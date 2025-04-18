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
    image_url: Optional[str] = None
    category: Optional[str] = None
    canteen_id: int
    is_available: bool
    is_vegetarian: bool
    is_featured: bool

# Resolver for getting all menu items
def resolve_get_menu_items() -> List[MenuItemType]:
    # Get database session
    db = next(get_db())
    
    # Query the database for menu items
    db_menu_items = db.query(MenuItem).all()
    
    # Convert to MenuItemType - handling boolean conversion
    return [
        MenuItemType(
            id=item.id, 
            name=item.name, 
            description=item.description, 
            price=item.price, 
            image_url=item.image_url, 
            category=item.category,
            canteen_id=item.canteen_id,
            is_available=bool(item.is_available),
            is_vegetarian=bool(item.is_vegetarian),
            is_featured=bool(item.is_featured)
        ) 
        for item in db_menu_items
    ]

# Resolver for getting featured menu items
def resolve_get_featured_menu_items() -> List[MenuItemType]:
    # Get database session
    db = next(get_db())
    
    # Query the database for featured menu items
    featured_items = db.query(MenuItem).filter(MenuItem.is_featured == 1).all()
    
    # Convert to MenuItemType with boolean conversion
    return [
        MenuItemType(
            id=item.id, 
            name=item.name, 
            description=item.description, 
            price=item.price, 
            image_url=item.image_url, 
            category=item.category,
            canteen_id=item.canteen_id,
            is_available=bool(item.is_available),
            is_vegetarian=bool(item.is_vegetarian),
            is_featured=bool(item.is_featured)
        ) 
        for item in featured_items
    ]

# Resolver for getting menu items by canteen ID
def resolve_get_menu_items_by_canteen(canteen_id: int) -> List[MenuItemType]:
    # Get database session
    db = next(get_db())
    
    # Query the database for menu items filtered by canteen_id
    canteen_items = db.query(MenuItem).filter(MenuItem.canteen_id == canteen_id).all()
    
    # Convert to MenuItemType with boolean conversion
    return [
        MenuItemType(
            id=item.id, 
            name=item.name, 
            description=item.description, 
            price=item.price, 
            image_url=item.image_url, 
            category=item.category,
            canteen_id=item.canteen_id,
            is_available=bool(item.is_available),
            is_vegetarian=bool(item.is_vegetarian),
            is_featured=bool(item.is_featured)
        ) 
        for item in canteen_items
    ]

# Create properly decorated fields with resolvers and matching frontend field names
getMenuItems = strawberry.field(name="getMenuItems", resolver=resolve_get_menu_items)
getFeaturedMenuItems = strawberry.field(name="getFeaturedMenuItems", resolver=resolve_get_featured_menu_items)
getMenuItemsByCanteen = strawberry.field(name="getMenuItemsByCanteen", resolver=resolve_get_menu_items_by_canteen)

queries = [
    getMenuItems,
    getFeaturedMenuItems,
    getMenuItemsByCanteen
]