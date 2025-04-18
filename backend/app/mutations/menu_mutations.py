import strawberry
from typing import Optional, List
import json
from app.models.menu_item import MenuItem
from app.models.canteen import Canteen
from app.core.database import get_db

@strawberry.type
class MenuItemMutationResponse:
    success: bool
    message: str
    itemId: Optional[int] = None

@strawberry.input
class SizeOptionInput:
    name: str
    price: float

@strawberry.input
class AdditionOptionInput:
    name: str
    price: float

@strawberry.input
class CustomizationOptionsInput:
    sizes: Optional[List[SizeOptionInput]] = None
    additions: Optional[List[AdditionOptionInput]] = None
    removals: Optional[List[str]] = None

@strawberry.type
class MenuMutation:
    @strawberry.mutation
    def create_menu_item(
        self,
        name: str,
        price: float,
        canteenId: int,
        canteenName: str,
        currentUserId: int,
        description: Optional[str] = None,
        image: Optional[str] = None,
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
        isPopular: bool = False,
        preparationTime: int = 15,
        customizationOptions: Optional[CustomizationOptionsInput] = None,
    ) -> MenuItemMutationResponse:
        """Create a new menu item"""
        db = next(get_db())
        
        # Verify canteen exists
        canteen = db.query(Canteen).filter(Canteen.id == canteenId).first()
        if not canteen:
            return MenuItemMutationResponse(
                success=False, 
                message="Canteen not found"
            )
        
        # Check if current user is the owner of this canteen
        if canteen.userId != currentUserId:
            return MenuItemMutationResponse(
                success=False,
                message="Unauthorized: You don't have permission to add items to this canteen"
            )
        
        try:
            # Convert CustomizationOptionsInput to dictionary for database storage
            customization_dict = None
            if customizationOptions:
                customization_dict = {
                    "sizes": [{"name": size.name, "price": size.price} for size in customizationOptions.sizes] if customizationOptions.sizes else None,
                    "additions": [{"name": addition.name, "price": addition.price} for addition in customizationOptions.additions] if customizationOptions.additions else None,
                    "removals": customizationOptions.removals
                }
            
            new_item = MenuItem(
                name=name,
                price=price,
                canteenId=canteenId,
                canteenName=canteenName,
                description=description,
                image=image,
                category=category,
                tags=tags,
                isPopular=isPopular,
                preparationTime=preparationTime,
                customizationOptions=customization_dict,
                isAvailable=True,
                rating=0.0,
                ratingCount=0
            )
            db.add(new_item)
            db.commit()
            return MenuItemMutationResponse(
                success=True, 
                message=f"Menu item '{name}' created successfully",
                itemId=new_item.id
            )
        except Exception as e:
            db.rollback()
            return MenuItemMutationResponse(
                success=False, 
                message=f"Failed to create menu item: {str(e)}"
            )

    @strawberry.mutation
    def update_menu_item(
        self,
        itemId: int,
        currentUserId: int,
        name: Optional[str] = None,
        price: Optional[float] = None,
        description: Optional[str] = None,
        image: Optional[str] = None,
        category: Optional[str] = None,
        isAvailable: Optional[bool] = None,
        isPopular: Optional[bool] = None,
        preparationTime: Optional[int] = None,
        customizationOptions: Optional[CustomizationOptionsInput] = None,
    ) -> MenuItemMutationResponse:
        """Update a menu item"""
        db = next(get_db())
        
        # Find and verify item
        item = db.query(MenuItem).filter(MenuItem.id == itemId).first()
        if not item:
            return MenuItemMutationResponse(success=False, message="Menu item not found")
            
        canteen = db.query(Canteen).filter(Canteen.id == item.canteenId).first()
        if not canteen:
            return MenuItemMutationResponse(
                success=False, 
                message="Canteen not found"
            )
            
        # Check if current user is the owner of this canteen
        if canteen.userId != currentUserId:
            return MenuItemMutationResponse(
                success=False,
                message="Unauthorized: You don't have permission to update items in this canteen"
            )
        
        try:
            # Update only provided fields
            if name is not None: item.name = name
            if price is not None: item.price = price
            if description is not None: item.description = description
            if image is not None: item.image = image
            if category is not None: item.category = category
            if isAvailable is not None: item.isAvailable = isAvailable
            if isPopular is not None: item.isPopular = isPopular
            if preparationTime is not None: item.preparationTime = preparationTime
            
            # Convert CustomizationOptionsInput to dictionary for database storage
            if customizationOptions is not None:
                customization_dict = {
                    "sizes": [{"name": size.name, "price": size.price} for size in customizationOptions.sizes] if customizationOptions.sizes else None,
                    "additions": [{"name": addition.name, "price": addition.price} for addition in customizationOptions.additions] if customizationOptions.additions else None,
                    "removals": customizationOptions.removals
                }
                item.customizationOptions = customization_dict
            
            db.commit()
            return MenuItemMutationResponse(
                success=True,
                message="Menu item updated successfully",
                itemId=item.id
            )
        except Exception as e:
            db.rollback()
            return MenuItemMutationResponse(success=False, message=f"Failed to update menu item: {str(e)}")

    @strawberry.mutation
    def delete_menu_item(
        self,
        itemId: int,
        currentUserId: int
    ) -> MenuItemMutationResponse:
        """Delete a menu item"""
        db = next(get_db())
        
        item = db.query(MenuItem).filter(MenuItem.id == itemId).first()
        if not item:
            return MenuItemMutationResponse(success=False, message="Menu item not found")
            
        canteen = db.query(Canteen).filter(Canteen.id == item.canteenId).first()
        if not canteen:
            return MenuItemMutationResponse(
                success=False, 
                message="Canteen not found"
            )
            
        # Check if current user is the owner of this canteen
        if canteen.userId != currentUserId:
            return MenuItemMutationResponse(
                success=False,
                message="Unauthorized: You don't have permission to delete items from this canteen"
            )
        
        try:
            db.delete(item)
            db.commit()
            return MenuItemMutationResponse(success=True, message=f"Menu item deleted successfully")
        except Exception as e:
            db.rollback()
            return MenuItemMutationResponse(success=False, message=f"Failed to delete menu item: {str(e)}")

# Export the mutation fields
mutations = [
    strawberry.field(name="createMenuItem", resolver=MenuMutation.create_menu_item),
    strawberry.field(name="updateMenuItem", resolver=MenuMutation.update_menu_item),
    strawberry.field(name="deleteMenuItem", resolver=MenuMutation.delete_menu_item),
]