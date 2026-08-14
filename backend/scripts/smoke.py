"""End-to-end smoke test against a running API.

Exercises the paths that were broken or exploitable before the rewrite:
authorization on every read, cart-to-order checkout, transactional stock, the
cancellation refund of stock, and the absence of any client-assertable
"mark paid" route.

Usage: python -m scripts.smoke [base_url]
"""

from __future__ import annotations

import sys
from typing import Any

import httpx

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8010"
GQL = f"{BASE}/api/graphql"
PASSWORD = "canteenx-dev-2026"

passed: list[str] = []
failed: list[str] = []


def check(name: str, condition: bool, detail: str = "") -> None:
    (passed if condition else failed).append(name)
    mark = "PASS" if condition else "FAIL"
    print(f"  [{mark}] {name}" + (f" - {detail}" if detail and not condition else ""))


class Client:
    def __init__(self) -> None:
        self.http = httpx.Client(base_url=BASE, timeout=30.0)
        self.csrf: str | None = None

    def gql(self, query: str, **variables: Any) -> dict:
        headers = {}
        # The CSRF cookie is readable by design; the client echoes it back in a
        # header for the double-submit check.
        token = self.http.cookies.get("csrf_token") or self.csrf
        if token:
            headers["x-csrf-token"] = token
        response = self.http.post(
            GQL, json={"query": query, "variables": variables}, headers=headers
        )
        return response.json()

    def error_code(self, payload: dict) -> str | None:
        errors = payload.get("errors")
        if not errors:
            return None
        return (errors[0].get("extensions") or {}).get("code")


