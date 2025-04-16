import strawberry
import json
from typing import List, Optional
from app.models.order import Order, OrderItem, OrderStep

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

# Helper function to get mock order data
def _get_mock_orders() -> List[dict]:
    # Mock active order for current date (April 16, 2025)
    active_orders = [
        {
            "id": "ORD12345",
            "user_id": 1,
            "date": "2025-04-16T12:15:00.000Z",
            "total": 450.00,
            "status": "Processing",
            "canteen_name": "Central Canteen",
            "vendor_name": "Indian Delights",
            "estimated_delivery_time": "12:45 PM",
            "current_status": "Preparing",
            "steps": [
                {
                    "status": "Order Placed",
                    "description": "Your order has been received by the vendor.",
                    "time": "12:15 PM",
                    "completed": True,
                    "current": False,
                },
                {
                    "status": "Preparing",
                    "description": "The kitchen is preparing your food.",
                    "time": "12:20 PM",
                    "completed": False,
                    "current": True,
                },
                {
                    "status": "Ready for Pickup",
                    "description": "Your order is ready for pickup.",
                    "time": "",
                    "completed": False,
                    "current": False,
                },
                {
                    "status": "Completed",
                    "description": "Your order has been picked up.",
                    "time": "",
                    "completed": False,
                    "current": False,
                },
            ],
            "items": [
                {
                    "id": "item1",
                    "name": "Butter Chicken",
                    "price": 220.00,
                    "quantity": 1,
                    "customizations": ["Extra Butter", "Medium Spicy"],
                    "vendor_name": "Indian Delights",
                },
                {
                    "id": "item2",
                    "name": "Garlic Naan",
                    "price": 40.00,
                    "quantity": 2,
                    "customizations": [],
                    "vendor_name": "Indian Delights",
                },
                {
                    "id": "item3",
                    "name": "Jeera Rice",
                    "price": 150.00,
                    "quantity": 1,
                    "customizations": ["Large Portion"],
                    "vendor_name": "Indian Delights",
                },
            ]
        }
    ]

    # Mock order history
    order_history = [
        {
            "id": "ORD12344",
            "user_id": 1,
            "date": "2025-04-12T15:30:00.000Z",
            "total": 320.00,
            "status": "Completed",
            "canteen_name": "Central Canteen",
            "vendor_name": "Indian Delights",
            "items": [
                {
                    "id": "item1",
                    "name": "Paneer Butter Masala",
                    "price": 180.00,
                    "quantity": 1,
                    "customizations": ["Extra Spicy", "Regular Portion"],
                    "vendor_name": "Indian Delights",
                },
                {
                    "id": "item2",
                    "name": "Garlic Naan",
                    "price": 40.00,
                    "quantity": 2,
                    "customizations": [],
                    "vendor_name": "Indian Delights",
                },
                {
                    "id": "item3",
                    "name": "Sweet Lassi",
                    "price": 60.00,
                    "quantity": 1,
                    "customizations": [],
                    "vendor_name": "Indian Delights",
                },
            ]
        },
        {
            "id": "ORD12343",
            "user_id": 1,
            "date": "2025-04-10T13:15:00.000Z",
            "total": 280.00,
            "status": "Completed",
            "canteen_name": "South Campus Cafeteria",
            "vendor_name": "Sandwich King",
            "items": [
                {
                    "id": "item1",
                    "name": "Grilled Chicken Club Sandwich",
                    "price": 150.00,
                    "quantity": 1,
                    "customizations": ["No Onions", "Extra Cheese"],
                    "vendor_name": "Sandwich King",
                },
                {
                    "id": "item2",
                    "name": "French Fries",
                    "price": 80.00,
                    "quantity": 1,
                    "customizations": ["Extra Salt"],
                    "vendor_name": "Sandwich King",
                },
                {
                    "id": "item3",
                    "name": "Chocolate Shake",
                    "price": 50.00,
                    "quantity": 1,
                    "customizations": [],
                    "vendor_name": "Sandwich King",
                },
            ]
        },
        {
            "id": "ORD12340",
            "user_id": 1,
            "date": "2025-04-05T19:30:00.000Z",
            "total": 520.00,
            "status": "Cancelled",
            "canteen_name": "North Block Canteen",
            "vendor_name": "Chinese Corner",
            "items": [
                {
                    "id": "item1",
                    "name": "Hakka Noodles",
                    "price": 160.00,
                    "quantity": 1,
                    "customizations": ["Extra Veggies"],
                    "vendor_name": "Chinese Corner",
                },
                {
                    "id": "item2",
                    "name": "Chilli Paneer",
                    "price": 180.00,
                    "quantity": 1,
                    "customizations": ["Dry", "Extra Spicy"],
                    "vendor_name": "Chinese Corner",
                },
                {
                    "id": "item3",
                    "name": "Veg Spring Rolls",
                    "price": 120.00,
                    "quantity": 1,
                    "customizations": [],
                    "vendor_name": "Chinese Corner",
                },
                {
                    "id": "item4",
                    "name": "Fried Rice",
                    "price": 60.00,
                    "quantity": 1,
                    "customizations": ["No Eggs"],
                    "vendor_name": "Chinese Corner",
                },
            ]
        }
    ]

    return active_orders + order_history

