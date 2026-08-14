"""Ordering: checkout, stock reservation, and the status lifecycle."""

from __future__ import annotations

import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.errors import (
    AuthorizationError,
    ConflictError,
    InvalidStatusTransitionError,
    NotFoundError,
    OutOfStockError,
    ValidationError,
)
from app.core.logging import get_logger
from app.core.pubsub import canteen_queue_channel, get_pubsub, order_channel
from app.db.models import (
    ORDER_STATUS_TRANSITIONS,
    Canteen,
    MenuItem,
    NotificationType,
    Order,
    OrderItem,
    OrderStatus,
    OrderStatusEvent,
    PaymentMethod,
    PaymentStatus,
    ReservationStatus,
    StockReservation,
    User,
    UserRole,
    canteen_staff,
)
from app.domain.pricing import (
    calculate_tax_paise,
    calculate_total_paise,
    price_customizations,
    unit_price_paise,
)
from app.domain.services import cart_service, notification_service, promotion_service

logger = get_logger(__name__)

_REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no ambiguous glyphs


def _new_reference() -> str:
    return "CX-" + "".join(secrets.choice(_REFERENCE_ALPHABET) for _ in range(5))


ORDER_LOAD_OPTIONS = (
    selectinload(Order.items),
    selectinload(Order.status_events),
    selectinload(Order.canteen),
    selectinload(Order.user),
)


# ------------------------------------------------------------------ helpers
async def load_order(session: AsyncSession, order_id: int) -> Order:
    order = await session.scalar(
        select(Order).where(Order.id == order_id).options(*ORDER_LOAD_OPTIONS)
    )
    if order is None:
        raise NotFoundError("That order does not exist.")
    return order


async def user_manages_canteen(
    session: AsyncSession, user: User, canteen_id: int
) -> bool:
    """Object-level authorization for vendor actions."""
    if user.role is UserRole.ADMIN:
        return True

    owner_id = await session.scalar(
        select(Canteen.owner_id).where(Canteen.id == canteen_id)
    )
    if owner_id == user.id:
        return True

    staff_link = await session.scalar(
        select(canteen_staff.c.user_id).where(
            canteen_staff.c.user_id == user.id,
            canteen_staff.c.canteen_id == canteen_id,
        )
    )
    return staff_link is not None


async def assert_can_view_order(
    session: AsyncSession, user: User, order: Order
) -> None:
    if order.user_id == user.id:
        return
    if await user_manages_canteen(session, user, order.canteen_id):
        return
    # Deliberately "not found" rather than "forbidden": confirming an order id
    # exists is itself a small leak.
    raise NotFoundError("That order does not exist.")


def can_cancel(order: Order) -> bool:
    if order.status not in (OrderStatus.PENDING, OrderStatus.CONFIRMED):
        return False
    window = timedelta(seconds=settings.order_cancellation_window_seconds)
    return datetime.now(UTC) - order.created_at <= window


# ------------------------------------------------------------------ stock
async def _reserve_stock(
    session: AsyncSession, order: Order, lines: list[tuple[MenuItem, int]]
) -> None:
    """Decrement tracked stock atomically, or fail the whole checkout.

    The conditional UPDATE is the entire concurrency control: two shoppers
    racing for the last portion both issue it, and exactly one gets rowcount 1.
    The previous implementation read the row, checked in Python, then wrote -
    and wrapped its `SELECT ... FOR UPDATE` in a bare `except` that silently
    fell back to an unlocked read, so the lock did nothing under load.
    """
    expires_at = datetime.now(UTC) + timedelta(
        seconds=settings.stock_reservation_ttl_seconds
    )

    for item, quantity in lines:
        if item.stock_count is None:
            continue

        result = await session.execute(
            update(MenuItem)
            .where(MenuItem.id == item.id, MenuItem.stock_count >= quantity)
            .values(stock_count=MenuItem.stock_count - quantity)
        )
        if result.rowcount != 1:
            raise OutOfStockError(f"'{item.name}' just sold out.")

        session.add(
            StockReservation(
                order_id=order.id,
                menu_item_id=item.id,
                quantity=quantity,
                status=ReservationStatus.HELD,
                expires_at=expires_at,
            )
        )


async def release_reservations(session: AsyncSession, order_id: int) -> int:
    """Return held stock to the shelf. Idempotent."""
    reservations = list(
        (
            await session.execute(
                select(StockReservation).where(
                    StockReservation.order_id == order_id,
                    StockReservation.status == ReservationStatus.HELD,
                )
            )
        )
        .scalars()
        .all()
    )

    for reservation in reservations:
        await session.execute(
            update(MenuItem)
            .where(MenuItem.id == reservation.menu_item_id)
            .values(stock_count=MenuItem.stock_count + reservation.quantity)
        )
        reservation.status = ReservationStatus.RELEASED

    return len(reservations)


