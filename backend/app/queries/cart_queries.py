import strawberry
import json
import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.cart import Cart, CartItem
from app.core.database import get_db

@strawberry.type
class CartItemType:
    id: int
    menu_item_id: int
    name: str
    price: float
    quantity: int
    customizations: Optional[str]
    image: Optional[str]
    description: Optional[str]
    vendor_name: Optional[str]

@strawberry.type
class CartType:
    id: int
    user_id: str
    created_at: str
    updated_at: str
    items: List[CartItemType]

def resolve_get_cart_items(user_id: int) -> CartType:
    """Get cart items for a user from the database"""
    # Get database session
    db = next(get_db())
    
    # Get or create cart
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    
    if not cart:
        # Create a new cart if none exists
        now = datetime.datetime.utcnow().isoformat()
        cart = Cart(user_id=user_id, created_at=now, updated_at=now)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    # Get cart items
    cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    
    return CartType(
        id=cart.id,
        user_id=cart.user_id,
        created_at=cart.created_at,
        updated_at=cart.updated_at,
        items=[
            CartItemType(
                id=item.id,
                menu_item_id=item.menu_item_id,
                name=item.name,
                price=item.price,
                quantity=item.quantity,
                customizations=item.customizations,
                image=item.image,
                description=item.description,
                vendor_name=item.vendor_name
            ) 
            for item in cart_items
        ]
    )

# Create GraphQL fields
getCartItems = strawberry.field(name="getCartItems", resolver=resolve_get_cart_items)

# Export queries and mutations
queries = [getCartItems]