"""Payment orchestration.

Order confirmation is driven by *server-verified* gateway state only. There is
no client-assertable "mark this order paid" path - the previous schema had one
(`markOrderPaid`), and it let any customer flip their own order to paid without
any money moving.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import (
    ConflictError,
    NotFoundError,
    PaymentError,
    ValidationError,
)
from app.core.logging import get_logger
from app.db.models import (
    NotificationType,
    Order,
    OrderStatus,
    Payment,
    PaymentMethod,
    PaymentStatus,
    PaymentWebhookEvent,
    User,
)
from app.domain.gateways import razorpay_gateway
from app.domain.services import notification_service, wallet_service

logger = get_logger(__name__)


@dataclass(slots=True)
class CheckoutIntent:
    payment: Payment
    #: Populated for gateway payments; None when the wallet settled it outright.
    gateway_order_id: str | None
    requires_gateway: bool


# ------------------------------------------------------------------ initiate
async def initiate(
    session: AsyncSession,
    *,
    user: User,
    order_id: int,
    idempotency_key: str | None = None,
) -> CheckoutIntent:
    order = await session.get(Order, order_id)
    if order is None:
        raise NotFoundError("That order does not exist.")

    # Ownership is checked here, not inferred from the order row. The old REST
    # endpoint looked the owner up by raw SQL and then *impersonated* them.
    if order.user_id != user.id:
        raise NotFoundError("That order does not exist.")

    if order.payment_status is PaymentStatus.PAID:
        raise ConflictError("This order has already been paid for.")
    if order.status.is_terminal:
        raise ConflictError(f"This order is {order.status.value}.")

    if idempotency_key:
        existing = await session.scalar(
            select(Payment).where(Payment.idempotency_key == idempotency_key)
        )
        if existing is not None:
            return CheckoutIntent(
                payment=existing,
                gateway_order_id=existing.gateway_order_id,
                requires_gateway=existing.method is not PaymentMethod.WALLET,
            )

    method = order.payment_method or PaymentMethod.UPI

    if method is PaymentMethod.CASH:
        raise ValidationError("Cash payment is not supported.")

    payment = Payment(
        order_id=order.id,
        user_id=user.id,
        amount_paise=order.total_paise,
        method=method,
        status=PaymentStatus.PROCESSING,
        idempotency_key=idempotency_key,
    )
    session.add(payment)

    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise ConflictError("That payment was already started.") from None

    if method is PaymentMethod.WALLET:
        await wallet_service.debit(
            session,
            user_id=user.id,
            amount_paise=order.total_paise,
            description=f"Order {order.reference}",
            order_id=order.id,
            payment_id=payment.id,
        )
        await _settle(session, order=order, payment=payment)
        return CheckoutIntent(
            payment=payment, gateway_order_id=None, requires_gateway=False
        )

    gateway_order = razorpay_gateway.create_order(
        amount_paise=order.total_paise,
        receipt=order.reference,
        notes={"orderId": str(order.id), "userId": user.id},
    )
    payment.gateway_order_id = gateway_order.id
    await session.flush()

    return CheckoutIntent(
        payment=payment,
        gateway_order_id=gateway_order.id,
        requires_gateway=True,
    )


# -------------------------------------------------------------------- verify
async def verify_checkout(
    session: AsyncSession,
    *,
    user: User,
    gateway_order_id: str,
    gateway_payment_id: str,
    signature: str,
) -> Payment:
    """Verify the browser checkout callback.

    The signature is what makes this trustworthy. Even so, the webhook remains
    the authoritative confirmation - this path exists so the UI can advance
    immediately instead of waiting on gateway delivery.
    """
    payment = await session.scalar(
        select(Payment).where(Payment.gateway_order_id == gateway_order_id)
    )
    if payment is None:
        raise NotFoundError("That payment does not exist.")
    if payment.user_id != user.id:
        raise NotFoundError("That payment does not exist.")

    if payment.status is PaymentStatus.PAID:
        return payment

    if not razorpay_gateway.verify_checkout_signature(
        gateway_order_id=gateway_order_id,
        gateway_payment_id=gateway_payment_id,
        signature=signature,
    ):
        payment.status = PaymentStatus.FAILED
        payment.failure_reason = "Signature verification failed"
        logger.warning(
            "Rejected payment with an invalid signature",
            extra={"payment_id": payment.id, "order_id": payment.order_id},
        )
        raise PaymentError("This payment could not be verified.")

    # Trust but confirm: ask the gateway what it thinks the payment's state is,
    # rather than believing the client's claim that it succeeded.
    remote = razorpay_gateway.fetch_payment(gateway_payment_id)
    if remote.get("status") not in ("captured", "authorized"):
        payment.status = PaymentStatus.FAILED
        payment.failure_reason = f"Gateway status: {remote.get('status')}"
        raise PaymentError("The payment was not completed.")

    if int(remote.get("amount", 0)) != payment.amount_paise:
        payment.status = PaymentStatus.FAILED
        payment.failure_reason = "Amount mismatch"
        logger.error(
            "Payment amount mismatch",
            extra={
                "payment_id": payment.id,
                "expected": payment.amount_paise,
                "received": remote.get("amount"),
            },
        )
        raise PaymentError("The payment amount did not match the order.")

    payment.gateway_payment_id = gateway_payment_id
    payment.gateway_signature = signature
    payment.gateway_response = _trim_gateway_payload(remote)

    order = await session.get(Order, payment.order_id)
    if order is None:  # pragma: no cover - FK guarantees this
        raise NotFoundError("That order does not exist.")

    await _settle(session, order=order, payment=payment)
    return payment


async def _settle(session: AsyncSession, *, order: Order, payment: Payment) -> None:
    """Mark a payment captured and move the order to confirmed."""
    now = datetime.now(UTC)

    payment.status = PaymentStatus.PAID
    payment.captured_at = now

    order.payment_status = PaymentStatus.PAID
    if order.status is OrderStatus.PENDING:
        order.status = OrderStatus.CONFIRMED

    from app.domain.services import order_service

    event = await order_service._record_status(
        session, order, order.status, note="Payment received"
    )
    await order_service._publish_status(order, event)

    await notification_service.notify(
        session,
        user_id=order.user_id,
        type=NotificationType.PAYMENT,
        title="Payment received",
        body=f"Order {order.reference} is confirmed.",
        link=f"/orders/track/{order.id}",
        data={"orderId": order.id, "amountPaise": payment.amount_paise},
    )

    logger.info(
        "Payment settled",
        extra={"payment_id": payment.id, "order_id": order.id},
    )


def _trim_gateway_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """Keep only fields that are useful for reconciliation."""
    keep = {
        "id",
        "amount",
        "currency",
        "status",
        "method",
        "captured",
        "created_at",
        "order_id",
    }
    return {key: value for key, value in payload.items() if key in keep}


# ------------------------------------------------------------------ webhook
async def handle_webhook(
    session: AsyncSession,
    *,
    event_id: str,
    event_type: str,
    payload: dict[str, Any],
) -> bool:
    """Process a verified webhook exactly once.

    Returns False when the event was already handled. Razorpay retries
    aggressively; the primary key on `event_id` is what makes a replay a no-op
    instead of a double credit.
    """
    record = PaymentWebhookEvent(
        event_id=event_id,
        event_type=event_type,
        payload=payload,
        received_at=datetime.now(UTC),
    )
    session.add(record)
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        logger.info("Ignored duplicate webhook", extra={"event_id": event_id})
        return False

    entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    gateway_order_id = entity.get("order_id")
    gateway_payment_id = entity.get("id")

    if not gateway_order_id:
        record.processed_at = datetime.now(UTC)
        record.processing_error = "No order id in payload"
        return False

    payment = await session.scalar(
        select(Payment).where(Payment.gateway_order_id == gateway_order_id)
    )
    if payment is None:
        record.processed_at = datetime.now(UTC)
        record.processing_error = "No matching payment"
        return False

    order = await session.get(Order, payment.order_id)
    if order is None:  # pragma: no cover
        record.processed_at = datetime.now(UTC)
        record.processing_error = "No matching order"
        return False

    if event_type in ("payment.captured", "order.paid"):
        if payment.status is not PaymentStatus.PAID:
            if int(entity.get("amount", payment.amount_paise)) != payment.amount_paise:
                record.processing_error = "Amount mismatch"
                logger.error(
                    "Webhook amount mismatch",
                    extra={"payment_id": payment.id},
                )
            else:
                payment.gateway_payment_id = gateway_payment_id
                payment.gateway_response = _trim_gateway_payload(entity)
                await _settle(session, order=order, payment=payment)

    elif event_type == "payment.failed":
        payment.status = PaymentStatus.FAILED
        payment.failure_reason = entity.get("error_description") or "Payment failed"
        order.payment_status = PaymentStatus.FAILED

    record.processed_at = datetime.now(UTC)
    return True


# ------------------------------------------------------------------- refund
async def refund_order(
    session: AsyncSession, *, order: Order, reason: str
) -> Payment | None:
    payment = await session.scalar(
        select(Payment)
        .where(Payment.order_id == order.id, Payment.status == PaymentStatus.PAID)
        .order_by(Payment.id.desc())
    )
    if payment is None:
        return None

    refundable = payment.amount_paise - payment.refunded_amount_paise
    if refundable <= 0:
        return payment

    if payment.method is PaymentMethod.WALLET:
        await wallet_service.credit(
            session,
            user_id=payment.user_id,
            amount_paise=refundable,
            description=f"Refund for {order.reference}: {reason}",
            order_id=order.id,
            payment_id=payment.id,
        )
    else:
        if not payment.gateway_payment_id:
            raise PaymentError("This payment cannot be refunded automatically.")
        razorpay_gateway.refund(
            gateway_payment_id=payment.gateway_payment_id,
            amount_paise=refundable,
        )

    payment.refunded_amount_paise += refundable
    payment.status = PaymentStatus.REFUNDED
    payment.refunded_at = datetime.now(UTC)
    order.payment_status = PaymentStatus.REFUNDED

    await notification_service.notify(
        session,
        user_id=order.user_id,
        type=NotificationType.PAYMENT,
        title="Refund issued",
        body=f"₹{refundable / 100:,.2f} was refunded for {order.reference}.",
        link=f"/orders/{order.id}",
        data={"orderId": order.id, "amountPaise": refundable},
    )

    logger.info(
        "Refund issued",
        extra={"payment_id": payment.id, "amount_paise": refundable},
    )
    return payment


async def top_up_wallet(session: AsyncSession, *, user: User, amount_paise: int) -> str:
    """Create a gateway order for a wallet top-up (no CanteenX order involved)."""
    if amount_paise < 1000:
        raise ValidationError("The minimum top-up is ₹10.")
    if amount_paise > 5_000_00:
        raise ValidationError("The maximum top-up is ₹5,000.")

    gateway_order = razorpay_gateway.create_order(
        amount_paise=amount_paise,
        receipt=f"WALLET-{user.id[:8]}",
        notes={"kind": "wallet_topup", "userId": user.id},
    )
    return gateway_order.id
