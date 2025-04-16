from typing import Optional, List, Dict
from pydantic import BaseModel
from datetime import datetime, date

class OrderVolumeStats(BaseModel):
    date: date
    order_count: int

class RevenueStats(BaseModel):
    date: date
    revenue: float

class MenuItemStats(BaseModel):
    menu_item_id: int
    menu_item_name: str
    quantity_sold: int
    revenue: float

class TimeOfDayStats(BaseModel):
    hour: int  # 0-23
    order_count: int

class CanteenStats(BaseModel):
    """Statistics for canteen dashboard"""
    canteen_id: int
    total_orders: int
    total_revenue: float
    average_order_value: float
    pending_orders: int
    completed_orders: int
    cancelled_orders: int
    
    # Statistics for daily order volume over time
    order_volume_by_day: List[OrderVolumeStats]
    
    # Statistics for daily revenue over time
    revenue_by_day: List[RevenueStats]
    
    # Statistics for best selling items
    best_selling_items: List[MenuItemStats]
    
    # Statistics for order times
    order_by_time_of_day: List[TimeOfDayStats]
    
    # Current day stats
    today_orders: int
    today_revenue: float
    
    # Average preparation time in minutes
    average_preparation_time: float 