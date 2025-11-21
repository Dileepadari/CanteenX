import strawberry
from typing import List, Optional
from strawberry.types import Info
from sqlalchemy.orm import Session
from fastapi import Depends

from app.models.canteen import Canteen, CanteenType, ScheduleType
from app.core.database import get_db

def convert_canteen_model_to_type(canteen: Canteen) -> CanteenType:
    """Converts a Canteen SQLAlchemy model to a CanteenType."""
    return CanteenType(
        id=canteen.id,
        name=canteen.name,
        email=canteen.email,
        image=canteen.image,
        location=canteen.location,
        rating=canteen.rating,
        # Map SQLAlchemy snake_case fields to the GraphQL camelCase fields
        openTime=(canteen.open_time.strftime("%H:%M") if getattr(canteen, "open_time", None) is not None else None),
        closeTime=(canteen.close_time.strftime("%H:%M") if getattr(canteen, "close_time", None) is not None else None),
        isOpen=bool(getattr(canteen, "is_open", False)),
        description=canteen.description,
        phone=canteen.phone,
        userId=canteen.user_id,
        # schedule=canteen.schedule, # Uncomment if you add this back to your type
        tags=canteen.tags
    )

@strawberry.type
class CanteenQueries:
    @strawberry.field
    def get_all_canteens(self, info: Info) -> List[CanteenType]:
        """Get all canteens"""
        db: Session = info.context["db"]
        canteens = db.query(Canteen).all()
        return [convert_canteen_model_to_type(canteen) for canteen in canteens]

    @strawberry.field
    def get_canteen_by_id(self, id: int, info: Info) -> Optional[CanteenType]:
        """Get a specific canteen by ID"""
        db: Session = info.context["db"]
        canteen = db.query(Canteen).filter(Canteen.id == id).first()
        if not canteen:
            return None
        return convert_canteen_model_to_type(canteen)

    @strawberry.field
    def get_open_canteens(self, info: Info) -> List[CanteenType]:
        """Get all currently open canteens"""
        db: Session = info.context["db"]
        # Avoid referencing GraphQL-facing properties on the model class.
        # Use the actual DB column `is_open` when available, otherwise
        # fall back to checking for a class attribute named `isOpen`.
        if hasattr(Canteen, "is_open"):
            canteens = db.query(Canteen).filter(getattr(Canteen, "is_open") == True).all()
        elif hasattr(Canteen, "isOpen"):
            canteens = db.query(Canteen).filter(getattr(Canteen, "isOpen") == True).all()
        else:
            # As a last resort, return all canteens and let the converter
            # mark them open/closed based on instance attributes.
            canteens = db.query(Canteen).all()

        return [convert_canteen_model_to_type(canteen) for canteen in canteens]

    @strawberry.field
    def search_canteens(self, query: str, info: Info) -> List[CanteenType]:
        """Search canteens by name or location"""
        db: Session = info.context["db"]
        canteens = db.query(Canteen).filter(
            (Canteen.name.ilike(f"%{query}%")) |
            (Canteen.location.ilike(f"%{query}%"))
        ).all()
        return [convert_canteen_model_to_type(canteen) for canteen in canteens]