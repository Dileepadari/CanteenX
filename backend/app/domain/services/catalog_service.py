"""Canteens and menu items: browsing, search, and vendor CRUD."""

from __future__ import annotations

import re
import unicodedata
from datetime import UTC, datetime
from zoneinfo import ZoneInfo

from sqlalchemy import Select, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import (
    AuthorizationError,
    ConflictError,
    NotFoundError,
    ValidationError,
)
from app.db.models import (
    Canteen,
    MenuItem,
    User,
    UserRole,
    canteen_staff,
    user_favorite_canteens,
)

#: Campus operating hours are local, not UTC. Comparing a UTC clock against a
#: stored local opening time is what made "open now" wrong by 5h30m.
CAMPUS_TZ = ZoneInfo("Asia/Kolkata")

_DAY_KEYS = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")


def slugify(value: str) -> str:
    normalised = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", normalised.lower()).strip("-")
    return slug or "canteen"


def is_open_now(canteen: Canteen, *, at: datetime | None = None) -> bool:
    """Effective open state: manual switch, then schedule, then plain hours."""
    if not canteen.is_active or not canteen.is_accepting_orders:
        return False

    now = (at or datetime.now(UTC)).astimezone(CAMPUS_TZ)
    schedule = canteen.weekly_schedule or {}
    today = schedule.get(_DAY_KEYS[now.weekday()])

    if isinstance(today, dict):
        if today.get("closed"):
            return False
        opens, closes = today.get("opens"), today.get("closes")
        if opens and closes:
            try:
                return (
                    datetime.strptime(opens, "%H:%M").time()
                    <= now.time()
                    <= datetime.strptime(closes, "%H:%M").time()
                )
            except ValueError:
                pass  # malformed schedule entry; fall through to plain hours

    if canteen.opens_at and canteen.closes_at:
        return canteen.opens_at <= now.time() <= canteen.closes_at

    return True


async def assert_manages_canteen(
    session: AsyncSession, user: User, canteen_id: int
) -> Canteen:
    canteen = await session.get(Canteen, canteen_id)
    if canteen is None:
        raise NotFoundError("That canteen does not exist.")

    if user.role is UserRole.ADMIN or canteen.owner_id == user.id:
        return canteen

    is_staff = await session.scalar(
        select(canteen_staff.c.user_id).where(
            canteen_staff.c.user_id == user.id,
            canteen_staff.c.canteen_id == canteen_id,
        )
    )
    if is_staff is None:
        raise AuthorizationError("You do not manage this canteen.")
    return canteen


# ------------------------------------------------------------------ queries
def _visible_canteens() -> Select:
    return select(Canteen).where(Canteen.is_active.is_(True))


async def list_canteens(
    session: AsyncSession,
    *,
    search: str | None = None,
    open_only: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> list[Canteen]:
    query = _visible_canteens()

    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                Canteen.name.ilike(pattern),
                Canteen.description.ilike(pattern),
                Canteen.location.ilike(pattern),
            )
        )

    result = await session.execute(
        query.order_by(Canteen.rating.desc(), Canteen.name).limit(limit).offset(offset)
    )
    canteens = list(result.scalars().all())

    return [c for c in canteens if is_open_now(c)] if open_only else canteens


async def get_canteen(session: AsyncSession, canteen_id: int) -> Canteen:
    canteen = await session.get(Canteen, canteen_id)
    if canteen is None or not canteen.is_active:
        raise NotFoundError("That canteen does not exist.")
    return canteen


async def menu_item_counts(
    session: AsyncSession, canteen_ids: list[int]
) -> dict[int, int]:
    """Batched count, so a list of N canteens costs one query rather than N."""
    if not canteen_ids:
        return {}

    result = await session.execute(
        select(MenuItem.canteen_id, func.count())
        .where(MenuItem.canteen_id.in_(canteen_ids), MenuItem.is_available.is_(True))
        .group_by(MenuItem.canteen_id)
    )
    return {row[0]: row[1] for row in result.all()}


async def favorite_canteen_ids(session: AsyncSession, user_id: str) -> set[int]:
    result = await session.execute(
        select(user_favorite_canteens.c.canteen_id).where(
            user_favorite_canteens.c.user_id == user_id
        )
    )
    return set(result.scalars().all())


async def list_menu_items(
    session: AsyncSession,
    *,
    canteen_id: int | None = None,
    category: str | None = None,
    search: str | None = None,
    vegetarian_only: bool = False,
    featured_only: bool = False,
    available_only: bool = True,
    limit: int = 100,
    offset: int = 0,
) -> list[MenuItem]:
    query = select(MenuItem).options(selectinload(MenuItem.canteen))

    if canteen_id is not None:
        query = query.where(MenuItem.canteen_id == canteen_id)
    if category:
        query = query.where(MenuItem.category == category)
    if vegetarian_only:
        query = query.where(MenuItem.is_vegetarian.is_(True))
    if featured_only:
        query = query.where(MenuItem.is_featured.is_(True))
    if available_only:
        query = query.where(MenuItem.is_available.is_(True))
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(MenuItem.name.ilike(pattern), MenuItem.description.ilike(pattern))
        )

    result = await session.execute(
        query.order_by(
            MenuItem.is_featured.desc(), MenuItem.order_count.desc(), MenuItem.name
        )
        .limit(limit)
        .offset(offset)
    )
    return list(result.unique().scalars().all())


async def get_menu_item(session: AsyncSession, item_id: int) -> MenuItem:
    item = await session.scalar(
        select(MenuItem)
        .where(MenuItem.id == item_id)
        .options(selectinload(MenuItem.canteen))
    )
    if item is None:
        raise NotFoundError("That menu item does not exist.")
    return item


