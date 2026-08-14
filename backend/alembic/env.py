"""Alembic environment, wired to the async engine.

Migrations are the *only* source of schema truth. The application no longer
calls `Base.metadata.create_all()` at import time, which previously meant the
running app and the migration history could - and did - disagree.
"""

from __future__ import annotations

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.engine import Connection

from app.core.database import Base, engine

# Importing the package registers every mapper. Autogenerate silently emits
# "drop table" for anything not imported here, so this import matters.
import app.db.models  # noqa: F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _configure(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
        # Postgres enum types are created and dropped by explicit operations in
        # the migrations rather than inferred, which keeps enum changes visible
        # in review instead of hiding inside a column alter.
        include_object=_include_object,
    )


def _include_object(obj, name, type_, reflected, compare_to) -> bool:  # noqa: ANN001
    # Never touch Supabase-managed schemas if the search path ever widens.
    if type_ == "table" and getattr(obj, "schema", None) in {
        "auth",
        "storage",
        "realtime",
        "extensions",
        "graphql",
    }:
        return False
    return True


def run_migrations_offline() -> None:
    """Emit SQL to stdout without a live connection (`alembic upgrade --sql`)."""
    context.configure(
        url=str(config.get_main_option("sqlalchemy.url") or engine.url),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def _run_migrations(connection: Connection) -> None:
    _configure(connection)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    async with engine.connect() as connection:
        await connection.run_sync(_run_migrations)
    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
