import strawberry
import json
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from strawberry.types import Info
from graphql import GraphQLError
from datetime import datetime, timezone
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import get_db
from app.models.cart import Cart, CartItem, CartType, AddToCartInput, CustomizationsInput, CartMutationResponse, CartItemType, CustomizationsType
from app.models.menu_item import MenuItem
from app.models.user import User

# This helper function is central to getting or creating a user's cart.
def _get_or_create_user_cart(db: Session, user_id: str):
    """Finds a user's cart or creates one if it doesn't exist."""
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        now = datetime.now(timezone.utc)
        cart = Cart(user_id=user_id, created_at=now, updated_at=now)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

# This helper normalizes customization data for consistent database storage and comparison.
def _normalize_customizations(customizations: Optional[CustomizationsInput]) -> Optional[Dict[str, Any]]:
    """Converts the CustomizationInput into a consistent dictionary for the database."""
    if not customizations:
        return None
    
    # Use .__dict__ to get all fields from the input object
    # Filter out unset values to avoid storing nulls for every possible key
    return {k: v for k, v in customizations.__dict__.items() if v is not strawberry.UNSET}


@strawberry.type
class CartMutations:
    @strawberry.mutation
    def add_to_cart(self, info: Info, input: AddToCartInput) -> CartMutationResponse:
        """
        Adds an item to the cart or increases its quantity if an identical item already exists.
        Returns the entire updated cart on success.
        """
        db: Session = info.context["db"]
        current_user: User = info.context.get("user")
        if not current_user:
            raise GraphQLError("You must be logged in to modify the cart.")

        # 1. Validate that the menu item exists (Source of Truth)
        # The input uses camelCase field names coming from the frontend
        menu_item = db.query(MenuItem).filter(MenuItem.id == input.menuItemId).first()
        if not menu_item:
            raise GraphQLError("Menu item not found.")

        # 2. Get or create the user's cart
        cart = _get_or_create_user_cart(db, current_user.id)

        # 3. Normalize customizations for consistent comparison and storage
        customizations_dict = _normalize_customizations(input.customizations)

        # 4. Check if an identical item (same menu item ID and same customizations) already exists
        # Build a safe comparison for the JSON column. Postgres does not
        # support the `=` operator for the `json` type in some setups; using
        # jsonb equality is more robust. If customizations is None we check
        # for NULL, otherwise cast the column to JSONB and compare.
        if customizations_dict is None:
            custom_filter = CartItem.customizations.is_(None)
        else:
            custom_filter = func.cast(CartItem.customizations, JSONB) == customizations_dict

        existing_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.menu_item_id == input.menuItemId,
            custom_filter
        ).first()

        if existing_item:
            existing_item.quantity += input.quantity
            # ensure we return the updated cart item
            cart_item = existing_item
        else:
            new_cart_item = CartItem(
                cart_id=cart.id,
                menu_item_id=input.menuItemId,
                quantity=input.quantity,
                customizations=customizations_dict
            )
            db.add(new_cart_item)
            # capture the newly created item for returning
            cart_item = new_cart_item

        cart.updated_at = datetime.now(timezone.utc)
        db.commit()
        # refresh both cart and the single cart item we will return
        db.refresh(cart)
        try:
            db.refresh(cart_item)
        except Exception:
            # If refresh fails for any reason, ignore and still return the cart
            cart_item = None

        # Build a safe GraphQL-friendly CartItemType to avoid Strawberry trying to access
        # missing attributes on the SQLAlchemy model (which caused AttributeError for
        # fields like `name` and `price` in previous responses).
        cart_item_result = None
        if cart_item is not None:
            # Try to get the associated MenuItem to populate human-friendly fields
            try:
                menu_item = db.query(MenuItem).filter(MenuItem.id == cart_item.menu_item_id).first()
            except Exception:
                menu_item = None

            # Map DB customizations (JSON/dict) into the GraphQL CustomizationsType
            cs = getattr(cart_item, 'customizations', None)
            cs_obj = None
            if isinstance(cs, dict):
                # Ensure additions/removals are lists of strings for GraphQL
                def _coerce_list(values):
                    if values is None:
                        return None
                    out = []
                    for v in values:
                        if isinstance(v, dict):
                            out.append(v.get('name') or v.get('label') or str(v))
                        else:
                            out.append(str(v))
                    return out if out else None

                cs_obj = CustomizationsType(
                    size=cs.get('size'),
                    additions=_coerce_list(cs.get('additions')),
                    removals=_coerce_list(cs.get('removals')),
                    notes=(cs.get('notes') if not isinstance(cs.get('notes'), dict) else json.dumps(cs.get('notes'))),
                )

            cart_item_result = CartItemType(
                id=cart_item.id,
                menuItemId=int(cart_item.menu_item_id) if getattr(cart_item, 'menu_item_id', None) is not None else None,
                quantity=int(getattr(cart_item, 'quantity', 0)),
                name=menu_item.name if menu_item else None,
                price=float(menu_item.price) if menu_item and getattr(menu_item, 'price', None) is not None else None,
                canteenId=menu_item.canteenId if menu_item else None,
                canteenName=menu_item.canteenName if menu_item else None,
                cartId=int(cart.id) if cart is not None else None,
                customizations=cs_obj,
            )

        return CartMutationResponse(success=True, message="Item added to cart.", cart=cart, cartItem=cart_item_result)

    @strawberry.mutation
    def update_cart_item_quantity(self, info: Info, cart_item_id: int, quantity: int) -> CartMutationResponse:
        """
        Updates the quantity of a specific item in the user's cart.
        If quantity is 0 or less, the item is removed.
        """
        db: Session = info.context["db"]
        current_user: User = info.context.get("user")
        if not current_user:
            raise GraphQLError("You must be logged in to modify the cart.")

        # Securely fetch the cart item by joining with the Cart and filtering by the current user's ID
        cart_item = db.query(CartItem).join(Cart).filter(
            CartItem.id == cart_item_id,
            Cart.user_id == current_user.id
        ).first()

        if not cart_item:
            raise GraphQLError("Cart item not found or you do not have permission to modify it.")
        
        cart = cart_item.cart
        if quantity <= 0:
            db.delete(cart_item)
        else:
            cart_item.quantity = quantity
        
        cart.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(cart)
        
        return CartMutationResponse(success=True, message="Cart item updated.", cart=cart)

    @strawberry.mutation
    def remove_from_cart(self, info: Info, cart_item_id: int) -> CartMutationResponse:
        """Removes an item completely from the authenticated user's cart."""
        db: Session = info.context["db"]
        current_user: User = info.context.get("user")
        if not current_user:
            raise GraphQLError("You must be logged in to modify the cart.")
            
        # Securely fetch the item to ensure it belongs to the current user
        cart_item = db.query(CartItem).join(Cart).filter(
            CartItem.id == cart_item_id,
            Cart.user_id == current_user.id
        ).first()

        if not cart_item:
            raise strawberry.GraphQLError("Cart item not found or you do not have permission to modify it.")
            
        cart = cart_item.cart
        db.delete(cart_item)
        cart.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(cart)

        return CartMutationResponse(success=True, message="Item removed from cart.", cart=cart)

    @strawberry.mutation
    def clear_cart(self, info: Info) -> CartMutationResponse:
        """Removes all items from the authenticated user's cart."""
        db: Session = info.context["db"]
        current_user: User = info.context.get("user")
        if not current_user:
            raise GraphQLError("You must be logged in to modify the cart.")

        cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
        if cart and cart.items:
            # Efficiently delete all items associated with the cart
            db.query(CartItem).filter(CartItem.cart_id == cart.id).delete(synchronize_session=False)
            cart.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(cart)
        elif not cart:
            # If the user has no cart, create an empty one for a consistent response
            cart = _get_or_create_user_cart(db, current_user.id)

        return CartMutationResponse(success=True, message="Cart cleared successfully.", cart=cart)
