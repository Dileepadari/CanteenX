"""Complaints raised against an order or a canteen."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.db.models.base import IntPKMixin, TimestampMixin, TZDateTime
from app.db.models.enums import ComplaintCategory, ComplaintStatus

if TYPE_CHECKING:
    from app.db.models.canteen import Canteen
    from app.db.models.order import Order
    from app.db.models.user import User


class Complaint(IntPKMixin, TimestampMixin, Base):
    __tablename__ = "complaints"
    __table_args__ = (
        Index("ix_complaints_status_created", "status", "created_at"),
        Index("ix_complaints_canteen_status", "canteen_id", "status"),
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    order_id: Mapped[int | None] = mapped_column(
        ForeignKey("orders.id", ondelete="SET NULL"), default=None, index=True
    )
    canteen_id: Mapped[int | None] = mapped_column(
        ForeignKey("canteens.id", ondelete="SET NULL"), default=None
    )

    subject: Mapped[str] = mapped_column(String(160), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[ComplaintCategory] = mapped_column(
        Enum(
            ComplaintCategory,
            name="complaint_category",
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
        default=ComplaintCategory.OTHER,
    )
    status: Mapped[ComplaintStatus] = mapped_column(
        Enum(
            ComplaintStatus,
            name="complaint_status",
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
        default=ComplaintStatus.OPEN,
    )

    #: Uploaded evidence photos (Oracle storage URLs).
    attachment_urls: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    response_body: Mapped[str | None] = mapped_column(Text, default=None)
    responded_by_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), default=None
    )
    responded_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)
    escalated_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)
    resolved_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)

    user: Mapped["User"] = relationship(
        back_populates="complaints", foreign_keys=[user_id]
    )
    order: Mapped["Order | None"] = relationship(back_populates="complaints")
    canteen: Mapped["Canteen | None"] = relationship(back_populates="complaints")
