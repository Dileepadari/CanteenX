"""Mutation root.

Notably absent: `markOrderPaid`. The previous schema exposed it, and it let any
customer set their own order to paid with no payment involved. Order state now
moves only in response to server-verified gateway events.
"""

from __future__ import annotations

from datetime import datetime, time

import strawberry
from strawberry.types import Info

from app.api.cookies import clear_auth_cookies, set_auth_cookies
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
    RazorpayCheckoutType,
    ReviewType,
    to_bulk_order,
    to_cart,
    to_cart_item,
    to_complaint,
    to_notification,
    to_order,
    to_review,
)
from app.api.graphql.types.common import MutationSuccess, money
from app.api.graphql.types.enums import (
    BulkOrderStatus,
    ComplaintCategory,
    ComplaintStatus,
    OrderStatus,
    PaymentMethod,
    PromotionType,
    UserRole,
)
from app.api.graphql.types.identity import AuthPayload, UserType, to_user
from app.core.config import settings
from app.core.errors import PaymentsDisabledError, ValidationError
from app.core.security import REFRESH_COOKIE_NAME, create_realtime_ticket
from app.db.models import PromotionType as PromotionTypeModel
from app.domain.services import (
    auth_service,
    bulk_order_service,
    cart_service,
    catalog_service,
    engagement_service,
    notification_service,
    order_service,
    payment_service,
    promotion_service,
    user_service,
)


# ------------------------------------------------------------------- inputs
@strawberry.input
class SignUpInput:
    name: str
    email: str
    password: str


@strawberry.input
class SignInInput:
    email: str
    password: str


@strawberry.input
class ProfileInput:
    name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
    upi_id: str | None = None
    is_vegetarian: bool | None = None
    notification_preferences: strawberry.scalars.JSON | None = None


@strawberry.input
class AddToCartInput:
    menu_item_id: int
    quantity: int = 1
    customizations: strawberry.scalars.JSON | None = None
    note: str | None = None
    #: Set true to discard a cart holding items from a different canteen.
    replace_cart: bool = False


@strawberry.input
class PlaceOrderInput:
    payment_method: PaymentMethod
    customer_note: str | None = None
    contact_phone: str | None = None
    promotion_code: str | None = None
    scheduled_for: datetime | None = None


@strawberry.input
class CanteenInput:
    name: str | None = None
    description: str | None = None
    location: str | None = None
    phone: str | None = None
    email: str | None = None
    banner_url: str | None = None
    logo_url: str | None = None
    opens_at: time | None = None
    closes_at: time | None = None
    tags: list[str] | None = None
    weekly_schedule: strawberry.scalars.JSON | None = None
    average_preparation_minutes: int | None = None
    is_accepting_orders: bool | None = None


@strawberry.input
class MenuItemInput:
    name: str | None = None
    description: str | None = None
    price_paise: int | None = None
    image_url: str | None = None
    category: str | None = None
    is_vegetarian: bool | None = None
    is_vegan: bool | None = None
    contains_allergens: list[str] | None = None
    is_available: bool | None = None
    is_featured: bool | None = None
    stock_count: int | None = None
    preparation_minutes: int | None = None
    tags: list[str] | None = None
    customization_groups: strawberry.scalars.JSON | None = None


@strawberry.input
class PromotionInput:
    code: str
    title: str
    type: PromotionType
    value: int
    starts_at: datetime
    ends_at: datetime
    description: str | None = None
    max_discount_paise: int | None = None
    min_order_paise: int = 0
    max_redemptions: int | None = None
    max_redemptions_per_user: int = 1
    is_active: bool = True


@strawberry.input
class ComplaintInput:
    subject: str
    body: str
    category: ComplaintCategory = ComplaintCategory.OTHER
    order_id: int | None = None
    canteen_id: int | None = None
    attachment_urls: list[str] | None = None


@strawberry.input
class ReviewInput:
    order_id: int
    rating: int
    body: str | None = None
    menu_item_id: int | None = None


