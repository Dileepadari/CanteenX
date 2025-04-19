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
from app.models.order import Order, OrderItem, OrderStep

def add_mock_users(db: Session):
    """Add mock users to the database"""
    users = [
        User(id="a1b2c3d4-e5f6-7890-abcd-ef1234567890", name="John Doe", email="john@example.com", password="hashedpassword", role="user", favoriteCanteens=[], recentOrders=[]),
        User(id="b2c3d4e5-f6a7-8901-bcde-f12345678901", name="Jane Smith", email="jane@example.com", password="hashedpassword", role="user", favoriteCanteens=[], recentOrders=[]),
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
            name="Central Canteen",
            image="/placeholder.svg",
            location="Main Building",
            rating=4.2,
            openTime="08:00",
            closeTime="20:00",
            isOpen=True,
            description="A popular spot for diverse meals.",
            phone="040-12345678",
            email="centralcanteen@canteen.com",
            schedule={
                "breakfast": "08:00 AM - 10:00 AM",
                "lunch": "12:00 PM - 02:00 PM",
                "dinner": "07:00 PM - 09:00 PM",
                "regular": "08:00 AM - 09:00 PM",
                "evening": "04:00 PM - 06:00 PM",
                "night": None,
                "weekday": "08:00 AM - 09:00 PM",
                "weekend": "08:00 AM - 10:00 PM",
            },
            tags=["Popular", "Diverse"],
        ),
        Canteen(
            id=2,
            name="Library Cafe",
            image="/placeholder.svg",
            location="Library Building",
            rating=3.8,
            openTime="09:00",
            closeTime="18:00",
            isOpen=False,
            description="Cozy cafe near the library.",
            phone="040-87654321",
            email="librarycafe@canteen.com",
            schedule={
                "breakfast": "09:00 AM - 11:00 AM",
                "lunch": "12:30 PM - 02:30 PM",
                "dinner": None,
                "regular": "09:00 AM - 06:00 PM",
                "evening": "04:00 PM - 05:30 PM",
                "night": None,
                "weekday": "09:00 AM - 06:00 PM",
                "weekend": "10:00 AM - 04:00 PM",
            },
            tags=["Cozy", "Quiet"],
        ),
        Canteen(
            id=3,
            name="Tech Hub Canteen",
            image="/placeholder.svg",
            location="Technology Block",
            rating=4.5,
            openTime="07:30",
            closeTime="22:00",
            isOpen=True,
            description="Techies' favorite spot for quick bites.",
            phone="040-11223344",
            email="techhub@canteen.com",
            schedule={
                "breakfast": "07:30 AM - 09:30 AM",
                "lunch": "12:00 PM - 02:00 PM",
                "dinner": "07:00 PM - 10:00 PM",
                "regular": "07:30 AM - 10:00 PM",
                "evening": "05:00 PM - 07:00 PM",
                "night": None,
                "weekday": "07:30 AM - 10:00 PM",
                "weekend": "08:00 AM - 11:00 PM",
            },
            tags=["Tech", "Quick Bites"],
        ),
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
                    {"name": "large", "price": 70},
                ],
                "additions": [
                    {"name": "Extra Chutney", "price": 10},
                    {"name": "Ghee Roast", "price": 15},
                ],
                "removals": ["Onions", "Green Chilies"],
            },
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
                    {"name": "large", "price": 90},
                ],
                "additions": [
                    {"name": "Extra Bhature", "price": 20},
                    {"name": "Onions on Side", "price": 0},
                ],
                "removals": ["Spices"],
            },
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
                    {"name": "large", "price": 140},
                ],
                "additions": [
                    {"name": "Extra Raita", "price": 15},
                    {"name": "Extra Spicy", "price": 0},
                ],
                "removals": ["Coriander"],
            },
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
                    {"name": "large", "price": 100},
                ],
                "additions": [{"name": "Extra Raita", "price": 15}],
                "removals": ["Peas"],
            },
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
    cart1 = db.query(Cart).filter(Cart.userId == "a1b2c3d4-e5f6-7890-abcd-ef1234567890").first()
    if not cart1:
        cart1 = Cart(
            userId="a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            items=[
                {
                    "menuItemId": 1,
                    "quantity": 1,
                    "selectedSize": "Medium",
                    "selectedExtras": json.dumps(["Extra Paneer"]),
                    "specialInstructions": "Extra spicy",
                    "location": "Table 5",
                    "name": "Masala Dosa",
                    "price": 60.0,
                    "canteenId": 1,
                    "canteenName": "Central Canteen",
                    "customizations": json.dumps({
                        "size": "Medium",
                        "additions": ["Extra Paneer"],
                        "removals": ["Onions"],
                        "notes": "Extra spicy"
                    })
                },
                {
                    "menuItemId": 3,
                    "quantity": 2,
                    "selectedSize": "Large",
                    "selectedExtras": json.dumps(["Less Sugar", "Regular Ice"]),
                    "specialInstructions": "Extra cold",
                    "location": "Table 7",
                    "name": "Chicken Biryani",
                    "price": 120.0,
                    "canteenId": 1,
                    "canteenName": "Central Canteen",
                    "customizations": json.dumps({
                        "size": "Large",
                        "additions": ["Less Sugar", "Regular Ice"],
                        "removals": [],
                        "notes": "Extra cold"
                    })
                }
            ],
            createdAt=datetime.datetime.utcnow().isoformat(),
            updatedAt=datetime.datetime.utcnow().isoformat()
        )
        db.add(cart1)
    
    # Create cart for user 2
    cart2 = db.query(Cart).filter(Cart.userId == "b2c3d4e5-f6a7-8901-bcde-f12345678901").first()
    if not cart2:
        cart2 = Cart(
            userId="b2c3d4e5-f6a7-8901-bcde-f12345678901",
            items=[
                {
                    "menuItemId": 2,
                    "quantity": 2,
                    "selectedSize": "Small",
                    "selectedExtras": json.dumps(["Extra Chutney"]),
                    "specialInstructions": "Extra crispy",
                    "location": "Table 3",
                    "name": "Chole Bhature",
                    "price": 80.0,
                    "canteenId": 2,
                    "canteenName": "Library Cafe",
                    "customizations": json.dumps({
                        "size": "Small",
                        "additions": ["Extra Chutney"],
                        "removals": [],
                        "notes": "Extra crispy"
                    })
                },
                {
                    "menuItemId": 5,
                    "quantity": 1,
                    "selectedSize": "Medium",
                    "selectedExtras": json.dumps(["Extra Salt", "Ketchup"]),
                    "specialInstructions": "Extra crispy",
                    "location": "Table 1",
                    "name": "Veg Pulao",
                    "price": 90.0,
                    "canteenId": 2,
                    "canteenName": "Library Cafe",
                    "customizations": json.dumps({
                        "size": "Medium",
                        "additions": ["Extra Salt", "Ketchup"],
                        "removals": [],
                        "notes": "Extra crispy"
                    })
                }
            ],
            createdAt=datetime.datetime.utcnow().isoformat(),
            updatedAt=datetime.datetime.utcnow().isoformat()
        )
        db.add(cart2)
    
    db.commit()
    print("✅ Mock cart data added to database")

