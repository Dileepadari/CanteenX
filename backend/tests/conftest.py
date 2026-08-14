"""Test harness.

The schema is built by running Alembic against a throwaway database, not by
`create_all()`. That way the migrations themselves are exercised on every test
run - the previous project's migrations were decorative and could not build a
database from scratch at all.
"""

from __future__ import annotations

import os

# Must be set before app.core.config is imported anywhere.
os.environ.setdefault(
    "DATABASE_URL",
    os.environ.get(
        "TEST_DATABASE_URL",
        "postgresql://canteenx:canteenx@localhost:55432/canteenx_test",
    ),
)
os.environ.setdefault("JWT_SECRET", "test-secret-that-is-at-least-32-characters-long")
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:8080")

import asyncio  # noqa: E402
from collections.abc import AsyncIterator  # noqa: E402

import pytest  # noqa: E402
import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.core.database import engine, session_scope  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.db.models import (  # noqa: E402
    Canteen,
    MenuItem,
    User,
    UserRole,
    UserWallet,
)
from app.main import app  # noqa: E402

TEST_PASSWORD = "test-password-123"


def pytest_configure(config: pytest.Config) -> None:
    config.addinivalue_line("markers", "slow: longer-running integration test")


@pytest_asyncio.fixture(scope="session", autouse=True, loop_scope="session")
async def _schema() -> AsyncIterator[None]:
    """Build the schema with Alembic, so migrations are covered by every run."""
    from alembic import command
    from alembic.config import Config

    config = Config("alembic.ini")
    await asyncio.to_thread(command.upgrade, config, "head")
    yield
    await engine.dispose()


@pytest_asyncio.fixture(autouse=True, loop_scope="session")
async def _clean_tables() -> AsyncIterator[None]:
    """Truncate between tests.

    Truncation rather than transactional rollback: several behaviours under
    test (stock reservation, wallet debits) deliberately use their own
    transactions, which a wrapping transaction would mask.
    """
    yield
    async with engine.begin() as connection:
        await connection.execute(
            text(
                """
                TRUNCATE TABLE
                    notifications, order_status_events, stock_reservations,
                    wallet_transactions, payments, payment_webhook_events,
                    order_items, orders, cart_items, carts,
                    promotion_redemptions, promotions, reviews, complaints,
                    bulk_orders, menu_items, canteen_staff,
                    user_favorite_canteens, canteens, user_wallets,
                    refresh_tokens, users
                RESTART IDENTITY CASCADE
                """
            )
        )


@pytest_asyncio.fixture(loop_scope="session")
async def client() -> AsyncIterator[AsyncClient]:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as http_client:
        yield http_client


# ----------------------------------------------------------------- factories
async def make_user(
    *,
    email: str,
    role: UserRole = UserRole.STUDENT,
    name: str = "Test User",
    wallet_paise: int = 0,
) -> str:
    async with session_scope() as session:
        user = User(
            name=name,
            email=email,
            password_hash=hash_password(TEST_PASSWORD),
            role=role,
        )
        session.add(user)
        await session.flush()
        session.add(UserWallet(user_id=user.id, balance_paise=wallet_paise))
        return user.id


async def make_canteen(*, owner_id: str, name: str = "Test Canteen") -> int:
    async with session_scope() as session:
        canteen = Canteen(
            name=name,
            slug=name.lower().replace(" ", "-"),
            owner_id=owner_id,
            weekly_schedule={},
            tags=[],
        )
        session.add(canteen)
        await session.flush()
        return canteen.id


async def make_menu_item(
    *,
    canteen_id: int,
    name: str = "Test Dish",
    price_paise: int = 10_000,
    stock_count: int | None = None,
    customization_groups: list | None = None,
) -> int:
    async with session_scope() as session:
        item = MenuItem(
            canteen_id=canteen_id,
            name=name,
            price_paise=price_paise,
            stock_count=stock_count,
            customization_groups=customization_groups or [],
            tags=[],
            contains_allergens=[],
        )
        session.add(item)
        await session.flush()
        return item.id


# ------------------------------------------------------------------- helpers
class GraphQL:
    """Thin GraphQL caller that carries cookies and the CSRF header."""

    def __init__(self, client: AsyncClient) -> None:
        self.client = client

    async def __call__(self, query: str, **variables) -> dict:
        csrf = self.client.cookies.get("csrf_token")
        response = await self.client.post(
            "/api/graphql",
            json={"query": query, "variables": variables},
            headers={"x-csrf-token": csrf} if csrf else {},
        )
        return response.json()

    async def sign_in(self, email: str, password: str = TEST_PASSWORD) -> dict:
        return await self(
            """
            mutation($e: String!, $p: String!) {
              signIn(input: {email: $e, password: $p}) { user { id role } }
            }
            """,
            e=email,
            p=password,
        )

    @staticmethod
    def error_code(payload: dict) -> str | None:
        errors = payload.get("errors")
        if not errors:
            return None
        return (errors[0].get("extensions") or {}).get("code")


@pytest_asyncio.fixture(loop_scope="session")
async def gql(client: AsyncClient) -> GraphQL:
    return GraphQL(client)
