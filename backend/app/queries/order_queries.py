import strawberry
from typing import List, Optional
from datetime import datetime
from app.models.order import Order, OrderItem
from app.core.database import get_db



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
    totalAmount: float
    status: str
    orderTime: str
    confirmedTime: Optional[str]
    preparingTime: Optional[str]
    readyTime: Optional[str]
    deliveryTime: Optional[str]
    cancelledTime: Optional[str]
    pickupTime: Optional[str]
    paymentMethod: str
    paymentStatus: str
    customerNote: Optional[str]
    cancellationReason: Optional[str]
    discount: float
    phone: str
    isPreOrder: bool
    items: List[OrderItemType]

    @staticmethod
    def from_db_model(order: "Order") -> "OrderType":
        return OrderType(
            id=order.id,
            userId=order.userId,
            canteenId=order.canteenId,
            totalAmount=order.totalAmount,
            status=order.status,
            orderTime=order.orderTime,
            confirmedTime=order.confirmedTime,
            preparingTime=order.preparingTime,
            readyTime=order.readyTime,
            deliveryTime=order.deliveryTime,
            cancelledTime=order.cancelledTime,
            pickupTime=order.pickupTime,
            paymentMethod=order.paymentMethod,
            paymentStatus=order.paymentStatus,
            customerNote=order.customerNote,
            cancellationReason=order.cancellationReason,
            discount=order.discount,
            phone=order.phone,
            isPreOrder=order.isPreOrder,
            items=[
                OrderItemType(
                    id=item.get("id"),
                    itemId=item["itemId"],
                    quantity=item["quantity"],
                    customizations=item.get("customizations"),
                    note=item.get("note")
                )
                for item in order.items
            ]
        )

@strawberry.type
class OrderQuery:
    @strawberry.field
    def get_user_orders(self, userId: int) -> List[OrderType]:
        """Get all orders for a user"""
        db = next(get_db())
        orders = db.query(Order).filter(Order.userId == userId).all()
        return [OrderType.from_db_model(order) for order in orders]

    @strawberry.field
    def get_canteen_orders(self, canteenId: int) -> List[OrderType]:
        """Get all orders for a canteen"""
        db = next(get_db())
        orders = db.query(Order).filter(Order.canteenId == canteenId).all()
        return [OrderType.from_db_model(order) for order in orders]

    @strawberry.field
    def get_order_by_id(self, orderId: int) -> Optional[OrderType]:
        """Get a specific order by ID"""
        db = next(get_db())
        order = db.query(Order).filter(Order.id == orderId).first()
        return OrderType.from_db_model(order) if order else None

    @strawberry.field
    def get_orders_by_status(self, status: str) -> List[OrderType]:
        """Get all orders with a specific status"""
        db = next(get_db())
        orders = db.query(Order).filter(Order.status == status.lower()).all()
        return [OrderType.from_db_model(order) for order in orders]

queries = [
    strawberry.field(name="getUserOrders", resolver=OrderQuery.get_user_orders),
    strawberry.field(name="getCanteenOrders", resolver=OrderQuery.get_canteen_orders),
    strawberry.field(name="getOrderById", resolver=OrderQuery.get_order_by_id),
    strawberry.field(name="getOrdersByStatus", resolver=OrderQuery.get_orders_by_status),
]