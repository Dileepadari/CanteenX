import strawberry
from typing import List
from app.models.canteen import Canteen
from app.core.database import get_db

@strawberry.type
class CanteenType:
    id: int
    name: str
    location: str = None
    opening_time: str = None
    closing_time: str = None

def resolve_get_canteens() -> List[CanteenType]:
    # Get database session
    db = next(get_db())
    
    # Query all canteens from the database
    canteens = db.query(Canteen).all()
    
    # Convert to CanteenType
    return [
        CanteenType(
            id=c.id, 
            name=c.name, 
            location=c.location, 
            opening_time=c.opening_time, 
            closing_time=c.closing_time
        ) for c in canteens
    ]

# Create properly decorated field with resolver and matching frontend field name
getCanteens = strawberry.field(name="getCanteens", resolver=resolve_get_canteens)

queries = [
    getCanteens
]