def main() -> int:
    anon = Client()

    print("\n1. Public reads")
    result = anon.gql("query { canteens(limit: 3) { id name menuItemCount } }")
    canteens = (result.get("data") or {}).get("canteens") or []
    check("anonymous can browse canteens", len(canteens) > 0, str(result)[:200])

    result = anon.gql(
        """query { menuItems(limit: 50) {
             id name price { paise formatted }
             customizationGroups { required }
           } }"""
    )
    all_items = (result.get("data") or {}).get("menuItems") or []
    # Only items with no *required* option group can be added without a
    # selection; picking blindly would trip the validation the API is
    # supposed to enforce.
    items = [
        item
        for item in all_items
        if not any(group["required"] for group in item["customizationGroups"])
    ]
    check("anonymous can browse the menu", len(all_items) > 0)
    check("some items need no required options", len(items) > 0)
    check(
        "money is transported as integer paise",
        bool(items) and isinstance(items[0]["price"]["paise"], int),
    )

    print("\n2. Authorization holds for anonymous callers")
    for field, query in [
        ("cart", "query { cart { id } }"),
        ("myOrders", "query { myOrders { id } }"),
        ("wallet", "query { wallet { balance { paise } } }"),
        ("notifications", "query { notifications { id } }"),
        ("users", "query { users { id } }"),
        ("platformStats", "query { platformStats { totalUsers } }"),
    ]:
        payload = anon.gql(query)
        code = anon.error_code(payload)
        check(
            f"{field} rejects anonymous access",
            code in ("unauthenticated", "forbidden"),
            f"got {code}",
        )

    print("\n3. Sign-in and identity")
    student = Client()
    result = student.gql(
        """mutation($e:String!,$p:String!){
             signIn(input:{email:$e,password:$p}){ user{ id name role } csrfToken }
           }""",
        e="student@canteenx.dev",
        p=PASSWORD,
    )
    auth = (result.get("data") or {}).get("signIn")
    check("student can sign in", auth is not None, str(result)[:200])
    if auth is None:
        return 1
    student.csrf = auth["csrfToken"]
    check("role is student", auth["user"]["role"] == "STUDENT", auth["user"]["role"])

    result = student.gql("query { me { id email role } }")
    check(
        "me returns the signed-in user",
        (result.get("data") or {}).get("me") is not None,
    )

    print("\n4. Privilege separation")
    payload = student.gql("query { users { id } }")
    check(
        "student cannot list users",
        student.error_code(payload) == "forbidden",
        f"got {student.error_code(payload)}",
    )
    payload = student.gql("query { platformStats { totalUsers } }")
    check(
        "student cannot read platform stats",
        student.error_code(payload) == "forbidden",
    )

    print("\n5. Cart")
    student.gql("mutation { clearCart { id } }")
    item = items[0]
    result = student.gql(
        """mutation($id:Int!){
             addToCart(input:{menuItemId:$id, quantity:2}){
               itemCount subtotal{paise} tax{paise} total{paise}
               items{ id quantity lineTotal{paise} }
             }
           }""",
        id=item["id"],
    )
    cart = (result.get("data") or {}).get("addToCart")
    check(
        "item added to cart",
        cart is not None and cart["itemCount"] == 2,
        str(result)[:250],
    )
    if cart is None:
        return 1

    check(
        "totals are computed server-side",
        cart["total"]["paise"] == cart["subtotal"]["paise"] + cart["tax"]["paise"],
        f"{cart['total']['paise']} != {cart['subtotal']['paise']}+{cart['tax']['paise']}",
    )

    # Adding the same item with the same options must merge, not duplicate.
    result = student.gql(
        "mutation($id:Int!){ addToCart(input:{menuItemId:$id, quantity:1}){ itemCount items{id} } }",
        id=item["id"],
    )
    merged = (result.get("data") or {}).get("addToCart")
    check(
        "identical lines merge rather than duplicate",
        merged is not None and len(merged["items"]) == 1 and merged["itemCount"] == 3,
        str(merged),
    )

    print("\n6. Checkout")
    result = student.gql(
        """mutation {
             placeOrder(input:{paymentMethod: WALLET}){
               id reference status paymentStatus total{paise} canCancel
               items{ name quantity lineTotal{paise} }
               statusEvents{ status }
             }
           }"""
    )
    order = (result.get("data") or {}).get("placeOrder")
    check("order placed from the cart", order is not None, str(result)[:250])
    if order is None:
        return 1

    check("order reference issued", order["reference"].startswith("CX-"))
    check("order starts pending", order["status"] == "PENDING", order["status"])
    check("payment starts unpaid", order["paymentStatus"] == "PENDING")
    check("status audit trail written", len(order["statusEvents"]) >= 1)
    check("order is cancellable inside the window", order["canCancel"] is True)

    result = student.gql("query { cart { itemCount } }")
    check(
        "cart is emptied by checkout",
        (result.get("data") or {})["cart"]["itemCount"] == 0,
    )

    print("\n7. Wallet payment settles server-side")
    before_wallet = student.gql("query { wallet { balance { paise } } }")
    balance_before = (before_wallet.get("data") or {})["wallet"]["balance"]["paise"]

    result = student.gql(
        "mutation($id:Int!){ initiatePayment(orderId:$id){ gatewayOrderId } }",
        id=order["id"],
    )
    # A wallet payment needs no gateway, so this returns null on success.
    check(
        "wallet payment needs no gateway round-trip",
        "errors" not in result
        and (result.get("data") or {}).get("initiatePayment") is None,
        str(result)[:200],
    )

    result = student.gql(
        "query($id:Int!){ order(id:$id){ status paymentStatus total{paise} } }",
        id=order["id"],
    )
    paid = (result.get("data") or {}).get("order") or {}
    check("order is marked paid", paid.get("paymentStatus") == "PAID", str(paid))
    check("paid order auto-confirms", paid.get("status") == "CONFIRMED", str(paid))

    after_wallet = student.gql("query { wallet { balance { paise } } }")
    balance_after = (after_wallet.get("data") or {})["wallet"]["balance"]["paise"]
    check(
        "wallet was debited by exactly the order total",
        balance_before - balance_after == paid.get("total", {}).get("paise"),
        f"{balance_before} -> {balance_after}, order {paid.get('total')}",
    )

    print("\n7b. Payment integrity")
    schema_probe = anon.gql("query { __typename }")
    check("schema responds", "data" in schema_probe)

    # The single most important assertion in this file: there must be no way
    # for a client to assert payment. `markOrderPaid` used to do exactly that.
    payload = student.gql(
        "mutation($id:Int!){ markOrderPaid(orderId:$id){ id } }", id=order["id"]
    )
    check(
        "markOrderPaid no longer exists",
        payload.get("errors") is not None and "markOrderPaid" in str(payload["errors"]),
        "the mutation still resolves",
    )

    print("\n8. Cross-user isolation")
    other = Client()
    other.gql(
        "mutation($e:String!,$p:String!){ signIn(input:{email:$e,password:$p}){ csrfToken } }",
        e="student2@canteenx.dev",
        p=PASSWORD,
    )
    payload = other.gql(
        "query($id:Int!){ order(id:$id){ id reference } }", id=order["id"]
    )
    check(
        "another user cannot read this order",
        other.error_code(payload) == "not_found",
        f"got {other.error_code(payload)}",
    )

    print("\n9. Cancellation restores stock")
    tracked = student.gql(
        """query { menuItems(limit: 50) {
             id name stockCount customizationGroups { required }
           } }"""
    )
    stocked = [
        i
        for i in (tracked.get("data") or {}).get("menuItems", [])
        if i.get("stockCount") is not None
        and i.get("stockCount", 0) >= 2
        and not any(g["required"] for g in i["customizationGroups"])
    ]
    if stocked:
        target = stocked[0]
        before = target["stockCount"]
        student.gql("mutation { clearCart { id } }")
        student.gql(
            "mutation($id:Int!){ addToCart(input:{menuItemId:$id, quantity:2}){ itemCount } }",
            id=target["id"],
        )
        placed = student.gql(
            "mutation { placeOrder(input:{paymentMethod: WALLET}){ id } }"
        )
        new_order = (placed.get("data") or {}).get("placeOrder")

        mid = student.gql(
            "query($id:Int!){ menuItem(id:$id){ stockCount } }", id=target["id"]
        )
        during = (mid.get("data") or {})["menuItem"]["stockCount"]
        check(
            "stock is reserved at checkout",
            during == before - 2,
            f"{before} -> {during}",
        )

        if new_order:
            student.gql(
                'mutation($id:Int!){ cancelOrder(orderId:$id, reason:"smoke test"){ status } }',
                id=new_order["id"],
            )
            after = student.gql(
                "query($id:Int!){ menuItem(id:$id){ stockCount } }", id=target["id"]
            )
            restored = (after.get("data") or {})["menuItem"]["stockCount"]
            check(
                "cancellation restores stock",
                restored == before,
                f"{during} -> {restored}, expected {before}",
            )
    else:
        print("  [SKIP] no stock-tracked items in the seed")

    print("\n10. Vendor scope")
    vendor = Client()
    vendor.gql(
        "mutation($e:String!,$p:String!){ signIn(input:{email:$e,password:$p}){ csrfToken } }",
        e="vendor1@canteenx.dev",
        p=PASSWORD,
    )
    result = vendor.gql("query { managedCanteens { id name } }")
    managed = (result.get("data") or {}).get("managedCanteens") or []
    check("vendor sees their own canteens", len(managed) == 1, str(result)[:200])

    if managed:
        mine = managed[0]["id"]
        others = [c["id"] for c in canteens if c["id"] != mine]
        result = vendor.gql(
            "query($id:Int!){ canteenStats(canteenId:$id){ ordersTotal } }", id=mine
        )
        check("vendor can read their own stats", "errors" not in result)

        if others:
            payload = vendor.gql(
                "query($id:Int!){ canteenOrders(canteenId:$id){ id } }", id=others[0]
            )
            check(
                "vendor cannot read another canteen's orders",
                vendor.error_code(payload) == "forbidden",
                f"got {vendor.error_code(payload)}",
            )

    print("\n11. Input validation")
    payload = student.gql(
        "mutation { addToCart(input:{menuItemId: 999999, quantity: 1}){ id } }"
    )
    check("unknown menu item is rejected", student.error_code(payload) == "not_found")

    payload = student.gql(
        "mutation($id:Int!){ addToCart(input:{menuItemId:$id, quantity:0}){ id } }",
        id=item["id"],
    )
    check(
        "non-positive quantity is rejected",
        student.error_code(payload) == "validation_failed",
    )

    print(f"\n{'=' * 60}")
    print(f"passed: {len(passed)}   failed: {len(failed)}")
    if failed:
        print("\nFAILED:")
        for name in failed:
            print(f"  - {name}")
    print("=" * 60)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