async def commit_reservations(session: AsyncSession, order_id: int) -> None:
    """Mark holds as consumed once the order is fulfilled."""
    await session.execute(
        update(StockReservation)
        .where(
            StockReservation.order_id == order_id,
            StockReservation.status == ReservationStatus.HELD,
        )
        .values(status=ReservationStatus.COMMITTED)
    )


# --------------------------------------------------------------- lifecycle
async def _record_status(
    session: AsyncSession,
    order: Order,
    status: OrderStatus,
    *,
    actor_id: str | None = None,
    note: str | None = None,
) -> OrderStatusEvent:
    event = OrderStatusEvent(
        order_id=order.id,
        status=status,
        note=note,
        actor_id=actor_id,
        created_at=datetime.now(UTC),
    )
    session.add(event)
    await session.flush()
    return event


async def _publish_status(order: Order, event: OrderStatusEvent) -> None:
    payload = {
        "orderId": order.id,
        "reference": order.reference,
        "status": order.status.value,
        "paymentStatus": order.payment_status.value,
        "canteenId": order.canteen_id,
        "note": event.note,
        "at": event.created_at.isoformat(),
    }
    pubsub = get_pubsub()
    await pubsub.publish(order_channel(order.id), payload)
    await pubsub.publish(canteen_queue_channel(order.canteen_id), payload)


_STATUS_COPY: dict[OrderStatus, tuple[str, str]] = {
    OrderStatus.CONFIRMED: ("Order confirmed", "The canteen has accepted your order."),
    OrderStatus.PREPARING: ("Being prepared", "Your food is being cooked now."),
    OrderStatus.READY: ("Ready for pickup", "Head over and collect your order."),
    OrderStatus.COMPLETED: ("Order completed", "Enjoy your meal."),
    OrderStatus.CANCELLED: ("Order cancelled", "Your order was cancelled."),
}


# ---------------------------------------------------------------- checkout
async def create_order(
    session: AsyncSession,
    *,
    user: User,
    payment_method: PaymentMethod,
    customer_note: str | None = None,
    contact_phone: str | None = None,
    promotion_code: str | None = None,
    scheduled_for: datetime | None = None,
) -> Order:
    view = await cart_service.load_cart_view(session, user.id)

    if not view.priced_items:
        raise ValidationError("Your cart is empty.")
    if view.blocking_issues:
        raise ConflictError(view.blocking_issues[0], code="cart_not_orderable")

    canteen = await session.get(Canteen, view.cart.canteen_id)
    if canteen is None:
        raise NotFoundError("That canteen does not exist.")
    if not canteen.is_active or not canteen.is_accepting_orders:
        raise ConflictError(f"{canteen.name} is not accepting orders right now.")

    if scheduled_for is not None and scheduled_for <= datetime.now(UTC):
        raise ValidationError("A scheduled pickup time must be in the future.")

    order = Order(
        reference=_new_reference(),
        user_id=user.id,
        canteen_id=canteen.id,
        status=OrderStatus.PENDING,
        payment_status=PaymentStatus.PENDING,
        payment_method=payment_method,
        customer_note=customer_note,
        contact_phone=contact_phone or user.phone,
        scheduled_for=scheduled_for or view.cart.scheduled_for,
    )
    session.add(order)

    # Retry once on the (astronomically unlikely) reference collision.
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise ConflictError("Could not place the order. Please try again.") from None

    subtotal = 0
    stock_lines: list[tuple[MenuItem, int]] = []

    for line, _, _summary in view.priced_items:
        item = line.menu_item
        assert item is not None  # load_cart_view drops lines without a menu item

        selection = price_customizations(item, line.customizations)
        unit = unit_price_paise(item, selection)
        line_total = unit * line.quantity
        subtotal += line_total

        session.add(
            OrderItem(
                order_id=order.id,
                menu_item_id=item.id,
                quantity=line.quantity,
                note=line.note,
                customizations=selection.normalised,
                name_snapshot=item.name,
                customization_summary=", ".join(selection.labels) or None,
                image_url_snapshot=item.image_url,
                unit_price_paise=item.price_paise,
                customization_price_paise=selection.price_delta_paise,
                line_total_paise=line_total,
            )
        )
        stock_lines.append((item, line.quantity))

    discount = 0
    if promotion_code:
        discount = await promotion_service.apply_to_order(
            session,
            order=order,
            user=user,
            code=promotion_code,
            subtotal_paise=subtotal,
        )

    order.subtotal_paise = subtotal
    order.tax_paise = calculate_tax_paise(subtotal)
    order.discount_paise = discount
    order.total_paise = calculate_total_paise(subtotal, order.tax_paise, discount)
    order.ready_estimate_at = datetime.now(UTC) + timedelta(
        minutes=canteen.average_preparation_minutes
    )

    await _reserve_stock(session, order, stock_lines)

    event = await _record_status(
        session, order, OrderStatus.PENDING, actor_id=user.id, note="Order placed"
    )

    await cart_service.clear_items(session, view.cart)

    await session.refresh(order, attribute_names=["items", "status_events"])
    await _publish_status(order, event)

    logger.info(
        "Order created",
        extra={
            "order_id": order.id,
            "reference": order.reference,
            "total_paise": order.total_paise,
        },
    )
    return await load_order(session, order.id)


