from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class MenuItem(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = None
    is_available: bool = True
    is_vegetarian: bool = False
    is_vegan: bool = False
    is_gluten_free: bool = False
    preparation_time: int  # In minutes
    canteen_id: int
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now) 