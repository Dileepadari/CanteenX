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
from app.models.order import Order

def add_mock_users(db: Session):
    """Add mock users to the database"""
    users = [
        User(
            id=1,
            name="Aryan Kumar",
            email="aryan.kumar@example.edu",
            role="student",
            favoriteCanteens=[1, 2],  # Will be automatically converted to JSON
            recentOrders=[1001, 1002]  # Will be automatically converted to JSON
        ),
        User(
            id=2,
            name="Admin User",
            email="admin@example.edu",
            role="admin",
            favoriteCanteens=[],
            recentOrders=[]
        )
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
        Canteen(
            id=1,
            name="Himalaya Food Court",
            image="/placeholder.svg",
            location="Near Academic Block",
            rating=4.5,
            openTime="08:00",
            closeTime="22:00",
            isOpen=True,
            description="Multi-cuisine restaurant offering a variety of dishes from across India.",
            phone="040-23456789",
            userId=2
        ),
        Canteen(
            id=2,
            name="Vindhya Canteen",
            image="/placeholder.svg",
            location="Vindhya Building Ground Floor",
            rating=4.2,
            openTime="09:00",
            closeTime="21:00",
            isOpen=True,
            description="Fast food and quick bites for students on the go.",
            phone="040-23456788",
            userId=2
        ),
        Canteen(
            id=3,
            name="Faculty Dining",
            image="/placeholder.svg",
            location="Admin Block",
            rating=4.8,
            openTime="08:30",
            closeTime="20:30",
            isOpen=True,
            description="Premium dining experience with table service and gourmet options.",
            phone="040-23456787",
            userId=2
        ),
        Canteen(
            id=4,
            name="South Campus Cafeteria",
            image="/placeholder.svg",
            location="South Campus Main Building",
            rating=3.9,
            openTime="08:00",
            closeTime="21:00",
            isOpen=False,
            description="Budget-friendly meals with a focus on South Indian cuisine.",
            phone="040-23456786",
            userId=2
        ),
        Canteen(
            id=5,
            name="Night Canteen",
            image="/placeholder.svg",
            location="Hostel Complex",
            rating=4.0,
            openTime="18:00",
            closeTime="03:00",
            isOpen=True,
            description="Late night food options for hostel students. Popular for midnight snacks.",
            phone="040-23456785",
            userId=2
        )
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
            id=101,
            canteenId=1,
            canteenName="Faculty Lounge",
            name="Masala Dosa",
            description="Crispy rice crepe filled with spiced potato mixture, served with sambar and chutney",
            price=60,
            category="Breakfast",
            image="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=2070&auto=format&fit=crop",
            tags=["South Indian", "Vegetarian"],
            rating=4.5,
            ratingCount=120,
            isAvailable=True,
            preparationTime=15,
            isPopular=True,
            customizationOptions={
                "sizes": [
                    {"name": "small", "price": 50},
                    {"name": "medium", "price": 60},
                    {"name": "large", "price": 70}
                ],
                "additions": [
                    {"name": "Extra Chutney", "price": 10},
                    {"name": "Ghee Roast", "price": 15}
                ],
                "removals": ["Onions", "Green Chilies"]
            }
        ),
        MenuItem(
            id=102,
            canteenId=2,
            canteenName="Faculty Lounge",
            name="Chole Bhature",
            description="Spicy chickpea curry served with deep-fried bread",
            price=80,
            category="Lunch",
            image="https://images.unsplash.com/photo-1589352911312-5d218efc96be?q=80&w=1974&auto=format&fit=crop",
            tags=["North Indian", "Vegetarian"],
            rating=4.3,
            ratingCount=95,
            isAvailable=True,
            preparationTime=20,
            isPopular=True,
            customizationOptions={
                "sizes": [
                    {"name": "small", "price": 70},
                    {"name": "medium", "price": 80},
                    {"name": "large", "price": 90}
                ],
                "additions": [
                    {"name": "Extra Bhature", "price": 20},
                    {"name": "Onions on Side", "price": 0}
                ],
                "removals": ["Spices"]
            }
        ),
        MenuItem(
            id=103,
            canteenId=1,
            canteenName="Central Canteen",
            name="Chicken Biryani",
            description="Fragrant basmati rice cooked with chicken, spices, and herbs",
            price=120,
            category="Lunch",
            image="https://images.unsplash.com/photo-1589309736404-be8c25f8dea8?q=80&w=1974&auto=format&fit=crop",
            tags=["Hyderabadi", "Non-Vegetarian"],
            rating=4.7,
            ratingCount=150,
            isAvailable=True,
            preparationTime=30,
            isPopular=True,
            customizationOptions={
                "sizes": [
                    {"name": "small", "price": 100},
                    {"name": "medium", "price": 120},
                    {"name": "large", "price": 140}
                ],
                "additions": [
                    {"name": "Extra Raita", "price": 15},
                    {"name": "Extra Spicy", "price": 0}
                ],
                "removals": ["Coriander"]
            }
        ),
        MenuItem(
            id=104,
            canteenId=1,
            canteenName="Central Canteen",
            name="Veg Pulao",
            description="Basmati rice cooked with mixed vegetables and mild spices",
            price=90,
            category="Dinner",
            image="https://images.unsplash.com/photo-1596797038530-2c107aa4606c?q=80&w=1935&auto=format&fit=crop",
            tags=["North Indian", "Vegetarian"],
            rating=4.0,
            ratingCount=80,
            isAvailable=False,
            preparationTime=25,
            isPopular=False,
            customizationOptions={
                "sizes": [
                    {"name": "small", "price": 80},
                    {"name": "medium", "price": 90},
                    {"name": "large", "price": 100}
                ],
                "additions": [{"name": "Extra Raita", "price": 15}],
                "removals": ["Peas"]
            }
        )
    ]
    
    for item in menu_items:
        db_item = db.query(MenuItem).filter(MenuItem.id == item.id).first()
        if not db_item:
            db.add(item)
    
    db.commit()
    print("✅ Mock menu items added to database")

