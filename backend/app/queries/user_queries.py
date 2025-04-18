import strawberry
from typing import List, Optional
from app.models.user import User
from app.core.database import get_db
from app.models.order import Order
from app.models.user_types import UserType  # Import from a central location

@strawberry.type
class UserProfileType:
    user: UserType
    favorite_canteen_id: Optional[int] = None
    dietary_preferences: List[str] = strawberry.field(default_factory=list)
    recent_orders: List[int] = strawberry.field(default_factory=list)

def resolve_get_users() -> List[UserType]:
    # Get database session
    db = next(get_db())
    
    # Query all users
    users = db.query(User).all()
    
    # Convert to UserType with additional default fields
    return [
        UserType(
            id=user.id,
            name=user.name,
            email=user.email,
            profile_picture=f"/assets/profiles/user{user.id}.jpg" if user.id < 3 else None,
            preferred_payment="Credit Card" if user.id == 1 else ("Mobile Payment" if user.id == 2 else None)
        )
        for user in users
    ]

def resolve_get_user_by_id(user_id: str) -> Optional[UserType]:
    # Get database session
    db = next(get_db())
    
    # Query for the specific user
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        return None
    
    # Convert to UserType with additional default fields
    return UserType(
        id=user.id,
        name=user.name,
        email=user.email,
        profile_picture=f"/assets/profiles/user{user.id}.jpg" if user.id < 3 else None,
        preferred_payment="Credit Card" if user.id == 1 else ("Mobile Payment" if user.id == 2 else None)
    )

def resolve_get_user_profile(user_id: str) -> Optional[UserProfileType]:
    # Get database session
    db = next(get_db())
    
    # Get the user
    user = resolve_get_user_by_id(user_id)
    if not user:
        return None
    
    # Mock dietary preferences based on user id (in a real app, this would be in a user_preferences table)
    dietary_preferences = []
    if user_id == 1:
        dietary_preferences = ["Vegetarian", "Low Carb"]
    elif user_id == 2:
        dietary_preferences = ["Halal"]
    
    # Get recent order IDs for the user
    recent_orders_query = db.query(Order.id).filter(Order.user_id == user_id).order_by(Order.date.desc()).limit(3)
    recent_order_ids = [int(order_id[0].replace("ORD", "")) for order_id in recent_orders_query.all()]
    
    # Create user profile
    return UserProfileType(
        user=user,
        favorite_canteen_id=1 if user_id == 1 else (2 if user_id == 2 else None), # Mock favorite canteen
        dietary_preferences=dietary_preferences,
        recent_orders=recent_order_ids
    )

# Create properly decorated fields with resolvers and matching frontend field names
getUsers = strawberry.field(name="getUsers", resolver=resolve_get_users)
getUserById = strawberry.field(name="getUserById", resolver=resolve_get_user_by_id)
getUserProfile = strawberry.field(name="getUserProfile", resolver=resolve_get_user_profile)

queries = [
    getUsers,
    getUserById,
    getUserProfile
]