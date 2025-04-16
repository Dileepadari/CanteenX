"""
Mock data script to populate the database with initial data for development
"""
import datetime
import json
from sqlalchemy.orm import Session

from app.core.database import engine, Base, get_db
from app.models.canteen import Canteen
from app.models.menu_item import MenuItem
from app.models.user import User
from app.models.cart import Cart, CartItem

def add_mock_users(db: Session):
    """Add mock users to the database"""
    users = [
        User(id=1, name="John Doe", email="john@example.com"),
        User(id=2, name="Jane Smith", email="jane@example.com"),
    ]
    
    for user in users:
        db_user = db.query(User).filter(User.id == user.id).first()
        if not db_user:
            db.add(user)
    
    db.commit()
    print("✅ Mock users added to database")

def add_mock_canteens(db: Session):
    """Add mock canteens to the database"""
    canteens = [
        Canteen(id=1, name="Central Canteen", location="Main Building", opening_time="08:00", closing_time="20:00"),
        Canteen(id=2, name="Library Cafe", location="Library Building", opening_time="09:00", closing_time="18:00"),
        Canteen(id=3, name="Tech Hub Canteen", location="Technology Block", opening_time="07:30", closing_time="22:00")
    ]
    
    for canteen in canteens:
        db_canteen = db.query(Canteen).filter(Canteen.id == canteen.id).first()
        if not db_canteen:
            db.add(canteen)
    
    db.commit()
    print("✅ Mock canteens added to database")

def add_mock_menu_items(db: Session):
    """Add mock menu items to the database"""
    menu_items = [
        MenuItem(
            id=1, name="Paneer Butter Masala", description="Rich and creamy paneer curry",
            price=180.0, image_url="https://images.unsplash.com/photo-1567188040759-fb8a254b3bd2?q=80&w=300&auto=format&fit=crop",
            category="Indian Delights", canteen_id=1, is_available=1, is_vegetarian=1, is_featured=1
        ),
        MenuItem(
            id=2, name="Masala Dosa", description="Crispy crepe filled with spicy potato filling",
            price=80.0, image_url="https://images.unsplash.com/photo-1589301760014-d929f86731c7?q=80&w=300&auto=format&fit=crop",
            category="South Indian", canteen_id=1, is_available=1, is_vegetarian=1, is_featured=0
        ),
        MenuItem(
            id=3, name="Cold Coffee", description="Refreshing cold coffee with ice cream",
            price=70.0, image_url="https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80&w=300&auto=format&fit=crop",
            category="Beverages", canteen_id=2, is_available=1, is_vegetarian=1, is_featured=1
        ),
        MenuItem(
            id=4, name="Veg Burger", description="Delicious vegetable patty with fresh veggies",
            price=90.0, image_url="https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=300&auto=format&fit=crop",
            category="Fast Food", canteen_id=3, is_available=1, is_vegetarian=1, is_featured=1
        ),
        MenuItem(
            id=5, name="French Fries", description="Crispy potato fries with seasoning",
            price=60.0, image_url="https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=300&auto=format&fit=crop",
            category="Fast Food", canteen_id=3, is_available=1, is_vegetarian=1, is_featured=0
        ),
    ]
    
    for item in menu_items:
        db_item = db.query(MenuItem).filter(MenuItem.id == item.id).first()
        if not db_item:
            db.add(item)
    
    db.commit()
    print("✅ Mock menu items added to database")

def add_mock_cart_data(db: Session):
    """Add mock cart data to the database"""
    # Create cart for user 1
    cart1 = db.query(Cart).filter(Cart.user_id == 1).first()
    if not cart1:
        cart1 = Cart(
            user_id=1,
            created_at=datetime.datetime.utcnow().isoformat(),
            updated_at=datetime.datetime.utcnow().isoformat()
        )
        db.add(cart1)
        db.flush()  # Get the ID without committing
    
    # Clear any existing cart items for this cart
    db.query(CartItem).filter(CartItem.cart_id == cart1.id).delete()
    
    # Add items to cart 1
    cart_items = [
        CartItem(
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
    
    for item in cart_items:
        db.add(item)
    
    # Create cart for user 2
    cart2 = db.query(Cart).filter(Cart.user_id == 2).first()
    if not cart2:
        cart2 = Cart(
            user_id=2,
            created_at=datetime.datetime.utcnow().isoformat(),
            updated_at=datetime.datetime.utcnow().isoformat()
        )
        db.add(cart2)
        db.flush()  # Get the ID without committing
    
    # Clear any existing cart items for this cart
    db.query(CartItem).filter(CartItem.cart_id == cart2.id).delete()
    
    # Add items to cart 2
    cart_items = [
        CartItem(
            cart_id=cart2.id,
            menu_item_id=2,
            name="Masala Dosa",
            price=80.0,
            quantity=2,
            customizations=json.dumps({
                "Extra Chutney": True
            }),
            image="https://images.unsplash.com/photo-1589301760014-d929f86731c7?q=80&w=300&auto=format&fit=crop",
            description="Crispy crepe filled with spicy potato filling",
            vendor_name="South Indian"
        ),
        CartItem(
            cart_id=cart2.id,
            menu_item_id=5,
            name="French Fries",
            price=60.0,
            quantity=1,
            customizations=json.dumps({
                "Extra Salt": True,
                "Sauce": "Ketchup"
            }),
            image="https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=300&auto=format&fit=crop",
            description="Crispy potato fries with seasoning",
            vendor_name="Fast Food"
        )
    ]
    
    for item in cart_items:
        db.add(item)
    
    db.commit()
    print("✅ Mock cart data added to database")

def initialize_mock_data():
    """Initialize database with mock data"""
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created")
        
        # Add mock data
        db = next(get_db())
        add_mock_users(db)
        add_mock_canteens(db)
        add_mock_menu_items(db)
        add_mock_cart_data(db)
        
        print("✅ All mock data added successfully")
    except Exception as e:
        print(f"❌ Error initializing mock data: {e}")

if __name__ == "__main__":
    initialize_mock_data()