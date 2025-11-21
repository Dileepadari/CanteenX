import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from passlib.context import CryptContext

# It's crucial to adjust the import paths if this script is in a 'scripts' directory
# You may need to add the project root to the PYTHONPATH
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import engine, Base, SessionLocal
from app.models.canteen import Canteen
from app.models.menu_item import MenuItem
from app.models.user import User, user_favorite_canteen_association
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem, OrderStep
from app.models.payment import Merchant, Payment, UserWallet
# FIX: Import the missing Complaint model
from app.models.complaints import Complaint

# Use the same password context as the application
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Developer-friendly passwords (override with environment variables in dev)
DEV_STUDENT_PASSWORD = os.getenv("DEV_STUDENT_PASSWORD", "password123")
DEV_ADMIN_PASSWORD = os.getenv("DEV_ADMIN_PASSWORD", "adminpassword")
DEV_VENDOR_PASSWORD = os.getenv("DEV_VENDOR_PASSWORD", "vendorpass")

def add_mock_users(db: Session):
    """Adds mock users with hashed passwords and creates wallets for them."""
    print("Seeding users and wallets...")
    users_data = [
            {"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "name": "John Doe", "email": "john@example.com", "password": DEV_STUDENT_PASSWORD, "role": "student"},
            {"id": "b2c3d4e5-f6a7-8901-bcde-f12345678901", "name": "Jane Smith", "email": "jane@example.com", "password": DEV_STUDENT_PASSWORD, "role": "student"},
            {"id": "c3d4e5f6-a7b8-9012-cdef-123456789012", "name": "Admin User", "email": "admin@example.com", "password": DEV_ADMIN_PASSWORD, "role": "admin"},
        {"id": "d4e5f6a7-b8c9-0123-def1-234567890123", "name": "Vendor North", "email": "dileepkumar.adari@students.iiit.ac.in", "password": DEV_VENDOR_PASSWORD, "role": "vendor"},
    ]
    
    for user_data in users_data:
        existing_user = db.query(User).filter(User.id == user_data["id"]).first()
        hashed_password = pwd_context.hash(user_data["password"])
        if not existing_user:
            db.add(User(**{k:v for k,v in user_data.items() if k != 'password'}, password=hashed_password))
        else:
            # Ensure existing user's password and role are in sync with mock data for dev convenience
            existing_user.password = hashed_password
            existing_user.role = user_data.get("role", existing_user.role)
            existing_user.email = user_data.get("email", existing_user.email)
            db.add(existing_user)
    db.commit()

    for user_data in users_data:
        uid = user_data["id"]
        if not db.query(UserWallet).filter(UserWallet.user_id == uid).first():
            balance = 250.0 if user_data["role"] == "student" else 1000.0
            db.add(UserWallet(user_id=uid, balance=balance))
    db.commit()
    print("✅ Users and wallets seeded.")
    # Print developer credentials to make local login easier (only in dev)
    try:
        print("\n--- Dev seeded user credentials ---")
        for u in users_data:
            print(f"{u['email']} -> {u['password']}")
        print("--- End credentials ---\n")
    except Exception:
        pass

def add_mock_canteens(db: Session):
    """Adds a diverse set of mock canteens."""
    print("Seeding canteens...")
    canteens_data = [
        {
            "id": 1, "name": "Central Canteen", "location": "Main Building", "rating": 4.2,
            "open_time": datetime.time(8, 0), "close_time": datetime.time(20, 0), "is_open": True,
            "description": "A popular spot for diverse meals.", "phone": "040-12345678",
            "email": "centralcanteen@example.com", "user_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
            "schedule": {"breakfast": "08:00-10:00", "lunch": "12:00-14:00"}, "tags": ["Popular", "Diverse"]
        },
        {
            "id": 2, "name": "Library Cafe", "location": "Library Building", "rating": 3.8,
            "open_time": datetime.time(9, 0), "close_time": datetime.time(18, 0), "is_open": False,
            "description": "Cozy cafe near the library.", "phone": "040-87654321",
            "email": "librarycafe@example.com", "user_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
            "schedule": {"regular": "09:00-18:00"}, "tags": ["Cozy", "Quiet"]
        },
        {
            "id": 3, "name": "South Block Eatery", "location": "South Block", "rating": 4.5,
            "open_time": datetime.time(7, 0), "close_time": datetime.time(21, 0), "is_open": True,
            "description": "Authentic south Indian breakfast and meals.", "phone": "040-55551234",
            "email": "southcanteen@example.com", "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "schedule": {"breakfast": "07:00-10:30", "lunch": "12:00-14:00"}, "tags": ["South Indian", "Breakfast"]
        },
        {
            "id": 4, "name": "North Spices", "location": "North Block", "rating": 4.3,
            "open_time": datetime.time(11, 0), "close_time": datetime.time(22, 0), "is_open": True,
            "description": "Hearty North Indian meals and snacks.", "phone": "040-55559876",
            "email": "northcanteen@example.com", "user_id": "d4e5f6a7-b8c9-0123-def1-234567890123",
            "schedule": {"regular": "11:00-22:00"}, "tags": ["North Indian", "Dinner"]
        },
    ]
    
    for canteen_data in canteens_data:
        if not db.query(Canteen).filter(Canteen.id == canteen_data["id"]).first():
            db.add(Canteen(**canteen_data))
    db.commit()
    print("✅ Canteens seeded.")

def add_mock_menu_items(db: Session):
    """Adds a large, diverse set of mock menu items."""
    print("Seeding menu items...")
    menu_items_data = [
        {
            "id": 101,
            "canteen_id": 3,
            "name": "Masala Dosa",
            "price": 60,
            "description": "Crispy dosa served with sambar and chutney.",
            "image": "/public/placeholder.svg",
            "category": "Breakfast",
            "tags": ["South Indian", "Vegetarian", "Breakfast"],
            "rating": 4.5,
            "rating_count": 120,
            "is_available": True,
            "is_featured": True,
            "is_popular": True,
            "preparation_time": 12,
            "customization_options": {"sizes": [], "additions": [{"name": "Extra Masala", "price": 10}], "removals": [], "notes_allowed": True},
            "stock_count": 50
        },
        {
            "id": 102,
            "canteen_id": 2,
            "name": "Espresso Coffee",
            "price": 80,
            "description": "Strong espresso shot, served hot.",
            "image": "/public/placeholder.svg",
            "category": "Beverage",
            "tags": ["Beverage", "Quick Bite"],
            "rating": 4.1,
            "rating_count": 80,
            "is_available": True,
            "is_featured": False,
            "is_popular": True,
            "preparation_time": 5,
            "customization_options": {"sizes": [{"name": "Small", "price": 0}, {"name": "Large", "price": 20}], "additions": [{"name": "Extra Shot", "price": 15}], "removals": [], "notes_allowed": False},
            "stock_count": 100
        },
        {
            "id": 103,
            "canteen_id": 1,
            "name": "Chicken Biryani",
            "price": 120,
            "description": "Aromatic chicken biryani with long-grain rice and spices.",
            "image": "/public/placeholder.svg",
            "category": "Lunch",
            "tags": ["Non-Vegetarian", "Rice"],
            "rating": 4.6,
            "rating_count": 200,
            "is_available": True,
            "is_featured": True,
            "is_popular": True,
            "preparation_time": 25,
            "customization_options": {"sizes": [{"name": "Regular", "price": 0}, {"name": "Large", "price": 40}], "additions": [{"name": "Raita", "price": 20}], "removals": [], "notes_allowed": True},
            "stock_count": 30
        },
        {
            "id": 104,
            "canteen_id": 4,
            "name": "Paneer Butter Masala",
            "price": 140,
            "description": "Rich paneer curry in a creamy tomato gravy.",
            "image": "/public/placeholder.svg",
            "category": "Main Course",
            "tags": ["Vegetarian", "North Indian"],
            "rating": 4.4,
            "rating_count": 95,
            "is_available": True,
            "is_featured": False,
            "is_popular": True,
            "preparation_time": 20,
            "customization_options": {"sizes": [{"name": "Half", "price": 0}, {"name": "Full", "price": 60}], "additions": [], "removals": ["Onion"], "notes_allowed": True},
            "stock_count": 20
        },
        {
            "id": 105,
            "canteen_id": 3,
            "name": "Idli Sambar",
            "price": 50,
            "description": "Soft idlis served with sambar and coconut chutney.",
            "image": "/public/placeholder.svg",
            "category": "Breakfast",
            "tags": ["South Indian", "Vegetarian"],
            "rating": 4.3,
            "rating_count": 60,
            "is_available": True,
            "is_featured": False,
            "is_popular": True,
            "preparation_time": 10,
            "customization_options": {"sizes": [], "additions": [], "removals": [], "notes_allowed": True},
            "stock_count": 60
        },
        {
            "id": 106,
            "canteen_id": 4,
            "name": "Chole Bhature",
            "price": 110,
            "description": "Spicy chickpea curry served with fried bhature.",
            "image": "/public/placeholder.svg",
            "category": "Lunch",
            "tags": ["North Indian", "Spicy"],
            "rating": 4.2,
            "rating_count": 50,
            "is_available": True,
            "is_featured": False,
            "is_popular": True,
            "preparation_time": 18,
            "customization_options": {"sizes": [], "additions": [{"name": "Extra Chole", "price": 30}], "removals": [], "notes_allowed": True},
            "stock_count": 15
        },
        {
            "id": 107,
            "canteen_id": 2,
            "name": "Veg Sandwich",
            "price": 70,
            "description": "Toasted sandwich with fresh vegetables and chutney.",
            "image": "/public/placeholder.svg",
            "category": "Snack",
            "tags": ["Vegetarian", "Quick Bite"],
            "rating": 4.0,
            "rating_count": 40,
            "is_available": True,
            "is_featured": False,
            "is_popular": False,
            "preparation_time": 8,
            "customization_options": {"sizes": [], "additions": [{"name": "Cheese", "price": 15}], "removals": [], "notes_allowed": True},
            "stock_count": 80
        },
        {
            "id": 108,
            "canteen_id": 1,
            "name": "Lassi",
            "price": 40,
            "description": "Refreshing sweet lassi.",
            "image": "/public/placeholder.svg",
            "category": "Beverage",
            "tags": ["Beverage", "Sweet"],
            "rating": 4.1,
            "rating_count": 150,
            "is_available": True,
            "is_featured": False,
            "is_popular": True,
            "preparation_time": 4,
            "customization_options": {"sizes": [{"name": "Regular", "price": 0}, {"name": "Large", "price": 20}], "additions": [], "removals": [], "notes_allowed": False},
            "stock_count": 120
        },
    ]
    
    for item_data in menu_items_data:
        existing = db.query(MenuItem).filter(MenuItem.id == item_data["id"]).first()
        if not existing:
            db.add(MenuItem(**item_data))
        else:
            # Update existing record fields so seeding is idempotent and
            # fills in newly added columns like stock_count, customization_options, etc.
            for k, v in item_data.items():
                # Only set attributes that actually exist on the model/table
                if hasattr(existing, k):
                    setattr(existing, k, v)
            db.add(existing)
    db.commit()
    print("✅ Menu items seeded.")
    
def add_mock_favorite_canteens(db: Session):
    """Populates the many-to-many relationship for favorite canteens."""
    print("Seeding favorite canteens...")
    user_john = db.query(User).filter(User.email == "john@example.com").first()
    user_jane = db.query(User).filter(User.email == "jane@example.com").first()
    canteen_central = db.query(Canteen).filter(Canteen.id == 1).first()
    canteen_south = db.query(Canteen).filter(Canteen.id == 3).first()
    
    if user_john and canteen_central and canteen_central not in user_john.favorite_canteens:
        user_john.favorite_canteens.append(canteen_central)
    if user_jane and canteen_south and canteen_south not in user_jane.favorite_canteens:
        user_jane.favorite_canteens.append(canteen_south)
        
    db.commit()
    print("✅ Favorite canteens seeded.")

def add_mock_carts(db: Session):
    """Seeds normalized cart data for multiple users."""
    print("Seeding carts...")
    users_data = [
        {"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "items": [
            {"menu_item_id": 101, "quantity": 1, "customizations": {"notes": "Extra spicy"}},
            {"menu_item_id": 103, "quantity": 2, "customizations": {"notes": "Less oil"}}
        ]},
        {"id": "b2c3d4e5-f6a7-8901-bcde-f12345678901", "items": [
            {"menu_item_id": 106, "quantity": 1},
            {"menu_item_id": 104, "quantity": 1}
        ]}
    ]

    for user_data in users_data:
        existing_cart = db.query(Cart).filter(Cart.user_id == user_data["id"]).first()
        if existing_cart:
            db.delete(existing_cart)
            db.commit()
        
        cart = Cart(user_id=user_data["id"])
        db.add(cart)
        db.flush()

        for item_data in user_data["items"]:
            db.add(CartItem(cart_id=cart.id, **item_data))
    
    db.commit()
    print("✅ Carts seeded.")

