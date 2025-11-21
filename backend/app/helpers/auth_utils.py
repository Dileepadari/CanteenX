import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from fastapi import Response
from jose import jwt, JWTError, ExpiredSignatureError

# It's excellent practice to keep all configuration constants in a central file.
from app.core.config import (
    JWT_SECRET,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)

# ===================================================================
# INTERNAL HELPER FUNCTION
# ===================================================================

def _create_token(data: Dict[str, Any], expires_delta: timedelta) -> str:
    """
    Creates a JWT with a specified data payload and expiration time.

    Args:
        data: The payload to encode into the token.
        expires_delta: The lifespan of the token.

    Returns:
        The encoded JWT as a string.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "iat": datetime.utcnow()}) # Add issued-at time
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)


# ===================================================================
# PUBLIC UTILITY FUNCTIONS
# ===================================================================

def create_and_set_tokens(response: Response, user_id: str, username: str, role: str):
    """
    Generates access and refresh tokens, and sets them as secure, httpOnly cookies.

    Args:
        response: The FastAPI response object to which cookies will be attached.
        user_id: The ID of the user (will be the token's subject).
        username: The username of the user.
        role: The role of the user.
    """
    # 1. Create Access Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token_payload = {"sub": user_id, "username": username, "role": role}
    access_token = _create_token(access_token_payload, access_token_expires)

    # 2. Create Refresh Token (with a minimal payload)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token_payload = {"sub": user_id}
    refresh_token = _create_token(refresh_token_payload, refresh_token_expires)

    # 3. Set Access Token Cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # Crucial: Prevents JavaScript from accessing the cookie.
        secure=os.getenv("ENV") == "production", # Ensures cookie is only sent over HTTPS in production.
        samesite="lax", # Provides protection against CSRF attacks.
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    # 4. Set Refresh Token Cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=os.getenv("ENV") == "production",
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Safely decodes a JWT, handling potential errors.

    Args:
        token: The JWT string to decode.

    Returns:
        The decoded payload as a dictionary if the token is valid, otherwise None.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        # Token has expired
        return None
    except JWTError:
        # Any other JWT error (e.g., invalid signature, malformed token)
        return None