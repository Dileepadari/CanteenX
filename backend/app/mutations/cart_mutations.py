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
        userId: int,
        menuItemId: int,
        quantity: int = 1,
        selectedSize: Optional[str] = None,  # JSON string input
        selectedExtras: Optional[str] = None,  # JSON string input
        specialInstructions: Optional[str] = None,
        location: Optional[str] = None,
    ) -> CartMutationResponse:
        db: Session = next(get_db())

        # Parse JSON strings into Python dictionaries
        selected_size_json = json.loads(selectedSize) if selectedSize else None
        selected_extras_json = json.loads(selectedExtras) if selectedExtras else None

        # Find or create a cart for the user
        cart = db.query(Cart).filter(Cart.userId == userId).first()
        now = datetime.now(timezone.utc)
        if not cart:
            cart = Cart(userId=userId, createdAt=now.isoformat(), updatedAt=now.isoformat())
            db.add(cart)
            db.commit()
            db.refresh(cart)

        # Check if item already exists in cart
        existing_item = db.query(CartItem).filter(
            CartItem.cartId == cart.id,
            CartItem.menuItemId == menuItemId,
            CartItem.selectedSize == selected_size_json,
            CartItem.selectedExtras == selected_extras_json,
        ).first()

        if existing_item:
            existing_item.quantity += quantity
        else:
            new_cart_item = CartItem(
                cartId=cart.id,
                menuItemId=menuItemId,
                quantity=quantity,
                selectedSize=selected_size_json,
                selectedExtras=selected_extras_json,
                specialInstructions=specialInstructions,
                location=location,
            )
            db.add(new_cart_item)

        cart.updatedAt = now.isoformat()
        db.commit()
        return CartMutationResponse(success=True, message="Item added to cart")

    @strawberry.mutation
    def update_cart_item(
        self,
        cartItemId: int,
        quantity: Optional[int] = None,
        selectedSize: Optional[str] = None,  # JSON string input
        selectedExtras: Optional[str] = None,  # JSON string input
        specialInstructions: Optional[str] = None,
        location: Optional[str] = None,
    ) -> CartMutationResponse:
        db: Session = next(get_db())
        cart_item = db.query(CartItem).filter(CartItem.id == cartItemId).first()

        if not cart_item:
            return CartMutationResponse(success=False, message="Cart item not found")

        # Parse JSON strings into Python dictionaries
        if selectedSize is not None:
            cart_item.selectedSize = json.loads(selectedSize)
        if selectedExtras is not None:
            cart_item.selectedExtras = json.loads(selectedExtras)
        if quantity is not None:
            cart_item.quantity = quantity
        if specialInstructions is not None:
            cart_item.specialInstructions = specialInstructions
        if location is not None:
            cart_item.location = location

        cart = db.query(Cart).filter(Cart.id == cart_item.cartId).first()
        if cart:
            cart.updatedAt = datetime.now(timezone.utc).isoformat()
        db.commit()
        return CartMutationResponse(success=True, message="Cart item updated")

    @strawberry.mutation
    def remove_from_cart(
        self,
        userId: int,
        cartItemId: int,
    ) -> CartMutationResponse:
        db: Session = next(get_db())
        cart_item = db.query(CartItem).filter(CartItem.id == cartItemId).first()

        if not cart_item:
            return CartMutationResponse(success=False, message="Cart item not found")

        # Verify this cart item belongs to the user
        cart = db.query(Cart).filter(Cart.id == cart_item.cartId).first()
        if not cart or cart.userId != userId:
            return CartMutationResponse(success=False, message="Cart item does not belong to this user")

        # Remove the item
        db.delete(cart_item)
        cart.updatedAt = datetime.now(timezone.utc).isoformat()
        db.commit()

        return CartMutationResponse(success=True, message="Item removed from cart")

    @strawberry.mutation
    def clear_cart(self, userId: int) -> CartMutationResponse:
        db: Session = next(get_db())
        cart = db.query(Cart).filter(Cart.userId == userId).first()

        if not cart:
            return CartMutationResponse(success=False, message="Cart not found")

        db.query(CartItem).filter(CartItem.cartId == cart.id).delete()
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
