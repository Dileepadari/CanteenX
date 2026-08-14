"""Dashboard and analytics GraphQL types."""

from __future__ import annotations

import strawberry

from app.api.graphql.types.catalog import PromotionType_
from app.api.graphql.types.common import Money, money
from app.domain.services import analytics_service


@strawberry.type(name="CanteenStats")
class CanteenStatsType:
    canteen_id: int
    canteen_name: str
    orders_today: int
    orders_total: int
    revenue_today: Money
    revenue_total: Money
    pending_orders: int
    open_complaints: int
    average_order_value: Money
    rating: float

    @classmethod
    def from_domain(cls, stats: analytics_service.CanteenStats) -> "CanteenStatsType":
        return cls(
            canteen_id=stats.canteen_id,
            canteen_name=stats.canteen_name,
            orders_today=stats.orders_today,
            orders_total=stats.orders_total,
            revenue_today=money(stats.revenue_today_paise),
            revenue_total=money(stats.revenue_total_paise),
            pending_orders=stats.pending_orders,
            open_complaints=stats.open_complaints,
            average_order_value=money(stats.average_order_value_paise),
            rating=stats.rating,
        )


@strawberry.type(name="PlatformStats")
class PlatformStatsType:
    total_users: int
    total_vendors: int
    total_canteens: int
    total_menu_items: int
    orders_today: int
    revenue_today: Money
    revenue_total: Money
    open_complaints: int
    active_orders: int

    @classmethod
    def from_domain(cls, stats: analytics_service.PlatformStats) -> "PlatformStatsType":
        return cls(
            total_users=stats.total_users,
            total_vendors=stats.total_vendors,
            total_canteens=stats.total_canteens,
            total_menu_items=stats.total_menu_items,
            orders_today=stats.orders_today,
            revenue_today=money(stats.revenue_today_paise),
            revenue_total=money(stats.revenue_total_paise),
            open_complaints=stats.open_complaints,
            active_orders=stats.active_orders,
        )


@strawberry.type(name="TimeseriesPoint")
class TimeseriesPointType:
    date: str
    orders: int
    revenue: Money


@strawberry.type(name="TopItem")
class TopItemType:
    menu_item_id: int | None
    name: str
    quantity: int
    revenue: Money


@strawberry.type(name="PromotionPreview")
class PromotionPreviewType:
    valid: bool
    message: str
    discount: Money
    promotion: PromotionType_ | None = None
