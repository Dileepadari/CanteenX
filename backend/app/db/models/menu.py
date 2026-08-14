"""Menu items and their customization option groups."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.db.models.base import IntPKMixin, Money, TimestampMixin

if TYPE_CHECKING:
    from app.db.models.canteen import Canteen
    from app.db.models.review import Review


class MenuItem(IntPKMixin, TimestampMixin, Base):
    __tablename__ = "menu_items"
    __table_args__ = (
        CheckConstraint("price_paise >= 0", name="ck_menu_items_price_non_negative"),
        CheckConstraint("stock_count >= 0", name="ck_menu_items_stock_non_negative"),
        Index("ix_menu_items_canteen_category", "canteen_id", "category"),
        Index("ix_menu_items_search", "name"),
    )

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default=None)
    price_paise: Mapped[int] = mapped_column(Money, nullable=False)
    image_url: Mapped[str | None] = mapped_column(Text, default=None)
    category: Mapped[str | None] = mapped_column(String(80), default=None, index=True)

    canteen_id: Mapped[int] = mapped_column(
        ForeignKey("canteens.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # This column is the fix for a long-standing silent bug: the old model
    # exposed an `isVegetarian` property that read a column which was never
    # created, so it always returned False and the veg filter never worked.
    is_vegetarian: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_vegan: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    contains_allergens: Mapped[list] = mapped_column(
        JSONB, nullable=False, default=list
    )

    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Nullable means "not stock-tracked" - an unlimited kitchen item. Zero means
    # genuinely sold out. The old schema conflated the two with a NOT NULL
    # default of 0, which made every unseeded item look sold out.
    stock_count: Mapped[int | None] = mapped_column(Integer, default=None)
    preparation_minutes: Mapped[int] = mapped_column(
        Integer, nullable=False, default=15
    )

    rating: Mapped[float] = mapped_column(
        Numeric(3, 2), nullable=False, default=0, server_default="0"
    )
    rating_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    order_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )

    tags: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    #: Option groups, validated against `app.domain.schemas.customization`:
    #: ``[{"id": "size", "label": "Size", "type": "single", "required": true,
    #:     "options": [{"id": "reg", "label": "Regular", "priceDeltaPaise": 0}]}]``
    customization_groups: Mapped[list] = mapped_column(
        JSONB, nullable=False, default=list
    )

    # --- relationships -------------------------------------------------------
    canteen: Mapped["Canteen"] = relationship(back_populates="menu_items")
    reviews: Mapped[list["Review"]] = relationship(back_populates="menu_item")

    @property
    def is_stock_tracked(self) -> bool:
        return self.stock_count is not None

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<MenuItem {self.id} {self.name}>"
