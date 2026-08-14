"""Payment verification and webhook idempotency.

The audited build shipped a mock processor that accepted any payload and
returned "captured", reachable from an unauthenticated REST endpoint - a free
order for anyone with curl.
"""

from __future__ import annotations

import hashlib
import hmac
import json

import pytest

from app.core.config import settings
from app.domain.gateways import razorpay_gateway

pytestmark = pytest.mark.asyncio(loop_scope="session")


def _sign(body: bytes, secret: str) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


async def test_checkout_signature_rejects_a_forged_value(monkeypatch) -> None:
    monkeypatch.setattr(settings, "razorpay_key_id", "rzp_test_key", raising=False)
    monkeypatch.setattr(settings, "razorpay_key_secret", "super-secret", raising=False)

    assert not razorpay_gateway.verify_checkout_signature(
        gateway_order_id="order_1",
        gateway_payment_id="pay_1",
        signature="obviously-forged",
    )


async def test_checkout_signature_accepts_a_genuine_value(monkeypatch) -> None:
    secret = "super-secret"
    monkeypatch.setattr(settings, "razorpay_key_id", "rzp_test_key", raising=False)
    monkeypatch.setattr(settings, "razorpay_key_secret", secret, raising=False)

    expected = hmac.new(secret.encode(), b"order_1|pay_1", hashlib.sha256).hexdigest()

    assert razorpay_gateway.verify_checkout_signature(
        gateway_order_id="order_1",
        gateway_payment_id="pay_1",
        signature=expected,
    )


async def test_webhook_signature_uses_the_webhook_secret(monkeypatch) -> None:
    """A different secret from the checkout signature - easy to conflate."""
    monkeypatch.setattr(
        settings, "razorpay_webhook_secret", "webhook-secret", raising=False
    )
    body = b'{"event":"payment.captured"}'

    assert razorpay_gateway.verify_webhook_signature(
        body=body, signature=_sign(body, "webhook-secret")
    )
    assert not razorpay_gateway.verify_webhook_signature(
        body=body, signature=_sign(body, "the-api-key-secret")
    )


async def test_unsigned_webhook_is_rejected(client, monkeypatch) -> None:
    """This endpoint is unauthenticated by necessity; the HMAC is its only gate."""
    monkeypatch.setattr(
        settings, "razorpay_webhook_secret", "webhook-secret", raising=False
    )

    response = await client.post(
        "/api/payments/webhook",
        content=json.dumps({"event": "payment.captured"}),
        headers={"x-razorpay-signature": "forged", "content-type": "application/json"},
    )
    assert response.status_code == 401
    assert response.json()["status"] == "invalid_signature"


async def test_duplicate_webhook_is_processed_once(client, monkeypatch) -> None:
    """Gateways retry aggressively; a replay must not credit an order twice."""
    monkeypatch.setattr(
        settings, "razorpay_webhook_secret", "webhook-secret", raising=False
    )

    payload = {
        "event": "payment.captured",
        "payload": {"payment": {"entity": {"id": "pay_x", "order_id": "order_x"}}},
    }
    body = json.dumps(payload).encode()
    headers = {
        "x-razorpay-signature": _sign(body, "webhook-secret"),
        "x-razorpay-event-id": "evt_duplicate",
        "content-type": "application/json",
    }

    first = await client.post("/api/payments/webhook", content=body, headers=headers)
    second = await client.post("/api/payments/webhook", content=body, headers=headers)

    assert first.status_code == 200
    assert second.status_code == 200
    # Always 200 - a non-2xx makes Razorpay retry, and a duplicate is not a
    # failure. The distinction is in the body.
    assert second.json()["status"] == "duplicate"


async def test_payments_disabled_when_keys_are_absent(monkeypatch) -> None:
    """Absent credentials disable payment; they never fall back to a mock."""
    from app.core.errors import PaymentsDisabledError

    monkeypatch.setattr(settings, "razorpay_key_id", None, raising=False)
    monkeypatch.setattr(settings, "razorpay_key_secret", None, raising=False)

    assert settings.payments_enabled is False
    with pytest.raises(PaymentsDisabledError):
        razorpay_gateway.create_order(amount_paise=1000, receipt="CX-TEST")
