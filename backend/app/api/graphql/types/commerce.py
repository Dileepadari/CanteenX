"""Cart, order, payment, and engagement GraphQL types."""

from __future__ import annotations

from datetime import datetime

import strawberry

from app.api.graphql.types.catalog import MenuItemType, to_menu_item
from app.api.graphql.types.common import Money, money
from app.api.graphql.types.enums import (
    BulkOrderStatus,
    ComplaintCategory,
    ComplaintStatus,
    NotificationType,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
)
from app.api.graphql.types.identity import PublicUserType, to_public_user
from app.db.models import (
    BulkOrder,
    Cart,
    CartItem,
    Complaint,
    Notification,
    Order,
    OrderItem,
    OrderStatusEvent,
    Payment,
    Review,
    UserWallet,
    WalletTransaction,
)


# --------------------------------------------------------------------- cart
@strawberry.type(name="CartItem")
class CartItemType:
    id: int
    menu_item_id: int
    menu_item: MenuItemType | None
    quantity: int
    note: str | None
    #: ``{"size": ["large"], "addons": ["cheese"]}``
    customizations: strawberry.scalars.JSON
    #: Option *labels* for display, e.g. "Large, Extra cheese". The raw
    #: `customizations` map holds ids, which are not meant to be shown.
    customization_summary: str | None
    unit_price: Money
    line_total: Money
    #: Surfaced so the cart can warn before checkout fails.
    is_orderable: bool


@strawberry.type(name="Cart")
class CartType:
    id: int
    canteen_id: int | None
    canteen_name: str | None
    items: list[CartItemType]
    subtotal: Money
    tax: Money
    total: Money
    item_count: int
    scheduled_for: datetime | None
    #: Non-empty when something in the cart cannot currently be ordered.
    blocking_issues: list[str]


# -------------------------------------------------------------------- order
@strawberry.type(name="OrderItem")
class OrderItemType:
    id: int
    menu_item_id: int | None
    name: str
    image_url: str | None
    quantity: int
    note: str | None
    customizations: strawberry.scalars.JSON
    customization_summary: str | None
    unit_price: Money
    customization_price: Money
    line_total: Money


@strawberry.type(name="OrderStatusEvent")
class OrderStatusEventType:
    id: int
    status: OrderStatus
    note: str | None
    created_at: datetime


@strawberry.type(name="Order")
class OrderType:
    id: int
    reference: str
    user_id: strawberry.ID
    canteen_id: int
    canteen_name: str | None
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: PaymentMethod | None
    subtotal: Money
    tax: Money
    discount: Money
    total: Money
    customer_note: str | None
    contact_phone: str | None
    cancellation_reason: str | None
    scheduled_for: datetime | None
    ready_estimate_at: datetime | None
    completed_at: datetime | None
    cancelled_at: datetime | None
    created_at: datetime
    items: list[OrderItemType]
    status_events: list[OrderStatusEventType]
    customer: PublicUserType | None
    #: True while the customer-initiated cancellation window is still open.
    can_cancel: bool


# ------------------------------------------------------------------ payment
@strawberry.type(name="Payment")
class PaymentType:
    id: int
    order_id: int
    amount: Money
    method: PaymentMethod
    status: PaymentStatus
    gateway_order_id: str | None
    gateway_payment_id: str | None
    failure_reason: str | None
    refunded_amount: Money
    created_at: datetime
    captured_at: datetime | None


@strawberry.type(
    name="RazorpayCheckout",
    description="Everything the browser SDK needs to open the payment sheet.",
)
class RazorpayCheckoutType:
    payment_id: int
    gateway_order_id: str
    #: The publishable key id only. The secret never leaves the server.
    key_id: str
    amount: Money
    currency: str
    order_reference: str
    customer_name: str
    customer_email: str
    customer_phone: str | None


@strawberry.type(name="WalletTransaction")
class WalletTransactionType:
    id: int
    amount: Money
    balance_after: Money
    description: str
    order_id: int | None
    created_at: datetime


@strawberry.type(name="Wallet")
class WalletType:
    id: int
    balance: Money
    is_frozen: bool
    transactions: list[WalletTransactionType]


