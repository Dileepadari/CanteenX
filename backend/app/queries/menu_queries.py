import strawberry
from typing import List, Optional
from app.models.menu_item import MenuItem

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

# Function to create mock menu items (helper function, not a resolver)
def _get_mock_menu_items():
    # Mock data for menu items
    menu_items = [
        MenuItem(
            id=1, 
            name="Veggie Burger", 
            description="Delicious vegetarian burger with fresh vegetables", 
            price=5.99, 
            image_url="/assets/menu/veggie-burger.jpg", 
            category="Burgers",
            canteen_id=1,
            is_available=1,
            is_vegetarian=1,
            is_featured=1
        ),
        MenuItem(
            id=2, 
            name="Chicken Wrap", 
            description="Grilled chicken with fresh vegetables in a wrap", 
            price=6.99, 
            image_url="/assets/menu/chicken-wrap.jpg", 
            category="Wraps",
            canteen_id=1,
            is_available=1,
            is_vegetarian=0,
            is_featured=1
        ),
        MenuItem(
            id=3, 
            name="Caesar Salad", 
            description="Fresh romaine lettuce with Caesar dressing", 
            price=4.99, 
            image_url="/assets/menu/caesar-salad.jpg", 
            category="Salads",
            canteen_id=2,
            is_available=1,
            is_vegetarian=0,
            is_featured=0
        ),
        MenuItem(
            id=4, 
            name="Margherita Pizza", 
            description="Classic pizza with tomato, mozzarella, and basil", 
            price=8.99, 
            image_url="/assets/menu/margherita-pizza.jpg", 
            category="Pizza",
            canteen_id=2,
            is_available=1,
            is_vegetarian=1,
            is_featured=1
        ),
        MenuItem(
            id=5, 
            name="Fries", 
            description="Crispy golden fries with sea salt", 
            price=2.99, 
            image_url="/assets/menu/fries.jpg", 
            category="Sides",
            canteen_id=1,
            is_available=1,
            is_vegetarian=1,
            is_featured=0
        ),
    ]
    return menu_items

# Resolver for getting all menu items
def resolve_get_menu_items() -> List[MenuItemType]:
    menu_items = _get_mock_menu_items()
    
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
        for item in menu_items
    ]

# Resolver for getting featured menu items
def resolve_get_featured_menu_items() -> List[MenuItemType]:
    # Reuse get_menu_items but filter for featured items only
    all_items = resolve_get_menu_items()
    return [item for item in all_items if item.is_featured]

# Resolver for getting menu items by canteen ID
def resolve_get_menu_items_by_canteen(canteen_id: int) -> List[MenuItemType]:
    # Reuse get_menu_items but filter by canteen_id
    all_items = resolve_get_menu_items()
    return [item for item in all_items if item.canteen_id == canteen_id]

# Create properly decorated fields with resolvers and matching frontend field names
getMenuItems = strawberry.field(name="getMenuItems", resolver=resolve_get_menu_items)
getFeaturedMenuItems = strawberry.field(name="getFeaturedMenuItems", resolver=resolve_get_featured_menu_items)
getMenuItemsByCanteen = strawberry.field(name="getMenuItemsByCanteen", resolver=resolve_get_menu_items_by_canteen)

queries = [
    getMenuItems,
    getFeaturedMenuItems,
    getMenuItemsByCanteen
]