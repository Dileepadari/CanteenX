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
        customizations = None
        
        # Handle the customizations properly
        if item.customizations:
            custom_data = item.customizations
            # If customizations is stored as a string, parse it to a dictionary
            if isinstance(custom_data, str):
                try:
                    custom_data = json.loads(custom_data)
                except Exception:
                    custom_data = {}
                
            if isinstance(custom_data, dict):
                customizations = CustomizationsType(
                    size=custom_data.get("size"),
                    additions=custom_data.get("additions"),
                    removals=custom_data.get("removals"),
                    notes=custom_data.get("notes") or item.specialInstructions,
                )
            else:
                # Fallback for legacy or incorrectly formatted data
                customizations = CustomizationsType(
                    size=None,
                    additions=None,
                    removals=None,
                    notes=item.specialInstructions,
                )
        elif item.selectedSize or item.selectedExtras or item.specialInstructions:
            # Handle legacy data format
            selected_size = item.selectedSize
            if selected_size is not None and isinstance(selected_size, str):
                try:
                    selected_size = json.loads(selected_size)
                except Exception:
                    selected_size = item.selectedSize
                    
            selected_extras = item.selectedExtras
            if selected_extras is not None:
                try:
                    if isinstance(selected_extras, str):
                        selected_extras = json.loads(selected_extras)
                except Exception:
                    selected_extras = {}
                    
            customizations = CustomizationsType(
                size=selected_size if not isinstance(selected_size, dict) else None,
                additions=selected_extras.get("additions") if isinstance(selected_extras, dict) else None,
                removals=selected_extras.get("removals") if isinstance(selected_extras, dict) else None,
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
