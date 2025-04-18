import strawberry
from typing import List, Optional
from app.models.user import User
from app.core.database import get_db

@strawberry.type
class UserType:
    id: int
    name: str
    email: str
    role: str
    favoriteCanteens: List[int]
    recentOrders: List[int]
    isActive: bool

@strawberry.type
class UserQuery:
    @strawberry.field
    def get_user_by_id(self, id: int) -> Optional[UserType]:
        """Get user by ID"""
        db = next(get_db())
        user = db.query(User).filter(User.id == id).first()
        return UserType(**user.__dict__) if user else None

    @strawberry.field
    def get_user_by_email(self, email: str) -> Optional[UserType]:
        """Get user by email"""
        db = next(get_db())
        user = db.query(User).filter(User.email == email).first()
        return UserType(**user.__dict__) if user else None

    @strawberry.field
    def get_users_by_role(self, role: str) -> List[UserType]:
        """Get users by role"""
        db = next(get_db())
        users = db.query(User).filter(User.role == role).all()
        return [UserType(**user.__dict__) for user in users]

    @strawberry.field
    def search_users(self, query: str) -> List[UserType]:
        """Search users by name or email"""
        db = next(get_db())
        users = db.query(User).filter(
            (User.name.ilike(f"%{query}%")) |
            (User.email.ilike(f"%{query}%"))
        ).all()
        return [UserType(**user.__dict__) for user in users]

queries = [
    strawberry.field(name="getUserById", resolver=UserQuery.get_user_by_id),
    strawberry.field(name="getUserByEmail", resolver=UserQuery.get_user_by_email),
    strawberry.field(name="getUsersByRole", resolver=UserQuery.get_users_by_role),
    strawberry.field(name="searchUsers", resolver=UserQuery.search_users),
]