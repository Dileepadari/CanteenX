import strawberry
import json
import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.cart import Cart, CartItem

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
    user_id: int
    created_at: str
    updated_at: str
    items: List[CartItemType]

# def get_or_create_cart(db: Session, user_id: int) -> Cart:
#     """Get existing cart or create a new one for the user"""
#     cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    
#     if not cart:
#         now = datetime.datetime.utcnow().isoformat()
#         cart = Cart(user_id=user_id, created_at=now, updated_at=now)
#         db.add(cart)
#         db.commit()
#         db.refresh(cart)
    
#     return cart

def resolve_get_cart_items(user_id: int) -> CartType:

    # return mock data
    
    cart1 = Cart(
        id=1,
        user_id=1,
        created_at="2023-10-01T12:00:00Z",
        updated_at="2023-10-01T12:00:00Z"
    )
    
    mock_data = [
            CartItem(
                id=1,
                cart_id=cart1.id,
                menu_item_id=1,
                name="Paneer Butter Masala",
                price=180.0,
                quantity=1,
                customizations=json.dumps({
                    "Spice Level": "Medium",
                    "Extra Paneer": True
                }),
                image="https://images.unsplash.com/photo-1567188040759-fb8a254b3bd2?q=80&w=300&auto=format&fit=crop",
                description="Rich and creamy paneer curry",
                vendor_name="Indian Delights"
            ),
            CartItem(
                id=2,
                cart_id=cart1.id,
                menu_item_id=3,
                name="Cold Coffee",
                price=70.0,
                quantity=2,
                customizations=json.dumps({
                    "Sugar": "Less",
                    "Ice": "Regular"
                }),
                image="https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80&w=300&auto=format&fit=crop",
                description="Refreshing cold coffee with ice cream",
                vendor_name="Beverages"
            ),
            CartItem(
                id=3,
                cart_id=cart1.id,
                menu_item_id=4,
                name="Veg Burger",
                price=90.0,
                quantity=1,
                customizations=json.dumps({
                    "Extra Cheese": True,
                    "No Onion": True
                }),
                image="https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=300&auto=format&fit=crop",
                description="Delicious vegetable patty with fresh veggies",
                vendor_name="Fast Food"
            )
        ]
    
    return CartType(
        id=cart1.id,
        user_id=cart1.user_id,
        created_at=cart1.created_at,
        updated_at=cart1.updated_at,
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
            for item in mock_data
        ]
    )
    
    

# @strawberry.mutation
# def resolve_add_to_cart(
#     user_id: int, 
#     menu_item_id: int, 
#     quantity: int = 1, 
#     customizations: Optional[str] = None
# ) -> CartType:
#     """Add an item to the cart"""
#     db = next(get_db())
    
#     # Get or create cart
#     cart = get_or_create_cart(db, user_id)
    
#     # Check if item already exists in cart
#     existing_item = db.query(CartItem).filter(
#         and_(
#             CartItem.cart_id == cart.id,
#             CartItem.menu_item_id == menu_item_id,
#             CartItem.customizations == customizations
#         )
#     ).first()
    
#     if existing_item:
#         # Update quantity if item exists
#         existing_item.quantity += quantity
#         db.commit()
#         db.refresh(existing_item)
#     else:
#         # Get menu item details
#         menu_item = db.query(MenuItem).filter(MenuItem.id == menu_item_id).first()
#         if not menu_item:
#             raise ValueError(f"Menu item with ID {menu_item_id} not found")
        
#         # Add new item to cart
#         cart_item = CartItem(
#             cart_id=cart.id,
#             menu_item_id=menu_item_id,
#             name=menu_item.name,
#             price=menu_item.price,
#             quantity=quantity,
#             customizations=customizations,
#             description=menu_item.description,
#             image=menu_item.image_url,
#             vendor_name=menu_item.category  # Using category as vendor name
#         )
#         db.add(cart_item)
#         db.commit()
#         db.refresh(cart_item)
    
#     # Update cart timestamp
#     cart.updated_at = datetime.datetime.utcnow().isoformat()
#     db.commit()
    
#     # Return updated cart
#     return resolve_get_cart_items(user_id)

