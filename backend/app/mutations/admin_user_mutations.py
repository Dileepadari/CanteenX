import strawberry
from strawberry.types import Info
from sqlalchemy.orm import Session
from graphql import GraphQLError
import uuid
from passlib.context import CryptContext
from typing import List

from app.models.user import User, UserType

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _ensure_admin(db: Session, user) -> None:
    if not user or getattr(user, "role", None) != "admin":
        raise GraphQLError("Unauthorized: admin privileges required.")


@strawberry.type
class AdminUserMutations:
    @strawberry.mutation
    def create_vendor(self, info: Info, name: str, email: str, password: str, role: str = "vendor") -> UserType:
        """Admin-only: create a vendor or staff user with given role."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        _ensure_admin(db, current_user)

        existing = db.query(User).filter((User.email == email) | (User.name == name)).first()
        if existing:
            raise GraphQLError("User with this email or name already exists.")

        hashed = pwd_context.hash(password)
        new_user = User(id=str(uuid.uuid4()), name=name, email=email, password=hashed, role=role)
        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
        except Exception as e:
            db.rollback()
            raise GraphQLError(f"Failed to create user: {e}")

        return new_user

    @strawberry.mutation
    def update_user(self, info: Info, user_id: str, name: str | None = None, email: str | None = None, role: str | None = None) -> UserType:
        """Admin-only: update another user's basic fields."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        _ensure_admin(db, current_user)

        user = db.query(User).filter(User.id == str(user_id)).first()
        if not user:
            raise GraphQLError("User not found")

        if name is not None:
            user.name = name
        if email is not None:
            user.email = email
        if role is not None:
            user.role = role

        try:
            db.commit()
            db.refresh(user)
        except Exception as e:
            db.rollback()
            raise GraphQLError(f"Failed to update user: {e}")

        return user

    @strawberry.mutation
    def delete_user(self, info: Info, user_id: str) -> str:
        """Admin-only: delete a user."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        _ensure_admin(db, current_user)

        user = db.query(User).filter(User.id == str(user_id)).first()
        if not user:
            raise GraphQLError("User not found")

        try:
            db.delete(user)
            db.commit()
        except Exception as e:
            db.rollback()
            raise GraphQLError(f"Failed to delete user: {e}")

        return "User deleted"

    @strawberry.mutation
    def assign_staff_to_canteen(self, info: Info, canteen_id: int, user_ids: List[str]) -> str:
        """Admin-only: assign multiple users (staff/vendors) to a canteen."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        _ensure_admin(db, current_user)

        from app.models.canteen import Canteen
        from app.models.user import User

        canteen = db.query(Canteen).filter(Canteen.id == int(canteen_id)).first()
        if not canteen:
            raise GraphQLError("Canteen not found")

        added = 0
        for uid in user_ids:
            user = db.query(User).filter(User.id == str(uid)).first()
            if user and user not in canteen.staff:
                canteen.staff.append(user)
                added += 1

        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise GraphQLError(f"Failed to assign staff: {e}")

        return f"Assigned {added} users to canteen {canteen_id}"

    @strawberry.mutation
    def remove_staff_from_canteen(self, info: Info, canteen_id: int, user_ids: List[str]) -> str:
        """Admin-only: remove multiple users from a canteen's staff list."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        _ensure_admin(db, current_user)

        from app.models.canteen import Canteen
        from app.models.user import User

        canteen = db.query(Canteen).filter(Canteen.id == int(canteen_id)).first()
        if not canteen:
            raise GraphQLError("Canteen not found")

        removed = 0
        for uid in user_ids:
            user = db.query(User).filter(User.id == str(uid)).first()
            if user and user in canteen.staff:
                try:
                    canteen.staff.remove(user)
                    removed += 1
                except ValueError:
                    pass

        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise GraphQLError(f"Failed to remove staff: {e}")

        return f"Removed {removed} users from canteen {canteen_id}"
