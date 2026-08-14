"""Ordering, money, and inventory invariants."""

from __future__ import annotations

import asyncio

import pytest
from sqlalchemy import select

from app.core.database import session_scope
from app.db.models import MenuItem, Order, OrderStatus, PaymentStatus, UserRole
from app.domain.services import order_service
from tests.conftest import GraphQL, make_canteen, make_menu_item, make_user

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def _student_with_cart(gql: GraphQL, *, stock: int | None = None) -> dict:
    owner = await make_user(email="owner@test.dev", role=UserRole.VENDOR)
    canteen = await make_canteen(owner_id=owner)
    item = await make_menu_item(
        canteen_id=canteen, price_paise=10_000, stock_count=stock
    )
    await make_user(email="student@test.dev", wallet_paise=100_000)
    await gql.sign_in("student@test.dev")
    return {"canteen": canteen, "item": item, "owner": owner}


async def test_totals_are_computed_server_side(gql: GraphQL) -> None:
    """Prices come from the database, never from the client."""
    fixtures = await _student_with_cart(gql)

    payload = await gql(
        """
        mutation($id: Int!) {
          addToCart(input: {menuItemId: $id, quantity: 3}) {
            subtotal { paise } tax { paise } total { paise }
          }
        }
        """,
        id=fixtures["item"],
    )
    cart = payload["data"]["addToCart"]

    assert cart["subtotal"]["paise"] == 30_000
    # 5% of 30000 paise, integer arithmetic throughout.
    assert cart["tax"]["paise"] == 1_500
    assert cart["total"]["paise"] == 31_500


async def test_identical_lines_merge_instead_of_duplicating(gql: GraphQL) -> None:
    """Deduplication is a database constraint, not an order-sensitive compare."""
    fixtures = await _student_with_cart(gql)

    for _ in range(3):
        payload = await gql(
            "mutation($id: Int!) { addToCart(input: {menuItemId: $id, quantity: 1}) "
            "{ itemCount items { id } } }",
            id=fixtures["item"],
        )

    cart = payload["data"]["addToCart"]
    assert len(cart["items"]) == 1
    assert cart["itemCount"] == 3


async def test_checkout_reserves_stock_and_cancel_restores_it(gql: GraphQL) -> None:
    """Cancellation used to leak inventory permanently."""
    fixtures = await _student_with_cart(gql, stock=10)

    await gql(
        "mutation($id: Int!) { addToCart(input: {menuItemId: $id, quantity: 4}) { itemCount } }",
        id=fixtures["item"],
    )
    placed = await gql(
        "mutation { placeOrder(input: {paymentMethod: WALLET}) { id status } }"
    )
    order_id = placed["data"]["placeOrder"]["id"]

    async with session_scope() as session:
        during = await session.scalar(
            select(MenuItem.stock_count).where(MenuItem.id == fixtures["item"])
        )
    assert during == 6, "stock was not reserved at checkout"

    await gql(
        'mutation($id: Int!) { cancelOrder(orderId: $id, reason: "test") { status } }',
        id=order_id,
    )

    async with session_scope() as session:
        after = await session.scalar(
            select(MenuItem.stock_count).where(MenuItem.id == fixtures["item"])
        )
    assert after == 10, "cancellation did not return stock"


async def test_concurrent_checkouts_cannot_oversell(gql: GraphQL) -> None:
    """The last portion may be sold exactly once.

    The old implementation read, checked in Python, then wrote - with its
    `SELECT ... FOR UPDATE` wrapped in a bare except that silently fell back to
    an unlocked read.
    """
    owner = await make_user(email="owner@test.dev", role=UserRole.VENDOR)
    canteen = await make_canteen(owner_id=owner)
    item = await make_menu_item(canteen_id=canteen, price_paise=1_000, stock_count=1)

    buyers = []
    for index in range(5):
        email = f"buyer{index}@test.dev"
        user_id = await make_user(email=email, wallet_paise=100_000)
        buyers.append(user_id)

    async def attempt(user_id: str) -> bool:
        from app.db.models import User
        from app.db.models.enums import PaymentMethod
        from app.domain.services import cart_service

        async with session_scope() as session:
            user = await session.get(User, user_id)
            assert user is not None
            await cart_service.add_item(
                session, user_id=user_id, menu_item_id=item, quantity=1
            )
        try:
            async with session_scope() as session:
                user = await session.get(User, user_id)
                assert user is not None
                await order_service.create_order(
                    session, user=user, payment_method=PaymentMethod.WALLET
                )
            return True
        except Exception:
            return False

    outcomes = await asyncio.gather(*(attempt(uid) for uid in buyers))

    assert sum(outcomes) == 1, f"oversold: {sum(outcomes)} orders for 1 unit"

    async with session_scope() as session:
        remaining = await session.scalar(
            select(MenuItem.stock_count).where(MenuItem.id == item)
        )
    assert remaining == 0