async def list_categories(
    session: AsyncSession, canteen_id: int | None = None
) -> list[str]:
    query = select(MenuItem.category).where(MenuItem.category.isnot(None)).distinct()
    if canteen_id is not None:
        query = query.where(MenuItem.canteen_id == canteen_id)
    result = await session.execute(query.order_by(MenuItem.category))
    return [row for row in result.scalars().all() if row]


# ----------------------------------------------------------------- mutations
async def create_canteen(
    session: AsyncSession, *, actor: User, owner_id: str, **fields
) -> Canteen:
    if actor.role is not UserRole.ADMIN:
        raise AuthorizationError("Only administrators can create canteens.")

    owner = await session.get(User, owner_id)
    if owner is None:
        raise NotFoundError("That owner account does not exist.")

    name = (fields.get("name") or "").strip()
    if not name:
        raise ValidationError("A canteen needs a name.")

    canteen = Canteen(
        name=name,
        slug=slugify(name),
        owner_id=owner_id,
        description=fields.get("description"),
        location=fields.get("location"),
        phone=fields.get("phone"),
        email=fields.get("email"),
        banner_url=fields.get("banner_url"),
        logo_url=fields.get("logo_url"),
        opens_at=fields.get("opens_at"),
        closes_at=fields.get("closes_at"),
        tags=fields.get("tags") or [],
        weekly_schedule=fields.get("weekly_schedule") or {},
        average_preparation_minutes=fields.get("average_preparation_minutes") or 15,
    )
    session.add(canteen)

    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise ConflictError(
            "A canteen with that name or contact details already exists."
        ) from None

    # Promote the owner so they can actually reach the vendor console.
    if owner.role is UserRole.STUDENT:
        owner.role = UserRole.VENDOR

    return canteen


async def update_canteen(
    session: AsyncSession, *, actor: User, canteen_id: int, **fields
) -> Canteen:
    canteen = await assert_manages_canteen(session, actor, canteen_id)

    # Explicit whitelist. The previous implementation looped over the input and
    # `setattr`-ed mangled camelCase names onto the model, which silently wrote
    # to read-only properties and threw AttributeError on the core paths.
    editable = {
        "name",
        "description",
        "location",
        "phone",
        "email",
        "banner_url",
        "logo_url",
        "opens_at",
        "closes_at",
        "tags",
        "weekly_schedule",
        "average_preparation_minutes",
        "is_accepting_orders",
    }

    for key, value in fields.items():
        if key in editable and value is not None:
            setattr(canteen, key, value)

    if fields.get("name"):
        canteen.slug = slugify(fields["name"])

    await session.flush()
    return canteen


async def set_canteen_active(
    session: AsyncSession, *, actor: User, canteen_id: int, is_active: bool
) -> Canteen:
    if actor.role is not UserRole.ADMIN:
        raise AuthorizationError("Only administrators can do that.")
    canteen = await session.get(Canteen, canteen_id)
    if canteen is None:
        raise NotFoundError("That canteen does not exist.")
    canteen.is_active = is_active
    await session.flush()
    return canteen


async def create_menu_item(
    session: AsyncSession, *, actor: User, canteen_id: int, **fields
) -> MenuItem:
    await assert_manages_canteen(session, actor, canteen_id)

    name = (fields.get("name") or "").strip()
    if not name:
        raise ValidationError("A menu item needs a name.")

    price = fields.get("price_paise")
    if price is None or price < 0:
        raise ValidationError("A menu item needs a valid price.")

    item = MenuItem(
        canteen_id=canteen_id,
        name=name,
        description=fields.get("description"),
        price_paise=price,
        image_url=fields.get("image_url"),
        category=fields.get("category"),
        is_vegetarian=bool(fields.get("is_vegetarian", False)),
        is_vegan=bool(fields.get("is_vegan", False)),
        contains_allergens=fields.get("contains_allergens") or [],
        is_available=bool(fields.get("is_available", True)),
        is_featured=bool(fields.get("is_featured", False)),
        stock_count=fields.get("stock_count"),
        preparation_minutes=fields.get("preparation_minutes") or 15,
        tags=fields.get("tags") or [],
        customization_groups=fields.get("customization_groups") or [],
    )
    session.add(item)
    await session.flush()
    return item


async def update_menu_item(
    session: AsyncSession, *, actor: User, item_id: int, **fields
) -> MenuItem:
    item = await get_menu_item(session, item_id)
    await assert_manages_canteen(session, actor, item.canteen_id)

    editable = {
        "name",
        "description",
        "price_paise",
        "image_url",
        "category",
        "is_vegetarian",
        "is_vegan",
        "contains_allergens",
        "is_available",
        "is_featured",
        "preparation_minutes",
        "tags",
        "customization_groups",
    }

    for key, value in fields.items():
        if key in editable and value is not None:
            setattr(item, key, value)

    # stock_count is handled separately: None is a meaningful value here
    # ("stop tracking stock"), so it cannot use the `is not None` filter above.
    if "stock_count" in fields:
        item.stock_count = fields["stock_count"]

    await session.flush()
    return item


async def delete_menu_item(session: AsyncSession, *, actor: User, item_id: int) -> None:
    item = await get_menu_item(session, item_id)
    await assert_manages_canteen(session, actor, item.canteen_id)
    await session.delete(item)
    await session.flush()


async def set_stock(
    session: AsyncSession, *, actor: User, item_id: int, stock_count: int | None
) -> MenuItem:
    item = await get_menu_item(session, item_id)
    await assert_manages_canteen(session, actor, item.canteen_id)

    if stock_count is not None and stock_count < 0:
        raise ValidationError("Stock cannot be negative.")

    item.stock_count = stock_count
    await session.flush()
    return item
