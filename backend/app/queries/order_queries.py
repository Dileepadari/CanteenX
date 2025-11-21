import json
import strawberry
from typing import List, Optional, Dict, Any
from strawberry.types import Info
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.order import Order, OrderType, OrderItemType, Customizations, OrderItem

# Define a constant for active order statuses to avoid repetition and magic strings
ACTIVE_ORDER_STATUSES = ["pending", "confirmed", "preparing", "ready"]

def _parse_customizations_from_dict(custom_data: Any) -> Optional[Customizations]:
    """Safely parses a dictionary or JSON string into a Customizations object."""
    if not custom_data:
        return None

    customizations_dict = custom_data
    # If customizations is a string, try to load it as JSON
    if isinstance(customizations_dict, str):
        try:
            customizations_dict = json.loads(customizations_dict)
        except json.JSONDecodeError:
            # If parsing fails, it's not a valid format
            return None

    # Ensure we have a dictionary before proceeding
    if not isinstance(customizations_dict, dict):
        return None

    return Customizations(
        size=customizations_dict.get("size"),
        additions=customizations_dict.get("additions"),
        removals=customizations_dict.get("removals"),
        notes=customizations_dict.get("notes"),
    )

def _convert_item_data_to_type(item_data: Dict[str, Any]) -> OrderItemType:
    """Converts either an OrderItem model instance or a dictionary into an OrderItemType.

    Supports both the legacy JSON-like representation and the SQLAlchemy
    `OrderItem` model instances stored via relationships.
    """
    # If this is a SQLAlchemy OrderItem instance
    if isinstance(item_data, OrderItem):
        return OrderItemType(
            id=item_data.id,
            itemId=item_data.item_id,
            name=item_data.name,
            price=item_data.price,
            quantity=item_data.quantity,
            customizations=_parse_customizations_from_dict(item_data.customizations),
            note=item_data.note,
        )

    # Otherwise treat it as a dict-like structure (backwards compatibility)
    return OrderItemType(
        id=item_data.get('id'),
        itemId=item_data.get('itemId') or item_data.get('item_id'),
        name=item_data.get('name') or item_data.get('snapshot_name'),
        price=item_data.get('price') or item_data.get('snapshot_price') or 0.0,
        quantity=item_data.get('quantity', 1),
        customizations=_parse_customizations_from_dict(item_data.get('customizations')),
        note=item_data.get('note')
    )

def _convert_order_model_to_type(order: Order) -> OrderType:
    """Converts an Order SQLAlchemy model to an OrderType, processing its related items.

    This maps the snake_case DB attributes to the camelCase GraphQL fields and
    converts datetime fields to ISO 8601 strings.
    """
    order_items = [_convert_item_data_to_type(item) for item in order.items] if order.items else []

    from app.helpers.time_utils import to_ist_iso

    def _iso(dt):
        return to_ist_iso(dt)

    return OrderType(
        id=order.id,
        userId=order.user_id,
        canteenId=order.canteen_id,
        items=order_items,
        totalAmount=order.total_amount,
        subtotal=order.subtotal if getattr(order, 'subtotal', None) is not None else 0.0,
        tax=order.tax if getattr(order, 'tax', None) is not None else 0.0,
        status=order.status,
        orderTime=_iso(order.order_time),
        confirmedTime=_iso(order.confirmed_time),
        preparingTime=_iso(order.preparing_time),
        readyTime=_iso(order.ready_time),
        deliveryTime=_iso(order.delivery_time),
        paymentMethod=order.payment_method,
        paymentStatus=order.payment_status,
        customerNote=order.customer_note,
        discount=order.discount,
    # phone is non-nullable in the GraphQL schema; provide a safe default
    # (empty string) when the DB value is None to avoid Strawberry errors.
    phone=order.phone or "",
        pickupTime=order.pickup_time,
        isPreOrder=order.is_pre_order,
        cancelledTime=_iso(order.cancelled_time),
        cancellationReason=order.cancellation_reason,
    )

@strawberry.type
class OrderQueries:
    @strawberry.field
    def get_all_orders(self, user_id: str, info: Info) -> List[OrderType]:
        """Get all orders for a user, sorted by most recent."""
        db: Session = info.context["db"]
        orders = (
            db.query(Order)
            .filter(Order.user_id == user_id)
            .order_by(desc(Order.order_time))
            .all()
        )
        return [_convert_order_model_to_type(order) for order in orders]

    @strawberry.field
    def get_active_orders(self, user_id: str, info: Info) -> List[OrderType]:
        """Get active orders (not delivered or cancelled) for a user."""
        db: Session = info.context["db"]
        orders = (
            db.query(Order)
            .filter(Order.user_id == user_id)
            .filter(Order.status.in_(ACTIVE_ORDER_STATUSES))
            .order_by(desc(Order.order_time))
            .all()
        )
        return [_convert_order_model_to_type(order) for order in orders]

    @strawberry.field
    def get_order_by_id(self, order_id: int, info: Info) -> Optional[OrderType]:
        """Get a specific order by its ID."""
        db: Session = info.context["db"]
        order = db.query(Order).filter(Order.id == order_id).first()
        return _convert_order_model_to_type(order) if order else None

    @strawberry.field
    def get_canteen_orders(self, canteen_id: int, info: Info) -> List[OrderType]:
        """Get all orders for a specific canteen."""
        db: Session = info.context["db"]
        orders = (
            db.query(Order)
            .filter(Order.canteen_id == canteen_id)
            .order_by(desc(Order.order_time))
            .all()
        )
        return [_convert_order_model_to_type(order) for order in orders]

    @strawberry.field
    def get_canteen_active_orders(self, canteen_id: int, info: Info) -> List[OrderType]:
        """Get active orders for a specific canteen."""
        db: Session = info.context["db"]
        orders = (
            db.query(Order)
            .filter(Order.canteen_id == canteen_id)
            .filter(Order.status.in_(ACTIVE_ORDER_STATUSES))
            .order_by(desc(Order.order_time))
            .all()
        )
        return [_convert_order_model_to_type(order) for order in orders]