"""Orders, line items, the status audit trail, and stock reservations."""

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
from app.db.models.enums import (
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    ReservationStatus,
)

if TYPE_CHECKING:
    from app.db.models.canteen import Canteen
    from app.db.models.complaint import Complaint
    from app.db.models.menu import MenuItem
    from app.db.models.payment import Payment
    from app.db.models.promotion import PromotionRedemption
    from app.db.models.review import Review
    from app.db.models.user import User


def _enum(enum_cls, name: str):
    return Enum(enum_cls, name=name, values_callable=lambda e: [m.value for m in e])


class Order(IntPKMixin, TimestampMixin, Base):
    __tablename__ = "orders"
    __table_args__ = (
        UniqueConstraint("reference", name="uq_orders_reference"),
        CheckConstraint("subtotal_paise >= 0", name="ck_orders_subtotal_non_negative"),
        CheckConstraint("total_paise >= 0", name="ck_orders_total_non_negative"),
        CheckConstraint("discount_paise >= 0", name="ck_orders_discount_non_negative"),
        Index("ix_orders_user_created", "user_id", "created_at"),
        Index("ix_orders_canteen_status", "canteen_id", "status"),
    )

    #: Short human-quotable code shown on the pickup counter, e.g. "CX-7F3K2".
    reference: Mapped[str] = mapped_column(String(16), nullable=False)

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    canteen_id: Mapped[int] = mapped_column(
        ForeignKey("canteens.id", ondelete="RESTRICT"), nullable=False
    )

    status: Mapped[OrderStatus] = mapped_column(
        _enum(OrderStatus, "order_status"),
        nullable=False,
        default=OrderStatus.PENDING,
        index=True,
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        _enum(PaymentStatus, "payment_status"),
        nullable=False,
        default=PaymentStatus.PENDING,
        index=True,
    )
    payment_method: Mapped[PaymentMethod | None] = mapped_column(
        _enum(PaymentMethod, "payment_method"), default=None
    )

    # All money in paise. Invariant, enforced by the ordering service:
    #   total = subtotal + tax - discount
    subtotal_paise: Mapped[int] = mapped_column(Money, nullable=False, default=0)
    tax_paise: Mapped[int] = mapped_column(Money, nullable=False, default=0)
    discount_paise: Mapped[int] = mapped_column(Money, nullable=False, default=0)
    total_paise: Mapped[int] = mapped_column(Money, nullable=False, default=0)

    customer_note: Mapped[str | None] = mapped_column(Text, default=None)
    contact_phone: Mapped[str | None] = mapped_column(String(20), default=None)
    cancellation_reason: Mapped[str | None] = mapped_column(Text, default=None)

    #: Set for pre-orders; null means "as soon as possible".
    scheduled_for: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)
    ready_estimate_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)
    completed_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)
    cancelled_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)

    # --- relationships -------------------------------------------------------
    user: Mapped["User"] = relationship(back_populates="orders")
    canteen: Mapped["Canteen"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="OrderItem.id",
    )
    status_events: Mapped[list["OrderStatusEvent"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="OrderStatusEvent.created_at",
    )
    payments: Mapped[list["Payment"]] = relationship(back_populates="order")
    reservations: Mapped[list["StockReservation"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", passive_deletes=True
    )
    complaints: Mapped[list["Complaint"]] = relationship(back_populates="order")
    reviews: Mapped[list["Review"]] = relationship(back_populates="order")
    promotion_redemptions: Mapped[list["PromotionRedemption"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", passive_deletes=True
    )

    @property
    def is_paid(self) -> bool:
        return self.payment_status is PaymentStatus.PAID

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Order {self.reference} {self.status.value}>"


class OrderItem(IntPKMixin, TimestampMixin, Base):
    __tablename__ = "order_items"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_order_items_quantity_positive"),
        CheckConstraint(
            "unit_price_paise >= 0", name="ck_order_items_price_non_negative"
        ),
    )

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Nullable: a menu item may be deleted later, but the order must survive
    # intact. Everything needed to render the line is snapshotted below.
    menu_item_id: Mapped[int | None] = mapped_column(
        ForeignKey("menu_items.id", ondelete="SET NULL"), default=None
    )

    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    note: Mapped[str | None] = mapped_column(Text, default=None)
    customizations: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    # Price snapshot taken at checkout. Without this, a later price change would
    # silently rewrite the value of historical orders and break reconciliation.
    name_snapshot: Mapped[str] = mapped_column(String(160), nullable=False)
    #: Human-readable option labels, e.g. "Large, Extra cheese". Snapshotted
    #: because the item's option groups can change after the order is placed.
    customization_summary: Mapped[str | None] = mapped_column(String(255), default=None)
    image_url_snapshot: Mapped[str | None] = mapped_column(Text, default=None)
    unit_price_paise: Mapped[int] = mapped_column(Money, nullable=False)
    customization_price_paise: Mapped[int] = mapped_column(
        Money, nullable=False, default=0
    )
    line_total_paise: Mapped[int] = mapped_column(Money, nullable=False)

    order: Mapped["Order"] = relationship(back_populates="items")
    menu_item: Mapped["MenuItem | None"] = relationship()


class OrderStatusEvent(IntPKMixin, Base):
    """Append-only audit trail powering the live tracking timeline.

    Replaces the old `order_steps` table, which existed in the schema but was
    never written to by any resolver, so the tracking UI had to simulate
    progress on the client.
    """

    __tablename__ = "order_status_events"

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[OrderStatus] = mapped_column(
        _enum(OrderStatus, "order_status"), nullable=False
    )
    note: Mapped[str | None] = mapped_column(Text, default=None)
    #: Null for system-generated transitions (payment webhook, expiry sweeper).
    actor_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), default=None
    )
    created_at: Mapped[datetime] = mapped_column(TZDateTime, nullable=False, index=True)

    order: Mapped["Order"] = relationship(back_populates="status_events")


class StockReservation(IntPKMixin, TimestampMixin, Base):
    """A hold placed on stock at checkout, released on cancel or expiry.

    Previously stock was decremented at order creation and never restored on
    cancellation, so every abandoned checkout permanently leaked inventory.
    """

    __tablename__ = "stock_reservations"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_stock_reservations_qty_positive"),
        Index("ix_stock_reservations_status_expiry", "status", "expires_at"),
    )

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    menu_item_id: Mapped[int] = mapped_column(
        ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[ReservationStatus] = mapped_column(
        _enum(ReservationStatus, "reservation_status"),
        nullable=False,
        default=ReservationStatus.HELD,
    )
    expires_at: Mapped[datetime] = mapped_column(TZDateTime, nullable=False)

    order: Mapped["Order"] = relationship(back_populates="reservations")
