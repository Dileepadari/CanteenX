from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime, time

class CanteenHours(BaseModel):
    opens_at: time
    closes_at: time
    is_closed: bool = False

class DailyHours(BaseModel):
    monday: CanteenHours
    tuesday: CanteenHours
    wednesday: CanteenHours
    thursday: CanteenHours
    friday: CanteenHours
    saturday: CanteenHours
    sunday: CanteenHours

class Canteen(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    location: str
    contact_email: str
    contact_phone: Optional[str] = None
    owner_id: int  # User ID of the canteen owner/admin
    hours: DailyHours
    is_active: bool = True
    average_preparation_time: int = 15  # Default average preparation time in minutes
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now) 