import json
import strawberry
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.cart import Cart, CartItem
from app.models.menu_item import MenuItem
from datetime import datetime, timezone
from strawberry.types import Info
import jwt

@strawberry.input
class CustomizationsInput:
    size: Optional[str] = None
    additions: Optional[List[str]] = None
    removals: Optional[List[str]] = None
    notes: Optional[str] = None

@strawberry.type
class CustomizationsResponse:
    size: Optional[str]
    additions: Optional[List[str]]
    removals: Optional[List[str]]
    notes: Optional[str]

@strawberry.input
class AddToCartInput:
    menuItemId: int
    quantity: int = 1
    selectedSize: Optional[str] = None
    selectedExtras: Optional[str] = None
    specialInstructions: Optional[str] = None
    location: Optional[str] = None
    id: Optional[int] = None
    name: Optional[str] = None
    price: Optional[float] = None
    canteenId: Optional[int] = None
    canteenName: Optional[str] = None
    customizations: Optional[CustomizationsInput] = None

@strawberry.type
class CartItemResponse:
    id: int
    name: str
    price: float
    quantity: int
    canteenId: Optional[int]
    canteenName: Optional[str]
    customizations: Optional[CustomizationsResponse] = None

@strawberry.type
class CartMutationResponse:
    success: bool
    message: str
    cartItem: Optional[CartItemResponse] = None

@strawberry.type
class CartMutation:
    @strawberry.mutation
    def add_to_cart(self, info: Info, input: AddToCartInput) -> CartMutationResponse:
        request = info.context["request"]
        cookies = request.headers.get("cookie", "")
        auth_header = None
        for cookie in cookies.split(";"):
            key, _, value = cookie.strip().partition("=")
            if key == "accessToken":
                auth_header = f"Bearer {value}"
                break

        if not auth_header or not auth_header.startswith("Bearer "):
            return CartMutationResponse(success=False, message="Unauthorized", cartItem=None)

        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            userId = payload.get("user_id")
            if not userId:
                return CartMutationResponse(success=False, message="Invalid token: user_id missing", cartItem=None)
        except Exception as e:
            return CartMutationResponse(success=False, message=f"Invalid token: {str(e)}", cartItem=None)

        db: Session = next(get_db())

        if not input.menuItemId:
            return CartMutationResponse(success=False, message="menuItemId is required", cartItem=None)

        selected_size_json = json.loads(input.selectedSize) if input.selectedSize else None
        selected_extras_json = json.loads(input.selectedExtras) if input.selectedExtras else None

        cart = db.query(Cart).filter(Cart.userId == userId).first()
        now = datetime.now(timezone.utc)
        if not cart:
            cart = Cart(userId=userId, createdAt=now.isoformat(), updatedAt=now.isoformat())
            db.add(cart)
            db.commit()
            db.refresh(cart)

        existing_item = db.query(CartItem).filter(
            CartItem.cartId == cart.id,
            CartItem.menuItemId == input.menuItemId,
            CartItem.selectedSize == selected_size_json,
            CartItem.selectedExtras == selected_extras_json,
        ).first()
        customizations_obj = None
        if input.customizations:
            try:
                customizations_dict = json.loads(input.customizations)
                customizations_obj = CustomizationsResponse(
                    size=customizations_dict.get("size"),
                    additions=customizations_dict.get("additions"),
                    removals=customizations_dict.get("removals"),
                    notes=customizations_dict.get("notes"),
                )
            except Exception:
                customizations_obj = None
        else:
            customizations_obj = None
        if existing_item:
            existing_item.quantity += input.quantity
            db.commit()
            db.refresh(existing_item)
            cart_item = existing_item
        else:
            new_cart_item = CartItem(
                cartId=cart.id,
                menuItemId=input.menuItemId,
                name=input.name,
                canteenId=input.canteenId,
                canteenName=input.canteenName,
                price=input.price,
                quantity=input.quantity,
                selectedSize=selected_size_json,
                selectedExtras=selected_extras_json,
                specialInstructions=input.specialInstructions,
                location=input.location,
                customizations=customizations_obj,
                
            )
            db.add(new_cart_item)
            db.commit()
            db.refresh(new_cart_item)
            cart_item = new_cart_item

        cart.updatedAt = now.isoformat()
        db.commit()

        menu_item = db.query(MenuItem).filter(MenuItem.id == cart_item.menuItemId).first()
        if not menu_item:
            return CartMutationResponse(success=False, message="Menu item not found", cartItem=None)

        customizations = json.dumps({
            "size": selected_size_json if isinstance(selected_size_json, str) else None,
            "additions": selected_extras_json.get("additions") if selected_extras_json and isinstance(selected_extras_json, dict) else None,
            "removals": selected_extras_json.get("removals") if selected_extras_json and isinstance(selected_extras_json, dict) else None,
            "notes": cart_item.specialInstructions,
        })

        cart_item_response = CartItemResponse(
            id=cart_item.id,
            name=menu_item.name,
            price=menu_item.price,
            quantity=cart_item.quantity,
            canteenId=menu_item.canteenId,
            canteenName=menu_item.canteenName,
            customizations=customizations,
        )

        return CartMutationResponse(success=True, message="Item added to cart", cartItem=cart_item_response)

    @strawberry.mutation
    def update_cart_item(
        self,
        cartItemId: int,
        quantity: Optional[int] = None,
        selectedSize: Optional[str] = None,
        selectedExtras: Optional[str] = None,
        specialInstructions: Optional[str] = None,
        location: Optional[str] = None,
        price: Optional[float] = None,
    ) -> CartMutationResponse:
        db: Session = next(get_db())
        cart_item = db.query(CartItem).filter(CartItem.id == cartItemId).first()

        if not cart_item:
            return CartMutationResponse(success=False, message="Cart item not found")

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
        if price is not None:
            cart_item.price = price

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

        cart = db.query(Cart).filter(Cart.id == cart_item.cartId).first()
        if not cart or cart.userId != userId:
            return CartMutationResponse(success=False, message="Cart item does not belong to this user")

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

@strawberry.type
class Mutation:
    add_to_cart: CartMutationResponse = strawberry.field(resolver=CartMutation.add_to_cart)
    update_cart_item: CartMutationResponse = strawberry.field(resolver=CartMutation.update_cart_item)
    remove_from_cart: CartMutationResponse = strawberry.field(resolver=CartMutation.remove_from_cart)
    clear_cart: CartMutationResponse = strawberry.field(resolver=CartMutation.clear_cart)
