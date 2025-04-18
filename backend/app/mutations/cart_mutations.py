import json
import strawberry
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.cart import Cart, CartItem
from datetime import datetime, timezone

@strawberry.type
class CartMutationResponse:
    success: bool
    message: str

@strawberry.type
class CartMutation:
    @strawberry.mutation
    def add_to_cart(
        self,
        user_id: int,
        menu_item_id: int,
        quantity: int = 1,
        selected_size: Optional[str] = None,  # JSON string input
        selected_extras: Optional[str] = None,  # JSON string input
        special_instructions: Optional[str] = None,
        location: Optional[str] = None,
    ) -> CartMutationResponse:
        db: Session = next(get_db())

        # Parse JSON strings into Python dictionaries
        selected_size_json = json.loads(selected_size) if selected_size else None
        selected_extras_json = json.loads(selected_extras) if selected_extras else None

        # Find or create a cart for the user
        cart = db.query(Cart).filter(Cart.userId == user_id).first()
        now = datetime.now(timezone.utc)
        if not cart:
            cart = Cart(userId=user_id, createdAt=now.isoformat(), updatedAt=now.isoformat())
            db.add(cart)
            db.commit()
            db.refresh(cart)

        # Check if item already exists in cart
        existing_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.menu_item_id == menu_item_id,
            CartItem.selected_size == selected_size_json,
            CartItem.selected_extras == selected_extras_json,
        ).first()

        if existing_item:
            existing_item.quantity += quantity
        else:
            new_cart_item = CartItem(
                cart_id=cart.id,
                menu_item_id=menu_item_id,
                quantity=quantity,
                selected_size=selected_size_json,
                selected_extras=selected_extras_json,
                special_instructions=special_instructions,
                location=location,
            )
            db.add(new_cart_item)

        cart.updatedAt = now.isoformat()
        db.commit()
        return CartMutationResponse(success=True, message="Item added to cart")

    @strawberry.mutation
    def update_cart_item(
        self,
        cart_item_id: int,
        quantity: Optional[int] = None,
        selected_size: Optional[str] = None,  # JSON string input
        selected_extras: Optional[str] = None,  # JSON string input
        special_instructions: Optional[str] = None,
        location: Optional[str] = None,
    ) -> CartMutationResponse:
        db: Session = next(get_db())
        cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()

        if not cart_item:
            return CartMutationResponse(success=False, message="Cart item not found")

        # Parse JSON strings into Python dictionaries
        if selected_size is not None:
            cart_item.selected_size = json.loads(selected_size)
        if selected_extras is not None:
            cart_item.selected_extras = json.loads(selected_extras)
        if quantity is not None:
            cart_item.quantity = quantity
        if special_instructions is not None:
            cart_item.special_instructions = special_instructions
        if location is not None:
            cart_item.location = location

        cart = db.query(Cart).filter(Cart.id == cart_item.cart_id).first()
        if cart:
            cart.updatedAt = datetime.now(timezone.utc).isoformat()
        db.commit()
        return CartMutationResponse(success=True, message="Cart item updated")

    @strawberry.mutation
    def remove_from_cart(
        self,
        user_id: int,
        cart_item_id: int,
    ) -> CartMutationResponse:
        db: Session = next(get_db())
        cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()

        if not cart_item:
            return CartMutationResponse(success=False, message="Cart item not found")

        # Verify this cart item belongs to the user
        cart = db.query(Cart).filter(Cart.id == cart_item.cart_id).first()
        if not cart or cart.userId != user_id:
            return CartMutationResponse(success=False, message="Cart item does not belong to this user")

        # Remove the item
        db.delete(cart_item)
        cart.updatedAt = datetime.now(timezone.utc).isoformat()
        db.commit()

        return CartMutationResponse(success=True, message="Item removed from cart")

    @strawberry.mutation
    def clear_cart(self, user_id: int) -> CartMutationResponse:
        db: Session = next(get_db())
        cart = db.query(Cart).filter(Cart.userId == user_id).first()

        if not cart:
            return CartMutationResponse(success=False, message="Cart not found")

        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        cart.updatedAt = datetime.now(timezone.utc).isoformat()
        db.commit()

        return CartMutationResponse(success=True, message="Cart cleared successfully")


# Register mutations individually if needed
mutations = [
    strawberry.field(name="addToCart", resolver=CartMutation.add_to_cart),
    strawberry.field(name="updateCartItem", resolver=CartMutation.update_cart_item),
    strawberry.field(name="removeFromCart", resolver=CartMutation.remove_from_cart),
    strawberry.field(name="clearCart", resolver=CartMutation.clear_cart),
]
