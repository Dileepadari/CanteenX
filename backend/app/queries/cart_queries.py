import strawberry
import json
from typing import Optional
from strawberry.types import Info
from sqlalchemy.orm import Session, selectinload
from app.models.cart import Cart, CartItem, CartType, CartItemType, CustomizationsType

def _parse_customizations(item: CartItem) -> Optional[CustomizationsType]:
    """
    Parses customizations from various possible data formats on a CartItem.
    Handles modern JSON format, legacy fields, and string-encoded JSON.
    """
    def _coerce_list_to_strings(values):
        if values is None:
            return None
        out = []
        for v in values:
            if isinstance(v, dict):
                # prefer common keys
                out.append(v.get('name') or v.get('label') or str(v))
            else:
                out.append(str(v))
        return out if out else None

    # Modern format: `customizations` is a dictionary
    if getattr(item, "customizations", None) and isinstance(item.customizations, dict):
        custom_data = item.customizations
        return CustomizationsType(
            size=custom_data.get("size"),
            additions=_coerce_list_to_strings(custom_data.get("additions")),
            removals=_coerce_list_to_strings(custom_data.get("removals")),
            notes=(custom_data.get("notes") if not isinstance(custom_data.get("notes"), dict) else json.dumps(custom_data.get("notes"))),
        )

    # Handle `customizations` stored as a JSON string
    if getattr(item, "customizations", None) and isinstance(item.customizations, str):
        try:
            custom_data = json.loads(item.customizations)
            return CustomizationsType(
                size=custom_data.get("size"),
                additions=custom_data.get("additions"),
                removals=custom_data.get("removals"),
                notes=custom_data.get("notes"),
            )
        except json.JSONDecodeError:
            # If parsing fails, fall back to legacy fields or nothing
            pass

    # Fallback: if the cart item has no customizations, try the linked menu_item's
    # customization options (this covers cases where the frontend sent item-level
    # customizations or the DB stores options on the menu item itself).
    menu_item = getattr(item, "menu_item", None)
    if menu_item is not None:
        opts = getattr(menu_item, "customizationOptions", None)
        if isinstance(opts, dict):
            return CustomizationsType(
                size=opts.get("size"),
                additions=_coerce_list_to_strings(opts.get("additions")),
                removals=_coerce_list_to_strings(opts.get("removals")),
                notes=(opts.get("notes") if not isinstance(opts.get("notes"), dict) else json.dumps(opts.get("notes"))),
            )

    return None

def _convert_cart_item_to_type(item: CartItem) -> CartItemType:
    """Converts a CartItem SQLAlchemy model to a CartItemType."""
    return CartItemType(
        id=item.id,
        menuItemId=item.menu_item_id,
        quantity=item.quantity,
        name=getattr(getattr(item, "menu_item", None), "name", None),
        price=getattr(getattr(item, "menu_item", None), "price", None),
        canteenId=getattr(getattr(item, "menu_item", None), "canteenId", None),
        canteenName=getattr(getattr(item, "menu_item", None), "canteenName", None),
        cartId=getattr(item, "cart_id", None),
        specialInstructions=( _parse_customizations(item).notes if _parse_customizations(item) and getattr(_parse_customizations(item), 'notes', None) else None ),
        location=getattr(getattr(getattr(item, "menu_item", None), "canteen", None), "location", None),
        customizations=_parse_customizations(item),
    )

@strawberry.type
class CartQueries:
    @strawberry.field
    def get_cart_by_user_id(self, userId: str, info: Info) -> Optional[CartType]:
        """Get the cart for a specific user, including all items."""
        db: Session = info.context["db"]
        
        # Use selectinload to efficiently fetch the cart and its items in one go
        cart = (
            db.query(Cart)
            .options(selectinload(Cart.items))
            .filter(Cart.user_id == userId)
            .first()
        )
        
        if not cart:
            return None

        # Convert cart items using the helper function
        cart_items_types = [_convert_cart_item_to_type(item) for item in cart.items]

        return CartType(
            id=cart.id,
            userId=cart.user_id,
            createdAt=cart.created_at.isoformat() if cart.created_at else None,
            updatedAt=cart.updated_at.isoformat() if cart.updated_at else None,
            pickupDate=cart.pickup_date.isoformat() if cart.pickup_date else None,
            pickupTime=cart.pickup_time if cart.pickup_time else None,
            items=cart_items_types
        )