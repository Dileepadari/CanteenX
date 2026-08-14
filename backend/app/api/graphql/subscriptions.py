"""Subscription root - live order tracking and notifications over WebSocket.

These replace a notification system that was `useState` plus `localStorage`,
where an event only ever appeared in the tab that caused it. A student could
therefore never be told their order was ready, because the vendor's browser is
what changed the status.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

import strawberry
from strawberry.types import Info

from app.api.graphql.permissions import IsAuthenticated, IsVendor
from app.api.graphql.types.enums import OrderStatus, PaymentStatus
from app.core.errors import AuthorizationError
from app.core.logging import get_logger
from app.core.pubsub import (
    canteen_queue_channel,
    get_pubsub,
    order_channel,
    user_channel,
)
from app.domain.services import catalog_service, order_service

logger = get_logger(__name__)


@strawberry.type(name="OrderStatusUpdate")
class OrderStatusUpdateType:
    order_id: int
    reference: str
    status: OrderStatus
    payment_status: PaymentStatus
    canteen_id: int
    note: str | None
    at: str


@strawberry.type(name="NotificationEvent")
class NotificationEventType:
    id: int
    type: str
    title: str
    body: str | None
    link: str | None
    created_at: str


def _to_status_update(payload: dict) -> OrderStatusUpdateType:
    return OrderStatusUpdateType(
        order_id=payload["orderId"],
        reference=payload["reference"],
        status=OrderStatus(payload["status"]),
        payment_status=PaymentStatus(payload["paymentStatus"]),
        canteen_id=payload["canteenId"],
        note=payload.get("note"),
        at=payload["at"],
    )


@strawberry.type
class Subscription:
    @strawberry.subscription(
        permission_classes=[IsAuthenticated],
        description="Live status for one order. Owner or canteen team only.",
    )
    async def order_status(
        self, info: Info, order_id: int
    ) -> AsyncGenerator[OrderStatusUpdateType, None]:
        user = await info.context.require_user()

        # Authorize once at subscribe time, then release the connection. The
        # loop below can run for hours; holding a pooled session across it
        # exhausts the pool. Skipping the check entirely would let anyone
        # stream any order simply by guessing an id.
        async with info.context.db() as session:
            order = await order_service.load_order(session, order_id)
            await order_service.assert_can_view_order(session, user, order)

        async for payload in get_pubsub().subscribe(order_channel(order_id)):
            yield _to_status_update(payload)

    @strawberry.subscription(
        permission_classes=[IsVendor],
        description="Live order queue for a canteen kitchen display.",
    )
    async def canteen_order_queue(
        self, info: Info, canteen_id: int
    ) -> AsyncGenerator[OrderStatusUpdateType, None]:
        user = await info.context.require_user()

        async with info.context.db() as session:
            await catalog_service.assert_manages_canteen(session, user, canteen_id)

        async for payload in get_pubsub().subscribe(canteen_queue_channel(canteen_id)):
            yield _to_status_update(payload)

    @strawberry.subscription(
        permission_classes=[IsAuthenticated],
        description="Notifications addressed to the signed-in user.",
    )
    async def notifications(
        self, info: Info
    ) -> AsyncGenerator[NotificationEventType, None]:
        user = await info.context.require_user()

        # The channel is derived from the authenticated identity, never from an
        # argument, so one user cannot subscribe to another's stream.
        if not user.id:  # pragma: no cover - require_user guarantees this
            raise AuthorizationError()

        async for payload in get_pubsub().subscribe(user_channel(user.id)):
            yield NotificationEventType(
                id=payload["id"],
                type=payload["type"],
                title=payload["title"],
                body=payload.get("body"),
                link=payload.get("link"),
                created_at=payload["createdAt"],
            )
