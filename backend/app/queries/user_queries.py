import strawberry
from typing import List, Optional
from app.models.user import User
from app.core.database import get_db
from app.models.user_types import UserType
from jose import jwt

@strawberry.type
class UserQuery:
    @strawberry.field
    def get_user_by_id(self, id: int) -> Optional[UserType]:
        """Get user by ID"""
        db = next(get_db())
        user = db.query(User).filter(User.id == id).first()
        if not user:
            return None
            
        # Convert user dictionary to UserType, handling new fields
        user_dict = user.__dict__.copy()
        return UserType(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            favoriteCanteens=user.favoriteCanteens,
            recentOrders=user.recentOrders,
            profilePicture=getattr(user, 'profile_pic', None),
            isVegetarian=getattr(user, 'is_vegetarian', False),
            notifPrefs=getattr(user, 'notif_prefs', None)
        )

    @strawberry.field
    def get_user_by_email(self, email: str) -> Optional[UserType]:
        """Get user by email"""
        db = next(get_db())
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
            
        # Convert user dictionary to UserType, handling new fields
        return UserType(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            favoriteCanteens=user.favoriteCanteens,
            recentOrders=user.recentOrders,
            profilePicture=getattr(user, 'profile_pic', None),
            isVegetarian=getattr(user, 'is_vegetarian', False),
            notifPrefs=getattr(user, 'notif_prefs', None)
        )

    @strawberry.field
    def get_users_by_role(self, role: str) -> List[UserType]:
        """Get users by role"""
        db = next(get_db())
        users = db.query(User).filter(User.role == role).all()
        return [UserType(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            favoriteCanteens=user.favoriteCanteens,
            recentOrders=user.recentOrders,
            profilePicture=getattr(user, 'profile_pic', None),
            isVegetarian=getattr(user, 'is_vegetarian', False),
            notifPrefs=getattr(user, 'notif_prefs', None)
        ) for user in users]

    @strawberry.field
    def search_users(self, query: str) -> List[UserType]:
        """Search users by name or email"""
        db = next(get_db())
        users = db.query(User).filter(
            (User.name.ilike(f"%{query}%")) |
            (User.email.ilike(f"%{query}%"))
        ).all()
        return [UserType(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            favoriteCanteens=user.favoriteCanteens,
            recentOrders=user.recentOrders,
            profilePicture=getattr(user, 'profile_pic', None),
            isVegetarian=getattr(user, 'is_vegetarian', False),
            notifPrefs=getattr(user, 'notif_prefs', None)
        ) for user in users]
        
    @strawberry.field
    def get_current_user(self, info) -> Optional[UserType]:
        """Get current user from JWT token in cookies"""
        request = info.context["request"]
        cookies = request.headers.get("cookie", "")
        
        auth_header = None
        for cookie in cookies.split(";"):
            key, _, value = cookie.strip().partition("=")
            if key == "accessToken":
                auth_header = f"Bearer {value}"
                break

        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, key=None, options={"verify_signature": False})
            user_id = payload.get("user_id")
            if not user_id:
                return None
        except Exception:
            return None

        db = next(get_db())
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        return UserType(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            favoriteCanteens=user.favoriteCanteens,
            recentOrders=user.recentOrders,
            profilePicture=getattr(user, 'profile_pic', None),
            isVegetarian=getattr(user, 'is_vegetarian', False),
            notifPrefs=getattr(user, 'notif_prefs', None)
        )


# Export the query fields
queries = [
    strawberry.field(name="getUserById", resolver=UserQuery.get_user_by_id),
    strawberry.field(name="getUserByEmail", resolver=UserQuery.get_user_by_email),
    strawberry.field(name="getUsersByRole", resolver=UserQuery.get_users_by_role),
    strawberry.field(name="searchUsers", resolver=UserQuery.search_users),
    strawberry.field(name="getCurrentUser", resolver=UserQuery.get_current_user),
]