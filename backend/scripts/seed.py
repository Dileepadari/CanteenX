"""Seed the database with realistic demo data.

Run with `python -m scripts.seed`. Idempotent: re-running updates rather than
duplicating, so it is safe against a database that already has data.

Passwords come from the environment, never from literals in this file - the
previous seed script hardcoded credentials *and* wrote the placeholder Razorpay
key `rzp_test_YOUR_KEY_ID` into every merchant row, which is what silently
switched the whole payment system into a mock that approved everything.
"""

from __future__ import annotations

import asyncio
import os
import random
from datetime import UTC, datetime, time, timedelta

from sqlalchemy import select

from app.core.database import session_scope
from app.core.logging import configure_logging, get_logger
from app.core.security import hash_password
from app.db.models import (
    Canteen,
    MenuItem,
    Promotion,
    PromotionType,
    User,
    UserRole,
    UserWallet,
)
from app.domain.services.catalog_service import slugify

logger = get_logger(__name__)

DEFAULT_PASSWORD = os.getenv("SEED_PASSWORD", "canteenx-dev-2026")

WEEKDAY_SCHEDULE = {
    day: {"opens": "08:00", "closes": "21:00", "closed": False}
    for day in ("mon", "tue", "wed", "thu", "fri")
} | {
    "sat": {"opens": "09:00", "closes": "22:00", "closed": False},
    "sun": {"opens": "10:00", "closes": "20:00", "closed": False},
}

SIZE_GROUP = {
    "id": "size",
    "label": "Size",
    "selection": "single",
    "required": True,
    "options": [
        {"id": "regular", "label": "Regular", "priceDeltaPaise": 0, "isDefault": True},
        {"id": "large", "label": "Large", "priceDeltaPaise": 3000},
    ],
}

ADDONS_GROUP = {
    "id": "addons",
    "label": "Add-ons",
    "selection": "multiple",
    "required": False,
    "options": [
        {"id": "cheese", "label": "Extra cheese", "priceDeltaPaise": 2000},
        {"id": "butter", "label": "Extra butter", "priceDeltaPaise": 1000},
        {"id": "egg", "label": "Add egg", "priceDeltaPaise": 2500},
    ],
}

SPICE_GROUP = {
    "id": "spice",
    "label": "Spice level",
    "selection": "single",
    "required": False,
    "options": [
        {"id": "mild", "label": "Mild", "priceDeltaPaise": 0},
        {"id": "medium", "label": "Medium", "priceDeltaPaise": 0, "isDefault": True},
        {"id": "hot", "label": "Hot", "priceDeltaPaise": 0},
    ],
}


