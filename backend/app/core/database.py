"""Async SQLAlchemy engine, session factory, and the request-scoped unit of work."""

from __future__ import annotations

import ssl
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

_LOCAL_HOSTS = {"localhost", "127.0.0.1", "::1", "db", "postgres"}


def _connect_args() -> dict[str, Any]:
    """asyncpg connect args.

    Two things differ from the psycopg2 setup this replaces:

    * TLS is passed as an `ssl` context, not libpq's `sslmode` query parameter
      (which asyncpg rejects outright - `config.py` strips it from the URL).
    * `statement_cache_size=0` is required behind PgBouncer in transaction
      pooling mode (Supabase port 6543), where prepared statements do not
      survive between checkouts. It is harmless on the session pooler.
    """
    primary_host = settings.database_url.hosts()[0]
    host = primary_host.get("host") or ""
    port = primary_host.get("port")
    args: dict[str, Any] = {
        "timeout": 10,
        "server_settings": {
            "timezone": "UTC",
            "application_name": "canteenx-api",
        },
    }

    if host not in _LOCAL_HOSTS:
        context = ssl.create_default_context()
        args["ssl"] = context

    if port == 6543:
        args["statement_cache_size"] = 0
        args["prepared_statement_cache_size"] = 0

    return args


engine = create_async_engine(
    str(settings.database_url),
    echo=settings.db_echo,
    pool_pre_ping=True,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_recycle=settings.db_pool_recycle_seconds,
    connect_args=_connect_args(),
)

SessionFactory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Declarative base for every model."""


@asynccontextmanager
async def session_scope() -> AsyncIterator[AsyncSession]:
    """One transaction, committed once at the end.

    The previous build committed inside every repository method, which made a
    multi-step operation (debit wallet, write payment, confirm order) impossible
    to roll back - a crash halfway through left money missing. Services here
    never commit; this scope owns the transaction boundary.
    """
    session = SessionFactory()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency wrapping :func:`session_scope`."""
    async with session_scope() as session:
        yield session


async def dispose_engine() -> None:
    await engine.dispose()
