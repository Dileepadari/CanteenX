"""Aggregates for the vendor and admin dashboards.

Computed in SQL. The old dashboards either hardcoded their KPI tiles or pulled
every order to the browser and reduced them in JavaScript, which is both slow
and wrong once the result set is paginated.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    Canteen,
    Complaint,
    ComplaintStatus,
    MenuItem,
    Order,
    OrderItem,
    OrderStatus,
    PaymentStatus,
    User,
    UserRole,
)


@dataclass(slots=True)
class CanteenStats:
    canteen_id: int
    canteen_name: str
    orders_today: int
    orders_total: int
    revenue_today_paise: int
    revenue_total_paise: int
    pending_orders: int
    open_complaints: int
    average_order_value_paise: int
    rating: float


@dataclass(slots=True)
class PlatformStats:
    total_users: int
    total_vendors: int
    total_canteens: int
    total_menu_items: int
    orders_today: int
    revenue_today_paise: int
    revenue_total_paise: int
    open_complaints: int
    active_orders: int


@dataclass(slots=True)
class TimeseriesPoint:
    date: str
    orders: int
    revenue_paise: int


@dataclass(slots=True)
class TopItem:
    menu_item_id: int | None
    name: str
    quantity: int
    revenue_paise: int


def _start_of_today() -> datetime:
    now = datetime.now(UTC)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def _revenue_filter(query: Select) -> Select:
    """Only paid, non-cancelled orders count as revenue."""
    return query.where(
        Order.payment_status == PaymentStatus.PAID,
        Order.status != OrderStatus.CANCELLED,
    )


async def canteen_stats(session: AsyncSession, *, canteen_id: int) -> CanteenStats:
    today = _start_of_today()

    canteen = await session.get(Canteen, canteen_id)
    name = canteen.name if canteen else "Unknown"
    rating = float(canteen.rating) if canteen else 0.0

    orders_today = await session.scalar(
        select(func.count())
        .select_from(Order)
        .where(Order.canteen_id == canteen_id, Order.created_at >= today)
    )
    orders_total = await session.scalar(
        select(func.count()).select_from(Order).where(Order.canteen_id == canteen_id)
    )

    revenue_today = await session.scalar(
        _revenue_filter(
            select(func.coalesce(func.sum(Order.total_paise), 0)).where(
                Order.canteen_id == canteen_id, Order.created_at >= today
            )
        )
    )
    revenue_total = await session.scalar(
        _revenue_filter(
            select(func.coalesce(func.sum(Order.total_paise), 0)).where(
                Order.canteen_id == canteen_id
            )
        )
    )
    paid_count = await session.scalar(
        _revenue_filter(
            select(func.count())
            .select_from(Order)
            .where(Order.canteen_id == canteen_id)
        )
    )

    pending = await session.scalar(
        select(func.count())
        .select_from(Order)
        .where(
            Order.canteen_id == canteen_id,
            Order.status.in_(
                [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING]
            ),
        )
    )
    complaints = await session.scalar(
        select(func.count())
        .select_from(Complaint)
        .where(
            Complaint.canteen_id == canteen_id,
            Complaint.status.in_([ComplaintStatus.OPEN, ComplaintStatus.ESCALATED]),
        )
    )

    return CanteenStats(
        canteen_id=canteen_id,
        canteen_name=name,
        orders_today=orders_today or 0,
        orders_total=orders_total or 0,
        revenue_today_paise=revenue_today or 0,
        revenue_total_paise=revenue_total or 0,
        pending_orders=pending or 0,
        open_complaints=complaints or 0,
        average_order_value_paise=int((revenue_total or 0) / paid_count)
        if paid_count
        else 0,
        rating=rating,
    )


async def platform_stats(session: AsyncSession) -> PlatformStats:
    today = _start_of_today()

    return PlatformStats(
        total_users=(
            await session.scalar(
                select(func.count()).select_from(User).where(User.deleted_at.is_(None))
            )
        )
        or 0,
        total_vendors=(
            await session.scalar(
                select(func.count())
                .select_from(User)
                .where(User.role == UserRole.VENDOR, User.deleted_at.is_(None))
            )
        )
        or 0,
        total_canteens=(
            await session.scalar(
                select(func.count())
                .select_from(Canteen)
                .where(Canteen.is_active.is_(True))
            )
        )
        or 0,
        total_menu_items=(
            await session.scalar(select(func.count()).select_from(MenuItem))
        )
        or 0,
        orders_today=(
            await session.scalar(
                select(func.count()).select_from(Order).where(Order.created_at >= today)
            )
        )
        or 0,
        revenue_today_paise=(
            await session.scalar(
                _revenue_filter(
                    select(func.coalesce(func.sum(Order.total_paise), 0)).where(
                        Order.created_at >= today
                    )
                )
            )
        )
        or 0,
        revenue_total_paise=(
            await session.scalar(
                _revenue_filter(select(func.coalesce(func.sum(Order.total_paise), 0)))
            )
        )
        or 0,
        open_complaints=(
            await session.scalar(
                select(func.count())
                .select_from(Complaint)
                .where(
                    Complaint.status.in_(
                        [ComplaintStatus.OPEN, ComplaintStatus.ESCALATED]
                    )
                )
            )
        )
        or 0,
        active_orders=(
            await session.scalar(
                select(func.count())
                .select_from(Order)
                .where(
                    Order.status.notin_([OrderStatus.COMPLETED, OrderStatus.CANCELLED])
                )
            )
        )
        or 0,
    )


async def revenue_timeseries(
    session: AsyncSession, *, canteen_id: int | None = None, days: int = 30
) -> list[TimeseriesPoint]:
    since = _start_of_today() - timedelta(days=days - 1)
    day = func.date_trunc("day", Order.created_at).label("day")

    query = (
        select(day, func.count(), func.coalesce(func.sum(Order.total_paise), 0))
        .where(Order.created_at >= since)
        .group_by(day)
        .order_by(day)
    )
    query = _revenue_filter(query)
    if canteen_id is not None:
        query = query.where(Order.canteen_id == canteen_id)

    rows = (await session.execute(query)).all()
    by_date = {row[0].date().isoformat(): (row[1], row[2]) for row in rows}

    # Emit a point for every day, including zero days - a chart with gaps
    # silently misrepresents a quiet weekend as missing data.
    points: list[TimeseriesPoint] = []
    for offset in range(days):
        date = (since + timedelta(days=offset)).date().isoformat()
        orders, revenue = by_date.get(date, (0, 0))
        points.append(TimeseriesPoint(date=date, orders=orders, revenue_paise=revenue))
    return points


async def top_items(
    session: AsyncSession, *, canteen_id: int | None = None, limit: int = 10
) -> list[TopItem]:
    query = (
        select(
            OrderItem.menu_item_id,
            OrderItem.name_snapshot,
            func.sum(OrderItem.quantity),
            func.sum(OrderItem.line_total_paise),
        )
        .join(Order, Order.id == OrderItem.order_id)
        .group_by(OrderItem.menu_item_id, OrderItem.name_snapshot)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
    )
    query = _revenue_filter(query)
    if canteen_id is not None:
        query = query.where(Order.canteen_id == canteen_id)

    return [
        TopItem(
            menu_item_id=row[0],
            name=row[1],
            quantity=int(row[2] or 0),
            revenue_paise=int(row[3] or 0),
        )
        for row in (await session.execute(query)).all()
    ]