# Resolver for getting active orders for a user
def resolve_get_active_orders(userId: int) -> List[OrderType]:
    all_orders = _get_mock_orders()
    active_orders = [
        order for order in all_orders 
        if order["user_id"] == userId and order["status"] not in ["Completed", "Cancelled"]
    ]
    
    return [
        OrderType(
            id=order["id"],
            date=order["date"],
            total=order["total"],
            status=order["status"],
            canteen_name=order["canteen_name"],
            vendor_name=order["vendor_name"],
            estimated_delivery_time=order.get("estimated_delivery_time"),
            current_status=order.get("current_status"),
            steps=[
                OrderStepType(
                    status=step["status"],
                    description=step["description"],
                    time=step["time"],
                    completed=step["completed"],
                    current=step["current"]
                ) for step in order.get("steps", [])
            ],
            items=[
                OrderItemType(
                    id=item["id"],
                    name=item["name"],
                    price=item["price"],
                    quantity=item["quantity"],
                    customizations=item["customizations"],
                    vendor_name=item["vendor_name"]
                ) for item in order["items"]
            ]
        )
        for order in active_orders
    ]

# Resolver for getting order history for a user
def resolve_get_order_history(userId: int, limit: Optional[int] = None, offset: Optional[int] = 0) -> List[OrderType]:
    all_orders = _get_mock_orders()
    order_history = [
        order for order in all_orders 
        if order["user_id"] == userId and order["status"] in ["Completed", "Cancelled"]
    ]
    
    # Apply pagination if limit is provided
    if limit is not None:
        order_history = order_history[offset:offset+limit]
    
    return [
        OrderType(
            id=order["id"],
            date=order["date"],
            total=order["total"],
            status=order["status"],
            canteen_name=order["canteen_name"],
            vendor_name=order["vendor_name"],
            estimated_delivery_time=order.get("estimated_delivery_time"),
            current_status=order.get("current_status"),
            steps=[
                OrderStepType(
                    status=step["status"],
                    description=step["description"],
                    time=step["time"],
                    completed=step["completed"],
                    current=step["current"]
                ) for step in order.get("steps", [])
            ],
            items=[
                OrderItemType(
                    id=item["id"],
                    name=item["name"],
                    price=item["price"],
                    quantity=item["quantity"],
                    customizations=item["customizations"],
                    vendor_name=item["vendor_name"]
                ) for item in order["items"]
            ]
        )
        for order in order_history
    ]

# Resolver for getting a specific order by ID
def resolve_get_order_by_id(orderId: str) -> Optional[OrderType]:
    all_orders = _get_mock_orders()
    
    for order in all_orders:
        if order["id"] == orderId:
            return OrderType(
                id=order["id"],
                date=order["date"],
                total=order["total"],
                status=order["status"],
                canteen_name=order["canteen_name"],
                vendor_name=order["vendor_name"],
                estimated_delivery_time=order.get("estimated_delivery_time"),
                current_status=order.get("current_status"),
                steps=[
                    OrderStepType(
                        status=step["status"],
                        description=step["description"],
                        time=step["time"],
                        completed=step["completed"],
                        current=step["current"]
                    ) for step in order.get("steps", [])
                ],
                items=[
                    OrderItemType(
                        id=item["id"],
                        name=item["name"],
                        price=item["price"],
                        quantity=item["quantity"],
                        customizations=item["customizations"],
                        vendor_name=item["vendor_name"]
                    ) for item in order["items"]
                ]
            )
    
    return None

# Create properly decorated fields with resolvers and matching frontend field names
getActiveOrders = strawberry.field(name="getActiveOrders", resolver=resolve_get_active_orders)
getOrderHistory = strawberry.field(name="getOrderHistory", resolver=resolve_get_order_history)
getOrderById = strawberry.field(name="getOrderById", resolver=resolve_get_order_by_id)

queries = [
    getActiveOrders,
    getOrderHistory,
    getOrderById
]