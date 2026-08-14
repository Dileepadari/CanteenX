"""Query root.

Every field names a permission class, `AllowAny` included. A field with no
policy fails the schema-completeness test in `tests/test_schema_policy.py`.
"""

from __future__ import annotations

import strawberry
from strawberry.types import Info

from app.api.graphql.permissions import (
    AllowAny,
    IsAdmin,
    IsAuthenticated,
    IsVendor,
)
from app.api.graphql.types.catalog import (
    CanteenType,
    MenuItemType,
    PromotionType_,
    to_canteen,
    to_menu_item,
    to_promotion,
)
from app.api.graphql.types.commerce import (
    BulkOrderType,
    CartType,
    ComplaintType,
    NotificationType_,
    OrderType,
    ReviewType,
    WalletType,
    to_bulk_order,
    to_cart,
    to_cart_item,
    to_complaint,
    to_notification,
    to_order,
    to_review,
    to_wallet,
)
from app.api.graphql.types.enums import ComplaintStatus, OrderStatus, UserRole
from app.api.graphql.types.identity import UserType, to_user
from app.api.graphql.types.stats import (
    CanteenStatsType,
    PlatformStatsType,
    PromotionPreviewType,
    TimeseriesPointType,
    TopItemType,
)
from app.api.graphql.types.common import money
from app.domain.services import (
    analytics_service,
    bulk_order_service,
    cart_service,
    catalog_service,
    engagement_service,
    notification_service,
    order_service,
    promotion_service,
    user_service,
    wallet_service,
)


async def _canteen_types(info: Info, canteens: list) -> list[CanteenType]:
    """Map canteens with their counts and favourite flags in two extra queries.

    Batched deliberately: doing it per-canteen is the N+1 that made the old
    canteen list issue one query per row through lazy relationship properties.
    """
    session = info.context.session
    ids = [c.id for c in canteens]
    counts = await catalog_service.menu_item_counts(session, ids)

    favorites: set[int] = set()
    if info.context.user_id:
        favorites = await catalog_service.favorite_canteen_ids(
            session, info.context.user_id
        )

    return [
        to_canteen(
            canteen,
            is_open_now=catalog_service.is_open_now(canteen),
            menu_item_count=counts.get(canteen.id, 0),
            is_favorite=canteen.id in favorites,
        )
        for canteen in canteens
    ]


