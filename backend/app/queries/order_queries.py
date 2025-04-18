import json
import strawberry
from typing import List, Optional
from app.models.order import OrderItem, Order
from app.core.database import get_db
from sqlalchemy import desc, func
from datetime import datetime

@strawberry.type
class OrderItemType:
    id: Optional[int] = None  # Made optional to avoid missing key error
    itemId: int
    quantity: int
    customizations: Optional[List[str]] = None
    note: Optional[str] = None

@strawberry.type
class OrderType:
    id: int
    userId: int
    canteenId: int
    items: List[OrderItemType]  # List of OrderItemType objects
    totalAmount: float
    status: str
    orderTime: str
    confirmedTime: Optional[str] = None
    preparingTime: Optional[str] = None
    readyTime: Optional[str] = None
    deliveryTime: Optional[str] = None
    paymentMethod: str
    paymentStatus: str
    customerNote: Optional[str] = None
    discount: float
    phone: str
    pickupTime: Optional[str] = None
    isPreOrder: bool
    cancelledTime: Optional[str] = None
    cancellationReason: Optional[str] = None

def map_order_to_type(order: Order) -> OrderType:
    """Map database Order model to GraphQL OrderType"""
    # Parse items from JSON to OrderItemType objects
    order_items = []
    if order.items:
        for item_data in order.items:
            item = OrderItemType(
                itemId=item_data.get('itemId'),
                quantity=item_data.get('quantity', 1),
                customizations=item_data.get('customizations'),
                note=item_data.get('note')
            )
            order_items.append(item)
    
    return OrderType(
        id=order.id,
        userId=order.userId,
        canteenId=order.canteenId,
        items=order_items,
        totalAmount=order.totalAmount,
        status=order.status,
        orderTime=order.orderTime,
        confirmedTime=order.confirmedTime,
        preparingTime=order.preparingTime,
        readyTime=order.readyTime,
        deliveryTime=order.deliveryTime,
        paymentMethod=order.paymentMethod,
        paymentStatus=order.paymentStatus,
        customerNote=order.customerNote,
        discount=order.discount,
        phone=order.phone,
        pickupTime=order.pickupTime,
        isPreOrder=order.isPreOrder,
        cancelledTime=order.cancelledTime,
        cancellationReason=order.cancellationReason,
    )

def resolve_get_all_orders(userId: int) -> List[OrderType]:
    """Get all orders for a user"""
    db = next(get_db())
    orders = db.query(Order).filter(Order.userId == userId).order_by(desc(Order.orderTime)).all()
    return [map_order_to_type(order) for order in orders]

def resolve_get_active_orders(userId: int) -> List[OrderType]:
    """Get active orders (not delivered or cancelled) for a user"""
    db = next(get_db())
    orders = db.query(Order)\
        .filter(Order.userId == userId)\
        .filter(Order.status.in_(["pending", "confirmed", "preparing", "ready"]))\
        .order_by(desc(Order.orderTime))\
        .all()
    return [map_order_to_type(order) for order in orders]

def resolve_get_order_by_id(orderId: int) -> Optional[OrderType]:
    """Get specific order by ID"""
    db = next(get_db())
    order = db.query(Order).filter(Order.id == orderId).first()
    if not order:
        return None
    return map_order_to_type(order)

def resolve_get_canteen_orders(canteenId: int) -> List[OrderType]:
    """Get all orders for a specific canteen"""
    db = next(get_db())
    orders = db.query(Order).filter(Order.canteenId == canteenId).order_by(desc(Order.orderTime)).all()
    return [map_order_to_type(order) for order in orders]

def resolve_get_canteen_active_orders(canteenId: int) -> List[OrderType]:
    """Get active orders for a specific canteen"""
    db = next(get_db())
    orders = db.query(Order)\
        .filter(Order.canteenId == canteenId)\
        .filter(Order.status.in_(["pending", "confirmed", "preparing", "ready"]))\
        .order_by(desc(Order.orderTime))\
        .all()
    return [map_order_to_type(order) for order in orders]

# Create properly decorated fields with resolvers
getAllOrders = strawberry.field(name="getAllOrders", resolver=resolve_get_all_orders)
getActiveOrders = strawberry.field(name="getActiveOrders", resolver=resolve_get_active_orders)
getOrderById = strawberry.field(name="getOrderById", resolver=resolve_get_order_by_id)
getCanteenOrders = strawberry.field(name="getCanteenOrders", resolver=resolve_get_canteen_orders)
getCanteenActiveOrders = strawberry.field(name="getCanteenActiveOrders", resolver=resolve_get_canteen_active_orders)

# Export the queries
queries = [
    getAllOrders,
    getActiveOrders,
    getOrderById,
    getCanteenOrders,
    getCanteenActiveOrders
]