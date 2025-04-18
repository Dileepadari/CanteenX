import strawberry
import json
from typing import List, Optional
from app.models.order import Order, OrderItem, OrderStep
from app.core.database import get_db

@strawberry.type
class OrderStepType:
    status: str
    description: str
    time: Optional[str]
    completed: bool
    current: bool

@strawberry.type
class OrderItemType:
    id: str
    name: str
    price: float
    quantity: int
    customizations: List[str]
    vendor_name: str

@strawberry.type
class OrderType:
    id: str
    date: str
    total: float
    status: str
    canteen_name: str
    vendor_name: str
    estimated_delivery_time: Optional[str]
    current_status: Optional[str]
    steps: List[OrderStepType]
    items: List[OrderItemType]

# Resolver for getting active orders for a user
def resolve_get_active_orders(userId: str) -> List[OrderType]:
    # Get database session
    db = next(get_db())
    
    # Query active orders for the user
    active_orders = db.query(Order).filter(
        Order.user_id == userId,
        Order.status.notin_(["Completed", "Cancelled"])
    ).all()
    
    result = []
    
    for order in active_orders:
        # Get order steps
        steps = db.query(OrderStep).filter(OrderStep.order_id == order.id).all()
        
        # Get order items
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        
        # Convert to OrderType
        result.append(
            OrderType(
                id=order.id,
                date=order.date.isoformat() + ".000Z",
                total=order.total,
                status=order.status,
                canteen_name=order.canteen_name,
                vendor_name=order.vendor_name,
                estimated_delivery_time=order.estimated_delivery_time,
                current_status=order.current_status,
                steps=[
                    OrderStepType(
                        status=step.status,
                        description=step.description,
                        time=step.time,
                        completed=bool(step.completed),
                        current=bool(step.current)
                    ) for step in steps
                ],
                items=[
                    OrderItemType(
                        id=str(item.id),
                        name=item.name,
                        price=item.price,
                        quantity=item.quantity,
                        customizations=json.loads(item.customizations) if item.customizations else [],
                        vendor_name=item.vendor_name
                    ) for item in items
                ]
            )
        )
    
    return result

# Resolver for getting order history for a user
def resolve_get_order_history(userId: str, limit: Optional[int] = None, offset: Optional[int] = 0) -> List[OrderType]:
    # Get database session
    db = next(get_db())
    
    # Query completed or cancelled orders for the user
    query = db.query(Order).filter(
        Order.user_id == userId,
        Order.status.in_(["Completed", "Cancelled"])
    ).order_by(Order.date.desc())
    
    # Apply pagination if limit is provided
    if limit is not None:
        query = query.offset(offset).limit(limit)
    
    order_history = query.all()
    
    result = []
    
    for order in order_history:
        # Get order steps
        steps = db.query(OrderStep).filter(OrderStep.order_id == order.id).all()
        
        # Get order items
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        
        # Convert to OrderType
        result.append(
            OrderType(
                id=order.id,
                date=order.date.isoformat() + ".000Z",
                total=order.total,
                status=order.status,
                canteen_name=order.canteen_name,
                vendor_name=order.vendor_name,
                estimated_delivery_time=order.estimated_delivery_time,
                current_status=order.current_status,
                steps=[
                    OrderStepType(
                        status=step.status,
                        description=step.description,
                        time=step.time,
                        completed=bool(step.completed),
                        current=bool(step.current)
                    ) for step in steps
                ],
                items=[
                    OrderItemType(
                        id=str(item.id),
                        name=item.name,
                        price=item.price,
                        quantity=item.quantity,
                        customizations=json.loads(item.customizations) if item.customizations else [],
                        vendor_name=item.vendor_name
                    ) for item in items
                ]
            )
        )
    
    return result

# Resolver for getting a specific order by ID
def resolve_get_order_by_id(orderId: str) -> Optional[OrderType]:
    # Get database session
    db = next(get_db())
    
    # Query for the specific order
    order = db.query(Order).filter(Order.id == orderId).first()
    
    if not order:
        return None
    
    # Get order steps
    steps = db.query(OrderStep).filter(OrderStep.order_id == order.id).all()
    
    # Get order items
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    # Convert to OrderType
    return OrderType(
        id=order.id,
        date=order.date.isoformat() + ".000Z",
        total=order.total,
        status=order.status,
        canteen_name=order.canteen_name,
        vendor_name=order.vendor_name,
        estimated_delivery_time=order.estimated_delivery_time,
        current_status=order.current_status,
        steps=[
            OrderStepType(
                status=step.status,
                description=step.description,
                time=step.time,
                completed=bool(step.completed),
                current=bool(step.current)
            ) for step in steps
        ],
        items=[
            OrderItemType(
                id=str(item.id),
                name=item.name,
                price=item.price,
                quantity=item.quantity,
                customizations=json.loads(item.customizations) if item.customizations else [],
                vendor_name=item.vendor_name
            ) for item in items
        ]
    )

# Create properly decorated fields with resolvers and matching frontend field names
getActiveOrders = strawberry.field(name="getActiveOrders", resolver=resolve_get_active_orders)
getOrderHistory = strawberry.field(name="getOrderHistory", resolver=resolve_get_order_history)
getOrderById = strawberry.field(name="getOrderById", resolver=resolve_get_order_by_id)

queries = [
    getActiveOrders,
    getOrderHistory,
    getOrderById
]