CANTEENS: list[dict] = [
    {
        "name": "Juice Canteen",
        "location": "Near Himalaya Block",
        "description": "Fresh juices, shakes, and quick South Indian breakfast.",
        "tags": ["Juices", "Breakfast", "South Indian"],
        "prep": 10,
        "items": [
            (
                "Masala Dosa",
                "Crisp dosa with spiced potato filling",
                6000,
                "South Indian",
                True,
                [SIZE_GROUP],
            ),
            (
                "Idli Vada Combo",
                "Two idlis, one vada, sambar and chutney",
                5000,
                "South Indian",
                True,
                [],
            ),
            (
                "Cold Coffee",
                "Thick blended coffee with ice cream",
                7000,
                "Beverages",
                True,
                [SIZE_GROUP],
            ),
            (
                "Mixed Fruit Juice",
                "Seasonal fruits, no added sugar",
                6500,
                "Beverages",
                True,
                [SIZE_GROUP],
            ),
            (
                "Veg Sandwich",
                "Grilled sandwich with mint chutney",
                5500,
                "Snacks",
                True,
                [ADDONS_GROUP],
            ),
            (
                "Poha",
                "Flattened rice with peanuts and curry leaves",
                4000,
                "Breakfast",
                True,
                [],
            ),
        ],
    },
    {
        "name": "North Canteen",
        "location": "Opposite Old Boys Hostel",
        "description": "North Indian thalis, biryanis, and tandoori through the day.",
        "tags": ["North Indian", "Thali", "Biryani"],
        "prep": 20,
        "items": [
            (
                "Veg Biryani",
                "Basmati rice layered with spiced vegetables",
                12000,
                "Main Course",
                True,
                [SIZE_GROUP, SPICE_GROUP],
            ),
            (
                "Chicken Biryani",
                "Slow-cooked chicken dum biryani",
                16000,
                "Main Course",
                False,
                [SIZE_GROUP, SPICE_GROUP],
            ),
            (
                "Paneer Butter Masala",
                "Cottage cheese in a rich tomato gravy",
                14000,
                "Main Course",
                True,
                [SPICE_GROUP],
            ),
            (
                "Butter Naan",
                "Tandoor-baked, brushed with butter",
                4000,
                "Breads",
                True,
                [],
            ),
            (
                "Dal Tadka",
                "Yellow lentils with a garlic tempering",
                9000,
                "Main Course",
                True,
                [SPICE_GROUP],
            ),
            (
                "Veg Thali",
                "Rice, dal, two sabzis, roti, salad, sweet",
                15000,
                "Thali",
                True,
                [],
            ),
            ("Gulab Jamun", "Two pieces, served warm", 4500, "Desserts", True, []),
        ],
    },
    {
        "name": "Kadamba Canteen",
        "location": "Kadamba Nivas Ground Floor",
        "description": "The late-night spot. Maggi, rolls, and everything fried.",
        "tags": ["Fast Food", "Late Night", "Rolls"],
        "prep": 15,
        "items": [
            (
                "Cheese Maggi",
                "Classic Maggi loaded with cheese",
                5000,
                "Snacks",
                True,
                [ADDONS_GROUP],
            ),
            (
                "Paneer Roll",
                "Kathi roll with mint mayo",
                9000,
                "Rolls",
                True,
                [SPICE_GROUP, ADDONS_GROUP],
            ),
            (
                "Chicken Roll",
                "Grilled chicken kathi roll",
                11000,
                "Rolls",
                False,
                [SPICE_GROUP],
            ),
            (
                "French Fries",
                "Salted, with peri-peri on request",
                6000,
                "Snacks",
                True,
                [SIZE_GROUP],
            ),
            (
                "Veg Burger",
                "Crispy patty, lettuce, house sauce",
                8000,
                "Fast Food",
                True,
                [ADDONS_GROUP],
            ),
            (
                "Masala Chai",
                "Strong, gingery, endlessly refilled",
                2000,
                "Beverages",
                True,
                [SIZE_GROUP],
            ),
        ],
    },
    {
        "name": "Yuktahar",
        "location": "Near Vindhya Block",
        "description": "Health-first bowls, salads, and millet meals.",
        "tags": ["Healthy", "Salads", "Vegan"],
        "prep": 12,
        "items": [
            (
                "Quinoa Salad Bowl",
                "Quinoa, chickpeas, seasonal vegetables",
                13000,
                "Salads",
                True,
                [SIZE_GROUP],
            ),
            (
                "Millet Khichdi",
                "Foxtail millet with vegetables",
                10000,
                "Main Course",
                True,
                [],
            ),
            (
                "Sprouts Chaat",
                "Moong sprouts, onion, lemon",
                6000,
                "Snacks",
                True,
                [SPICE_GROUP],
            ),
            (
                "Greek Yogurt Parfait",
                "Yogurt, granola, honey",
                9000,
                "Desserts",
                True,
                [],
            ),
            (
                "Green Smoothie",
                "Spinach, banana, almond milk",
                8500,
                "Beverages",
                True,
                [SIZE_GROUP],
            ),
        ],
    },
]


async def _upsert_user(
    session, *, email: str, name: str, role: UserRole, password: str | None = None
) -> User:
    user = await session.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(email=email, name=name, role=role)
        session.add(user)

    user.name = name
    user.role = role
    if password:
        user.password_hash = hash_password(password)

    await session.flush()

    wallet = await session.scalar(
        select(UserWallet).where(UserWallet.user_id == user.id)
    )
    if wallet is None:
        # Seed students with a demo balance so the wallet path is testable
        # without touching a real payment gateway.
        session.add(
            UserWallet(
                user_id=user.id,
                balance_paise=50_000 if role is UserRole.STUDENT else 0,
            )
        )

    return user


