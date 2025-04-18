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
        Canteen(id=1, name="Central Canteen", location="Main Building", openTime="08:00", closeTime="20:00"),
        Canteen(id=2, name="Library Cafe", location="Library Building", openTime="09:00", closeTime="18:00"),
        Canteen(id=3, name="Tech Hub Canteen", location="Technology Block", openTime="07:30", closeTime="22:00")
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
            price=180.0, image="https://images.unsplash.com/photo-1567188040759-fb8a254b3bd2?q=80&w=300&auto=format&fit=crop",
            category="Indian Delights", canteenId=1, isAvailable=True, tags=["Vegetarian"], isPopular=True
        ),
        MenuItem(
            id=2, name="Masala Dosa", description="Crispy crepe filled with spicy potato filling",
            price=80.0, image="https://images.unsplash.com/photo-1589301760014-d929f86731c7?q=80&w=300&auto=format&fit=crop",
            category="South Indian", canteenId=1, isAvailable=True, tags=["Vegetarian"], isPopular=False
        ),
        MenuItem(
            id=3, name="Cold Coffee", description="Refreshing cold coffee with ice cream",
            price=70.0, image="https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80&w=300&auto=format&fit=crop",
            category="Beverages", canteenId=2, isAvailable=True, tags=["Vegetarian"], isPopular=True
        ),
        MenuItem(
            id=4, name="Veg Burger", description="Delicious vegetable patty with fresh veggies",
            price=90.0, image="https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=300&auto=format&fit=crop",
            category="Fast Food", canteenId=3, isAvailable=True, tags=["Vegetarian"], isPopular=True
        ),
        MenuItem(
            id=5, name="French Fries", description="Crispy potato fries with seasoning",
            price=60.0, image="https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=300&auto=format&fit=crop",
            category="Fast Food", canteenId=3, isAvailable=True, tags=["Vegetarian"], isPopular=False
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
            createdAt=datetime.datetime.utcnow().isoformat(),
            updatedAt=datetime.datetime.utcnow().isoformat()
        )
        db.add(cart1)
        db.flush()  # Get the ID without committing
    
    # Clear any existing cart items for this cart
    db.query(CartItem).filter(CartItem.cartId == cart1.id).delete()
    
    # Add items to cart 1
    cart_items = [
        CartItem(
            cartId=cart1.id,
            menuItemId=1,
            quantity=1,
            selectedExtras=json.dumps({
                "Spice Level": "Medium",
                "Extra Paneer": True
            }),
            specialInstructions="Extra spicy"
        ),
        CartItem(
            cartId=cart1.id,
            menuItemId=3,
            quantity=2,
            selectedExtras=json.dumps({
                "Sugar": "Less",
                "Ice": "Regular"
            }),
            specialInstructions="Extra cold"
        ),
        CartItem(
            cartId=cart1.id,
            menuItemId=4,
            quantity=1,
            selectedExtras=json.dumps({
                "Extra Cheese": True,
                "No Onion": True
            }),
            specialInstructions="Well done"
        )
    ]
    
    for item in cart_items:
        db.add(item)
    
    # Create cart for user 2
    cart2 = db.query(Cart).filter(Cart.userId == "b2c3d4e5-f6a7-8901-bcde-f12345678901").first()
    if not cart2:
        cart2 = Cart(
            userId="b2c3d4e5-f6a7-8901-bcde-f12345678901",
            createdAt=datetime.datetime.utcnow().isoformat(),
            updatedAt=datetime.datetime.utcnow().isoformat()
        )
        db.add(cart2)
        db.flush()  # Get the ID without committing
    
    # Clear any existing cart items for this cart
    db.query(CartItem).filter(CartItem.cartId == cart2.id).delete()
    
    # Add items to cart 2
    cart_items = [
        CartItem(
            cartId=cart2.id,
            menuItemId=2,
            quantity=2,
            selectedExtras=json.dumps({
                "Extra Chutney": True
            }),
            specialInstructions="Extra crispy"
        ),
        CartItem(
            cartId=cart2.id,
            menuItemId=5,
            quantity=1,
            selectedExtras=json.dumps({
                "Extra Salt": True,
                "Sauce": "Ketchup"
            }),
            specialInstructions="Extra crispy"
        )
    ]
    
    for item in cart_items:
        db.add(item)
    
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