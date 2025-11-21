import strawberry
import os
import uuid
from fastapi import Response
from passlib.context import CryptContext
from strawberry.types import Info
from sqlalchemy.orm import Session
from cas import CASClient
from urllib.parse import quote_plus
from graphql import GraphQLError

from app.core.database import get_db
from sqlalchemy import or_
from app.models.user import User, AuthResponse
from app.helpers.auth_utils import create_and_set_tokens

# --- Password Hashing Setup ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- CAS Client Setup ---
BASE_URL = os.getenv('BASE_URL', 'http://localhost')
SUBPATH = os.getenv('SUBPATH', '')
CAS_SERVER_URL = os.getenv('CAS_SERVER_URL', 'https://login-new.iiit.ac.in/cas/')
SERVICE_URL = os.getenv('SERVICE_URL', f'{BASE_URL}{SUBPATH}/cas')
REDIRECT_URL = os.getenv('REDIRECT_URL', f'{BASE_URL}{SUBPATH}/cas')

cas_client = CASClient(
    version=3,
    service_url=f"{SERVICE_URL}?next={quote_plus(REDIRECT_URL)}",
    server_url=CAS_SERVER_URL,
)

@strawberry.type
class AuthMutations:
    # --- Password-based Authentication ---

    @strawberry.mutation
    async def login(self, info: Info, username: str, password: str) -> AuthResponse:
        """
        Authenticates a user with a username and password. On success, sets
        httpOnly cookies and returns the user data.
        """
        response: Response = info.context["response"]
        db: Session = info.context["db"]

        # Allow login using either name or email (frontend sends email as username)
        user = db.query(User).filter(or_(User.name == username, User.email == username)).first()

        if not user or not pwd_context.verify(password, user.password):
            # Return a typed AuthResponse indicating failure so clients can inspect `success`.
            return AuthResponse(success=False, message="Invalid username or password", role=None, user=None)

        create_and_set_tokens(response, user.id, user.name, user.role)

        return AuthResponse(success=True, message="Login successful", role=user.role, user=user)

    # --- CAS-based Authentication ---

    @strawberry.mutation
    def initiate_cas_login(self) -> str:
        """
        Returns the CAS login URL for the client to redirect the user to.
        """
        return cas_client.get_login_url()

    @strawberry.mutation
    def verify_cas_ticket(self, info: Info, ticket: str) -> AuthResponse:
        """
        Verifies a CAS ticket after the user is redirected back. On success,
        creates the user if they don't exist, sets httpOnly cookies, and
        returns the user data.
        """
        response: Response = info.context["response"]
        db: Session = info.context["db"]

        try:
            cas_user, attributes, _ = cas_client.verify_ticket(ticket)

            if not cas_user:
                return AuthResponse(success=False, message="Invalid or expired CAS ticket.", role=None, user=None)

            # Extract user details from CAS attributes
            uid = attributes.get("uid")
            email = attributes.get("E-Mail")
            first_name = attributes.get("FirstName")
            
            if not uid or not email or not first_name:
                raise GraphQLError("CAS ticket is missing required user attributes (uid, email, FirstName).")

            # Find or create the user in our local database
            # Ensure uid is treated as a string (some CAS providers return numeric ids)
            db_user = db.query(User).filter(User.email == str(email)).first()

            if not db_user:
                db_user = User(id=uid, name=first_name, email=email, role="student")
                db.add(db_user)
                db.commit()
                db.refresh(db_user)

            # Create and set session tokens
            create_and_set_tokens(response, db_user.id, db_user.name, db_user.role)

            return AuthResponse(success=True, message="Login successful", role=db_user.role, user=db_user)

        except Exception as e:
            # Catch any other exceptions during the process (e.g., database error)
            db.rollback()
            # It's often better to log the specific error `e` and return a generic message
            return AuthResponse(success=False, message="An unexpected error occurred during CAS verification.", role=None, user=None)

    # --- Session Management ---

    @strawberry.mutation
    async def logout(self, info: Info) -> str:
        """
        Logs out the current user by deleting their session cookies.
        """
        response: Response = info.context["response"]
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return "Logout successful"

    @strawberry.mutation
    def signup(self, info: Info, name: str, email: str, password: str) -> AuthResponse:
        """
        Simple signup endpoint for frontend clients that expect a `signup` mutation.
        Registers the user, sets session cookies, and returns an AuthResponse.
        """
        response: Response = info.context["response"]
        db: Session = info.context["db"]

        # Prevent duplicate emails
        if db.query(User).filter(User.email == email).first():
            return AuthResponse(success=False, message="Email already registered", role=None, user=None)

        hashed_password = pwd_context.hash(password)
        new_user = User(id=str(uuid.uuid4()), name=name, email=email, password=hashed_password, role="student")
        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
        except Exception:
            db.rollback()
            return AuthResponse(success=False, message="Failed to create user", role=None, user=None)

        # Set tokens/cookies for the new user
        try:
            create_and_set_tokens(response, new_user.id, new_user.name, new_user.role)
        except Exception:
            # Token creation failure shouldn't block signup; return success but warn in message
            return AuthResponse(success=True, message="Signup succeeded but token setup failed", role=new_user.role, user=new_user)

        return AuthResponse(success=True, message="Signup successful", role=new_user.role, user=new_user)