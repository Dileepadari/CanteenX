import strawberry
from typing import List, Optional
from app.models.menu_item import MenuItem
from app.core.database import get_db

@strawberry.type
class MenuItemType:
    id: int
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    category: Optional[str] = None
    canteenId: int
    canteenName : Optional[str] = None
    tags: Optional[List[str]] = None
    rating: float = 0.0
    ratingCount: int = 0
    isAvailable: bool = True
    isVegetarian: bool = False
    isFeatured: bool = False
    isPopular: bool = False
    preparationTime: int = 15
    customizationOptions: Optional[str] = None  # JSON string

def map_menu_item_to_type(item: MenuItem) -> MenuItemType:
    return MenuItemType(
        id=item.id,
        canteenId=item.canteenId,
        canteenName=item.canteenName,
        name=item.name,
        description=item.description,
        price=item.price,
        category=item.category,
        image=item.image,
        tags=item.tags,
        rating=item.rating,
        ratingCount=item.ratingCount,
        isAvailable=item.isAvailable,
        preparationTime=item.preparationTime,
        isPopular=item.isPopular,
        customizationOptions=item.customizationOptions
    )


@strawberry.type
class MenuQuery:
    @strawberry.field
    def get_menu_items(self) -> List[MenuItemType]:
        """Get all menu items"""
        db = next(get_db())
        items = db.query(MenuItem).all()
        return [map_menu_item_to_type(item) for item in items]

    @strawberry.field
    def get_menu_items_by_canteen(self, canteenId: int) -> List[MenuItemType]:
        """Get menu items by canteen ID"""
        db = next(get_db())
        items = db.query(MenuItem).filter(MenuItem.canteenId == canteenId).all()
        return [map_menu_item_to_type(item) for item in items]

    # @strawberry.field
    # def get_featured_menu_items(self) -> List[MenuItemType]:
    #     """Get featured menu items"""
    #     db = next(get_db())
    #     items = db.query(MenuItem).filter(MenuItem.is_featured == True).all()
    #     return [map_menu_item_to_type(item) for item in items]

    # @strawberry.field
    # def get_popular_menu_items(self) -> List[MenuItemType]:
    #     """Get popular menu items"""
    #     db = next(get_db())
    #     items = db.query(MenuItem).filter(MenuItem.is_popular == True).all()
    #     return [map_menu_item_to_type(item) for item in items]

    @strawberry.field
    def search_menu_items(self, query: str) -> List[MenuItemType]:
        """Search menu items by name or description"""
        db = next(get_db())
        items = db.query(MenuItem).filter(
            (MenuItem.name.ilike(f"%{query}%")) | 
            (MenuItem.description.ilike(f"%{query}%"))
        ).all()
        return [map_menu_item_to_type(item) for item in items]

queries = [
    strawberry.field(name="getMenuItems", resolver=MenuQuery.get_menu_items),
    strawberry.field(name="getMenuItemsByCanteen", resolver=MenuQuery.get_menu_items_by_canteen),
    # strawberry.field(name="getFeaturedMenuItems", resolver=MenuQuery.get_featured_menu_items),
    # strawberry.field(name="getPopularMenuItems", resolver=MenuQuery.get_popular_menu_items),
    strawberry.field(name="searchMenuItems", resolver=MenuQuery.search_menu_items),
]