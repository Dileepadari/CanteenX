import strawberry
from fastapi import Response
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
from app.core.database import get_db
import uuid
from sqlalchemy.exc import SQLAlchemyError
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@strawberry.type
class UserType:
    id: int
    username: str
    email: str
    password: str
    role: str

@strawberry.type
class SignupResponse:
    message: str
    user: str
    success: bool

async def signup_resolver(username: str, email: str, password: str, role: str) -> SignupResponse :
    db = next(get_db())

    try:
        # Check if user exists
        existing_user = db.query(User).filter(
            (User.email == email) | (User.name == username)
        ).first()

        if existing_user:
            return SignupResponse(
                message="User with this email or username already exists",
                user=0,
                success=False
            )

        # Create new user
        hashed_password = pwd_context.hash(password)
        new_user = User(
            id=str(uuid.uuid4()),
            name=username,
            email=email,
            password=hashed_password,
            role=role
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return SignupResponse(
            message="User created successfully",
            user=str(new_user.id),
            success=True
        )

    except SQLAlchemyError as e:
        db.rollback()
        print("Signup error:", e)
        return SignupResponse(
            message="Internal server error",
            user=0,
            success=False
        )


signup = strawberry.field(name = "signup", resolver = signup_resolver)

queries = [
    signup
]