# ------------------------------------------------------------- transitions
async def transition_status(
    session: AsyncSession,
    *,
    actor: User,
    order_id: int,
    new_status: OrderStatus,
    note: str | None = None,
) -> Order:
    order = await load_order(session, order_id)

    if not await user_manages_canteen(session, actor, order.canteen_id):
        raise AuthorizationError("You do not manage this canteen.")

    allowed = ORDER_STATUS_TRANSITIONS[order.status]
    if new_status not in allowed:
        raise InvalidStatusTransitionError(
            f"An order that is {order.status.value} cannot become {new_status.value}."
        )

    if new_status is OrderStatus.COMPLETED and not order.is_paid:
        raise ConflictError("This order has not been paid for yet.")

    order.status = new_status
    now = datetime.now(UTC)

    if new_status is OrderStatus.COMPLETED:
        order.completed_at = now
        await commit_reservations(session, order.id)
    elif new_status is OrderStatus.CANCELLED:
        order.cancelled_at = now
        order.cancellation_reason = note
        await release_reservations(session, order.id)

    event = await _record_status(
        session, order, new_status, actor_id=actor.id, note=note
    )
    await _publish_status(order, event)

    title, body = _STATUS_COPY.get(new_status, ("Order updated", None))
    await notification_service.notify(
        session,
        user_id=order.user_id,
        type=NotificationType.ORDER_STATUS,
        title=title,
        body=f"{body} ({order.reference})" if body else order.reference,
        link=f"/orders/track/{order.id}",
        data={"orderId": order.id, "status": new_status.value},
    )

    return await load_order(session, order.id)


async def cancel_own_order(
    session: AsyncSession, *, user: User, order_id: int, reason: str | None = None
) -> Order:
    order = await load_order(session, order_id)

    if order.user_id != user.id:
        raise NotFoundError("That order does not exist.")

    if order.status.is_terminal:
        raise ConflictError(f"This order is already {order.status.value}.")

    if not can_cancel(order):
        raise ConflictError(
            "This order can no longer be cancelled. Please contact the canteen."
        )

    order.status = OrderStatus.CANCELLED
    order.cancelled_at = datetime.now(UTC)
    order.cancellation_reason = reason

    # Restoring stock on cancellation is new. Previously it was never returned,
    # so every abandoned or cancelled order permanently leaked inventory.
    await release_reservations(session, order.id)

    if order.payment_status is PaymentStatus.PAID:
        from app.domain.services import payment_service

        await payment_service.refund_order(
            session, order=order, reason="Order cancelled by customer"
        )

    event = await _record_status(
        session,
        order,
        OrderStatus.CANCELLED,
        actor_id=user.id,
        note=reason or "Cancelled by customer",
    )
    await _publish_status(order, event)

    return await load_order(session, order.id)


# --------------------------------------------------------------- listings
async def list_for_user(
    session: AsyncSession,
    *,
    user_id: str,
    active_only: bool = False,
    limit: int = 20,
    offset: int = 0,
) -> list[Order]:
    query = select(Order).where(Order.user_id == user_id)
    if active_only:
        query = query.where(
            Order.status.notin_([OrderStatus.COMPLETED, OrderStatus.CANCELLED])
        )

    result = await session.execute(
        query.options(*ORDER_LOAD_OPTIONS)
        .order_by(Order.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.unique().scalars().all())


async def list_for_canteen(
    session: AsyncSession,
    *,
    canteen_id: int,
    statuses: list[OrderStatus] | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[Order]:
    query = select(Order).where(Order.canteen_id == canteen_id)
    if statuses:
        query = query.where(Order.status.in_(statuses))

    result = await session.execute(
        query.options(*ORDER_LOAD_OPTIONS)
        .order_by(Order.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.unique().scalars().all())


async def expire_stale_reservations(session: AsyncSession) -> int:
    """Release holds for orders that were never paid. Run by the sweeper."""
    stale = list(
        (
            await session.execute(
                select(StockReservation.order_id)
                .join(Order, Order.id == StockReservation.order_id)
                .where(
                    StockReservation.status == ReservationStatus.HELD,
                    StockReservation.expires_at < datetime.now(UTC),
                    Order.payment_status != PaymentStatus.PAID,
                    Order.status == OrderStatus.PENDING,
                )
                .distinct()
            )
        )
        .scalars()
        .all()
    )

    for order_id in stale:
        await release_reservations(session, order_id)
        order = await session.get(Order, order_id)
        if order is not None and order.status is OrderStatus.PENDING:
            order.status = OrderStatus.CANCELLED
            order.cancelled_at = datetime.now(UTC)
            order.cancellation_reason = "Payment was not completed in time"
            await _record_status(
                session,
                order,
                OrderStatus.CANCELLED,
                note="Expired before payment",
            )

    if stale:
        logger.info("Expired stale orders", extra={"count": len(stale)})
    return len(stale)
