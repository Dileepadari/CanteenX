import strawberry
from typing import List, Optional
from passlib.context import CryptContext
import uuid
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from strawberry.types import Info
from graphql import GraphQLError

from app.models.user import User, UserType, RegisterUserInput, UpdateUserProfileInput

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@strawberry.type
class UserMutations:
    @strawberry.mutation
    def register_user(self, info: Info, input: RegisterUserInput) -> UserType:
        """
        Registers a new user. The role is defaulted to 'student'.
        Raises an error if the username or email is already taken.
        """
        db: Session = info.context["db"]

        # Check for existing user
        existing_user = db.query(User).filter(
            (User.email == input.email) | (User.name == input.username)
        ).first()
        if existing_user:
            raise GraphQLError("User with this email or username already exists.")

        # Always hash the password
        hashed_password = pwd_context.hash(input.password)
        
        new_user = User(
            id=str(uuid.uuid4()),
            name=input.username,
            email=input.email,
            password=hashed_password,
            role="student" # Default role for security
        )

        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
        except IntegrityError:
            db.rollback()
            raise GraphQLError("A database error occurred. The username or email might be taken.")
        
        return new_user

    @strawberry.mutation
    def update_user_profile(self, info: Info, input: UpdateUserProfileInput) -> UserType:
        """Updates the profile of the currently authenticated user."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        if not current_user:
            raise GraphQLError("Authentication required.")

        update_data = {k: v for k, v in input.__dict__.items() if v is not strawberry.UNSET}
        if not update_data:
            raise GraphQLError("No update data provided.")

        for key, value in update_data.items():
            if key == 'email':
                # Check if the new email is already taken by another user
                if db.query(User).filter(User.email == value, User.id != current_user.id).first():
                    raise GraphQLError("This email is already taken by another user.")
                current_user.email = value
            elif key == 'password':
                # Always hash the new password
                current_user.password = pwd_context.hash(value)
            else:
                setattr(current_user, key, value)
        
        db.commit()
        db.refresh(current_user)
        return current_user

    @strawberry.mutation
    def update_favorite_canteens(self, info: Info, canteen_ids: List[int]) -> UserType:
        """Updates the favorite canteens list for the currently authenticated user."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        if not current_user:
            raise GraphQLError("Authentication required.")

        current_user.favoriteCanteens = canteen_ids
        db.commit()
        db.refresh(current_user)
        return current_user

    @strawberry.mutation
    def delete_own_account(self, info: Info) -> str:
        """Deletes the account of the currently authenticated user."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        if not current_user:
            raise GraphQLError("Authentication required.")
            
        db.delete(current_user)
        db.commit()
        return "User account deleted successfully."

# Note: Admin-level mutations like deleting or updating *other* users
# should be in a separate class with specific admin-only permissions.