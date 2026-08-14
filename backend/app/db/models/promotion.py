"""Promotions and their redemptions.

The vendor promotions screen previously existed only as React state seeded with
three literal objects - there was no table, no API, and nothing survived a
refresh. This is the real thing.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
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
from app.db.models.enums import PromotionType

if TYPE_CHECKING:
    from app.db.models.canteen import Canteen
    from app.db.models.order import Order
    from app.db.models.user import User


class Promotion(IntPKMixin, TimestampMixin, Base):
    __tablename__ = "promotions"
    __table_args__ = (
        UniqueConstraint("canteen_id", "code", name="uq_promotions_canteen_code"),
        CheckConstraint("value > 0", name="ck_promotions_value_positive"),
        CheckConstraint("starts_at < ends_at", name="ck_promotions_window_ordered"),
        CheckConstraint(
            "max_redemptions IS NULL OR max_redemptions > 0",
            name="ck_promotions_max_redemptions_positive",
        ),
        Index("ix_promotions_active_window", "canteen_id", "starts_at", "ends_at"),
    )

    canteen_id: Mapped[int] = mapped_column(
        ForeignKey("canteens.id", ondelete="CASCADE"), nullable=False, index=True
    )

    code: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default=None)

    type: Mapped[PromotionType] = mapped_column(
        Enum(
            PromotionType,
            name="promotion_type",
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
    )
    #: Basis points for `percentage`, paise for `flat`.
    value: Mapped[int] = mapped_column(Integer, nullable=False)
    max_discount_paise: Mapped[int | None] = mapped_column(Money, default=None)
    min_order_paise: Mapped[int] = mapped_column(Money, nullable=False, default=0)

    starts_at: Mapped[datetime] = mapped_column(TZDateTime, nullable=False)
    ends_at: Mapped[datetime] = mapped_column(TZDateTime, nullable=False)

    max_redemptions: Mapped[int | None] = mapped_column(Integer, default=None)
    max_redemptions_per_user: Mapped[int] = mapped_column(
        Integer, nullable=False, default=1
    )
    redemption_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    #: Optional scoping, e.g. ``{"menuItemIds": [12, 13], "categories": ["Snacks"]}``
    applies_to: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    canteen: Mapped["Canteen"] = relationship(back_populates="promotions")
    redemptions: Mapped[list["PromotionRedemption"]] = relationship(
        back_populates="promotion", cascade="all, delete-orphan", passive_deletes=True
    )


class PromotionRedemption(IntPKMixin, Base):
    __tablename__ = "promotion_redemptions"
    __table_args__ = (
        # One redemption row per order, so replaying checkout cannot stack the
        # same coupon twice.
        UniqueConstraint(
            "promotion_id", "order_id", name="uq_promotion_redemptions_order"
        ),
        Index("ix_promotion_redemptions_user", "promotion_id", "user_id"),
    )

    promotion_id: Mapped[int] = mapped_column(
        ForeignKey("promotions.id", ondelete="CASCADE"), nullable=False
    )
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    discount_paise: Mapped[int] = mapped_column(Money, nullable=False)
    created_at: Mapped[datetime] = mapped_column(TZDateTime, nullable=False, index=True)

    promotion: Mapped["Promotion"] = relationship(back_populates="redemptions")
    order: Mapped["Order"] = relationship(back_populates="promotion_redemptions")
    user: Mapped["User"] = relationship()