@strawberry.type
class Query:
    # ------------------------------------------------------------- identity
    @strawberry.field(
        permission_classes=[AllowAny],
        description="The signed-in user, or null when anonymous.",
    )
    async def me(self, info: Info) -> UserType | None:
        user = await info.context.user()
        return to_user(user) if user else None

    # -------------------------------------------------------------- catalog
    @strawberry.field(permission_classes=[AllowAny])
    async def canteens(
        self,
        info: Info,
        search: str | None = None,
        open_only: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> list[CanteenType]:
        canteens = await catalog_service.list_canteens(
            info.context.session,
            search=search,
            open_only=open_only,
            limit=min(limit, 100),
            offset=max(offset, 0),
        )
        return await _canteen_types(info, canteens)

    @strawberry.field(permission_classes=[AllowAny])
    async def canteen(self, info: Info, id: int) -> CanteenType:
        canteen = await catalog_service.get_canteen(info.context.session, id)
        return (await _canteen_types(info, [canteen]))[0]

    @strawberry.field(permission_classes=[AllowAny])
    async def menu_items(
        self,
        info: Info,
        canteen_id: int | None = None,
        category: str | None = None,
        search: str | None = None,
        vegetarian_only: bool = False,
        featured_only: bool = False,
        limit: int = 100,
        offset: int = 0,
    ) -> list[MenuItemType]:
        items = await catalog_service.list_menu_items(
            info.context.session,
            canteen_id=canteen_id,
            category=category,
            search=search,
            vegetarian_only=vegetarian_only,
            featured_only=featured_only,
            limit=min(limit, 200),
            offset=max(offset, 0),
        )
        return [
            to_menu_item(item, canteen_name=item.canteen.name if item.canteen else None)
            for item in items
        ]

    @strawberry.field(permission_classes=[AllowAny])
    async def menu_item(self, info: Info, id: int) -> MenuItemType:
        item = await catalog_service.get_menu_item(info.context.session, id)
        return to_menu_item(
            item, canteen_name=item.canteen.name if item.canteen else None
        )

    @strawberry.field(permission_classes=[AllowAny])
    async def menu_categories(
        self, info: Info, canteen_id: int | None = None
    ) -> list[str]:
        return await catalog_service.list_categories(info.context.session, canteen_id)

    @strawberry.field(permission_classes=[AllowAny])
    async def reviews(
        self,
        info: Info,
        canteen_id: int | None = None,
        menu_item_id: int | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[ReviewType]:
        rows = await engagement_service.list_reviews(
            info.context.session,
            canteen_id=canteen_id,
            menu_item_id=menu_item_id,
            limit=min(limit, 50),
            offset=max(offset, 0),
        )
        return [to_review(row) for row in rows]

    @strawberry.field(
        permission_classes=[AllowAny],
        description="Promotions currently running at a canteen.",
    )
    async def live_promotions(
        self, info: Info, canteen_id: int
    ) -> list[PromotionType_]:
        rows = await promotion_service.list_for_canteen(
            info.context.session, canteen_id=canteen_id, live_only=True
        )
        return [to_promotion(row, is_live_now=True) for row in rows]

    # ----------------------------------------------------------------- cart
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def cart(self, info: Info) -> CartType:
        user = await info.context.require_user()
        view = await cart_service.load_cart_view(info.context.session, user.id)
        return to_cart(
            view.cart,
            items=[
                to_cart_item(line, unit_price_paise=unit, summary=summary)
                for line, unit, summary in view.priced_items
            ],
            subtotal_paise=view.subtotal_paise,
            tax_paise=view.tax_paise,
            canteen_name=view.canteen_name,
            blocking_issues=view.blocking_issues,
        )

    # --------------------------------------------------------------- orders
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def my_orders(
        self,
        info: Info,
        active_only: bool = False,
        limit: int = 20,
        offset: int = 0,
    ) -> list[OrderType]:
        user = await info.context.require_user()
        orders = await order_service.list_for_user(
            info.context.session,
            user_id=user.id,
            active_only=active_only,
            limit=min(limit, 50),
            offset=max(offset, 0),
        )
        return [
            to_order(order, can_cancel=order_service.can_cancel(order))
            for order in orders
        ]

    @strawberry.field(
        permission_classes=[IsAuthenticated],
        description="A single order. Visible to its owner and the canteen team.",
    )
    async def order(self, info: Info, id: int) -> OrderType:
        user = await info.context.require_user()
        order = await order_service.load_order(info.context.session, id)
        # Object-level ownership, which a role check alone cannot express.
        await order_service.assert_can_view_order(info.context.session, user, order)
        return to_order(order, can_cancel=order_service.can_cancel(order))

    # -------------------------------------------------------------- wallet
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def wallet(self, info: Info) -> WalletType:
        user = await info.context.require_user()
        session = info.context.session
        wallet = await wallet_service.get_or_create(session, user.id)
        transactions = await wallet_service.list_transactions(session, user_id=user.id)
        return to_wallet(wallet, transactions=transactions)

    # -------------------------------------------------------- notifications
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def notifications(
        self,
        info: Info,
        unread_only: bool = False,
        limit: int = 30,
        offset: int = 0,
    ) -> list[NotificationType_]:
        user = await info.context.require_user()
        rows = await notification_service.list_for_user(
            info.context.session,
            user_id=user.id,
            unread_only=unread_only,
            limit=min(limit, 100),
            offset=max(offset, 0),
        )
        return [to_notification(row) for row in rows]

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def unread_notification_count(self, info: Info) -> int:
        user = await info.context.require_user()
        return await notification_service.unread_count(
            info.context.session, user_id=user.id
        )

    # ----------------------------------------------------------- engagement
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def complaints(
        self,
        info: Info,
        canteen_id: int | None = None,
        status: ComplaintStatus | None = None,
        mine_only: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> list[ComplaintType]:
        user = await info.context.require_user()
        rows = await engagement_service.list_complaints(
            info.context.session,
            actor=user,
            canteen_id=canteen_id,
            status=status,
            mine_only=mine_only,
            limit=min(limit, 100),
            offset=max(offset, 0),
        )
        return [to_complaint(row) for row in rows]

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def favorite_canteens(self, info: Info) -> list[CanteenType]:
        user = await info.context.require_user()
        canteens = await user_service.list_favorites(
            info.context.session, user_id=user.id
        )
        return await _canteen_types(info, canteens)

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def my_bulk_orders(self, info: Info) -> list[BulkOrderType]:
        user = await info.context.require_user()
        rows = await bulk_order_service.list_for_user(
            info.context.session, user_id=user.id
        )
        return [to_bulk_order(row) for row in rows]

    @strawberry.field(
        permission_classes=[IsAuthenticated],
        description="Check a promo code against the current cart without using it.",
    )
    async def promotion_preview(self, info: Info, code: str) -> PromotionPreviewType:
        user = await info.context.require_user()
        session = info.context.session
        view = await cart_service.load_cart_view(session, user.id)

        if view.cart.canteen_id is None:
            return PromotionPreviewType(
                valid=False, message="Your cart is empty.", discount=money(0)
            )

        try:
            promotion, discount = await promotion_service.preview(
                session,
                canteen_id=view.cart.canteen_id,
                user_id=user.id,
                code=code,
                subtotal_paise=view.subtotal_paise,
            )
        except Exception as exc:  # domain errors carry a user-safe message
            return PromotionPreviewType(
                valid=False, message=str(exc), discount=money(0)
            )

        return PromotionPreviewType(
            valid=True,
            message=promotion.title,
            discount=money(discount),
            promotion=to_promotion(promotion, is_live_now=True),
        )

    # --------------------------------------------------------------- vendor
    @strawberry.field(
        permission_classes=[IsVendor],
        description="Canteens the signed-in user owns or staffs.",
    )
    async def managed_canteens(self, info: Info) -> list[CanteenType]:
        user = await info.context.require_user()
        canteens = await user_service.canteens_managed_by(info.context.session, user)
        return await _canteen_types(info, canteens)

    @strawberry.field(permission_classes=[IsVendor])
    async def canteen_orders(
        self,
        info: Info,
        canteen_id: int,
        statuses: list[OrderStatus] | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[OrderType]:
        user = await info.context.require_user()
        await catalog_service.assert_manages_canteen(
            info.context.session, user, canteen_id
        )
        orders = await order_service.list_for_canteen(
            info.context.session,
            canteen_id=canteen_id,
            statuses=statuses,
            limit=min(limit, 100),
            offset=max(offset, 0),
        )
        return [to_order(order) for order in orders]

    @strawberry.field(
        permission_classes=[IsVendor],
        description="Vendor menu view - includes unavailable items.",
    )
    async def canteen_menu(self, info: Info, canteen_id: int) -> list[MenuItemType]:
        user = await info.context.require_user()
        await catalog_service.assert_manages_canteen(
            info.context.session, user, canteen_id
        )
        items = await catalog_service.list_menu_items(
            info.context.session, canteen_id=canteen_id, available_only=False, limit=500
        )
        return [to_menu_item(item) for item in items]

    @strawberry.field(permission_classes=[IsVendor])
    async def canteen_stats(self, info: Info, canteen_id: int) -> CanteenStatsType:
        user = await info.context.require_user()
        await catalog_service.assert_manages_canteen(
            info.context.session, user, canteen_id
        )
        stats = await analytics_service.canteen_stats(
            info.context.session, canteen_id=canteen_id
        )
        return CanteenStatsType.from_domain(stats)

    @strawberry.field(permission_classes=[IsVendor])
    async def canteen_staff(self, info: Info, canteen_id: int) -> list[UserType]:
        user = await info.context.require_user()
        await catalog_service.assert_manages_canteen(
            info.context.session, user, canteen_id
        )
        staff = await user_service.list_staff(
            info.context.session, canteen_id=canteen_id
        )
        return [to_user(member) for member in staff]

    @strawberry.field(permission_classes=[IsVendor])
    async def canteen_promotions(
        self, info: Info, canteen_id: int
    ) -> list[PromotionType_]:
        user = await info.context.require_user()
        await catalog_service.assert_manages_canteen(
            info.context.session, user, canteen_id
        )
        rows = await promotion_service.list_for_canteen(
            info.context.session, canteen_id=canteen_id
        )
        return [
            to_promotion(row, is_live_now=promotion_service.is_live(row))
            for row in rows
        ]

    @strawberry.field(permission_classes=[IsVendor])
    async def canteen_bulk_orders(
        self, info: Info, canteen_id: int
    ) -> list[BulkOrderType]:
        user = await info.context.require_user()
        rows = await bulk_order_service.list_for_canteen(
            info.context.session, actor=user, canteen_id=canteen_id
        )
        return [to_bulk_order(row) for row in rows]

    @strawberry.field(permission_classes=[IsVendor])
    async def revenue_timeseries(
        self, info: Info, canteen_id: int | None = None, days: int = 30
    ) -> list[TimeseriesPointType]:
        user = await info.context.require_user()
        if canteen_id is not None:
            await catalog_service.assert_manages_canteen(
                info.context.session, user, canteen_id
            )
        elif user.role is not UserRole.ADMIN:
            raise PermissionError  # pragma: no cover - IsVendor + explicit id

        points = await analytics_service.revenue_timeseries(
            info.context.session, canteen_id=canteen_id, days=min(days, 365)
        )
        return [
            TimeseriesPointType(
                date=p.date, orders=p.orders, revenue=money(p.revenue_paise)
            )
            for p in points
        ]

    @strawberry.field(permission_classes=[IsVendor])
    async def top_items(
        self, info: Info, canteen_id: int | None = None, limit: int = 10
    ) -> list[TopItemType]:
        user = await info.context.require_user()
        if canteen_id is not None:
            await catalog_service.assert_manages_canteen(
                info.context.session, user, canteen_id
            )
        rows = await analytics_service.top_items(
            info.context.session, canteen_id=canteen_id, limit=min(limit, 50)
        )
        return [
            TopItemType(
                menu_item_id=row.menu_item_id,
                name=row.name,
                quantity=row.quantity,
                revenue=money(row.revenue_paise),
            )
            for row in rows
        ]

    # ---------------------------------------------------------------- admin
    @strawberry.field(permission_classes=[IsAdmin])
    async def users(
        self,
        info: Info,
        role: UserRole | None = None,
        search: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[UserType]:
        actor = await info.context.require_user()
        rows = await user_service.list_users(
            info.context.session,
            actor=actor,
            role=role,
            search=search,
            limit=min(limit, 100),
            offset=max(offset, 0),
        )
        return [to_user(row) for row in rows]

    @strawberry.field(permission_classes=[IsAdmin])
    async def platform_stats(self, info: Info) -> PlatformStatsType:
        stats = await analytics_service.platform_stats(info.context.session)
        return PlatformStatsType.from_domain(stats)
