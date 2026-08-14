"""Authorization invariants.

The audited build exposed 18 of 23 queries with no policy at all: any anonymous
caller could read another user's cart, orders, payment history and complaints,
plus per-canteen revenue. These tests exist so that cannot silently return.
"""

from __future__ import annotations

import pytest

from app.db.models import UserRole
from tests.conftest import GraphQL, make_canteen, make_user

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def test_every_schema_field_declares_a_policy() -> None:
    """Default-deny, enforced structurally rather than by review.

    A new field with no `permission_classes` fails here rather than shipping
    open. `AllowAny` counts - it makes "public" a decision someone wrote down.
    """
    from app.api.graphql.schema import schema

    missing: list[str] = []
    for root in ("Query", "Mutation", "Subscription"):
        graphql_type = schema.get_type_by_name(root)
        if graphql_type is None:
            continue
        for field in graphql_type.fields:
            if not getattr(field, "permission_classes", None):
                missing.append(f"{root}.{field.name}")

    assert not missing, f"fields without a policy: {missing}"


@pytest.mark.parametrize(
    "query",
    [
        "query { cart { id } }",
        "query { myOrders { id } }",
        "query { wallet { balance { paise } } }",
        "query { notifications { id } }",
        "query { users { id } }",
        "query { platformStats { totalUsers } }",
        "query { complaints { id } }",
        "query { favoriteCanteens { id } }",
        "query { managedCanteens { id } }",
    ],
)
async def test_private_reads_reject_anonymous_callers(gql: GraphQL, query: str) -> None:
    payload = await gql(query)
    assert gql.error_code(payload) in {"unauthenticated", "forbidden"}, (
        f"anonymous caller was not rejected: {query}"
    )


async def test_public_reads_stay_public(gql: GraphQL) -> None:
    """Browsing must not require an account, or nobody can discover the menu."""
    owner = await make_user(email="owner@test.dev", role=UserRole.VENDOR)
    await make_canteen(owner_id=owner)

    payload = await gql("query { canteens { id name } }")
    assert payload.get("errors") is None
    assert len(payload["data"]["canteens"]) == 1


async def test_student_cannot_reach_admin_surfaces(gql: GraphQL) -> None:
    await make_user(email="student@test.dev")
    await gql.sign_in("student@test.dev")

    for query in ("query { users { id } }", "query { platformStats { totalUsers } }"):
        payload = await gql(query)
        assert gql.error_code(payload) == "forbidden", query


async def test_vendor_cannot_read_another_canteens_orders(gql: GraphQL) -> None:
    """Role alone is not enough - ownership is checked per object."""
    mine = await make_user(email="v1@test.dev", role=UserRole.VENDOR)
    theirs = await make_user(email="v2@test.dev", role=UserRole.VENDOR)
    await make_canteen(owner_id=mine, name="Mine")
    other_canteen = await make_canteen(owner_id=theirs, name="Theirs")

    await gql.sign_in("v1@test.dev")
    payload = await gql(
        "query($id: Int!) { canteenOrders(canteenId: $id) { id } }",
        id=other_canteen,
    )
    assert gql.error_code(payload) == "forbidden"


async def test_mark_order_paid_is_not_in_the_schema() -> None:
    """The free-food mutation must never come back.

    `markOrderPaid` let any customer flip their own order to paid with no
    payment involved.
    """
    from app.api.graphql.schema import schema

    mutation = schema.get_type_by_name("Mutation")
    assert mutation is not None
    names = {field.name for field in mutation.fields}
    assert "markOrderPaid" not in names
