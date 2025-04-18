import strawberry
import datetime
import json
from typing import List, Optional


from app.models.cart import Cart, CartItem
from app.core.database import get_db

import strawberry
from typing import Optional, List
from datetime import datetime


@strawberry.type
class CartItemType:
    id: int
    cart_id: int
    menu_item_id: int
    quantity: int
    selected_size: Optional[str] = None  # Changed to string to store the selected size name
    selected_extras: Optional[str] = None  # Changed to list of strings for selected extras
    special_instructions: Optional[str] = None
    location: Optional[str] = None

@strawberry.type
class CartType:
    id: int
    userId: int
    createdAt: str  # ISO format string
    updatedAt: str  # ISO format string
    pickup_date: Optional[str]
    pickup_time: Optional[str]
    items: Optional[List[CartItemType]] = None  # if you're resolving related items

def resolve_get_cart_by_user_id(userId: int) -> Optional[CartType]:
    # Get database session
    db = next(get_db())
    
    # Query for the cart associated with the user
    cart = db.query(Cart).filter(Cart.userId == userId).first()
    
    if not cart:
        return None
    
    # Query for cart items
    cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    
    # Convert cart items to CartItemType objects
    cart_items_types = []
    for item in cart_items:
        # Handle selected_size - convert from dict/JSON to string if needed
        selected_size = item.selected_size
        if selected_size is not None:
            try:
                selected_size = json.dumps(selected_size)
            except Exception:
                selected_size = None
                
        # Handle selected_extras - convert from dict/JSON to list of strings if needed
        selected_extras = item.selected_extras
        if selected_extras is not None:
            try:
                selected_extras = json.dumps(selected_extras)
            except Exception:
                selected_extras = None
        
        cart_items_types.append(CartItemType(
            id=item.id,
            cart_id=item.cart_id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            selected_size=selected_size,
            selected_extras=selected_extras,
            special_instructions=item.special_instructions,
            location=item.location
        ))
    
    # Create and return CartType with all items
    return CartType(
        id=cart.id,
        userId=cart.userId,
        createdAt=cart.createdAt,
        updatedAt=cart.updatedAt,
        pickup_date=cart.pickup_date.isoformat() if cart.pickup_date else None,
        pickup_time=cart.pickup_time if cart.pickup_time else None,
        items=cart_items_types
    )

# Create properly decorated field with resolver
getCartByUserId = strawberry.field(name="getCartByUserId", resolver=resolve_get_cart_by_user_id)

queries = [
    getCartByUserId
]

