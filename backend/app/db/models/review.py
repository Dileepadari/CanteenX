"""Reviews of a menu item or a canteen, anchored to a completed order."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.db.models.base import IntPKMixin, TimestampMixin

if TYPE_CHECKING:
    from app.db.models.canteen import Canteen
    from app.db.models.menu import MenuItem
    from app.db.models.order import Order
    from app.db.models.user import User


class Review(IntPKMixin, TimestampMixin, Base):
    __tablename__ = "reviews"
    __table_args__ = (
        # One review per user per item per order: anchoring to the order is what
        # makes a review verifiable rather than a free-for-all rating box.
        UniqueConstraint(
            "user_id", "order_id", "menu_item_id", name="uq_reviews_user_order_item"
        ),
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating_range"),
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    canteen_id: Mapped[int] = mapped_column(
        ForeignKey("canteens.id", ondelete="CASCADE"), nullable=False, index=True
    )
    #: Null means the review is about the canteen as a whole.
    menu_item_id: Mapped[int | None] = mapped_column(
        ForeignKey("menu_items.id", ondelete="CASCADE"), default=None, index=True
    )

    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    body: Mapped[str | None] = mapped_column(Text, default=None)

    user: Mapped["User"] = relationship(back_populates="reviews")
    order: Mapped["Order"] = relationship(back_populates="reviews")
    canteen: Mapped["Canteen"] = relationship(back_populates="reviews")
    menu_item: Mapped["MenuItem | None"] = relationship(back_populates="reviews")
