"""Promotions: validation, discount calculation, and redemption."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictError, NotFoundError, ValidationError
from app.db.models import (
    Order,
    Promotion,
    PromotionRedemption,
    PromotionType,
    User,
)


def is_live(promotion: Promotion, *, at: datetime | None = None) -> bool:
    now = at or datetime.now(UTC)
    return (
        promotion.is_active
        and promotion.starts_at <= now <= promotion.ends_at
        and (
            promotion.max_redemptions is None
            or promotion.redemption_count < promotion.max_redemptions
        )
    )


def calculate_discount_paise(promotion: Promotion, subtotal_paise: int) -> int:
    """Discount for a basket, capped and never exceeding the subtotal."""
    if promotion.type is PromotionType.PERCENTAGE:
        discount = (subtotal_paise * promotion.value) // 10_000
    else:
        discount = promotion.value

    if promotion.max_discount_paise is not None:
        discount = min(discount, promotion.max_discount_paise)

    return max(0, min(discount, subtotal_paise))


async def find_by_code(
    session: AsyncSession, *, canteen_id: int, code: str
) -> Promotion:
    promotion = await session.scalar(
        select(Promotion).where(
            Promotion.canteen_id == canteen_id,
            func.upper(Promotion.code) == code.strip().upper(),
        )
    )
    if promotion is None:
        raise NotFoundError("That promo code is not valid for this canteen.")
    return promotion


async def preview(
    session: AsyncSession,
    *,
    canteen_id: int,
    user_id: str,
    code: str,
    subtotal_paise: int,
) -> tuple[Promotion, int]:
    """Validate a code without consuming it, for the checkout screen."""
    promotion = await find_by_code(session, canteen_id=canteen_id, code=code)
    await _assert_usable(session, promotion, user_id, subtotal_paise)
    return promotion, calculate_discount_paise(promotion, subtotal_paise)


async def _assert_usable(
    session: AsyncSession,
    promotion: Promotion,
    user_id: str,
    subtotal_paise: int,
) -> None:
    if not is_live(promotion):
        raise ConflictError("That promo code is not currently available.")

    if subtotal_paise < promotion.min_order_paise:
        shortfall = (promotion.min_order_paise - subtotal_paise) / 100
        raise ValidationError(f"Spend ₹{shortfall:,.2f} more to use this code.")

    used_by_user = (
        await session.scalar(
            select(func.count())
            .select_from(PromotionRedemption)
            .where(
                PromotionRedemption.promotion_id == promotion.id,
                PromotionRedemption.user_id == user_id,
            )
        )
    ) or 0

    if used_by_user >= promotion.max_redemptions_per_user:
        raise ConflictError("You have already used that promo code.")


async def apply_to_order(
    session: AsyncSession,
    *,
    order: Order,
    user: User,
    code: str,
    subtotal_paise: int,
) -> int:
    """Consume a promotion for an order and return the discount in paise."""
    promotion = await find_by_code(session, canteen_id=order.canteen_id, code=code)
    await _assert_usable(session, promotion, user.id, subtotal_paise)

    discount = calculate_discount_paise(promotion, subtotal_paise)

    session.add(
        PromotionRedemption(
            promotion_id=promotion.id,
            order_id=order.id,
            user_id=user.id,
            discount_paise=discount,
            created_at=datetime.now(UTC),
        )
    )

    # Conditional increment so the global cap holds under concurrent checkouts
    # rather than relying on a read-modify-write of `redemption_count`.
    if promotion.max_redemptions is not None:
        result = await session.execute(
            update(Promotion)
            .where(
                Promotion.id == promotion.id,
                Promotion.redemption_count < promotion.max_redemptions,
            )
            .values(redemption_count=Promotion.redemption_count + 1)
        )
        if result.rowcount != 1:
            raise ConflictError("That promo code has just run out.")
    else:
        await session.execute(
            update(Promotion)
            .where(Promotion.id == promotion.id)
            .values(redemption_count=Promotion.redemption_count + 1)
        )

    return discount


async def list_for_canteen(
    session: AsyncSession, *, canteen_id: int, live_only: bool = False
) -> list[Promotion]:
    result = await session.execute(
        select(Promotion)
        .where(Promotion.canteen_id == canteen_id)
        .order_by(Promotion.starts_at.desc())
    )
    promotions = list(result.scalars().all())
    return [p for p in promotions if is_live(p)] if live_only else promotions
