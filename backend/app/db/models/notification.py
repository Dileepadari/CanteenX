"""Persisted notifications.

Notifications were previously client-only: React state mirrored into
`localStorage`, created by the same tab that performed the action. A student
could therefore never be told their order was ready, because the vendor's tab
is what changed the status. Writing them here first means they survive reloads
and reach users who were offline when the event happened.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.db.models.base import IntPKMixin, TZDateTime
from app.db.models.enums import NotificationType

if TYPE_CHECKING:
    from app.db.models.user import User


class Notification(IntPKMixin, Base):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notifications_user_unread", "user_id", "read_at"),
        Index("ix_notifications_user_created", "user_id", "created_at"),
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[NotificationType] = mapped_column(
        Enum(
            NotificationType,
            name="notification_type",
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(String(160), nullable=False)
    body: Mapped[str | None] = mapped_column(Text, default=None)
    #: Deep link into the SPA, e.g. "/orders/track/42".
    link: Mapped[str | None] = mapped_column(String(255), default=None)
    #: Structured extras for rendering (order reference, status, amount).
    data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    read_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)
    created_at: Mapped[datetime] = mapped_column(TZDateTime, nullable=False, index=True)

    user: Mapped["User"] = relationship(back_populates="notifications")

    @property
    def is_read(self) -> bool:
        return self.read_at is not None
