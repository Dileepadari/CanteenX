from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class OrderItem(BaseModel):
    id: Optional[int] = None
    menu_item_id: int
    quantity: int
    price: float
    notes: Optional[str] = None

class Order(BaseModel):
    id: Optional[int] = None
    user_id: int
    canteen_id: int
    status: OrderStatus = OrderStatus.PENDING
    items: List[OrderItem]
    total_amount: float
    payment_status: bool = False
    payment_method: Optional[str] = None
    payment_id: Optional[str] = None
    preparation_time: Optional[int] = None  # Estimated time in minutes
    notes: Optional[str] = None
    is_bulk_order: bool = False
    pickup_time: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Used for tracking orders in dashboard
    def calculate_waiting_time(self) -> int:
        """Calculate the waiting time in minutes since order creation"""
        if self.status == OrderStatus.COMPLETED or self.status == OrderStatus.CANCELLED:
            return 0
        
        time_diff = datetime.now() - self.created_at
        return int(time_diff.total_seconds() / 60) 