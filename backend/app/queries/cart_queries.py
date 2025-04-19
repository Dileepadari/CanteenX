import strawberry
import json
from typing import List, Optional
from app.models.cart import Cart, CartItem
from app.core.database import get_db
from datetime import datetime

@strawberry.type
class CustomizationsType:
    size: Optional[str]
    additions: Optional[List[str]]
    removals: Optional[List[str]]
    notes: Optional[str]

@strawberry.type
class CartItemType:
    id: int
    cartId: int
    menuItemId: int
    name: Optional[str]
    price: Optional[float]
    quantity: int
    canteenId: Optional[int]
    canteenName: Optional[str]
    customizations: Optional[CustomizationsType]
    specialInstructions: Optional[str]
    location: Optional[str]

@strawberry.type
class CartType:
    id: int
    userId: str
    createdAt: str
    updatedAt: str
    pickupDate: Optional[str]
    pickupTime: Optional[str]
    items: Optional[List[CartItemType]] = None

def resolve_get_cart_by_user_id(userId: str) -> Optional[CartType]:
    db = next(get_db())
    cart = db.query(Cart).filter(Cart.userId == userId).first()
    if not cart:
        return None
    cart_items = db.query(CartItem).filter(CartItem.cartId == cart.id).all()
    cart_items_types = []
    for item in cart_items:
        selected_size = item.selectedSize
        if selected_size is not None:
            try:
                selected_size = json.dumps(selected_size)
            except Exception:
                selected_size = None
        selected_extras = item.selectedExtras
        if selected_extras is not None:
            try:
                selected_extras = json.loads(json.dumps(selected_extras))
            except Exception:
                selected_extras = None
        customizations = None
        if selected_size or selected_extras or item.specialInstructions:
            customizations = CustomizationsType(
                size=selected_size if isinstance(selected_size, str) else None,
                additions=selected_extras.get("additions") if selected_extras and isinstance(selected_extras, dict) else None,
                removals=selected_extras.get("removals") if selected_extras and isinstance(selected_extras, dict) else None,
                notes=item.specialInstructions,
            )
        cart_items_types.append(CartItemType(
            id=item.id,
            cartId=item.cartId,
            menuItemId=item.menuItemId,
            name=getattr(item, "name", None),
            price=getattr(item, "price", None),
            quantity=item.quantity,
            canteenId=getattr(item, "canteenId", None),
            canteenName=getattr(item, "canteenName", None),
            customizations=customizations,
            specialInstructions=item.specialInstructions,
            location=item.location
        ))
    return CartType(
        id=cart.id,
        userId=cart.userId,
        createdAt=cart.createdAt,
        updatedAt=cart.updatedAt,
        pickupDate=cart.pickupDate.isoformat() if cart.pickupDate else None,
        pickupTime=cart.pickupTime if cart.pickupTime else None,
        items=cart_items_types
    )

getCartByUserId = strawberry.field(name="getCartByUserId", resolver=resolve_get_cart_by_user_id)

queries = [
    getCartByUserId
]
