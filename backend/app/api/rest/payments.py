"""Razorpay webhook receiver.

This endpoint is the authoritative confirmation of payment. It is deliberately
CSRF-exempt and unauthenticated in the session sense - Razorpay cannot present
a cookie - and is instead authenticated by an HMAC signature over the raw body.
"""

from __future__ import annotations

from fastapi import APIRouter, Header, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.core.config import settings
from app.core.database import get_session
from app.core.logging import get_logger
from app.domain.gateways import razorpay_gateway
from app.domain.services import payment_service

logger = get_logger(__name__)

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def razorpay_webhook(
    request: Request,
    response: Response,
    x_razorpay_signature: str | None = Header(default=None),
    x_razorpay_event_id: str | None = Header(default=None),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    if not settings.webhooks_enabled:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "webhooks_disabled"}

    # The signature must be computed over the exact bytes received. Re-encoding
    # a parsed JSON body changes whitespace and key order, and the HMAC fails.
    body = await request.body()

    if not razorpay_gateway.verify_webhook_signature(
        body=body, signature=x_razorpay_signature or ""
    ):
        logger.warning("Rejected webhook with an invalid signature")
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return {"status": "invalid_signature"}

    payload = await request.json()
    event_type = payload.get("event", "")

    # Razorpay does not always send an event id header; fall back to a
    # deterministic key so replays still collapse to one row.
    event_id = x_razorpay_event_id or (
        f"{event_type}:"
        f"{payload.get('payload', {}).get('payment', {}).get('entity', {}).get('id', '')}"
    )

    processed = await payment_service.handle_webhook(
        session, event_id=event_id, event_type=event_type, payload=payload
    )

    # Always 200: a non-2xx makes Razorpay retry, and a duplicate is not a
    # failure - it is the system working as intended.
    return {"status": "processed" if processed else "duplicate"}
