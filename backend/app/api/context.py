"""Request context shared by every GraphQL resolver."""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from typing import Any

from fastapi import Request, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.websockets import WebSocket
from strawberry.fastapi import BaseContext

from app.core.database import session_scope
from app.core.errors import AuthenticationError
from app.core.security import (
    ACCESS_COOKIE_NAME,
    TokenClaims,
    TokenError,
    TokenType,
    decode_token,
)
from app.db.models import User, UserRole


@dataclass
class GraphQLContext(BaseContext):
    """Per-request state.

    Authentication is resolved from the JWT claims alone. The previous build ran
    a middleware that opened a *second*, out-of-band database session on every
    request (including health checks and preflights) to fetch the full user row,
    then handed that detached object to resolvers bound to a different session -
    a reliable source of cross-session write bugs.

    Here `claims` is free (no query), and `user()` lazily loads the row once,
    only when a resolver actually needs more than the id and role.
    """

    #: A WebSocket on the subscription transport, an HTTP Request otherwise.
    request: Request | WebSocket
    #: None over WebSocket - there is no response to set cookies on there.
    response: Response | None
    #: None over WebSocket. A subscription may stay open for hours, so it must
    #: never hold a pooled connection for its lifetime - that exhausts the pool
    #: after a handful of subscribers and takes the whole API down. Use `db()`.
    session: AsyncSession | None
    _claims: TokenClaims | None = field(default=None, repr=False)
    _claims_resolved: bool = field(default=False, repr=False)
    _user: User | None = field(default=None, repr=False)
    _user_loaded: bool = field(default=False, repr=False)
    #: Serialises `user()` across the concurrent subscriptions that share one
    #: WebSocket connection - and therefore one context.
    _user_lock: asyncio.Lock = field(default_factory=asyncio.Lock, repr=False)
    #: Cookie operations queued by the auth service, applied after the response
    #: body is produced.
    pending_cookies: list[dict[str, Any]] = field(default_factory=list)

    # ------------------------------------------------------------- identity
    @property
    def claims(self) -> TokenClaims | None:
        """Resolve the caller's identity, lazily.

        Lazily, because over WebSocket the cookie is read at handshake time but
        `connection_params` only arrive with `connection_init` - a message
        later. Resolving eagerly meant a ticket-authenticated subscription was
        always evaluated as anonymous.
        """
        if not self._claims_resolved:
            self._claims_resolved = True
            self._claims = _extract_claims(self.request) or self._ticket_claims()
        return self._claims

    def _ticket_claims(self) -> TokenClaims | None:
        """Fall back to a realtime ticket supplied in `connection_init`."""
        params = self.connection_params
        if not isinstance(params, dict):
            return None

        ticket = params.get("ticket")
        if not isinstance(ticket, str) or not ticket:
            return None

        try:
            return decode_token(ticket, TokenType.realtime)
        except TokenError:
            return None

    @property
    def is_authenticated(self) -> bool:
        return self.claims is not None

    @property
    def user_id(self) -> str | None:
        return self.claims.subject if self.claims else None

    @property
    def role(self) -> UserRole | None:
        if not self.claims or not self.claims.role:
            return None
        try:
            return UserRole(self.claims.role)
        except ValueError:
            return None

    @property
    def is_admin(self) -> bool:
        return self.role is UserRole.ADMIN

    @asynccontextmanager
    async def db(self) -> AsyncIterator[AsyncSession]:
        """A session for the duration of one unit of work.

        Over HTTP this is the request-scoped session. Over WebSocket there is
        none, so a short-lived one is opened and released immediately - the
        subscription then waits on pub/sub holding no database connection.
        """
        if self.session is not None:
            yield self.session
        else:
            async with session_scope() as session:
                yield session

    async def user(self) -> User | None:
        """Load and memoise the authenticated user row.

        The lock is essential, not defensive. A single WebSocket carries
        several concurrent subscriptions that share this one context object.
        Setting `_user_loaded` before awaiting the query let a second task
        observe the flag while `_user` was still None and conclude the caller
        was unauthenticated - a valid user, rejected, purely on timing. The
        flag is now set only once the row is actually loaded.
        """
        if self._user_loaded:
            return self._user

        async with self._user_lock:
            # Re-check: another task may have completed the load while we
            # waited for the lock.
            if self._user_loaded:
                return self._user

            if not self.claims:
                self._user_loaded = True
                return None

            async with self.db() as session:
                result = await session.execute(
                    select(User).where(
                        User.id == self.claims.subject,
                        User.deleted_at.is_(None),
                        User.is_active.is_(True),
                    )
                )
                self._user = result.scalar_one_or_none()

            self._user_loaded = True

        return self._user

    async def require_user(self) -> User:
        user = await self.user()
        if user is None:
            # Deliberately worded differently from the IsAuthenticated policy:
            # identical messages made it impossible to tell which check failed.
            raise AuthenticationError("Your account could not be loaded.")
        return user


def _extract_claims(request: Request | WebSocket) -> TokenClaims | None:
    """Read the access token from the cookie, or the Authorization header.

    The cookie is the browser path. The bearer header exists for the websocket
    handshake and for server-to-server callers, which cannot rely on cookies.
    """
    token = request.cookies.get(ACCESS_COOKIE_NAME)

    if not token:
        header = request.headers.get("authorization", "")
        if header.lower().startswith("bearer "):
            token = header[7:].strip()

    if not token:
        return None

    try:
        return decode_token(token, TokenType.access)
    except TokenError:
        # An expired or malformed token is treated as anonymous. The client
        # refreshes on the `unauthenticated` error and retries.
        return None


async def build_context(
    request: Request | WebSocket | None,
    response: Response | None,
    session: AsyncSession | None,
) -> GraphQLContext:
    if request is None:  # pragma: no cover - FastAPI always supplies one
        raise RuntimeError("No request or websocket in scope.")

    # Claims are resolved on first access, not here - see `GraphQLContext.claims`.
    return GraphQLContext(request=request, response=response, session=session)