# --------------------------------------------------------------- engagement
@strawberry.type(name="Complaint")
class ComplaintType:
    id: int
    user_id: strawberry.ID
    order_id: int | None
    canteen_id: int | None
    canteen_name: str | None
    subject: str
    body: str
    category: ComplaintCategory
    status: ComplaintStatus
    attachment_urls: list[str]
    response_body: str | None
    responded_at: datetime | None
    escalated_at: datetime | None
    resolved_at: datetime | None
    created_at: datetime
    author: PublicUserType | None


@strawberry.type(name="Review")
class ReviewType:
    id: int
    user_id: strawberry.ID
    order_id: int
    canteen_id: int
    menu_item_id: int | None
    rating: int
    body: str | None
    created_at: datetime
    author: PublicUserType | None


@strawberry.type(name="Notification")
class NotificationType_:
    id: int
    type: NotificationType
    title: str
    body: str | None
    link: str | None
    data: strawberry.scalars.JSON
    is_read: bool
    created_at: datetime


@strawberry.type(name="BulkOrder")
class BulkOrderType:
    id: int
    reference: str
    requester_id: strawberry.ID
    canteen_id: int
    canteen_name: str | None
    title: str
    notes: str | None
    head_count: int
    required_at: datetime
    contact_phone: str | None
    requested_items: strawberry.scalars.JSON
    status: BulkOrderStatus
    quoted_total: Money | None
    quote_note: str | None
    quoted_at: datetime | None
    confirmed_at: datetime | None
    fulfilled_at: datetime | None
    created_at: datetime
    requester: PublicUserType | None


# ----------------------------------------------------------------- mappers
def to_cart_item(
    model: CartItem, *, unit_price_paise: int, summary: str | None = None
) -> CartItemType:
    item = model.menu_item
    quantity = model.quantity
    orderable = bool(
        item
        and item.is_available
        and (item.stock_count is None or item.stock_count >= quantity)
    )
    return CartItemType(
        id=model.id,
        menu_item_id=model.menu_item_id,
        menu_item=to_menu_item(item) if item else None,
        quantity=quantity,
        note=model.note,
        customizations=model.customizations or {},
        customization_summary=summary,
        unit_price=money(unit_price_paise),
        line_total=money(unit_price_paise * quantity),
        is_orderable=orderable,
    )


def to_cart(
    model: Cart,
    *,
    items: list[CartItemType],
    subtotal_paise: int,
    tax_paise: int,
    canteen_name: str | None,
    blocking_issues: list[str],
) -> CartType:
    return CartType(
        id=model.id,
        canteen_id=model.canteen_id,
        canteen_name=canteen_name,
        items=items,
        subtotal=money(subtotal_paise),
        tax=money(tax_paise),
        total=money(subtotal_paise + tax_paise),
        item_count=sum(item.quantity for item in items),
        scheduled_for=model.scheduled_for,
        blocking_issues=blocking_issues,
    )


def to_order_item(model: OrderItem) -> OrderItemType:
    return OrderItemType(
        id=model.id,
        menu_item_id=model.menu_item_id,
        name=model.name_snapshot,
        image_url=model.image_url_snapshot,
        quantity=model.quantity,
        note=model.note,
        customizations=model.customizations or {},
        customization_summary=model.customization_summary,
        unit_price=money(model.unit_price_paise),
        customization_price=money(model.customization_price_paise),
        line_total=money(model.line_total_paise),
    )


def to_status_event(model: OrderStatusEvent) -> OrderStatusEventType:
    return OrderStatusEventType(
        id=model.id,
        status=model.status,
        note=model.note,
        created_at=model.created_at,
    )


