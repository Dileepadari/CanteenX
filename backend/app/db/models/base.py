"""Shared column types and mixins."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import BigInteger, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

# Money is stored as an integer count of paise. Float was used previously, which
# cannot represent 0.1 exactly and accumulates error across tax and discount
# arithmetic - never acceptable for amounts that are charged to a card.
Money = BigInteger

TZDateTime = DateTime(timezone=True)


def utcnow() -> datetime:
    return datetime.now(UTC)


def new_uuid() -> str:
    return str(uuid.uuid4())


class TimestampMixin:
    """`created_at` / `updated_at`, both timezone-aware.

    The previous schema mixed naive and aware datetimes, which made
    `cancel_order` raise `TypeError: can't subtract offset-naive and
    offset-aware datetimes` for any row written by the seed script.
    """

    created_at: Mapped[datetime] = mapped_column(
        TZDateTime, nullable=False, server_default=func.now(), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        TZDateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class IntPKMixin:
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)


class UUIDPKMixin:
    id: Mapped[str] = mapped_column(primary_key=True, default=new_uuid)
