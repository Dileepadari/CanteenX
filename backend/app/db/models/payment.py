"""Payments, wallet, and webhook idempotency.

The `merchants` table is deliberately gone. It stored `razorpay_key_secret` as
plaintext in a column that an unauthenticated REST endpoint returned. Razorpay
credentials now live only in the environment.
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
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.db.models.base import IntPKMixin, Money, TimestampMixin, TZDateTime
from app.db.models.enums import PaymentMethod, PaymentStatus

if TYPE_CHECKING:
    from app.db.models.order import Order
    from app.db.models.user import User


def _enum(enum_cls, name: str):
    return Enum(enum_cls, name=name, values_callable=lambda e: [m.value for m in e])


class Payment(IntPKMixin, TimestampMixin, Base):
    __tablename__ = "payments"
    __table_args__ = (
        UniqueConstraint("gateway_order_id", name="uq_payments_gateway_order"),
        UniqueConstraint("gateway_payment_id", name="uq_payments_gateway_payment"),
        UniqueConstraint("idempotency_key", name="uq_payments_idempotency_key"),
        CheckConstraint("amount_paise > 0", name="ck_payments_amount_positive"),
        Index("ix_payments_user_created", "user_id", "created_at"),
    )

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )

    amount_paise: Mapped[int] = mapped_column(Money, nullable=False)
    method: Mapped[PaymentMethod] = mapped_column(
        _enum(PaymentMethod, "payment_method"), nullable=False
    )
    status: Mapped[PaymentStatus] = mapped_column(
        _enum(PaymentStatus, "payment_status"),
        nullable=False,
        default=PaymentStatus.PENDING,
        index=True,
    )

    #: Client-supplied key that makes retrying `initiatePayment` safe.
    idempotency_key: Mapped[str | None] = mapped_column(String(64), default=None)

    gateway_order_id: Mapped[str | None] = mapped_column(String(120), default=None)
    gateway_payment_id: Mapped[str | None] = mapped_column(String(120), default=None)
    gateway_signature: Mapped[str | None] = mapped_column(String(255), default=None)
    #: Trimmed gateway response. Never store raw card data or full PII blobs.
    gateway_response: Mapped[dict | None] = mapped_column(JSONB, default=None)

    failure_reason: Mapped[str | None] = mapped_column(Text, default=None)
    captured_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)
    refunded_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)
    refunded_amount_paise: Mapped[int] = mapped_column(Money, nullable=False, default=0)

    order: Mapped["Order"] = relationship(back_populates="payments")
    user: Mapped["User"] = relationship(back_populates="payments")


class UserWallet(IntPKMixin, TimestampMixin, Base):
    __tablename__ = "user_wallets"
    __table_args__ = (
        UniqueConstraint("user_id", name="uq_user_wallets_user"),
        # The balance invariant is enforced by the database, not just by a
        # Python check that raced with itself under concurrent debits.
        CheckConstraint(
            "balance_paise >= 0", name="ck_user_wallets_balance_non_negative"
        ),
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    balance_paise: Mapped[int] = mapped_column(Money, nullable=False, default=0)
    is_frozen: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped["User"] = relationship(back_populates="wallet")
    transactions: Mapped[list["WalletTransaction"]] = relationship(
        back_populates="wallet",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="WalletTransaction.id.desc()",
    )


class WalletTransaction(IntPKMixin, Base):
    """Append-only ledger. `balance_after_paise` makes the wallet auditable."""

    __tablename__ = "wallet_transactions"
    __table_args__ = (
        CheckConstraint("amount_paise <> 0", name="ck_wallet_tx_amount_non_zero"),
        Index("ix_wallet_tx_wallet_created", "wallet_id", "created_at"),
    )

    wallet_id: Mapped[int] = mapped_column(
        ForeignKey("user_wallets.id", ondelete="CASCADE"), nullable=False
    )
    #: Signed: positive is a credit, negative is a debit.
    amount_paise: Mapped[int] = mapped_column(Money, nullable=False)
    balance_after_paise: Mapped[int] = mapped_column(Money, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)

    order_id: Mapped[int | None] = mapped_column(
        ForeignKey("orders.id", ondelete="SET NULL"), default=None
    )
    payment_id: Mapped[int | None] = mapped_column(
        ForeignKey("payments.id", ondelete="SET NULL"), default=None
    )
    created_at: Mapped[datetime] = mapped_column(TZDateTime, nullable=False, index=True)

    wallet: Mapped["UserWallet"] = relationship(back_populates="transactions")


class PaymentWebhookEvent(Base):
    """Every webhook Razorpay delivers, recorded before it is acted on.

    Gateways retry aggressively and deliver duplicates. The primary key is the
    gateway's own event id, so a replayed webhook hits a unique-violation and is
    skipped instead of crediting an order twice.
    """

    __tablename__ = "payment_webhook_events"

    event_id: Mapped[str] = mapped_column(String(120), primary_key=True)
    event_type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    received_at: Mapped[datetime] = mapped_column(
        TZDateTime, nullable=False, index=True
    )
    processed_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)
    processing_error: Mapped[str | None] = mapped_column(Text, default=None)
