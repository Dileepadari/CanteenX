"""Server-side cart - the single source of truth for a user's basket.

The frontend previously kept three parallel carts (a GraphQL one, a React
context backed by `localStorage["smartCanteenCart"]`, and an orphaned zustand
store) with incompatible types. This table is now the only one.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.db.models.base import IntPKMixin, TimestampMixin, TZDateTime

if TYPE_CHECKING:
    from app.db.models.menu import MenuItem
    from app.db.models.user import User


class Cart(IntPKMixin, TimestampMixin, Base):
    __tablename__ = "carts"
    __table_args__ = (UniqueConstraint("user_id", name="uq_carts_user"),)

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # A cart holds items from exactly one canteen; switching canteens clears it.
    canteen_id: Mapped[int | None] = mapped_column(
        ForeignKey("canteens.id", ondelete="SET NULL"), default=None
    )
    scheduled_for: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)

    user: Mapped["User"] = relationship(back_populates="cart")
    items: Mapped[list["CartItem"]] = relationship(
        back_populates="cart",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="CartItem.id",
    )


class CartItem(IntPKMixin, TimestampMixin, Base):
    __tablename__ = "cart_items"
    __table_args__ = (
        # Deduplication is now a database invariant. It used to be done in
        # Python by comparing customization dicts, which is order-sensitive,
        # plus a Postgres-only JSONB cast - so the same item with the same
        # options could land in the cart twice.
        UniqueConstraint(
            "cart_id",
            "menu_item_id",
            "customization_hash",
            name="uq_cart_items_line",
        ),
        CheckConstraint("quantity > 0", name="ck_cart_items_quantity_positive"),
    )

    cart_id: Mapped[int] = mapped_column(
        ForeignKey("carts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    menu_item_id: Mapped[int] = mapped_column(
        ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    note: Mapped[str | None] = mapped_column(Text, default=None)

    #: Normalised selection, e.g. ``{"size": ["large"], "addons": ["cheese"]}``
    customizations: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    #: sha256 of the canonicalised `customizations`, used by the unique index
    #: above because JSONB equality cannot be indexed for this purpose.
    customization_hash: Mapped[str] = mapped_column(String(64), nullable=False)

    cart: Mapped["Cart"] = relationship(back_populates="items")
    menu_item: Mapped["MenuItem"] = relationship(lazy="joined")