@strawberry.input
class BulkOrderInput:
    canteen_id: int
    title: str
    head_count: int
    required_at: datetime
    requested_items: strawberry.scalars.JSON | None = None
    notes: str | None = None
    contact_phone: str | None = None


# ------------------------------------------------------------------ helpers
async def _cart_type(info: Info, view: cart_service.CartView) -> CartType:
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


def _apply_session(info: Info, issued: auth_service.IssuedSession) -> AuthPayload:
    set_auth_cookies(
        info.context.response,
        access_token=issued.access_token,
        refresh_token=issued.refresh_token,
        csrf_token=issued.csrf_token,
    )
    return AuthPayload(user=to_user(issued.user), csrf_token=issued.csrf_token)


def _user_agent(info: Info) -> str | None:
    return info.context.request.headers.get("user-agent")


async def _canteen_type(info: Info, canteen) -> CanteenType:
    return to_canteen(
        canteen,
        is_open_now=catalog_service.is_open_now(canteen),
        menu_item_count=0,
        is_favorite=False,
    )


@strawberry.type
class Mutation:
    # ----------------------------------------------------------------- auth
    @strawberry.mutation(permission_classes=[AllowAny])
    async def sign_up(self, info: Info, input: SignUpInput) -> AuthPayload:
        issued = await auth_service.sign_up(
            info.context.session,
            name=input.name,
            email=input.email,
            password=input.password,
            user_agent=_user_agent(info),
        )
        return _apply_session(info, issued)

    @strawberry.mutation(permission_classes=[AllowAny])
    async def sign_in(self, info: Info, input: SignInInput) -> AuthPayload:
        issued = await auth_service.sign_in(
            info.context.session,
            email=input.email,
            password=input.password,
            user_agent=_user_agent(info),
        )
        return _apply_session(info, issued)

    @strawberry.mutation(
        permission_classes=[AllowAny],
        description="Rotate the refresh cookie and issue a fresh access token.",
    )
    async def refresh_session(self, info: Info) -> AuthPayload:
        token = info.context.request.cookies.get(REFRESH_COOKIE_NAME)
        issued = await auth_service.refresh_session(
            info.context.session,
            refresh_token=token or "",
            user_agent=_user_agent(info),
        )
        return _apply_session(info, issued)

    @strawberry.mutation(permission_classes=[AllowAny])
    async def sign_out(self, info: Info) -> MutationSuccess:
        await auth_service.sign_out(
            info.context.session,
            refresh_token=info.context.request.cookies.get(REFRESH_COOKIE_NAME),
        )
        clear_auth_cookies(info.context.response)
        return MutationSuccess(message="Signed out.")

    @strawberry.mutation(
        permission_classes=[IsAuthenticated],
        description=(
            "Mint a short-lived ticket for the subscription WebSocket. "
            "Fetch one immediately before connecting."
        ),
    )
    async def create_realtime_ticket(self, info: Info) -> str:
        user = await info.context.require_user()
        return create_realtime_ticket(user.id, user.role.value)

    @strawberry.mutation(permission_classes=[AllowAny])
    async def initiate_cas_login(self, info: Info) -> str:
        if not settings.cas_enabled:
            raise ValidationError("Single sign-on is not enabled.")
        return auth_service.cas_login_url()

    @strawberry.mutation(permission_classes=[AllowAny])
    async def verify_cas_ticket(self, info: Info, ticket: str) -> AuthPayload:
        issued = await auth_service.verify_cas_ticket(
            info.context.session, ticket=ticket, user_agent=_user_agent(info)
        )
        return _apply_session(info, issued)

    # -------------------------------------------------------------- profile
    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def update_profile(self, info: Info, input: ProfileInput) -> UserType:
        user = await info.context.require_user()
        updated = await user_service.update_profile(
            info.context.session,
            user=user,
            name=input.name,
            phone=input.phone,
            avatar_url=input.avatar_url,
            upi_id=input.upi_id,
            is_vegetarian=input.is_vegetarian,
            notification_preferences=input.notification_preferences,
        )
        return to_user(updated)

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def change_password(
        self, info: Info, current_password: str, new_password: str
    ) -> MutationSuccess:
        user = await info.context.require_user()
        await user_service.change_password(
            info.context.session,
            user=user,
            current_password=current_password,
            new_password=new_password,
        )
        clear_auth_cookies(info.context.response)
        return MutationSuccess(message="Password changed. Please sign in again.")

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def delete_my_account(self, info: Info) -> MutationSuccess:
        user = await info.context.require_user()
        await user_service.soft_delete_account(info.context.session, user=user)
        clear_auth_cookies(info.context.response)
        return MutationSuccess(message="Your account has been closed.")

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def set_favorite_canteen(
        self, info: Info, canteen_id: int, favorite: bool
    ) -> MutationSuccess:
        user = await info.context.require_user()
        await user_service.set_favorite(
            info.context.session, user=user, canteen_id=canteen_id, favorite=favorite
        )
        return MutationSuccess()

    # ----------------------------------------------------------------- cart
    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def add_to_cart(self, info: Info, input: AddToCartInput) -> CartType:
        user = await info.context.require_user()
        view = await cart_service.add_item(
            info.context.session,
            user_id=user.id,
            menu_item_id=input.menu_item_id,
            quantity=input.quantity,
            customizations=input.customizations,
            note=input.note,
            replace_cart_if_different_canteen=input.replace_cart,
        )
        return await _cart_type(info, view)

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def update_cart_item(
        self, info: Info, cart_item_id: int, quantity: int
    ) -> CartType:
        user = await info.context.require_user()
        view = await cart_service.update_quantity(
            info.context.session,
            user_id=user.id,
            cart_item_id=cart_item_id,
            quantity=quantity,
        )
        return await _cart_type(info, view)

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def remove_from_cart(self, info: Info, cart_item_id: int) -> CartType:
        user = await info.context.require_user()
        view = await cart_service.remove_item(
            info.context.session, user_id=user.id, cart_item_id=cart_item_id
        )
        return await _cart_type(info, view)

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def clear_cart(self, info: Info) -> CartType:
        user = await info.context.require_user()
        view = await cart_service.clear_cart(info.context.session, user_id=user.id)
        return await _cart_type(info, view)

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def set_cart_pickup_time(
        self, info: Info, scheduled_for: datetime | None
    ) -> CartType:
        user = await info.context.require_user()
        view = await cart_service.set_scheduled_for(
            info.context.session, user_id=user.id, scheduled_for=scheduled_for
        )
        return await _cart_type(info, view)

    # --------------------------------------------------------------- orders
    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def place_order(self, info: Info, input: PlaceOrderInput) -> OrderType:
        user = await info.context.require_user()
        order = await order_service.create_order(
            info.context.session,
            user=user,
            payment_method=input.payment_method,
            customer_note=input.customer_note,
            contact_phone=input.contact_phone,
            promotion_code=input.promotion_code,
            scheduled_for=input.scheduled_for,
        )
        return to_order(order, can_cancel=order_service.can_cancel(order))

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def cancel_order(
        self, info: Info, order_id: int, reason: str | None = None
    ) -> OrderType:
        user = await info.context.require_user()
        order = await order_service.cancel_own_order(
            info.context.session, user=user, order_id=order_id, reason=reason
        )
        return to_order(order)

    @strawberry.mutation(permission_classes=[IsVendor])
    async def update_order_status(
        self,
        info: Info,
        order_id: int,
        status: OrderStatus,
        note: str | None = None,
    ) -> OrderType:
        user = await info.context.require_user()
        order = await order_service.transition_status(
            info.context.session,
            actor=user,
            order_id=order_id,
            new_status=status,
            note=note,
        )
        return to_order(order)

    # ------------------------------------------------------------- payments
    @strawberry.mutation(
        permission_classes=[IsAuthenticated],
        description="Start payment for an order. Wallet orders settle immediately.",
    )
    async def initiate_payment(
        self, info: Info, order_id: int, idempotency_key: str | None = None
    ) -> RazorpayCheckoutType | None:
        user = await info.context.require_user()
        intent = await payment_service.initiate(
            info.context.session,
            user=user,
            order_id=order_id,
            idempotency_key=idempotency_key,
        )

        if not intent.requires_gateway:
            return None  # wallet payment already settled

        if not settings.razorpay_key_id:  # pragma: no cover - guarded upstream
            raise PaymentsDisabledError()

        order = await order_service.load_order(info.context.session, order_id)
        return RazorpayCheckoutType(
            payment_id=intent.payment.id,
            gateway_order_id=intent.gateway_order_id or "",
            key_id=settings.razorpay_key_id,
            amount=money(intent.payment.amount_paise),
            currency="INR",
            order_reference=order.reference,
            customer_name=user.name,
            customer_email=user.email,
            customer_phone=user.phone,
        )

    @strawberry.mutation(
        permission_classes=[IsAuthenticated],
        description="Verify the Razorpay checkout callback. Signature-checked.",
    )
    async def verify_payment(
        self,
        info: Info,
        gateway_order_id: str,
        gateway_payment_id: str,
        signature: str,
    ) -> OrderType:
        user = await info.context.require_user()
        payment = await payment_service.verify_checkout(
            info.context.session,
            user=user,
            gateway_order_id=gateway_order_id,
            gateway_payment_id=gateway_payment_id,
            signature=signature,
        )
        order = await order_service.load_order(info.context.session, payment.order_id)
        return to_order(order)

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def create_wallet_top_up(self, info: Info, amount_paise: int) -> str:
        user = await info.context.require_user()
        return await payment_service.top_up_wallet(
            info.context.session, user=user, amount_paise=amount_paise
        )

    # -------------------------------------------------------- notifications
    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def mark_notification_read(
        self, info: Info, notification_id: int
    ) -> NotificationType_:
        user = await info.context.require_user()
        notification = await notification_service.mark_read(
            info.context.session, user_id=user.id, notification_id=notification_id
        )
        return to_notification(notification)

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def mark_all_notifications_read(self, info: Info) -> MutationSuccess:
        user = await info.context.require_user()
        count = await notification_service.mark_all_read(
            info.context.session, user_id=user.id
        )
        return MutationSuccess(message=f"{count} marked as read.")

    # ----------------------------------------------------------- engagement
    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def create_complaint(
        self, info: Info, input: ComplaintInput
    ) -> ComplaintType:
        user = await info.context.require_user()
        complaint = await engagement_service.create_complaint(
            info.context.session,
            user=user,
            subject=input.subject,
            body=input.body,
            category=input.category,
            order_id=input.order_id,
            canteen_id=input.canteen_id,
            attachment_urls=input.attachment_urls,
        )
        return to_complaint(complaint)

    @strawberry.mutation(permission_classes=[IsVendor])
    async def respond_to_complaint(
        self,
        info: Info,
        complaint_id: int,
        response_body: str,
        status: ComplaintStatus,
    ) -> ComplaintType:
        user = await info.context.require_user()
        complaint = await engagement_service.respond_to_complaint(
            info.context.session,
            actor=user,
            complaint_id=complaint_id,
            response_body=response_body,
            status=status,
        )
        return to_complaint(complaint)

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def create_review(self, info: Info, input: ReviewInput) -> ReviewType:
        user = await info.context.require_user()
        review = await engagement_service.create_review(
            info.context.session,
            user=user,
            order_id=input.order_id,
            rating=input.rating,
            body=input.body,
            menu_item_id=input.menu_item_id,
        )
        return to_review(review)

    # -------------------------------------------------------- bulk catering
    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def create_bulk_order(
        self, info: Info, input: BulkOrderInput
    ) -> BulkOrderType:
        user = await info.context.require_user()
        order = await bulk_order_service.create(
            info.context.session,
            user=user,
            canteen_id=input.canteen_id,
            title=input.title,
            head_count=input.head_count,
            required_at=input.required_at,
            requested_items=input.requested_items,
            notes=input.notes,
            contact_phone=input.contact_phone,
        )
        return to_bulk_order(order)

    @strawberry.mutation(permission_classes=[IsVendor])
    async def quote_bulk_order(
        self,
        info: Info,
        bulk_order_id: int,
        quoted_total_paise: int,
        quote_note: str | None = None,
    ) -> BulkOrderType:
        user = await info.context.require_user()
        order = await bulk_order_service.quote(
            info.context.session,
            actor=user,
            bulk_order_id=bulk_order_id,
            quoted_total_paise=quoted_total_paise,
            quote_note=quote_note,
        )
        return to_bulk_order(order)

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def set_bulk_order_status(
        self, info: Info, bulk_order_id: int, status: BulkOrderStatus
    ) -> BulkOrderType:
        user = await info.context.require_user()
        order = await bulk_order_service.set_status(
            info.context.session,
            actor=user,
            bulk_order_id=bulk_order_id,
            status=status,
        )
        return to_bulk_order(order)

    # --------------------------------------------------------- vendor: menu
    @strawberry.mutation(permission_classes=[IsVendor])
    async def create_menu_item(
        self, info: Info, canteen_id: int, input: MenuItemInput
    ) -> MenuItemType:
        user = await info.context.require_user()
        item = await catalog_service.create_menu_item(
            info.context.session,
            actor=user,
            canteen_id=canteen_id,
            **strawberry.asdict(input),
        )
        return to_menu_item(item)

    @strawberry.mutation(permission_classes=[IsVendor])
    async def update_menu_item(
        self, info: Info, item_id: int, input: MenuItemInput
    ) -> MenuItemType:
        user = await info.context.require_user()
        item = await catalog_service.update_menu_item(
            info.context.session,
            actor=user,
            item_id=item_id,
            **strawberry.asdict(input),
        )
        return to_menu_item(item)

    @strawberry.mutation(permission_classes=[IsVendor])
    async def delete_menu_item(self, info: Info, item_id: int) -> MutationSuccess:
        user = await info.context.require_user()
        await catalog_service.delete_menu_item(
            info.context.session, actor=user, item_id=item_id
        )
        return MutationSuccess(message="Menu item deleted.")

    @strawberry.mutation(permission_classes=[IsVendor])
    async def set_menu_item_stock(
        self, info: Info, item_id: int, stock_count: int | None
    ) -> MenuItemType:
        user = await info.context.require_user()
        item = await catalog_service.set_stock(
            info.context.session,
            actor=user,
            item_id=item_id,
            stock_count=stock_count,
        )
        return to_menu_item(item)

    # ------------------------------------------------------ vendor: canteen
    @strawberry.mutation(permission_classes=[IsVendor])
    async def update_canteen(
        self, info: Info, canteen_id: int, input: CanteenInput
    ) -> CanteenType:
        user = await info.context.require_user()
        canteen = await catalog_service.update_canteen(
            info.context.session,
            actor=user,
            canteen_id=canteen_id,
            **strawberry.asdict(input),
        )
        return await _canteen_type(info, canteen)

    @strawberry.mutation(permission_classes=[IsVendor])
    async def create_promotion(
        self, info: Info, canteen_id: int, input: PromotionInput
    ) -> PromotionType_:
        from app.db.models import Promotion

        user = await info.context.require_user()
        await catalog_service.assert_manages_canteen(
            info.context.session, user, canteen_id
        )

        if input.ends_at <= input.starts_at:
            raise ValidationError("The end date must be after the start date.")
        if input.type is PromotionTypeModel.PERCENTAGE and input.value > 10_000:
            raise ValidationError("A percentage discount cannot exceed 100%.")

        promotion = Promotion(
            canteen_id=canteen_id,
            code=input.code.strip().upper(),
            title=input.title.strip(),
            description=input.description,
            type=input.type,
            value=input.value,
            max_discount_paise=input.max_discount_paise,
            min_order_paise=input.min_order_paise,
            starts_at=input.starts_at,
            ends_at=input.ends_at,
            max_redemptions=input.max_redemptions,
            max_redemptions_per_user=input.max_redemptions_per_user,
            is_active=input.is_active,
        )
        info.context.session.add(promotion)
        await info.context.session.flush()
        return to_promotion(promotion, is_live_now=promotion_service.is_live(promotion))

    @strawberry.mutation(permission_classes=[IsVendor])
    async def set_promotion_active(
        self, info: Info, promotion_id: int, is_active: bool
    ) -> PromotionType_:
        from app.db.models import Promotion

        user = await info.context.require_user()
        promotion = await info.context.session.get(Promotion, promotion_id)
        if promotion is None:
            raise ValidationError("That promotion does not exist.")
        await catalog_service.assert_manages_canteen(
            info.context.session, user, promotion.canteen_id
        )

        promotion.is_active = is_active
        await info.context.session.flush()
        return to_promotion(promotion, is_live_now=promotion_service.is_live(promotion))

    @strawberry.mutation(permission_classes=[IsVendor])
    async def assign_staff(
        self, info: Info, canteen_id: int, user_ids: list[str]
    ) -> list[UserType]:
        actor = await info.context.require_user()
        staff = await user_service.assign_staff(
            info.context.session,
            actor=actor,
            canteen_id=canteen_id,
            user_ids=user_ids,
        )
        return [to_user(member) for member in staff]

    @strawberry.mutation(permission_classes=[IsVendor])
    async def remove_staff(
        self, info: Info, canteen_id: int, user_ids: list[str]
    ) -> list[UserType]:
        actor = await info.context.require_user()
        staff = await user_service.remove_staff(
            info.context.session,
            actor=actor,
            canteen_id=canteen_id,
            user_ids=user_ids,
        )
        return [to_user(member) for member in staff]

    # ---------------------------------------------------------------- admin
    @strawberry.mutation(permission_classes=[IsAdmin])
    async def create_canteen(
        self, info: Info, owner_id: str, input: CanteenInput
    ) -> CanteenType:
        actor = await info.context.require_user()
        canteen = await catalog_service.create_canteen(
            info.context.session,
            actor=actor,
            owner_id=owner_id,
            **strawberry.asdict(input),
        )
        return await _canteen_type(info, canteen)

    @strawberry.mutation(permission_classes=[IsAdmin])
    async def set_canteen_active(
        self, info: Info, canteen_id: int, is_active: bool
    ) -> CanteenType:
        actor = await info.context.require_user()
        canteen = await catalog_service.set_canteen_active(
            info.context.session,
            actor=actor,
            canteen_id=canteen_id,
            is_active=is_active,
        )
        return await _canteen_type(info, canteen)

    @strawberry.mutation(permission_classes=[IsAdmin])
    async def create_staff_account(
        self,
        info: Info,
        name: str,
        email: str,
        password: str,
        role: UserRole,
    ) -> UserType:
        actor = await info.context.require_user()
        user = await user_service.create_staff_account(
            info.context.session,
            actor=actor,
            name=name,
            email=email,
            password=password,
            role=role,
        )
        return to_user(user)

    @strawberry.mutation(permission_classes=[IsAdmin])
    async def set_user_role(self, info: Info, user_id: str, role: UserRole) -> UserType:
        actor = await info.context.require_user()
        user = await user_service.set_user_role(
            info.context.session, actor=actor, user_id=user_id, role=role
        )
        return to_user(user)

    @strawberry.mutation(permission_classes=[IsAdmin])
    async def set_user_active(
        self, info: Info, user_id: str, is_active: bool
    ) -> UserType:
        actor = await info.context.require_user()
        user = await user_service.set_user_active(
            info.context.session,
            actor=actor,
            user_id=user_id,
            is_active=is_active,
        )
        return to_user(user)

    @strawberry.mutation(permission_classes=[IsAdmin])
    async def escalate_stale_complaints(
        self, info: Info, older_than_days: int = 7
    ) -> MutationSuccess:
        count = await engagement_service.escalate_stale_complaints(
            info.context.session, older_than_days=older_than_days
        )
        return MutationSuccess(message=f"{count} complaint(s) escalated.")