def add_mock_orders_and_complaints(db: Session):
    """Seeds a variety of orders with different statuses and a related complaint."""
    print("Seeding orders and complaints...")
    user_john_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    user_jane_id = "b2c3d4e5-f6a7-8901-bcde-f12345678901"

    # Safely clear previous mock orders and related children for idempotency
    order_ids_to_delete = [row[0] for row in db.query(Order.id).filter(Order.user_id.in_([user_john_id, user_jane_id])).all()]
    if order_ids_to_delete:
        db.query(Complaint).filter(Complaint.order_id.in_(order_ids_to_delete)).delete(synchronize_session=False)
        db.query(OrderItem).filter(OrderItem.order_id.in_(order_ids_to_delete)).delete(synchronize_session=False)
        db.query(OrderStep).filter(OrderStep.order_id.in_(order_ids_to_delete)).delete(synchronize_session=False)
        # Ensure any payments linked to these orders are removed first to avoid FK violations
        try:
            from app.models.payment import Payment as _Payment
            db.query(_Payment).filter(_Payment.order_id.in_(order_ids_to_delete)).delete(synchronize_session=False)
        except Exception:
            # If Payment model isn't available for some reason, ignore and let cascade/constraints handle it in dev
            pass
        db.query(Order).filter(Order.id.in_(order_ids_to_delete)).delete(synchronize_session=False)
        db.commit()

    # Create a list of order data
    orders_data = [
        {
            "user_id": user_john_id, "canteen_id": 1, "total_amount": 280.00, "status": "preparing",
            "payment_method": "UPI", "payment_status": "Completed",
            "items": [{"item_id": 103, "quantity": 2}, {"item_id": 108, "quantity": 1}]
        },
        {
            "user_id": user_john_id, "canteen_id": 2, "total_amount": 150.00, "status": "completed",
            "payment_method": "WALLET", "payment_status": "Completed", "order_time": datetime.datetime.utcnow() - datetime.timedelta(days=1),
            "items": [{"item_id": 102, "quantity": 1}, {"item_id": 107, "quantity": 1}],
            "complaint": {"complaint_text": "The sandwich was missing tomatoes.", "heading": "Incorrect Item"}
        },
        {
            "user_id": user_jane_id, "canteen_id": 4, "total_amount": 250.00, "status": "cancelled",
            "payment_method": "CASH", "payment_status": "Refunded", "order_time": datetime.datetime.utcnow() - datetime.timedelta(days=2),
            "items": [{"item_id": 106, "quantity": 1}, {"item_id": 104, "quantity": 1}]
        }
    ]

    for order_data in orders_data:
        complaint_data = order_data.pop("complaint", None)
        items_data = order_data.pop("items", [])
        
        order = Order(**order_data)
        db.add(order)
        db.flush()

        for item_data in items_data:
            db.add(OrderItem(order_id=order.id, **item_data))
        
        if complaint_data:
            db.add(Complaint(user_id=order.user_id, order_id=order.id, **complaint_data))

    db.commit()
    print("✅ Orders and complaints seeded.")