async def test_wallet_payment_settles_atomically(gql: GraphQL) -> None:
    fixtures = await _student_with_cart(gql)

    await gql(
        "mutation($id: Int!) { addToCart(input: {menuItemId: $id, quantity: 2}) { itemCount } }",
        id=fixtures["item"],
    )
    placed = await gql(
        "mutation { placeOrder(input: {paymentMethod: WALLET}) { id total { paise } } }"
    )
    order = placed["data"]["placeOrder"]

    before = await gql("query { wallet { balance { paise } } }")
    await gql(
        "mutation($id: Int!) { initiatePayment(orderId: $id) { gatewayOrderId } }",
        id=order["id"],
    )
    after = await gql("query { wallet { balance { paise } } }")

    debited = (
        before["data"]["wallet"]["balance"]["paise"]
        - after["data"]["wallet"]["balance"]["paise"]
    )
    assert debited == order["total"]["paise"]

    async with session_scope() as session:
        row = await session.get(Order, order["id"])
        assert row is not None
        assert row.payment_status is PaymentStatus.PAID
        assert row.status is OrderStatus.CONFIRMED


async def test_wallet_cannot_go_negative(gql: GraphQL) -> None:
    owner = await make_user(email="owner@test.dev", role=UserRole.VENDOR)
    canteen = await make_canteen(owner_id=owner)
    item = await make_menu_item(canteen_id=canteen, price_paise=50_000)
    await make_user(email="broke@test.dev", wallet_paise=100)
    await gql.sign_in("broke@test.dev")

    await gql(
        "mutation($id: Int!) { addToCart(input: {menuItemId: $id, quantity: 1}) { itemCount } }",
        id=item,
    )
    placed = await gql("mutation { placeOrder(input: {paymentMethod: WALLET}) { id } }")
    payload = await gql(
        "mutation($id: Int!) { initiatePayment(orderId: $id) { gatewayOrderId } }",
        id=placed["data"]["placeOrder"]["id"],
    )

    assert gql.error_code(payload) == "insufficient_funds"


async def test_order_status_transitions_are_validated(gql: GraphQL) -> None:
    """Status was previously unvalidated free text."""
    fixtures = await _student_with_cart(gql)
    await gql(
        "mutation($id: Int!) { addToCart(input: {menuItemId: $id, quantity: 1}) { itemCount } }",
        id=fixtures["item"],
    )
    placed = await gql("mutation { placeOrder(input: {paymentMethod: WALLET}) { id } }")
    order_id = placed["data"]["placeOrder"]["id"]

    await gql.sign_in("owner@test.dev")

    # pending -> ready skips confirmed and preparing, and must be refused.
    payload = await gql(
        "mutation($id: Int!) { updateOrderStatus(orderId: $id, status: READY) { status } }",
        id=order_id,
    )
    assert gql.error_code(payload) == "invalid_status_transition"


async def test_another_user_cannot_read_your_order(gql: GraphQL) -> None:
    fixtures = await _student_with_cart(gql)
    await gql(
        "mutation($id: Int!) { addToCart(input: {menuItemId: $id, quantity: 1}) { itemCount } }",
        id=fixtures["item"],
    )
    placed = await gql("mutation { placeOrder(input: {paymentMethod: WALLET}) { id } }")
    order_id = placed["data"]["placeOrder"]["id"]

    await make_user(email="nosy@test.dev")
    await gql.sign_in("nosy@test.dev")

    payload = await gql(
        "query($id: Int!) { order(id: $id) { reference } }", id=order_id
    )
    # "not found" rather than "forbidden": confirming the id exists is a leak.
    assert gql.error_code(payload) == "not_found"
