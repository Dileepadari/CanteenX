"""Password hashing, JWT issuing/validation, and CSRF tokens."""

from __future__ import annotations

import hmac
import secrets
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from enum import Enum
from typing import Any, Final

import bcrypt
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

from app.core.config import settings

# A single shared hasher. The previous build constructed a passlib CryptContext
# in four separate modules, pinned to the passlib 1.7.4 / bcrypt 4.0.1 pair that
# raises `AttributeError: module 'bcrypt' has no attribute '__about__'`.
_hasher: Final = PasswordHasher()

MIN_PASSWORD_LENGTH: Final = 8
CSRF_COOKIE_NAME: Final = "csrf_token"
CSRF_HEADER_NAME: Final = "x-csrf-token"
ACCESS_COOKIE_NAME: Final = "access_token"
REFRESH_COOKIE_NAME: Final = "refresh_token"


class TokenType(str, Enum):
    access = "access"
    refresh = "refresh"
    #: Short-lived, single-purpose credential for the WebSocket handshake.
    realtime = "realtime"


class TokenError(Exception):
    """Raised when a token is absent, malformed, expired, or of the wrong type."""


@dataclass(frozen=True, slots=True)
class TokenClaims:
    subject: str
    token_type: TokenType
    jti: str
    role: str | None = None
    expires_at: datetime | None = None


# --------------------------------------------------------------------- passwords
def hash_password(password: str) -> str:
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")
    return _hasher.hash(password)


def verify_password(password: str, stored_hash: str | None) -> bool:
    """Verify a password against an argon2 or legacy bcrypt hash.

    `stored_hash` is None for CAS-provisioned accounts, which have no password.
    The old code passed None straight into passlib and raised instead of
    returning False, turning "SSO user tries the password form" into a 500.
    """
    if not stored_hash:
        return False

    if stored_hash.startswith("$argon2"):
        try:
            return _hasher.verify(stored_hash, password)
        except (VerifyMismatchError, InvalidHashError):
            return False

    if stored_hash.startswith(("$2a$", "$2b$", "$2y$")):
        try:
            return bcrypt.checkpw(password.encode(), stored_hash.encode())
        except ValueError:
            return False

    return False


def needs_rehash(stored_hash: str | None) -> bool:
    """True when a successful login should transparently upgrade the stored hash."""
    if not stored_hash:
        return False
    if not stored_hash.startswith("$argon2"):
        return True
    try:
        return _hasher.check_needs_rehash(stored_hash)
    except InvalidHashError:
        return True


# ------------------------------------------------------------------------ tokens
def _encode(
    subject: str,
    token_type: TokenType,
    expires_delta: timedelta,
    **extra: Any,
) -> tuple[str, str, datetime]:
    now = datetime.now(UTC)
    expires_at = now + expires_delta
    jti = uuid.uuid4().hex
    payload: dict[str, Any] = {
        "sub": subject,
        "typ": token_type.value,
        "jti": jti,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
        **{k: v for k, v in extra.items() if v is not None},
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, jti, expires_at


def create_access_token(subject: str, role: str) -> tuple[str, str, datetime]:
    return _encode(
        subject,
        TokenType.access,
        timedelta(minutes=settings.access_token_expire_minutes),
        role=role,
    )


def create_refresh_token(subject: str) -> tuple[str, str, datetime]:
    return _encode(
        subject,
        TokenType.refresh,
        timedelta(days=settings.refresh_token_expire_days),
    )


#: Deliberately brief. The ticket is fetched immediately before connecting,
#: so it only has to survive one handshake.
REALTIME_TICKET_TTL_SECONDS: Final = 60


def create_realtime_ticket(subject: str, role: str) -> str:
    """Mint a ticket the browser can present when opening a subscription.

    WebSocket auth is pinned at the handshake: a cookie refreshed later never
    reaches an already-open socket, so a session older than the access-token
    lifetime would have permanently dead subscriptions. The client fetches one
    of these over HTTP - where the refresh-and-retry path works - right before
    connecting.
    """
    token, _, _ = _encode(
        subject,
        TokenType.realtime,
        timedelta(seconds=REALTIME_TICKET_TTL_SECONDS),
        role=role,
    )
    return token


def decode_token(token: str, expected_type: TokenType) -> TokenClaims:
    """Decode and validate a token, or raise :class:`TokenError`.

    Enforcing `typ` matters: without it a refresh token - which is long-lived
    and carries no role claim - would be accepted as an access token.
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["exp", "iat", "sub", "jti", "typ"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise TokenError("Token has expired.") from exc
    except jwt.InvalidTokenError as exc:
        raise TokenError("Token is invalid.") from exc

    if payload.get("typ") != expected_type.value:
        raise TokenError(
            f"Expected a {expected_type.value} token, got {payload.get('typ')!r}."
        )

    return TokenClaims(
        subject=str(payload["sub"]),
        token_type=expected_type,
        jti=str(payload["jti"]),
        role=payload.get("role"),
        expires_at=datetime.fromtimestamp(payload["exp"], tz=UTC),
    )


# -------------------------------------------------------------------------- csrf
def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)


def csrf_tokens_match(cookie_value: str | None, header_value: str | None) -> bool:
    """Double-submit check, compared in constant time."""
    if not cookie_value or not header_value:
        return False
    return hmac.compare_digest(cookie_value, header_value)