# @strawberry.mutation
# def resolve_update_cart_item(
#     user_id: int, 
#     cart_item_id: int, 
#     quantity: int
# ) -> CartType:
#     """Update quantity of a cart item"""
#     db = next(get_db())
    
#     # Get cart
#     cart = db.query(Cart).filter(Cart.user_id == user_id).first()
#     if not cart:
#         raise ValueError(f"Cart not found for user {user_id}")
    
#     # Get cart item
#     cart_item = db.query(CartItem).filter(
#         and_(
#             CartItem.id == cart_item_id,
#             CartItem.cart_id == cart.id
#         )
#     ).first()
    
#     if not cart_item:
#         raise ValueError(f"Cart item {cart_item_id} not found in cart {cart.id}")
    
#     if quantity <= 0:
#         # Remove item if quantity is zero or negative
#         db.delete(cart_item)
#     else:
#         # Update quantity
#         cart_item.quantity = quantity
    
#     # Update cart timestamp
#     cart.updated_at = datetime.datetime.utcnow().isoformat()
#     db.commit()
    
#     # Return updated cart
#     return resolve_get_cart_items(user_id)

# @strawberry.mutation
# def resolve_remove_from_cart(user_id: int, cart_item_id: int) -> CartType:
#     """Remove an item from the cart"""
#     db = next(get_db())
    
#     # Get cart
#     cart = db.query(Cart).filter(Cart.user_id == user_id).first()
#     if not cart:
#         raise ValueError(f"Cart not found for user {user_id}")
    
#     # Get and remove cart item
#     cart_item = db.query(CartItem).filter(
#         and_(
#             CartItem.id == cart_item_id,
#             CartItem.cart_id == cart.id
#         )
#     ).first()
    
#     if cart_item:
#         db.delete(cart_item)
        
#         # Update cart timestamp
#         cart.updated_at = datetime.datetime.utcnow().isoformat()
#         db.commit()
    
#     # Return updated cart
#     return resolve_get_cart_items(user_id)

# @strawberry.mutation
# def resolve_clear_cart(user_id: int) -> bool:
#     """Clear all items from the cart"""
#     db = next(get_db())
    
#     # Get cart
#     cart = db.query(Cart).filter(Cart.user_id == user_id).first()
#     if not cart:
#         return True  # Cart doesn't exist, so it's already "cleared"
    
#     # Remove all items
#     db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    
#     # Update cart timestamp
#     cart.updated_at = datetime.datetime.utcnow().isoformat()
#     db.commit()
    
#     return True

# def initialize_mock_cart_data():
#     """
#     Initialize mock cart data for development purposes.
#     This function creates sample carts with items for demo users.
#     """
#     try:
#         db = next(get_db())
        
#         # Create test users if they don't exist
#         users = [
#             User(id=1, name="John Doe", email="john@example.com"),
#             User(id=2, name="Jane Smith", email="jane@example.com"),
#         ]
        
#         for user in users:
#             db_user = db.query(User).filter(User.id == user.id).first()
#             if not db_user:
#                 db.add(user)
        
#         db.commit()
        
#         # Create menu items if they don't exist
#         menu_items = [
#             MenuItem(
#                 id=1, name="Paneer Butter Masala", description="Rich and creamy paneer curry",
#                 price=180.0, image_url="https://images.unsplash.com/photo-1567188040759-fb8a254b3bd2?q=80&w=300&auto=format&fit=crop",
#                 category="Indian Delights", canteen_id=1, is_available=1, is_vegetarian=1, is_featured=1
#             ),
#             MenuItem(
#                 id=2, name="Masala Dosa", description="Crispy crepe filled with spicy potato filling",
#                 price=80.0, image_url="https://images.unsplash.com/photo-1589301760014-d929f86731c7?q=80&w=300&auto=format&fit=crop",
#                 category="South Indian", canteen_id=1, is_available=1, is_vegetarian=1, is_featured=0
#             ),
#             MenuItem(
#                 id=3, name="Cold Coffee", description="Refreshing cold coffee with ice cream",
#                 price=70.0, image_url="https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80&w=300&auto=format&fit=crop",
#                 category="Beverages", canteen_id=2, is_available=1, is_vegetarian=1, is_featured=1
#             ),
#             MenuItem(
#                 id=4, name="Veg Burger", description="Delicious vegetable patty with fresh veggies",
#                 price=90.0, image_url="https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=300&auto=format&fit=crop",
#                 category="Fast Food", canteen_id=3, is_available=1, is_vegetarian=1, is_featured=1
#             ),
#             MenuItem(
#                 id=5, name="French Fries", description="Crispy potato fries with seasoning",
#                 price=60.0, image_url="https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=300&auto=format&fit=crop",
#                 category="Fast Food", canteen_id=3, is_available=1, is_vegetarian=1, is_featured=0
#             ),
#         ]
        
