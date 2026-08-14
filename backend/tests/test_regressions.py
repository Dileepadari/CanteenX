"""Regression tests for bugs that reached a running system.

Each of these failed in the browser before it was fixed. They are grouped here
so the reason each test exists stays legible.
"""

from __future__ import annotations

import asyncio

import pytest

from app.api.context import build_context
from app.core.database import engine, session_scope
from app.db.models import User, UserRole
from tests.conftest import make_user

pytestmark = pytest.mark.asyncio(loop_scope="session")


class _FakeWebSocket:
    """Minimal stand-in with the two attributes the context reads."""

    def __init__(self, cookies: dict[str, str]) -> None:
        self.cookies = cookies
        self.headers: dict[str, str] = {}


async def test_context_accepts_a_websocket_without_a_request() -> None:
    """The subscription transport supplies `websocket`, never `request`.

    `get_context` originally declared only `request` with no default, so every
    WebSocket handshake died with a TypeError before a connection existed and
    no subscription could ever deliver.
    """
    context = await build_context(_FakeWebSocket({}), None, None)
    assert context.request is not None
    assert context.session is None  # never hold a pooled connection on a socket
    assert context.is_authenticated is False


async def test_concurrent_user_loads_all_resolve() -> None:
    """Concurrent `user()` calls on one context must all see the user.

    A single WebSocket carries several subscriptions that share one context.
    The memoisation flag used to be set *before* the query was awaited, so a
    second task read `_user` while it was still None and rejected a valid user
    purely on timing - which is what broke live order tracking.
    """
    from app.core.security import create_access_token

    user_id = await make_user(email="race@test.dev")
    token, _, _ = create_access_token(user_id, UserRole.STUDENT.value)

    context = await build_context(_FakeWebSocket({"access_token": token}), None, None)

    # Twenty simultaneous callers, exactly one of which should do the query.
    results = await asyncio.gather(*(context.user() for _ in range(20)))

    assert all(result is not None for result in results), (
        "a concurrent caller saw None - the memoisation race is back"
    )
    assert len({result.id for result in results if result}) == 1


async def test_subscriptions_do_not_exhaust_the_connection_pool() -> None:
    """Many contexts must not each pin a pooled connection.

    A dependency resolved on a WebSocket route is held for the whole
    connection. Yielding a session there meant every open subscription
    permanently occupied a database connection, and the pool (5 + 2 overflow)
    was exhausted after a handful of subscribers - taking the entire API down,
    not just real-time.
    """
    from app.core.security import create_access_token

    user_id = await make_user(email="pool@test.dev")
    token, _, _ = create_access_token(user_id, UserRole.STUDENT.value)

    contexts = [
        await build_context(_FakeWebSocket({"access_token": token}), None, None)
        for _ in range(20)
    ]
    # Far more than the pool holds; each must borrow and release.
    await asyncio.gather(*(context.user() for context in contexts))

    # The pool must still have capacity for ordinary work.
    async with session_scope() as session:
        from sqlalchemy import select

        found = await session.scalar(select(User.id).where(User.id == user_id))
        assert found == user_id

    assert engine.pool.checkedout() == 0, "connections were leaked"


async def test_auth_failures_are_distinguishable() -> None:
    """The policy and `require_user` must not share one message.

    They did, which made a client-side "You must be signed in" impossible to
    trace and hid the concurrency bug above for several rounds of debugging.
    """
    from app.api.graphql.permissions import IsAuthenticated
    from app.core.errors import AuthenticationError

    policy_message = AuthenticationError().message

    context = await build_context(_FakeWebSocket({}), None, None)
    with pytest.raises(AuthenticationError) as raised:
        await context.require_user()

    assert raised.value.message != policy_message
    assert IsAuthenticated.error is AuthenticationError