def add_mock_merchants(db: Session):
    """Adds mock merchants for all canteens."""
    print("Seeding merchants...")
    all_canteens = db.query(Canteen).all()
    for canteen in all_canteens:
        if not db.query(Merchant).filter(Merchant.canteen_id == canteen.id).first():
            db.add(Merchant(
                canteen_id=canteen.id, name=f"{canteen.name} Merchant",
                razorpay_merchant_id=f"merchant_{canteen.id}",
                razorpay_key_id="rzp_test_YOUR_KEY_ID",
                razorpay_key_secret="rzp_test_YOUR_KEY_SECRET"
            ))
    db.commit()
    print("✅ Merchants seeded.")

def initialize_mock_data():
    """Initializes the database with all mock data in a single session."""
    print("--- Starting Database Seeding ---")
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified.")
        # Ensure DB schema includes new columns added in code (idempotent)
        try:
            # Add stock_count column if it doesn't exist (safe to run multiple times).
            # Use sqlalchemy.text() to execute a textual SQL expression explicitly.
            db.execute(text("ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 0;"))
            db.commit()
            print("✅ Ensured 'stock_count' column exists on menu_items.")
        except Exception as e:
            # If this fails, rollback and continue; later operations may still work if column is present.
            db.rollback()
            print(f"⚠️ Could not ensure 'stock_count' column: {e}")
        
        add_mock_users(db)
        add_mock_canteens(db)
        add_mock_menu_items(db)
        add_mock_favorite_canteens(db)
        add_mock_carts(db)
        add_mock_orders_and_complaints(db)
        add_mock_merchants(db)
        
        print("\n✅ All mock data seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"\n❌ An error occurred during seeding: {e}")
        raise
    finally:
        db.close()
        print("--- Database Seeding Finished ---")

if __name__ == "__main__":
    initialize_mock_data()