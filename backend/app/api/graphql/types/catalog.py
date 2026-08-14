"""Canteen, menu, and promotion GraphQL types."""

from __future__ import annotations

from datetime import datetime, time

import strawberry

from app.api.graphql.types.common import Money, money
from app.api.graphql.types.enums import PromotionType
from app.db.models import Canteen, MenuItem, Promotion


@strawberry.type(name="CustomizationOption")
class CustomizationOptionType:
    id: str
    label: str
    price_delta: Money
    is_default: bool = False


@strawberry.type(name="CustomizationGroup")
class CustomizationGroupType:
    id: str
    label: str
    #: "single" or "multiple"
    selection: str
    required: bool
    options: list[CustomizationOptionType]


@strawberry.type(name="Canteen")
class CanteenType:
    id: int
    name: str
    slug: str
    description: str | None
    location: str | None
    banner_url: str | None
    logo_url: str | None
    phone: str | None
    email: str | None
    rating: float
    rating_count: int
    opens_at: time | None
    closes_at: time | None
    is_accepting_orders: bool
    is_active: bool
    tags: list[str]
    average_preparation_minutes: int
    owner_id: strawberry.ID

    #: Computed from the weekly schedule *and* the manual override, so clients
    #: never have to re-derive opening hours themselves.
    is_open_now: bool
    menu_item_count: int
    is_favorite: bool


@strawberry.type(name="MenuItem")
class MenuItemType:
    id: int
    name: str
    description: str | None
    price: Money
    image_url: str | None
    category: str | None
    canteen_id: int
    canteen_name: str | None
    is_vegetarian: bool
    is_vegan: bool
    contains_allergens: list[str]
    is_available: bool
    is_featured: bool
    #: Null means the item is not stock-tracked, which is different from 0.
    stock_count: int | None
    preparation_minutes: int
    rating: float
    rating_count: int
    order_count: int
    tags: list[str]
    customization_groups: list[CustomizationGroupType]

    @strawberry.field(description="False when unavailable or tracked and sold out.")
    def is_orderable(self) -> bool:
        if not self.is_available:
            return False
        return self.stock_count is None or self.stock_count > 0


@strawberry.type(name="Promotion")
class PromotionType_:
    id: int
    canteen_id: int
    code: str
    title: str
    description: str | None
    type: PromotionType
    #: Basis points for percentage promotions, paise for flat ones.
    value: int
    max_discount: Money | None
    min_order: Money
    starts_at: datetime
    ends_at: datetime
    max_redemptions: int | None
    max_redemptions_per_user: int
    redemption_count: int
    is_active: bool
    is_live_now: bool


# ----------------------------------------------------------------- mappers
def to_customization_groups(raw: list | None) -> list[CustomizationGroupType]:
    groups: list[CustomizationGroupType] = []
    for group in raw or []:
        groups.append(
            CustomizationGroupType(
                id=str(group.get("id", "")),
                label=str(group.get("label", "")),
                selection=str(group.get("selection", "single")),
                required=bool(group.get("required", False)),
                options=[
                    CustomizationOptionType(
                        id=str(option.get("id", "")),
                        label=str(option.get("label", "")),
                        price_delta=money(option.get("priceDeltaPaise", 0)),
                        is_default=bool(option.get("isDefault", False)),
                    )
                    for option in group.get("options", [])
                ],
            )
        )
    return groups


def to_canteen(
    model: Canteen,
    *,
    is_open_now: bool,
    menu_item_count: int = 0,
    is_favorite: bool = False,
) -> CanteenType:
    return CanteenType(
        id=model.id,
        name=model.name,
        slug=model.slug,
        description=model.description,
        location=model.location,
        banner_url=model.banner_url,
        logo_url=model.logo_url,
        phone=model.phone,
        email=model.email,
        rating=float(model.rating or 0),
        rating_count=model.rating_count,
        opens_at=model.opens_at,
        closes_at=model.closes_at,
        is_accepting_orders=model.is_accepting_orders,
        is_active=model.is_active,
        tags=list(model.tags or []),
        average_preparation_minutes=model.average_preparation_minutes,
        owner_id=strawberry.ID(model.owner_id),
        is_open_now=is_open_now,
        menu_item_count=menu_item_count,
        is_favorite=is_favorite,
    )


def to_menu_item(model: MenuItem, *, canteen_name: str | None = None) -> MenuItemType:
    return MenuItemType(
        id=model.id,
        name=model.name,
        description=model.description,
        price=money(model.price_paise),
        image_url=model.image_url,
        category=model.category,
        canteen_id=model.canteen_id,
        canteen_name=canteen_name,
        is_vegetarian=model.is_vegetarian,
        is_vegan=model.is_vegan,
        contains_allergens=list(model.contains_allergens or []),
        is_available=model.is_available,
        is_featured=model.is_featured,
        stock_count=model.stock_count,
        preparation_minutes=model.preparation_minutes,
        rating=float(model.rating or 0),
        rating_count=model.rating_count,
        order_count=model.order_count,
        tags=list(model.tags or []),
        customization_groups=to_customization_groups(model.customization_groups),
    )


def to_promotion(model: Promotion, *, is_live_now: bool) -> PromotionType_:
    return PromotionType_(
        id=model.id,
        canteen_id=model.canteen_id,
        code=model.code,
        title=model.title,
        description=model.description,
        type=model.type,
        value=model.value,
        max_discount=money(model.max_discount_paise)
        if model.max_discount_paise is not None
        else None,
        min_order=money(model.min_order_paise),
        starts_at=model.starts_at,
        ends_at=model.ends_at,
        max_redemptions=model.max_redemptions,
        max_redemptions_per_user=model.max_redemptions_per_user,
        redemption_count=model.redemption_count,
        is_active=model.is_active,
        is_live_now=is_live_now,
    )
