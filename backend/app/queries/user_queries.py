import strawberry
from typing import List, Optional
from strawberry.types import Info
from sqlalchemy.orm import Session

from app.models.user import User, UserType
from app.helpers.permissions import IsAuthenticated

@strawberry.type
class UserQueries:
    @strawberry.field(permission_classes=[IsAuthenticated])
    def get_user_by_id(self, user_id: str, info: Info) -> Optional[UserType]:
        """Get a specific user by their ID.

        Accepts user_id as a string (UUID) or a numeric value from legacy callers;
        the value is coerced to string before querying to avoid SQL type errors
        when the DB column is VARCHAR/UUID.
        """
        db: Session = info.context["db"]
        # coerce to string to avoid comparisons between varchar and int
        return db.query(User).filter(User.id == str(user_id)).first()

    @strawberry.field(permission_classes=[IsAuthenticated])
    def get_user_by_email(self, email: str, info: Info) -> Optional[UserType]:
        """Get a specific user by their email address."""
        db: Session = info.context["db"]
        return db.query(User).filter(User.email == email).first()

    @strawberry.field(permission_classes=[IsAuthenticated])
    def get_users_by_role(self, role: str, info: Info) -> List[UserType]:
        """Get a list of all users with a specific role."""
        db: Session = info.context["db"]
        return db.query(User).filter(User.role == role).all()

    @strawberry.field(permission_classes=[IsAuthenticated])
    def search_users(self, query: str, info: Info) -> List[UserType]:
        """Search for users by name or email."""
        db: Session = info.context["db"]
        search_filter = f"%{query}%"
        return db.query(User).filter(
            (User.name.ilike(search_filter)) |
            (User.email.ilike(search_filter))
        ).all()

    @strawberry.field
    def get_current_user(self, info: Info) -> Optional[UserType]:
        """Return the current authenticated user or None if unauthenticated."""
        # This resolver already followed the correct pattern.
        user = info.context.get("user")
        return user