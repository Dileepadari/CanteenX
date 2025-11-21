    
import strawberry
from typing import Optional, Dict, Any
from strawberry.types import Info
from sqlalchemy.orm import Session

from app.models.menu_item import MenuItem, MenuItemType, CustomizationOptionsInput, CreateMenuItemInput, UpdateMenuItemInput
from app.models.canteen import Canteen
from app.models.user import User

def _get_item_and_verify_owner(db: Session, item_id: int, user: User):
    """
    Fetches a menu item and verifies the user is its canteen's owner.
    Raises GraphQLError if not found or if unauthorized.
    """
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise strawberry.GraphQLError("Menu item not found.")
        
    canteen = db.query(Canteen).filter(Canteen.id == item.canteenId).first()
    if not canteen or canteen.userId != user.id:
        raise strawberry.GraphQLError("Unauthorized: You do not have permission to modify this menu item.")
        
    return item

def _convert_customizations_to_dict(customizations: Optional[CustomizationOptionsInput]) -> Optional[Dict[str, Any]]:
    """Converts the CustomizationOptionsInput to a dictionary for database storage."""
    if not customizations:
        return None
    return {
        "sizes": [{"name": size.name, "price": size.price} for size in customizations.sizes or []],
        "additions": [{"name": addition.name, "price": addition.price} for addition in customizations.additions or []],
        "removals": customizations.removals or []
    }

@strawberry.type
class MenuMutations:
    @strawberry.mutation
    def create_menu_item(self, info: Info, input: CreateMenuItemInput) -> MenuItemType:
        """Creates a new menu item for a canteen owned by the current user."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        if not current_user:
            raise strawberry.GraphQLError("You must be logged in to create a menu item.")

        canteen = db.query(Canteen).filter(Canteen.id == input.canteen_id).first()
        if not canteen:
            raise strawberry.GraphQLError("Canteen not found.")
        if canteen.userId != current_user.id:
            raise strawberry.GraphQLError("Unauthorized: You can only add items to your own canteen.")

        customization_dict = _convert_customizations_to_dict(input.customization_options)
        
        new_item = MenuItem(
            name=input.name,
            price=input.price,
            canteenId=canteen.id,
            canteenName=canteen.name, # Sourced directly from the canteen model
            description=input.description,
            image=input.image,
            category=input.category,
            tags=input.tags,
            isPopular=input.is_popular,
            preparationTime=input.preparation_time,
            customizationOptions=customization_dict,
            isAvailable=True,
            rating=0.0,
            ratingCount=0
        )
        
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item

    @strawberry.mutation
    def update_menu_item(self, info: Info, item_id: int, input: UpdateMenuItemInput) -> MenuItemType:
        """Updates a menu item. Must be the owner of the canteen."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        if not current_user:
            raise strawberry.GraphQLError("You must be logged in to update a menu item.")

        item = _get_item_and_verify_owner(db, item_id, current_user)
        
        update_data = {k: v for k, v in input.__dict__.items() if v is not strawberry.UNSET}
        if not update_data:
            raise strawberry.GraphQLError("No update data provided.")

        for key, value in update_data.items():
            if key == "customization_options":
                item.customizationOptions = _convert_customizations_to_dict(value)
            else:
                # Map snake_case from input to camelCase on model
                model_key = key.replace('_', '')
                model_key = model_key[0].lower() + ''.join(word.capitalize() for word in model_key[1:].split('_'))
                setattr(item, model_key, value)
        
        db.commit()
        db.refresh(item)
        return item

    @strawberry.mutation
    def delete_menu_item(self, info: Info, item_id: int) -> str:
        """Deletes a menu item. Must be the owner of the canteen."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        if not current_user:
            raise strawberry.GraphQLError("You must be logged in to delete a menu item.")
            
        item = _get_item_and_verify_owner(db, item_id, current_user)
        
        db.delete(item)
        db.commit()
        return "Menu item deleted successfully."

    @strawberry.mutation
    def set_menu_item_stock(self, info: Info, item_id: int, stock_count: int) -> MenuItemType:
        """Set the stock count for a menu item. Only the canteen owner may update stock."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        if not current_user:
            raise strawberry.GraphQLError("You must be logged in to update stock.")

        item = _get_item_and_verify_owner(db, item_id, current_user)
        try:
            item.stock_count = int(stock_count)
            db.commit()
            db.refresh(item)
            return item
        except Exception as e:
            db.rollback()
            raise strawberry.GraphQLError(f"Failed to update stock: {e}")

  