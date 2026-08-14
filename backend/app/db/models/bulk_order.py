"""Bulk / catering order requests.

Another screen that shipped as a 734-line mockup over a module-level literal
array with no API behind it. Modelled as a request-and-quote flow rather than a
regular order, because catering is negotiated before it is priced.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.db.models.base import IntPKMixin, Money, TimestampMixin, TZDateTime
from app.db.models.enums import BulkOrderStatus

if TYPE_CHECKING:
    from app.db.models.canteen import Canteen
    from app.db.models.user import User


class BulkOrder(IntPKMixin, TimestampMixin, Base):
    __tablename__ = "bulk_orders"
    __table_args__ = (
        UniqueConstraint("reference", name="uq_bulk_orders_reference"),
        CheckConstraint("head_count > 0", name="ck_bulk_orders_head_count_positive"),
        Index("ix_bulk_orders_canteen_status", "canteen_id", "status"),
    )

    reference: Mapped[str] = mapped_column(String(16), nullable=False)

    requester_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    canteen_id: Mapped[int] = mapped_column(
        ForeignKey("canteens.id", ondelete="CASCADE"), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(String(160), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, default=None)
    head_count: Mapped[int] = mapped_column(Integer, nullable=False)
    required_at: Mapped[datetime] = mapped_column(TZDateTime, nullable=False)
    contact_phone: Mapped[str | None] = mapped_column(String(20), default=None)

    #: ``[{"menuItemId": 3, "name": "Veg Biryani", "quantity": 40}]``
    requested_items: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    status: Mapped[BulkOrderStatus] = mapped_column(
        Enum(
            BulkOrderStatus,
            name="bulk_order_status",
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
        default=BulkOrderStatus.REQUESTED,
        index=True,
    )

    quoted_total_paise: Mapped[int | None] = mapped_column(Money, default=None)
    quote_note: Mapped[str | None] = mapped_column(Text, default=None)
    quoted_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)
    confirmed_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)
    fulfilled_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)

    requester: Mapped["User"] = relationship()
    canteen: Mapped["Canteen"] = relationship()