async def seed() -> None:
    async with session_scope() as session:
        admin = await _upsert_user(
            session,
            email="admin@canteenx.dev",
            name="Platform Admin",
            role=UserRole.ADMIN,
            password=DEFAULT_PASSWORD,
        )
        student = await _upsert_user(
            session,
            email="student@canteenx.dev",
            name="Ananya Rao",
            role=UserRole.STUDENT,
            password=DEFAULT_PASSWORD,
        )
        await _upsert_user(
            session,
            email="student2@canteenx.dev",
            name="Rohit Verma",
            role=UserRole.STUDENT,
            password=DEFAULT_PASSWORD,
        )

        for index, spec in enumerate(CANTEENS, start=1):
            vendor = await _upsert_user(
                session,
                email=f"vendor{index}@canteenx.dev",
                name=f"{spec['name']} Manager",
                role=UserRole.VENDOR,
                password=DEFAULT_PASSWORD,
            )

            canteen = await session.scalar(
                select(Canteen).where(Canteen.slug == slugify(spec["name"]))
            )
            if canteen is None:
                canteen = Canteen(slug=slugify(spec["name"]))
                session.add(canteen)

            canteen.name = spec["name"]
            canteen.description = spec["description"]
            canteen.location = spec["location"]
            canteen.owner_id = vendor.id
            canteen.tags = spec["tags"]
            canteen.opens_at = time(8, 0)
            canteen.closes_at = time(21, 0)
            canteen.weekly_schedule = WEEKDAY_SCHEDULE
            canteen.average_preparation_minutes = spec["prep"]
            canteen.phone = f"+9180{40000000 + index}"
            canteen.email = f"contact.{slugify(spec['name'])}@canteenx.dev"
            canteen.is_accepting_orders = True
            canteen.is_active = True
            await session.flush()

            for name, description, price, category, is_veg, groups in spec["items"]:
                item = await session.scalar(
                    select(MenuItem).where(
                        MenuItem.canteen_id == canteen.id, MenuItem.name == name
                    )
                )
                if item is None:
                    item = MenuItem(canteen_id=canteen.id, name=name)
                    session.add(item)

                item.description = description
                item.price_paise = price
                item.category = category
                item.is_vegetarian = is_veg
                item.is_available = True
                item.customization_groups = groups
                item.preparation_minutes = spec["prep"]
                # A mix of tracked and untracked stock, so both code paths are
                # exercised by hand-testing.
                item.stock_count = random.choice([None, None, 25, 40, 8])
                item.is_featured = random.random() < 0.2
                item.tags = [category]

            await session.flush()

            code = f"{slugify(spec['name'])[:6].upper()}10"
            promotion = await session.scalar(
                select(Promotion).where(
                    Promotion.canteen_id == canteen.id, Promotion.code == code
                )
            )
            if promotion is None:
                promotion = Promotion(canteen_id=canteen.id, code=code)
                session.add(promotion)

            promotion.title = "10% off your order"
            promotion.description = "Introductory offer for the new CanteenX app."
            promotion.type = PromotionType.PERCENTAGE
            promotion.value = 1000  # basis points
            promotion.max_discount_paise = 5000
            promotion.min_order_paise = 10000
            promotion.starts_at = datetime.now(UTC) - timedelta(days=1)
            promotion.ends_at = datetime.now(UTC) + timedelta(days=60)
            promotion.max_redemptions_per_user = 3
            promotion.is_active = True

        await session.flush()

        logger.info(
            "Seed complete",
            extra={
                "admin": admin.email,
                "student": student.email,
                "canteens": len(CANTEENS),
            },
        )

    print("\nSeeded accounts (password from $SEED_PASSWORD):")
    print(f"  admin    admin@canteenx.dev      {DEFAULT_PASSWORD}")
    print(f"  student  student@canteenx.dev    {DEFAULT_PASSWORD}")
    print(f"  vendor   vendor1@canteenx.dev    {DEFAULT_PASSWORD}")
    print(f"\n{len(CANTEENS)} canteens with menus and promotions.\n")


if __name__ == "__main__":
    configure_logging()
    asyncio.run(seed())
