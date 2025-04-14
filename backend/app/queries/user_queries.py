import strawberry
from typing import List, Optional
from app.models.user import User

@strawberry.type
class UserType:
    id: int
    name: str
    email: str
    profile_picture: Optional[str] = None
    preferred_payment: Optional[str] = None

@strawberry.type
class UserProfileType:
    user: UserType
    favorite_canteen_id: Optional[int] = None
    dietary_preferences: List[str] = strawberry.field(default_factory=list)
    recent_orders: List[int] = strawberry.field(default_factory=list)

# Helper function to get mock user data (not a resolver)
def _get_mock_users() -> List[User]:
    # Mock data for users
    return [
        User(id=1, name="John Doe", email="john@example.com"),
        User(id=2, name="Jane Smith", email="jane@example.com"),
        User(id=3, name="Mike Johnson", email="mike@example.com"),
    ]

def resolve_get_users() -> List[UserType]:
    users = _get_mock_users()
    
    # Convert to UserType with additional mock fields
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

def resolve_get_user_by_id(user_id: int) -> Optional[UserType]:
    users = resolve_get_users()
    for user in users:
        if user.id == user_id:
            return user
    return None

def resolve_get_user_profile(user_id: int) -> Optional[UserProfileType]:
    user = resolve_get_user_by_id(user_id)
    if not user:
        return None
    
    # Mock profile data based on user id
    if user_id == 1:
        return UserProfileType(
            user=user,
            favorite_canteen_id=1,
            dietary_preferences=["Vegetarian", "Low Carb"],
            recent_orders=[101, 105, 108]
        )
    elif user_id == 2:
        return UserProfileType(
            user=user,
            favorite_canteen_id=2,
            dietary_preferences=["Halal"],
            recent_orders=[102, 106]
        )
    else:
        return UserProfileType(
            user=user,
            recent_orders=[103]
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