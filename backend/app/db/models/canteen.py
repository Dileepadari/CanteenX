"""Canteen."""

from __future__ import annotations

from datetime import time
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Time,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.db.models.base import IntPKMixin, TimestampMixin
from app.db.models.user import canteen_staff, user_favorite_canteens

if TYPE_CHECKING:
    from app.db.models.complaint import Complaint
    from app.db.models.menu import MenuItem
    from app.db.models.order import Order
    from app.db.models.promotion import Promotion
    from app.db.models.review import Review
    from app.db.models.user import User


class Canteen(IntPKMixin, TimestampMixin, Base):
    __tablename__ = "canteens"
    __table_args__ = (
        UniqueConstraint("slug", name="uq_canteens_slug"),
        UniqueConstraint("email", name="uq_canteens_email"),
    )

    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(140), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default=None)
    location: Mapped[str | None] = mapped_column(String(255), default=None)

    banner_url: Mapped[str | None] = mapped_column(Text, default=None)
    logo_url: Mapped[str | None] = mapped_column(Text, default=None)

    phone: Mapped[str | None] = mapped_column(String(20), default=None)
    email: Mapped[str | None] = mapped_column(String(255), default=None)

    # Denormalised rating, recomputed by the review service on write. Numeric,
    # not Float, so it round-trips exactly.
    rating: Mapped[float] = mapped_column(
        Numeric(3, 2), nullable=False, default=0, server_default="0"
    )
    rating_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )

    opens_at: Mapped[time | None] = mapped_column(Time, default=None)
    closes_at: Mapped[time | None] = mapped_column(Time, default=None)
    # Vendor's manual override; the effective open state also considers the
    # weekly schedule and is computed in the canteen service, not stored.
    is_accepting_orders: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    #: ``{"mon": {"opens": "08:00", "closes": "20:00", "closed": false}, ...}``
    weekly_schedule: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    tags: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    average_preparation_minutes: Mapped[int] = mapped_column(
        Integer, nullable=False, default=15
    )

    owner_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    # --- relationships -------------------------------------------------------
    owner: Mapped["User"] = relationship(back_populates="owned_canteens")
    menu_items: Mapped[list["MenuItem"]] = relationship(
        back_populates="canteen", cascade="all, delete-orphan", passive_deletes=True
    )
    orders: Mapped[list["Order"]] = relationship(back_populates="canteen")
    promotions: Mapped[list["Promotion"]] = relationship(
        back_populates="canteen", cascade="all, delete-orphan", passive_deletes=True
    )
    reviews: Mapped[list["Review"]] = relationship(back_populates="canteen")
    complaints: Mapped[list["Complaint"]] = relationship(back_populates="canteen")
    staff: Mapped[list["User"]] = relationship(
        secondary=canteen_staff, back_populates="staffed_canteens"
    )
    favorited_by: Mapped[list["User"]] = relationship(
        secondary=user_favorite_canteens, back_populates="favorite_canteens"
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Canteen {self.id} {self.name}>"
