import strawberry
from fastapi import Response
from fastapi import HTTPException
from jose import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
from app.core.database import get_db
from app.models.user import User
from app.models.user_types import UserType  # Import from a central location
from app.mutations.cart_mutations import CartMutation, CartMutationResponse
import strawberry

@strawberry.type
class LoginResponse:
    message: str
    user: UserType

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def login(self, info, username: str, password: str) -> LoginResponse:
        response: Response = info.context['response']
        
        db = next(get_db())

        try:
            user = db.query(User).filter(User.name == username).first()

            if not user or not pwd_context.verify(password, user.password):
                return LoginResponse(
                    message="Invalid credentials",
                    user=UserType(
                        id="0",
                        name=username,
                        email="",
                        role="unknown"
                    )
                )

            access_token = jwt.encode(
                {"user_id": user.id, "name": user.name, "role": user.role, "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)},
                JWT_SECRET, algorithm=ALGORITHM
            )

            refresh_token = jwt.encode(
                {"user_id": user.id, "role": user.role, "exp": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)},
                JWT_SECRET, algorithm=ALGORITHM
            )

            response.set_cookie(
                key="accessToken",
                value=access_token,
                secure=os.getenv("ENV") == "production",
                max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )

            response.set_cookie(
                key="refreshToken",
                value=refresh_token,
                secure=os.getenv("ENV") == "production",
                max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
            )

            return LoginResponse(
                message="Login successful",
                user=UserType(
                    id=user.id,
                    name=user.name,
                    email=user.email,
                    role=user.role
                )
            )

        except Exception as e:
            print("Login error:", e)
            return LoginResponse(
                message="Internal error occurred",
                user=UserType(
                    id="0",
                    name=username,
                    email="",
                    role="unknown"
                )
            )

@strawberry.type
class RootMutation:
    login: LoginResponse = strawberry.field(resolver=Mutation.login)
    add_to_cart: CartMutationResponse = strawberry.field(resolver=CartMutation.add_to_cart)
    update_cart_item: CartMutationResponse = strawberry.field(resolver=CartMutation.update_cart_item)
    remove_from_cart: CartMutationResponse = strawberry.field(resolver=CartMutation.remove_from_cart)
    clear_cart: CartMutationResponse = strawberry.field(resolver=CartMutation.clear_cart)
