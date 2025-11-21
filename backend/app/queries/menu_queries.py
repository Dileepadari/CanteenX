import strawberry
from typing import List
from strawberry.types import Info
from sqlalchemy.orm import Session

from app.models.menu_item import (
    MenuItem,
    MenuItemType,
    CustomizationOptionsType,
    SizeOption,
    AdditionOption,
)
from app.core.database import get_db

def _convert_menu_item_to_type(item: MenuItem) -> "MenuItemType":
    """
    Safely converts a MenuItem SQLAlchemy model to a MenuItemType,
    handling potentially null or incomplete customization options.
    """
    customization_options_type = None
    if item.customizationOptions and isinstance(item.customizationOptions, dict):
        # Use .get() to safely access keys without modifying the original dict
        custom_data = item.customizationOptions
        customization_options_type = CustomizationOptionsType(
            sizes=[SizeOption(**size) for size in custom_data.get("sizes", [])],
            additions=[AdditionOption(**addition) for addition in custom_data.get("additions", [])],
            removals=custom_data.get("removals", []),
        )

    return MenuItemType(
        id=item.id,
        canteenId=item.canteenId,
        canteenName=item.canteenName,
        name=item.name,
        description=item.description,
        price=item.price,
        category=item.category,
        image=item.image,
        # Ensure tags is always a list (frontend expects an array and may call .slice)
        tags=item.tags or [],
        rating=item.rating,
        ratingCount=item.ratingCount,
        isAvailable=item.isAvailable,
        # Provide a default value for preparationTime if it's None
        preparationTime=item.preparationTime if item.preparationTime is not None else 15,
        isPopular=item.isPopular,
        customizationOptions=customization_options_type,
        # Map the SQLAlchemy snake_case column to the camelCase GraphQL field
        stockCount=item.stockCount,
    )

@strawberry.type
class MenuQueries:
    @strawberry.field
    def get_menu_items(self, info: Info) -> List["MenuItemType"]:
        """Get all menu items."""
        db: Session = info.context["db"]
        items = db.query(MenuItem).all()
        return [_convert_menu_item_to_type(item) for item in items]

    @strawberry.field
    def get_menu_items_by_canteen(self, canteen_id: int, info: Info) -> List["MenuItemType"]:
        """Get menu items by canteen ID."""
        db: Session = info.context["db"]
        # use the actual column name (snake_case) for filtering
        items = db.query(MenuItem).filter(MenuItem.canteen_id == canteen_id).all()
        return [_convert_menu_item_to_type(item) for item in items]

    @strawberry.field
    def get_featured_menu_items(self, info: Info) -> List["MenuItemType"]:
        """Get featured menu items."""
        db: Session = info.context["db"]

        items = db.query(MenuItem).filter(MenuItem.is_featured == True).all()

        return [_convert_menu_item_to_type(item) for item in items]

    @strawberry.field
    def get_popular_menu_items(self, info: Info) -> List["MenuItemType"]:
        """Get popular menu items."""
        db: Session = info.context["db"]
        items = db.query(MenuItem).filter(MenuItem.is_popular == True).all()
        return [_convert_menu_item_to_type(item) for item in items]

    @strawberry.field
    def search_menu_items(self, query: str, info: Info) -> List["MenuItemType"]:
        """Search menu items by name or description."""
        db: Session = info.context["db"]
        search_filter = f"%{query}%"
        items = db.query(MenuItem).filter(
            (MenuItem.name.ilike(search_filter)) |
            (MenuItem.description.ilike(search_filter))
        ).all()
        return [_convert_menu_item_to_type(item) for item in items]