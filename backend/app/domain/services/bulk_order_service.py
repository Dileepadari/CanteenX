"""Bulk / catering requests: a request-then-quote flow."""

from __future__ import annotations

import secrets
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ConflictError, NotFoundError, ValidationError
from app.db.models import (
    BulkOrder,
    BulkOrderStatus,
    Canteen,
    NotificationType,
    User,
    UserRole,
)
from app.domain.services import notification_service
from app.domain.services.catalog_service import assert_manages_canteen

_LOAD = (selectinload(BulkOrder.canteen), selectinload(BulkOrder.requester))

#: Only the canteen may drive these transitions; the requester may cancel.
_VENDOR_TRANSITIONS: dict[BulkOrderStatus, frozenset[BulkOrderStatus]] = {
    BulkOrderStatus.REQUESTED: frozenset(
        {BulkOrderStatus.QUOTED, BulkOrderStatus.DECLINED}
    ),
    BulkOrderStatus.QUOTED: frozenset(
        {BulkOrderStatus.CONFIRMED, BulkOrderStatus.DECLINED}
    ),
    BulkOrderStatus.CONFIRMED: frozenset({BulkOrderStatus.FULFILLED}),
    BulkOrderStatus.FULFILLED: frozenset(),
    BulkOrderStatus.DECLINED: frozenset(),
    BulkOrderStatus.CANCELLED: frozenset(),
}


def _new_reference() -> str:
    return "BX-" + "".join(
        secrets.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(5)
    )


async def get(session: AsyncSession, bulk_order_id: int) -> BulkOrder:
    order = await session.scalar(
        select(BulkOrder).where(BulkOrder.id == bulk_order_id).options(*_LOAD)
    )
    if order is None:
        raise NotFoundError("That bulk order does not exist.")
    return order


async def create(
    session: AsyncSession,
    *,
    user: User,
    canteen_id: int,
    title: str,
    head_count: int,
    required_at: datetime,
    requested_items: list | None = None,
    notes: str | None = None,
    contact_phone: str | None = None,
) -> BulkOrder:
    if head_count < 1:
        raise ValidationError("Head count must be at least 1.")
    if required_at <= datetime.now(UTC):
        raise ValidationError("The required time must be in the future.")

    canteen = await session.get(Canteen, canteen_id)
    if canteen is None or not canteen.is_active:
        raise NotFoundError("That canteen does not exist.")

    order = BulkOrder(
        reference=_new_reference(),
        requester_id=user.id,
        canteen_id=canteen_id,
        title=title.strip(),
        notes=notes,
        head_count=head_count,
        required_at=required_at,
        contact_phone=contact_phone or user.phone,
        requested_items=requested_items or [],
    )
    session.add(order)
    await session.flush()

    await notification_service.notify(
        session,
        user_id=canteen.owner_id,
        type=NotificationType.SYSTEM,
        title="New bulk order request",
        body=f"{user.name} requested catering for {head_count} people.",
        link="/vendor/bulk-orders",
        data={"bulkOrderId": order.id},
    )

    return await get(session, order.id)


async def list_for_user(session: AsyncSession, *, user_id: str) -> list[BulkOrder]:
    result = await session.execute(
        select(BulkOrder)
        .where(BulkOrder.requester_id == user_id)
        .options(*_LOAD)
        .order_by(BulkOrder.created_at.desc())
    )
    return list(result.unique().scalars().all())


async def list_for_canteen(
    session: AsyncSession, *, actor: User, canteen_id: int
) -> list[BulkOrder]:
    await assert_manages_canteen(session, actor, canteen_id)
    result = await session.execute(
        select(BulkOrder)
        .where(BulkOrder.canteen_id == canteen_id)
        .options(*_LOAD)
        .order_by(BulkOrder.required_at)
    )
    return list(result.unique().scalars().all())


async def quote(
    session: AsyncSession,
    *,
    actor: User,
    bulk_order_id: int,
    quoted_total_paise: int,
    quote_note: str | None = None,
) -> BulkOrder:
    order = await get(session, bulk_order_id)
    await assert_manages_canteen(session, actor, order.canteen_id)

    if BulkOrderStatus.QUOTED not in _VENDOR_TRANSITIONS[order.status]:
        raise ConflictError(f"A {order.status.value} request cannot be quoted.")
    if quoted_total_paise <= 0:
        raise ValidationError("The quote must be greater than zero.")

    order.status = BulkOrderStatus.QUOTED
    order.quoted_total_paise = quoted_total_paise
    order.quote_note = quote_note
    order.quoted_at = datetime.now(UTC)

    await notification_service.notify(
        session,
        user_id=order.requester_id,
        type=NotificationType.SYSTEM,
        title="Your catering quote is ready",
        body=f"{order.title}: ₹{quoted_total_paise / 100:,.2f}",
        link="/pre-order",
        data={"bulkOrderId": order.id},
    )

    await session.flush()
    return order


async def set_status(
    session: AsyncSession,
    *,
    actor: User,
    bulk_order_id: int,
    status: BulkOrderStatus,
) -> BulkOrder:
    order = await get(session, bulk_order_id)

    # The requester may cancel their own request; everything else is the
    # canteen's decision.
    if status is BulkOrderStatus.CANCELLED and order.requester_id == actor.id:
        if order.status in (BulkOrderStatus.FULFILLED, BulkOrderStatus.DECLINED):
            raise ConflictError(f"This request is already {order.status.value}.")
    else:
        if actor.role is not UserRole.ADMIN:
            await assert_manages_canteen(session, actor, order.canteen_id)
        if status not in _VENDOR_TRANSITIONS[order.status]:
            raise ConflictError(
                f"A {order.status.value} request cannot become {status.value}."
            )

    order.status = status
    now = datetime.now(UTC)
    if status is BulkOrderStatus.CONFIRMED:
        order.confirmed_at = now
    elif status is BulkOrderStatus.FULFILLED:
        order.fulfilled_at = now

    await session.flush()
    return order
