"""Razorpay gateway.

There is no mock fallback. The previous build selected a `MockRazorpayAdapter`
whenever merchant credentials were missing *or contained the substring
"YOUR_KEY"* - and the seed script wrote exactly `rzp_test_YOUR_KEY_ID` into
every merchant row. The mock's `verify_payment` accepted any payload and
returned "captured", so in every seeded environment an unauthenticated caller
could mark any order paid. If keys are absent now, online payment is *disabled*
and says so.
"""

from __future__ import annotations

import hashlib
import hmac
from dataclasses import dataclass
from typing import Any

import razorpay

from app.core.config import settings
from app.core.errors import PaymentError, PaymentsDisabledError
from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass(frozen=True, slots=True)
class GatewayOrder:
    id: str
    amount_paise: int
    currency: str


def _client() -> razorpay.Client:
    if not settings.payments_enabled:
        raise PaymentsDisabledError()
    client = razorpay.Client(
        auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
    )
    client.set_app_details({"title": "CanteenX", "version": "2.0"})
    return client


def create_order(
    *, amount_paise: int, receipt: str, notes: dict[str, Any] | None = None
) -> GatewayOrder:
    client = _client()
    try:
        created = client.order.create(
            {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": receipt,
                "payment_capture": 1,
                "notes": notes or {},
            }
        )
    except razorpay.errors.BadRequestError as exc:
        logger.warning("Razorpay rejected order creation", extra={"error": str(exc)})
        raise PaymentError("The payment could not be started.") from exc
    except Exception as exc:  # network, auth, gateway outage
        logger.error("Razorpay order creation failed", exc_info=exc)
        raise PaymentError("The payment service is unavailable right now.") from exc

    return GatewayOrder(
        id=created["id"],
        amount_paise=int(created["amount"]),
        currency=created.get("currency", "INR"),
    )


def verify_checkout_signature(
    *, gateway_order_id: str, gateway_payment_id: str, signature: str
) -> bool:
    """Verify the client-side checkout callback.

    HMAC-SHA256 over `order_id|payment_id` keyed with the API secret. Compared
    in constant time. This is the check that was entirely absent before.
    """
    if not settings.payments_enabled:
        raise PaymentsDisabledError()

    expected = hmac.new(
        settings.razorpay_key_secret.encode(),
        f"{gateway_order_id}|{gateway_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, signature or "")


def verify_webhook_signature(*, body: bytes, signature: str) -> bool:
    """Verify an inbound webhook against the webhook secret.

    Note this uses a *different* secret from the checkout signature - a common
    and expensive thing to get wrong.
    """
    if not settings.razorpay_webhook_secret:
        raise PaymentsDisabledError("Webhooks are not configured.")

    expected = hmac.new(
        settings.razorpay_webhook_secret.encode(), body, hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected, signature or "")


def fetch_payment(gateway_payment_id: str) -> dict[str, Any]:
    client = _client()
    try:
        return client.payment.fetch(gateway_payment_id)
    except Exception as exc:
        logger.error("Razorpay payment fetch failed", exc_info=exc)
        raise PaymentError("Could not confirm the payment with the gateway.") from exc


def refund(*, gateway_payment_id: str, amount_paise: int) -> dict[str, Any]:
    client = _client()
    try:
        return client.payment.refund(
            gateway_payment_id, {"amount": amount_paise, "speed": "normal"}
        )
    except Exception as exc:
        logger.error("Razorpay refund failed", exc_info=exc)
        raise PaymentError("The refund could not be processed.") from exc