#         for item in menu_items:
#             db_item = db.query(MenuItem).filter(MenuItem.id == item.id).first()
#             if not db_item:
#                 db.add(item)
        
#         db.commit()
        
#         # Create cart for user 1
#         cart1 = db.query(Cart).filter(Cart.user_id == 1).first()
#         if not cart1:
#             cart1 = Cart(
#                 user_id=1,
#                 created_at=datetime.datetime.utcnow().isoformat(),
#                 updated_at=datetime.datetime.utcnow().isoformat()
#             )
#             db.add(cart1)
#             db.flush()  # Get the ID without committing
        
#         # Clear any existing cart items for this cart
#         db.query(CartItem).filter(CartItem.cart_id == cart1.id).delete()
        
#         # Add items to cart 1
        
        
#         for item in cart_items:
#             db.add(item)
        
#         # Create cart for user 2
#         cart2 = db.query(Cart).filter(Cart.user_id == 2).first()
#         if not cart2:
#             cart2 = Cart(
#                 user_id=2,
#                 created_at=datetime.datetime.utcnow().isoformat(),
#                 updated_at=datetime.datetime.utcnow().isoformat()
#             )
#             db.add(cart2)
#             db.flush()  # Get the ID without committing
        
#         # Clear any existing cart items for this cart
#         db.query(CartItem).filter(CartItem.cart_id == cart2.id).delete()
        
#         # Add items to cart 2
#         cart_items = [
#             CartItem(
#                 cart_id=cart2.id,
#                 menu_item_id=2,
#                 name="Masala Dosa",
#                 price=80.0,
#                 quantity=2,
#                 customizations=json.dumps({
#                     "Extra Chutney": True
#                 }),
#                 image="https://images.unsplash.com/photo-1589301760014-d929f86731c7?q=80&w=300&auto=format&fit=crop",
#                 description="Crispy crepe filled with spicy potato filling",
#                 vendor_name="South Indian"
#             ),
#             CartItem(
#                 cart_id=cart2.id,
#                 menu_item_id=5,
#                 name="French Fries",
#                 price=60.0,
#                 quantity=1,
#                 customizations=json.dumps({
#                     "Extra Salt": True,
#                     "Sauce": "Ketchup"
#                 }),
#                 image="https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=300&auto=format&fit=crop",
#                 description="Crispy potato fries with seasoning",
#                 vendor_name="Fast Food"
#             )
#         ]
        
#         for item in cart_items:
#             db.add(item)
        
#         db.commit()
        
#         print("✅ Mock cart data successfully initialized")
#         return True
#     except Exception as e:
#         print(f"❌ Error initializing mock cart data: {e}")
#         return False

# Create a field to initialize mock data via GraphQL
# @strawberry.field
# def resolve_initialize_mock_cart_data() -> bool:
#     """GraphQL resolver to initialize mock cart data"""
#     return initialize_mock_cart_data()

# Create GraphQL fields
getCartItems = strawberry.field(name="getCartItems", resolver=resolve_get_cart_items)
# updateCartItem = strawberry.mutation(name="updateCartItem", resolver=resolve_update_cart_item)
# removeFromCart = strawberry.mutation(name="removeFromCart", resolver=resolve_remove_from_cart)
# clearCart = strawberry.mutation(name="clearCart", resolver=resolve_clear_cart)

# Export queries and mutations
queries = [getCartItems]
# mutations = [addToCart, updateCartItem, removeFromCart, clearCart]

# Initialize mock data when this module is imported