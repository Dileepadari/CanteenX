"""Cart operations - the single source of truth for a user's basket."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictError, NotFoundError, ValidationError
from app.db.models import Cart, CartItem, Canteen, MenuItem
from app.domain.pricing import (
    PricedSelection,
    calculate_tax_paise,
    price_customizations,
    unit_price_paise,
)

MAX_QUANTITY_PER_LINE = 50


@dataclass(slots=True)
class CartView:
    cart: Cart
    canteen_name: str | None
    #: (line, unit price in paise, human-readable option summary)
    priced_items: list[tuple[CartItem, int, str | None]]
    subtotal_paise: int
    tax_paise: int
    blocking_issues: list[str]


async def get_or_create_cart(session: AsyncSession, user_id: str) -> Cart:
    result = await session.execute(
        select(Cart)
        .where(Cart.user_id == user_id)
        .options(selectinload(Cart.items).selectinload(CartItem.menu_item))
    )
    cart = result.unique().scalar_one_or_none()
    if cart is not None:
        return cart

    cart = Cart(user_id=user_id)
    session.add(cart)
    try:
        await session.flush()
    except IntegrityError:
        # Two concurrent requests both tried to create the cart; the unique
        # constraint on user_id decides, and we re-read the winner.
        await session.rollback()
        result = await session.execute(
            select(Cart)
            .where(Cart.user_id == user_id)
            .options(selectinload(Cart.items).selectinload(CartItem.menu_item))
        )
        cart = result.unique().scalar_one()
    return cart


async def load_cart_view(session: AsyncSession, user_id: str) -> CartView:
    """Load the cart and price every line from current menu data."""
    cart = await get_or_create_cart(session, user_id)

    priced: list[tuple[CartItem, int, str | None]] = []
    issues: list[str] = []
    subtotal = 0

    for line in cart.items:
        item = line.menu_item
        if item is None:
            issues.append("An item in your cart is no longer on the menu.")
            continue

        try:
            selection = price_customizations(item, line.customizations)
            unit = unit_price_paise(item, selection)
        except ValidationError:
            # The vendor changed the option groups after this line was added.
            issues.append(f"'{item.name}' has changed and needs to be re-added.")
            continue

        if not item.is_available:
            issues.append(f"'{item.name}' is currently unavailable.")
        elif item.stock_count is not None and item.stock_count < line.quantity:
            issues.append(
                f"Only {item.stock_count} left of '{item.name}'."
                if item.stock_count
                else f"'{item.name}' is sold out."
            )

        priced.append((line, unit, ", ".join(selection.labels) or None))
        subtotal += unit * line.quantity

    canteen_name: str | None = None
    if cart.canteen_id is not None:
        canteen_name = await session.scalar(
            select(Canteen.name).where(Canteen.id == cart.canteen_id)
        )

    return CartView(
        cart=cart,
        canteen_name=canteen_name,
        priced_items=priced,
        subtotal_paise=subtotal,
        tax_paise=calculate_tax_paise(subtotal),
        blocking_issues=issues,
    )


async def _load_menu_item(session: AsyncSession, menu_item_id: int) -> MenuItem:
    item = await session.get(MenuItem, menu_item_id)
    if item is None:
        raise NotFoundError("That menu item does not exist.")
    return item


async def add_item(
    session: AsyncSession,
    *,
    user_id: str,
    menu_item_id: int,
    quantity: int = 1,
    customizations: dict | None = None,
    note: str | None = None,
    replace_cart_if_different_canteen: bool = False,
) -> CartView:
    if quantity < 1:
        raise ValidationError("Quantity must be at least 1.")

    item = await _load_menu_item(session, menu_item_id)
    if not item.is_available:
        raise ConflictError(f"'{item.name}' is currently unavailable.")

    cart = await get_or_create_cart(session, user_id)

    # A cart belongs to one canteen. Mixing them would produce an order that no
    # single kitchen could fulfil.
    if cart.canteen_id is not None and cart.canteen_id != item.canteen_id:
        if not replace_cart_if_different_canteen:
            raise ConflictError(
                "Your cart has items from another canteen. Clear it first, or "
                "confirm replacing it.",
                code="different_canteen",
            )
        await clear_items(session, cart)

    cart.canteen_id = item.canteen_id

    selection: PricedSelection = price_customizations(item, customizations)
    unit = unit_price_paise(item, selection)

    existing = await session.scalar(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.menu_item_id == item.id,
            CartItem.customization_hash == selection.hash,
        )
    )

    new_quantity = (existing.quantity if existing else 0) + quantity
    if new_quantity > MAX_QUANTITY_PER_LINE:
        raise ValidationError(
            f"You can order at most {MAX_QUANTITY_PER_LINE} of one item."
        )
    _assert_stock(item, new_quantity)

    if existing is not None:
        existing.quantity = new_quantity
        if note is not None:
            existing.note = note
    else:
        session.add(
            CartItem(
                cart_id=cart.id,
                menu_item_id=item.id,
                quantity=quantity,
                note=note,
                customizations=selection.normalised,
                customization_hash=selection.hash,
            )
        )

    await session.flush()
    session.expire(cart, ["items"])
    _ = unit  # priced again by load_cart_view against current menu data
    return await load_cart_view(session, user_id)


def _assert_stock(item: MenuItem, quantity: int) -> None:
    if item.stock_count is not None and item.stock_count < quantity:
        raise ConflictError(
            f"Only {item.stock_count} left of '{item.name}'."
            if item.stock_count
            else f"'{item.name}' is sold out.",
            code="out_of_stock",
        )


async def _owned_line(
    session: AsyncSession, user_id: str, cart_item_id: int
) -> CartItem:
    """Fetch a cart line, proving it belongs to the caller.

    The join to `carts` is the ownership check. Without it, passing another
    user's cart item id would happily mutate their basket.
    """
    line = await session.scalar(
        select(CartItem)
        .join(Cart, Cart.id == CartItem.cart_id)
        .where(CartItem.id == cart_item_id, Cart.user_id == user_id)
        .options(selectinload(CartItem.menu_item))
    )
    if line is None:
        raise NotFoundError("That cart item does not exist.")
    return line


async def update_quantity(
    session: AsyncSession, *, user_id: str, cart_item_id: int, quantity: int
) -> CartView:
    line = await _owned_line(session, user_id, cart_item_id)

    if quantity < 1:
        await session.delete(line)
    else:
        if quantity > MAX_QUANTITY_PER_LINE:
            raise ValidationError(
                f"You can order at most {MAX_QUANTITY_PER_LINE} of one item."
            )
        if line.menu_item is not None:
            _assert_stock(line.menu_item, quantity)
        line.quantity = quantity

    await session.flush()
    return await _reload(session, user_id)


async def remove_item(
    session: AsyncSession, *, user_id: str, cart_item_id: int
) -> CartView:
    line = await _owned_line(session, user_id, cart_item_id)
    await session.delete(line)
    await session.flush()
    return await _reload(session, user_id)


async def clear_items(session: AsyncSession, cart: Cart) -> None:
    await session.execute(delete(CartItem).where(CartItem.cart_id == cart.id))
    cart.canteen_id = None
    cart.scheduled_for = None
    await session.flush()
    session.expire(cart, ["items"])


async def clear_cart(session: AsyncSession, *, user_id: str) -> CartView:
    cart = await get_or_create_cart(session, user_id)
    await clear_items(session, cart)
    return await _reload(session, user_id)


async def set_scheduled_for(
    session: AsyncSession, *, user_id: str, scheduled_for: datetime | None
) -> CartView:
    cart = await get_or_create_cart(session, user_id)
    cart.scheduled_for = scheduled_for
    await session.flush()
    return await _reload(session, user_id)


async def _reload(session: AsyncSession, user_id: str) -> CartView:
    cart = await get_or_create_cart(session, user_id)
    session.expire(cart, ["items"])
    return await load_cart_view(session, user_id)
