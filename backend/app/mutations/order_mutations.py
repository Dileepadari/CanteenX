import strawberry
from typing import List, Optional, Tuple, Dict, Any
from datetime import timedelta
from strawberry.types import Info
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from graphql import GraphQLError

from app.models.order import Order, OrderItem, OrderType, CreateOrderInput, OrderItemInput
from app.models.menu_item import MenuItem
from app.models.canteen import Canteen
from app.models.user import User

def _process_order_items_and_calculate_total(
    db: Session, items: List[OrderItemInput]
) -> Tuple[List[Dict[str, Any]], float]:
    """
    Validates items, calculates the total amount based on DB prices,
    and returns a list of processed items and the total.
    Raises GraphQLError if an item is not found.
    """
    total_amount = 0.0
    processed_items: List[Dict[str, Any]] = []

    for item_input in items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item_input.itemId).first()
        if not menu_item:
            raise GraphQLError(f"Menu item with ID {item_input.itemId} not found.")
        # Use current menu price as the snapshot price
        price = float(menu_item.price or 0.0)
        total_amount += price * (item_input.quantity or 0)

        # Normalize customizations to a clean dictionary
        customizations_dict = None
        if getattr(item_input, "customizations", None):
            customizations_dict = {
                "size": getattr(item_input.customizations, "size", None),
                "additions": getattr(item_input.customizations, "additions", []),
                "removals": getattr(item_input.customizations, "removals", []),
                "notes": getattr(item_input.customizations, "notes", None),
            }

        processed_items.append({
            "itemId": item_input.itemId,
            "quantity": item_input.quantity,
            "note": getattr(item_input, "note", None),
            "customizations": customizations_dict,
            "snapshot_name": getattr(menu_item, 'name', None),
            "snapshot_price": price,
        })

    return processed_items, total_amount


