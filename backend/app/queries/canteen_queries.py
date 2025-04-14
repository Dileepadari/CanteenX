import strawberry
from typing import List
# from models.canteen import Canteen
# from app.core.database import get_db

from sqlalchemy import Column, Integer, String
from app.models.canteen import Canteen 

@strawberry.type
class CanteenType:
    id: int
    name: str
    location: str = None
    opening_time: str = None
    closing_time: str = None

def resolve_get_canteens() -> List[CanteenType]:
    # db = next(get_db())
    # canteens = db.query(Canteen).all()
    # Simulating database query for demonstration purposes
    canteens = [
        Canteen(id=1, name="Canteen A", location="Location A", opening_time="08:00", closing_time="20:00"),
        Canteen(id=2, name="Canteen B", location="Location B", opening_time="09:00", closing_time="21:00"),
    ]
    # Convert to CanteenType
    return [CanteenType(id=c.id, name=c.name, location=c.location, opening_time=c.opening_time, closing_time=c.closing_time) for c in canteens]

# Create properly decorated field with resolver and matching frontend field name
getCanteens = strawberry.field(name="getCanteens", resolver=resolve_get_canteens)

queries = [
    getCanteens
]
