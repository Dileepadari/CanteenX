import strawberry
from typing import List, Optional
from app.models.canteen import Canteen
from app.core.database import get_db

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
            userId=canteen.userId
        ) for canteen in canteens]

    @strawberry.field
    def get_canteen_by_id(self, id: int) -> Optional[CanteenType]:
        """Get a specific canteen by ID"""
        db = next(get_db())
        canteen = db.query(Canteen).filter(Canteen.id == id).first()
        if not canteen:
            return None
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
            userId=canteen.userId
        )

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
            userId=canteen.userId
        ) for canteen in canteens]

    @strawberry.field
    def search_canteens(self, query: str) -> List[CanteenType]:
        """Search canteens by name or location"""
        db = next(get_db())
        canteens = db.query(Canteen).filter(
            (Canteen.name.ilike(f"%{query}%")) |
            (Canteen.location.ilike(f"%{query}%"))
        ).all()
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
            userId=canteen.userId
        ) for canteen in canteens]

queries = [
    strawberry.field(name="getAllCanteens", resolver=CanteenQuery.get_all_canteens),
    strawberry.field(name="getCanteenById", resolver=CanteenQuery.get_canteen_by_id),
    strawberry.field(name="getOpenCanteens", resolver=CanteenQuery.get_open_canteens),
    strawberry.field(name="searchCanteens", resolver=CanteenQuery.search_canteens),
]