def _get_order_and_verify_vendor(db: Session, order_id: int, user: User):
    """Fetches an order and verifies the user is the canteen vendor."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise GraphQLError("Order not found.")

    canteen = db.query(Canteen).filter(Canteen.id == order.canteenId).first()
    if not canteen or canteen.userId != user.id:
        raise GraphQLError("Unauthorized: Only the canteen vendor can perform this action.")

    return order


@strawberry.type
class OrderMutations:
    @strawberry.mutation
    def create_order(self, info: Info, input: CreateOrderInput) -> OrderType:
        """
        Creates a new order for the authenticated user. Calculates total price on the server.
        NOTE: The client is responsible for clearing the cart after this mutation succeeds.
        """
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        if not current_user:
            raise GraphQLError("You must be logged in to create an order.")
        # Validate items, calculate subtotal (without tax) and prepare processed items
        processed_items, subtotal_amount = _process_order_items_and_calculate_total(db, input.items)

        # Compute tax and total. Tax rate is a simple site-wide default for now.
        TAX_RATE = 0.05
        tax_amount = round(float(subtotal_amount) * TAX_RATE, 2)
        total_amount = float(subtotal_amount) + float(tax_amount)

        # Check and decrement stock for each item if stock_count is present.
        # This should run inside the same DB session/transaction to avoid overselling.
        for item_input in input.items:
            # try to lock the row for update when supported by the DB
            try:
                menu_item = (
                    db.query(MenuItem)
                    .filter(MenuItem.id == item_input.itemId)
                    .with_for_update()
                    .first()
                )
            except Exception:
                # Fallback for DBs that don't support FOR UPDATE
                menu_item = db.query(MenuItem).filter(MenuItem.id == item_input.itemId).first()

            if not menu_item:
                raise GraphQLError(f"Menu item with ID {item_input.itemId} not found.")

            # If the menu item exposes stock_count, enforce it. If it's None, treat as unlimited.
            current_stock = getattr(menu_item, "stock_count", None)
            qty = item_input.quantity or 0
            if current_stock is not None:
                if current_stock < qty:
                    raise GraphQLError(
                        f"Insufficient stock for item '{getattr(menu_item, 'name', str(menu_item.id))}'. Available: {current_stock}, requested: {qty}"
                    )
                # decrement
                menu_item.stock_count = current_stock - qty
                db.add(menu_item)

        # Normalize input field names (support both camelCase and snake_case)
        canteen_id = getattr(input, "canteenId", getattr(input, "canteen_id", None))
        is_pre_order = getattr(input, "isPreOrder", getattr(input, "is_pre_order", False))
        payment_method = getattr(input, "paymentMethod", getattr(input, "payment_method", None))
        customer_note = getattr(input, "customerNote", getattr(input, "customer_note", None))
        phone_val = getattr(input, "phone", None)
        pickup_time = getattr(input, "pickupTime", getattr(input, "pickup_time", None))

        # Create order using snake_case DB column names to avoid assigning
        # to camelCase property accessors (which are read-only).
        new_order = Order(
            user_id=current_user.id,
            canteen_id=canteen_id,
            total_amount=total_amount,
            subtotal=subtotal_amount,
            tax=tax_amount,
            status="scheduled" if is_pre_order else "pending",
            order_time=datetime.now(timezone.utc),
            payment_method=payment_method,
            payment_status="Pending",
            customer_note=customer_note,
            phone=phone_val or "",
            is_pre_order=is_pre_order,
            pickup_time=pickup_time,
        )

        db.add(new_order)
        db.flush()  # ensure new_order.id is available

        # Persist OrderItem rows for the processed items
        for pi in processed_items:
            oi = OrderItem(
                order_id=new_order.id,
                item_id=pi.get("itemId"),
                quantity=pi.get("quantity") or 0,
                customizations=pi.get("customizations"),
                note=pi.get("note"),
                snapshot_name=pi.get("snapshot_name"),
                snapshot_price=pi.get("snapshot_price"),
            )
            db.add(oi)

        db.commit()
        db.refresh(new_order)

        return new_order

    @strawberry.mutation
    def update_order_status(self, info: Info, order_id: int, status: str) -> OrderType:
        """Update order status. Requires canteen vendor privileges."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        if not current_user:
            raise GraphQLError("Authentication required.")

        order = _get_order_and_verify_vendor(db, order_id, current_user)

        # Update status and corresponding timestamp (use DB column names)
        now = datetime.now(timezone.utc)
        order.status = status
        timestamps = {
            "confirmed": "confirmed_time",
            "preparing": "preparing_time",
            "ready": "ready_time",
            "delivered": "delivery_time",
            "cancelled": "cancelled_time",
        }
        if status in timestamps:
            setattr(order, timestamps[status], now)
        db.commit()
        db.refresh(order)
        return order

    @strawberry.type
    class CancelOrderPayload:
        """Payload returned by the cancelOrder mutation to match frontend expectations."""
        success: bool
        message: Optional[str] = None
        orderId: Optional[int] = None

    @strawberry.mutation
    def cancel_order(self, info: Info, userId: str, orderId: int, reason: Optional[str] = None) -> "OrderMutations.CancelOrderPayload":
        """Cancel an order. Exposes a payload { success, message, orderId } and accepts userId and orderId to match the frontend."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        if not current_user:
            return OrderMutations.CancelOrderPayload(success=False, message="Authentication required.", orderId=None)

        # Ensure the caller matches the provided userId for an explicit check.
        if str(current_user.id) != str(userId):
            return OrderMutations.CancelOrderPayload(success=False, message="Unauthorized: caller does not match userId.", orderId=None)

        order = db.query(Order).filter(Order.id == orderId).first()
        if not order:
            return OrderMutations.CancelOrderPayload(success=False, message="Order not found.", orderId=None)

        # Ensure only the owner can cancel
        if str(order.userId) != str(current_user.id):
            return OrderMutations.CancelOrderPayload(success=False, message="Unauthorized: You can only cancel your own orders.", orderId=None)

        # Disallow cancellation if already delivered or already cancelled
        if order.status in ["delivered", "cancelled"]:
            return OrderMutations.CancelOrderPayload(success=False, message=f"Cannot cancel order with status: '{order.status}'.", orderId=orderId)

        # Disallow cancelling paid orders (require refund flow)
        if getattr(order, 'payment_status', None) and str(order.payment_status).lower() in ["paid", "completed"]:
            return OrderMutations.CancelOrderPayload(success=False, message="Cannot cancel an order that has been paid. Please request a refund.", orderId=orderId)

        # Allow cancellation only within a 5 minute window from order creation
        order_time = getattr(order, 'order_time', None)
        if order_time:
            now = datetime.now(timezone.utc)
            if now - order_time > timedelta(minutes=5):
                return OrderMutations.CancelOrderPayload(success=False, message="Cancellation window (5 minutes) has expired.", orderId=orderId)
        # Perform cancellation using underlying DB columns
        order.status = "cancelled"
        order.cancelled_time = datetime.now(timezone.utc)
        order.cancellation_reason = reason

        db.commit()
        db.refresh(order)

        return OrderMutations.CancelOrderPayload(success=True, message="Order cancelled.", orderId=orderId)

    @strawberry.mutation
    def mark_order_paid(self, info: Info, order_id: int, payment_reference: Optional[str] = None) -> OrderType:
        """Mark an order as paid. Only the customer who placed the order can call this."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        if not current_user:
            raise GraphQLError("Authentication required.")

        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise GraphQLError("Order not found.")
        if order.userId != current_user.id:
            raise GraphQLError("Unauthorized: You can only confirm payment for your own orders.")

        if order.status in ["delivered", "cancelled"]:
            raise GraphQLError(f"Cannot update payment for order with status: '{order.status}'.")

        # Update payment status and confirm the order (use DB column names)
        order.payment_status = "Paid"
        order.status = "confirmed"
        order.confirmed_time = datetime.now(timezone.utc)

        db.add(order)
        db.commit()
        db.refresh(order)
        return order
