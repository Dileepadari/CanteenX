from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime, date
from enum import Enum

class DiscountType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"

class Promotion(BaseModel):
    id: Optional[int] = None
    canteen_id: int
    name: str
    description: str
    discount_type: DiscountType
    discount_value: float  # Either percentage or fixed amount
    start_date: date
    end_date: date
    is_active: bool = True
    min_order_value: Optional[float] = None
    applicable_menu_items: Optional[List[int]] = None  # List of menu item IDs this promotion applies to
    max_uses: Optional[int] = None  # Maximum number of times this promotion can be used
    current_uses: int = 0
    promo_code: Optional[str] = None  # Optional code that users need to enter
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    def is_valid(self, order_value: float, menu_item_ids: List[int]) -> bool:
        """
        Check if the promotion is valid for the given order
        """
        today = date.today()
        
        # Check if promotion is active and within valid date range
        if not self.is_active or today < self.start_date or today > self.end_date:
            return False
            
        # Check if max uses is reached
        if self.max_uses is not None and self.current_uses >= self.max_uses:
            return False
            
        # Check minimum order value
        if self.min_order_value is not None and order_value < self.min_order_value:
            return False
            
        # Check if promotion applies to specific menu items
        if self.applicable_menu_items is not None:
            # Check if any of the order items are in the applicable items list
            if not any(item_id in self.applicable_menu_items for item_id in menu_item_ids):
                return False
                
        return True
        
    def calculate_discount(self, order_value: float) -> float:
        """
        Calculate the discount amount based on the order value
        """
        if self.discount_type == DiscountType.PERCENTAGE:
            return order_value * (self.discount_value / 100)
        else:  # FIXED discount
            return min(self.discount_value, order_value)  # Don't exceed order value 