def to_order(model: Order, *, can_cancel: bool = False) -> OrderType:
    return OrderType(
        id=model.id,
        reference=model.reference,
        user_id=strawberry.ID(model.user_id),
        canteen_id=model.canteen_id,
        canteen_name=model.canteen.name if model.canteen else None,
        status=model.status,
        payment_status=model.payment_status,
        payment_method=model.payment_method,
        subtotal=money(model.subtotal_paise),
        tax=money(model.tax_paise),
        discount=money(model.discount_paise),
        total=money(model.total_paise),
        customer_note=model.customer_note,
        contact_phone=model.contact_phone,
        cancellation_reason=model.cancellation_reason,
        scheduled_for=model.scheduled_for,
        ready_estimate_at=model.ready_estimate_at,
        completed_at=model.completed_at,
        cancelled_at=model.cancelled_at,
        created_at=model.created_at,
        items=[to_order_item(item) for item in model.items],
        status_events=[to_status_event(event) for event in model.status_events],
        customer=to_public_user(model.user) if model.user else None,
        can_cancel=can_cancel,
    )


def to_payment(model: Payment) -> PaymentType:
    return PaymentType(
        id=model.id,
        order_id=model.order_id,
        amount=money(model.amount_paise),
        method=model.method,
        status=model.status,
        gateway_order_id=model.gateway_order_id,
        gateway_payment_id=model.gateway_payment_id,
        failure_reason=model.failure_reason,
        refunded_amount=money(model.refunded_amount_paise),
        created_at=model.created_at,
        captured_at=model.captured_at,
    )


def to_wallet_transaction(model: WalletTransaction) -> WalletTransactionType:
    return WalletTransactionType(
        id=model.id,
        amount=money(model.amount_paise),
        balance_after=money(model.balance_after_paise),
        description=model.description,
        order_id=model.order_id,
        created_at=model.created_at,
    )


def to_wallet(
    model: UserWallet, *, transactions: list[WalletTransaction] | None = None
) -> WalletType:
    return WalletType(
        id=model.id,
        balance=money(model.balance_paise),
        is_frozen=model.is_frozen,
        transactions=[to_wallet_transaction(tx) for tx in (transactions or [])],
    )


def to_complaint(model: Complaint) -> ComplaintType:
    return ComplaintType(
        id=model.id,
        user_id=strawberry.ID(model.user_id),
        order_id=model.order_id,
        canteen_id=model.canteen_id,
        canteen_name=model.canteen.name if model.canteen else None,
        subject=model.subject,
        body=model.body,
        category=model.category,
        status=model.status,
        attachment_urls=list(model.attachment_urls or []),
        response_body=model.response_body,
        responded_at=model.responded_at,
        escalated_at=model.escalated_at,
        resolved_at=model.resolved_at,
        created_at=model.created_at,
        author=to_public_user(model.user) if model.user else None,
    )


def to_review(model: Review) -> ReviewType:
    return ReviewType(
        id=model.id,
        user_id=strawberry.ID(model.user_id),
        order_id=model.order_id,
        canteen_id=model.canteen_id,
        menu_item_id=model.menu_item_id,
        rating=model.rating,
        body=model.body,
        created_at=model.created_at,
        author=to_public_user(model.user) if model.user else None,
    )


def to_notification(model: Notification) -> NotificationType_:
    return NotificationType_(
        id=model.id,
        type=model.type,
        title=model.title,
        body=model.body,
        link=model.link,
        data=model.data or {},
        is_read=model.read_at is not None,
        created_at=model.created_at,
    )


def to_bulk_order(model: BulkOrder) -> BulkOrderType:
    return BulkOrderType(
        id=model.id,
        reference=model.reference,
        requester_id=strawberry.ID(model.requester_id),
        canteen_id=model.canteen_id,
        canteen_name=model.canteen.name if model.canteen else None,
        title=model.title,
        notes=model.notes,
        head_count=model.head_count,
        required_at=model.required_at,
        contact_phone=model.contact_phone,
        requested_items=model.requested_items or [],
        status=model.status,
        quoted_total=money(model.quoted_total_paise)
        if model.quoted_total_paise is not None
        else None,
        quote_note=model.quote_note,
        quoted_at=model.quoted_at,
        confirmed_at=model.confirmed_at,
        fulfilled_at=model.fulfilled_at,
        created_at=model.created_at,
        requester=to_public_user(model.requester) if model.requester else None,
    )
