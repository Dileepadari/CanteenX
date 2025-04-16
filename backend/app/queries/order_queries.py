import strawberry
from typing import List, Optional
from datetime import datetime
from enum import Enum
from ..repositories.order_repository import OrderRepository

@strawberry.enum
class OrderStatus(str, Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

@strawberry.type
class OrderItem:
    id: int
    menuItemId: int
    itemName: str
    quantity: int
    price: float
    notes: Optional[str] = None

@strawberry.type
class Order:
    id: int
    user_id: int
    canteen_id: int
    customerName: str
    status: str
    totalAmount: float = strawberry.field(name="totalAmount")
    payment_status: bool
    payment_method: Optional[str] = None
    payment_id: Optional[str] = None
    preparation_time: Optional[int] = None
    notes: Optional[str] = None
    is_bulk_order: bool
    pickup_time: Optional[datetime] = None
    createdAt: datetime = strawberry.field(name="createdAt")
    updatedAt: datetime = strawberry.field(name="updatedAt")
    items: List[OrderItem]

@strawberry.type
class StatusCount:
    pending: int
    preparing: int
    ready: int
    completed: int
    cancelled: int

@strawberry.type
class OrdersQuery:
    @strawberry.field
    def orders(self, canteen_id: Optional[int] = None, status: Optional[str] = None) -> List[Order]:
        """Get a list of orders with optional filtering"""
        db_orders = OrderRepository.list_orders(canteen_id, status)
        
        # Convert the items dictionaries to OrderItem instances
        orders_with_item_instances = []
        for order in db_orders:
            # Clone the order data except for the items
            order_data = {k: v for k, v in order.items() if k != 'items'}
            
            # Create OrderItem instances for each item
            order_data['items'] = [OrderItem(**item) for item in order['items']]
            
            # Add to the results
            orders_with_item_instances.append(order_data)
        
        return [Order(**order) for order in orders_with_item_instances]

    @strawberry.field
    def order(self, id: int) -> Optional[Order]:
        """Get a single order by ID"""
        db_order = OrderRepository.get_order(id)
        if db_order:
            # Create OrderItem instances for each item
            order_data = {k: v for k, v in db_order.items() if k != 'items'}
            order_data['items'] = [OrderItem(**item) for item in db_order['items']]
            
            return Order(**order_data)
        return None
        
    @strawberry.field
    def order_counts(self, canteen_id: Optional[int] = None) -> StatusCount:
        """Get order counts by status"""
        counts = OrderRepository.get_orders_count_by_status(canteen_id)
        return StatusCount(**counts)

@strawberry.type
class OrdersMutation:
    @strawberry.mutation
    def update_order_status(self, order_id: int, status: OrderStatus) -> bool:
        """Update the status of an order"""
        return OrderRepository.update_order_status(order_id, status.value)

# Import these types in main.py to create the GraphQL schema
