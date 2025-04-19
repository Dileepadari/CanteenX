import strawberry
from typing import List, Optional
from app.models.canteen import Canteen
from app.core.database import get_db

@strawberry.type
class ScheduleType:
    breakfast: Optional[str] = None
    lunch: Optional[str] = None
    dinner: Optional[str] = None
    regular: Optional[str] = None
    evening: Optional[str] = None
    night: Optional[str] = None
    weekday: Optional[str] = None
    weekend: Optional[str] = None

@strawberry.type
class CanteenType:
    id: int
    name: str
    image: Optional[str]
    location: str
    rating: float
    openTime: str
    closeTime: str
    isOpen: bool
    description: Optional[str]
    phone: str
    email: Optional[str]
    schedule: Optional[ScheduleType]
    tags: Optional[List[str]]
    userId: Optional[int]

@strawberry.type
class CanteenQuery:
    @strawberry.field
    def get_all_canteens(self) -> List[CanteenType]:
        """Get all canteens"""
        db = next(get_db())
        canteens = db.query(Canteen).all()
        return [CanteenType(
            id=canteen.id,
            name=canteen.name,
            image=canteen.image,
            location=canteen.location,
            rating=canteen.rating,
            openTime=canteen.openTime,
            closeTime=canteen.closeTime,
            isOpen=canteen.isOpen,
            description=canteen.description,
            phone=canteen.phone,
            email=canteen.email,
            schedule=ScheduleType(**canteen.schedule) if canteen.schedule else None,
            tags=canteen.tags,
            userId=canteen.userId
        ) for canteen in canteens]

    @strawberry.field
    def get_canteen_by_id(self, id: int) -> Optional[CanteenType]:
        """Get a specific canteen by ID"""
        db = next(get_db())
        canteen = db.query(Canteen).filter(Canteen.id == id).first()
        return CanteenType(
            id=canteen.id,
            name=canteen.name,
            image=canteen.image,
            location=canteen.location,
            rating=canteen.rating,
            openTime=canteen.openTime,
            closeTime=canteen.closeTime,
            isOpen=canteen.isOpen,
            description=canteen.description,
            phone=canteen.phone,
            email=canteen.email,
            schedule=ScheduleType(**canteen.schedule) if canteen.schedule else None,
            tags=canteen.tags,
            userId=canteen.userId
        ) if canteen else None

    @strawberry.field
    def get_open_canteens(self) -> List[CanteenType]:
        """Get all currently open canteens"""
        db = next(get_db())
        canteens = db.query(Canteen).filter(Canteen.isOpen == True).all()
        return [CanteenType(
            id=canteen.id,
            name=canteen.name,
            image=canteen.image,
            location=canteen.location,
            rating=canteen.rating,
            openTime=canteen.openTime,
            closeTime=canteen.closeTime,
            isOpen=canteen.isOpen,
            description=canteen.description,
            phone=canteen.phone,
            email=canteen.email,
            schedule=ScheduleType(**canteen.schedule) if canteen.schedule else None,
            tags=canteen.tags,
            userId=canteen.userId
        ) for canteen in canteens]


queries = [
    strawberry.field(name="getAllCanteens", resolver=CanteenQuery.get_all_canteens),
    strawberry.field(name="getCanteenById", resolver=CanteenQuery.get_canteen_by_id),
    strawberry.field(name="getOpenCanteens", resolver=CanteenQuery.get_open_canteens),]