def add_mock_orders(db: Session):
    """Add mock orders to the database"""
    # Clear existing order data
    db.query(OrderStep).delete()
    db.query(OrderItem).delete()
    db.query(Order).delete()
    
    # Active order for current date (April 17, 2025)
    active_order = Order(
        userId="a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        canteenId=1,
        totalAmount=450.00,
        status="Processing",
        orderTime=datetime.datetime.strptime("2025-04-16T12:15:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ").isoformat(),
        paymentMethod="Card",
        paymentStatus="Paid",
        phone="1234567890",
        pickupTime="12:45 PM",
        isPreOrder=False
    )
    db.add(active_order)
    db.flush()

    # Order steps for active order
    order_steps = [
        OrderStep(
            orderId=active_order.id,
            status="Order Placed",
            description="Your order has been received by the vendor.",
            time="12:15 PM",
            completed=1,
            current=0
        ),
        OrderStep(
            orderId=active_order.id,
            status="Preparing",
            description="The kitchen is preparing your food.",
            time="12:20 PM",
            completed=0,
            current=1
        ),
        OrderStep(
            orderId=active_order.id,
            status="Ready for Pickup",
            description="Your order is ready for pickup.",
            time="",
            completed=0,
            current=0
        ),
        OrderStep(
            orderId=active_order.id,
            status="Completed",
            description="Your order has been picked up.",
            time="",
            completed=0,
            current=0
        )
    ]
    for step in order_steps:
        db.add(step)
        
    # Order items for active order
    order_items = [
        OrderItem(
            orderId=active_order.id,
            itemId=1,
            quantity=1,
            customizations=json.dumps(["Extra Butter", "Medium Spicy"]),
            note="Make it extra creamy"
        ),
        OrderItem(
            orderId=active_order.id,
            itemId=2,
            quantity=2,
            customizations=json.dumps([]),
            note=""
        ),
        OrderItem(
            orderId=active_order.id,
            itemId=3,
            quantity=1,
            customizations=json.dumps(["Large Portion"]),
            note=""
        )
    ]
    for item in order_items:
        db.add(item)
    
    # Order history
    order_history1 = Order(
        userId="a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        canteenId=1,
        totalAmount=320.00,
        status="Completed",
        orderTime=datetime.datetime.strptime("2025-04-12T15:30:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ").isoformat(),
        paymentMethod="Card",
        paymentStatus="Paid",
        phone="1234567890",
        isPreOrder=False
    )
    db.add(order_history1)
    db.flush()
    
    order_history2 = Order(
        userId="a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        canteenId=2,
        totalAmount=280.00,
        status="Completed",
        orderTime=datetime.datetime.strptime("2025-04-10T13:15:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ").isoformat(),
        paymentMethod="Card",
        paymentStatus="Paid",
        phone="1234567890",
        isPreOrder=False
    )
    db.add(order_history2)
    db.flush()
    
    order_history3 = Order(
        userId="a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        canteenId=3,
        totalAmount=520.00,
        status="Cancelled",
        orderTime=datetime.datetime.strptime("2025-04-05T19:30:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ").isoformat(),
        cancelledTime=datetime.datetime.strptime("2025-04-05T19:40:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ").isoformat(),
        cancellationReason="Changed my mind",
        paymentMethod="Cash",
        paymentStatus="Refunded",
        phone="1234567890",
        isPreOrder=False
    )
    db.add(order_history3)
    db.flush()
    
    # Add items for first history order
    history_items1 = [
        OrderItem(
            orderId=order_history1.id,
            itemId=1,
            quantity=1,
            customizations=json.dumps(["Extra Spicy", "Regular Portion"]),
            note=""
        ),
        OrderItem(
            orderId=order_history1.id,
            itemId=2,
            quantity=2,
            customizations=json.dumps([]),
            note=""
        ),
        OrderItem(
            orderId=order_history1.id,
            itemId=3,
            quantity=1,
            customizations=json.dumps([]),
            note=""
        )
    ]
    
    # Add items for second history order
    history_items2 = [
        OrderItem(
            orderId=order_history2.id,
            itemId=4,
            quantity=1,
            customizations=json.dumps(["No Onions", "Extra Cheese"]),
            note=""
        ),
        OrderItem(
            orderId=order_history2.id,
            itemId=5,
            quantity=1,
            customizations=json.dumps(["Extra Salt"]),
            note=""
        ),
        OrderItem(
            orderId=order_history2.id,
            itemId=3,
            quantity=1,
            customizations=json.dumps([]),
            note=""
        )
    ]
    
    # Add items for third history order
    history_items3 = [
        OrderItem(
            orderId=order_history3.id,
            itemId=1,
            quantity=1,
            customizations=json.dumps(["Extra Veggies"]),
            note=""
        ),
        OrderItem(
            orderId=order_history3.id,
            itemId=2,
            quantity=1,
            customizations=json.dumps(["Dry", "Extra Spicy"]),
            note=""
        ),
        OrderItem(
            orderId=order_history3.id,
            itemId=3,
            quantity=1,
            customizations=json.dumps([]),
            note=""
        ),
        OrderItem(
            orderId=order_history3.id,
            itemId=4,
            quantity=1,
            customizations=json.dumps(["No Eggs"]),
            note=""
        )
    ]
    
    # Add all history order items
    for item in history_items1 + history_items2 + history_items3:
        db.add(item)
    
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
        add_mock_cart_data(db)
        add_mock_orders(db)
        
        print("✅ All mock data added successfully")
    except Exception as e:
        print(f"❌ Error initializing mock data: {e}")

if __name__ == "__main__":
    initialize_mock_data()