def add_mock_orders(db: Session):
    """Add mock orders to the database"""
    orders = [
        Order(
            id=1001,
            userId=1,
            canteenId=1,
            items=[
                {
                    "itemId": 1,
                    "quantity": 2,
                    "customizations": ["Extra Cheese", "No Onion"],
                    "note": "Make it spicy please"
                },
                {
                    "itemId": 3,
                    "quantity": 1,
                    "customizations": [],
                    "note": ""
                }
            ],
            totalAmount=300,
            status="delivered",
            orderTime="2025-04-17T12:30:00",
            confirmedTime="2025-04-17T12:32:00",
            preparingTime="2025-04-17T12:35:00",
            readyTime="2025-04-17T12:45:00",
            deliveryTime="2025-04-17T12:50:00",
            paymentMethod="UPI",
            paymentStatus="Paid",
            customerNote="Please ensure the food is hot when delivered.",
            discount=0,
            phone="9876543210",
            pickupTime=None,
            isPreOrder=False,
            cancelledTime=None,
            cancellationReason=None
        ),
        Order(
            id=1002,
            userId=1,
            canteenId=2,
            items=[
                {
                    "itemId": 5,
                    "quantity": 1,
                    "customizations": ["No Cheese"],
                    "note": "Extra napkins please"
                }
            ],
            totalAmount=180,
            status="ready",
            orderTime="2025-04-18T10:15:00",
            confirmedTime="2025-04-18T10:17:00",
            preparingTime="2025-04-18T10:20:00",
            readyTime="2025-04-18T10:30:00",
            deliveryTime=None,
            paymentMethod="Wallet",
            paymentStatus="Paid",
            customerNote="",
            discount=0,
            phone="9876543210",
            pickupTime=None,
            isPreOrder=False,
            cancelledTime=None,
            cancellationReason=None
        )
    ]
    
    for order in orders:
        db_order = db.query(Order).filter(Order.id == order.id).first()
        if not db_order:
            db.add(order)
    
    db.commit()
    print("✅ Mock orders added to database")

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
        add_mock_orders(db)
        
        print("✅ All mock data added successfully")
    except Exception as e:
        print(f"❌ Error initializing mock data: {e}")

if __name__ == "__main__":
    initialize_mock_data()