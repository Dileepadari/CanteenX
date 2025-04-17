import strawberry
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.menu_item import MenuItem
from app.models.canteen import Canteen

@strawberry.type
class MenuItemMutationResponse:
    success: bool
    message: str

@strawberry.type
class Mutation:
    @strawberry.mutation
    def update_menu_item_price(self, item_id: int, price: float, user_email: str) -> MenuItemMutationResponse:
        """Update the price of a menu item if the user has permission"""
        db = next(get_db())
        
        # Find the menu item
        menu_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
        if not menu_item:
            return MenuItemMutationResponse(success=False, message="Menu item not found")
            
        # Get the canteen associated with the item
        canteen = db.query(Canteen).filter(Canteen.id == menu_item.canteen_id).first()
        if not canteen:
            return MenuItemMutationResponse(success=False, message="Canteen not found")
            
        # Check if user has permission (email matches canteen email)
        if canteen.email != user_email:
            return MenuItemMutationResponse(success=False, message="Unauthorized: You don't have permission to update this item")
            
        # Update the price
        menu_item.price = price
        db.commit()
        
        return MenuItemMutationResponse(success=True, message="Price updated successfully")

    @strawberry.mutation
    def update_menu_item_availability(self, item_id: int, is_available: bool, user_email: str) -> MenuItemMutationResponse:
        """Update the availability of a menu item if the user has permission"""
        db = next(get_db())
        
        # Find the menu item
        menu_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
        if not menu_item:
            return MenuItemMutationResponse(success=False, message="Menu item not found")
            
        # Get the canteen associated with the item
        canteen = db.query(Canteen).filter(Canteen.id == menu_item.canteen_id).first()
        if not canteen:
            return MenuItemMutationResponse(success=False, message="Canteen not found")
            
        # Check if user has permission (email matches canteen email)
        if canteen.email != user_email:
            return MenuItemMutationResponse(success=False, message="Unauthorized: You don't have permission to update this item")
            
        # Update the availability
        menu_item.is_available = 1 if is_available else 0
        db.commit()
        
        return MenuItemMutationResponse(success=True, message="Availability updated successfully")

    @strawberry.mutation
    def update_menu_item_details(
        self, 
        item_id: int, 
        user_email: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        category: Optional[str] = None,
        is_vegetarian: Optional[bool] = None,
        is_featured: Optional[bool] = None,
        preparation_time: Optional[int] = None,
        spice_level: Optional[int] = None
    ) -> MenuItemMutationResponse:
        """Update various details of a menu item if the user has permission"""
        db = next(get_db())
        
        # Find the menu item
        menu_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
        if not menu_item:
            return MenuItemMutationResponse(success=False, message="Menu item not found")
            
        # Get the canteen associated with the item
        canteen = db.query(Canteen).filter(Canteen.id == menu_item.canteen_id).first()
        if not canteen:
            return MenuItemMutationResponse(success=False, message="Canteen not found")
            
        # Check if user has permission (email matches canteen email)
        if canteen.email != user_email:
            return MenuItemMutationResponse(success=False, message="Unauthorized: You don't have permission to update this item")
            
        # Update the fields if provided
        if name is not None:
            menu_item.name = name
        if description is not None:
            menu_item.description = description
        if category is not None:
            menu_item.category = category
        if is_vegetarian is not None:
            menu_item.is_vegetarian = 1 if is_vegetarian else 0
        if is_featured is not None:
            menu_item.is_featured = 1 if is_featured else 0
        if preparation_time is not None:
            menu_item.preparation_time = preparation_time
        if spice_level is not None:
            menu_item.spice_level = spice_level
            
        db.commit()
        
        return MenuItemMutationResponse(success=True, message="Menu item details updated successfully")

mutations = [
    strawberry.field(name="updateMenuItemPrice", resolver=Mutation.update_menu_item_price),
    strawberry.field(name="updateMenuItemAvailability", resolver=Mutation.update_menu_item_availability),
    strawberry.field(name="updateMenuItemDetails", resolver=Mutation.update_menu_item_details)
]