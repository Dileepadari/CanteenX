import strawberry
from fastapi import Request, Response
from strawberry.fastapi import BaseContext
from typing import Optional
from cryptography.fernet import Fernet
from fastapi.responses import RedirectResponse
from cas import CASClient
import os
from app.core.database import get_db
from urllib.parse import quote_plus
from cryptography.fernet import Fernet
from sqlalchemy.orm import Session
from app.models.user import User
from datetime import datetime, timedelta
from jose import jwt



BASE_URL = os.getenv('BASE_URL', 'http://localhost')
SUBPATH = os.getenv('SUBPATH', '')

SECRET_KEY = os.getenv('SECRET_KEY',os.urandom(24))
CAS_SERVER_URL = os.getenv('CAS_SERVER_URL', 'https://login.iiit.ac.in/cas/')
SERVICE_URL = os.getenv('SERVICE_URL', f'{BASE_URL}{SUBPATH}/Get_Auth')
REDIRECT_URL = os.getenv('REDIRECT_URL', f'{BASE_URL}{SUBPATH}/Get_Auth')

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7


cas_client = CASClient(
    version=3,
    service_url=f"{SERVICE_URL}?next={quote_plus(REDIRECT_URL)}",
    server_url=CAS_SERVER_URL,
)

fernet = Fernet("P9vhSTT3oD2d5ZqWqkpld7oPAMNx4_xSM1M3vPMEV8g=")

@strawberry.type
class AuthPayload:
    success: bool
    message: Optional[str] = None
    redirectUrl: Optional[str] = None
    token: Optional[str] = None

@strawberry.type
class CASMutations:

    @strawberry.mutation
    def InitiateCasLogin(self) -> str:
        """Return the CAS login URL so the frontend can redirect the user."""
        return cas_client.get_login_url()

    @strawberry.mutation
    def verify_cas_ticket(self, ticket: str, info) -> AuthPayload:
        """Validate the ticket and perform login or signup redirection logic."""
        request: Request = info.context["request"]
        response: Response = info.context["response"]
        db: Session = next(get_db())  # SQLAlchemy session

        try:
            user, attributes, pgtiou = cas_client.verify_ticket(ticket)

            if user:
                uid = attributes.get("uid")
                roll = attributes.get("RollNo")
                email = attributes.get("E-Mail")
                first_name = attributes.get("FirstName")
                last_name = attributes.get("LastName")

                # Query the Login table using SQLAlchemy ORM
                entry = db.query(User).filter(User.id == uid).first()
                

                if entry:
                    access_token = jwt.encode(
                        {"user_id": uid, "username": first_name, "role": "student", "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)},
                        JWT_SECRET, algorithm=ALGORITHM
                    )

                    refresh_token = jwt.encode(
                        {"user_id": uid, "role": "student", "exp": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)},
                        JWT_SECRET, algorithm=ALGORITHM
                    )

                    # Set cookies in response
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
                
                    token = fernet.encrypt(uid.encode()).decode()
                    request.session["token"] = token  # Store token in session
                    return AuthPayload(
                        success=True,
                        token=token,
                        redirectUrl=f"{SUBPATH}/upcomingTravels"
                    )


                else:
                    access_token = jwt.encode(
                        {"user_id": uid, "username": first_name, "role": "student", "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)},
                        JWT_SECRET, algorithm=ALGORITHM
                    )

                    refresh_token = jwt.encode(
                        {"user_id": uid, "role": "student", "exp": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)},
                        JWT_SECRET, algorithm=ALGORITHM
                    )

                    # Set cookies in response
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
                
                    new_user = User(
                        id=uid,
                        name=first_name,
                        email=email,
                        password=None,
                        role="student"
                    )

                    db.add(new_user)
                    db.commit()
                    db.refresh(new_user)

                    return AuthPayload(
                        success=False,
                        message="User not found! Please sign up.",
                        redirectUrl=None
                    )
            else:
                return AuthPayload(success=False, message="Invalid CAS ticket. Please try again.")
        except Exception as e:
            db.rollback()
            return AuthPayload(success=False, message="An error occurred during CAS login.")


mutations = [
    strawberry.field(name="InitiateCasLogin", resolver=CASMutations.InitiateCasLogin),
    strawberry.field(name="verify_cas_ticket", resolver=CASMutations.verify_cas_ticket)
]