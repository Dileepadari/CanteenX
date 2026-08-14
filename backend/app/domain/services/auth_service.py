"""Authentication: local credentials, CAS SSO, and refresh-token rotation."""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import AuthenticationError, ConflictError, ValidationError
from app.core.logging import get_logger
from app.core.security import (
    MIN_PASSWORD_LENGTH,
    TokenError,
    TokenType,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_csrf_token,
    hash_password,
    needs_rehash,
    verify_password,
)
from app.db.models import RefreshToken, User, UserRole, UserWallet

logger = get_logger(__name__)

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$")


@dataclass(frozen=True, slots=True)
class IssuedSession:
    user: User
    access_token: str
    refresh_token: str
    csrf_token: str


def normalise_email(email: str) -> str:
    return email.strip().lower()


def _validate_email(email: str) -> str:
    email = normalise_email(email)
    if not _EMAIL_RE.match(email):
        raise ValidationError("That does not look like a valid email address.")
    return email


async def _issue_session(
    session: AsyncSession, user: User, *, user_agent: str | None = None
) -> IssuedSession:
    access_token, _, _ = create_access_token(user.id, user.role.value)
    refresh_token, jti, expires_at = create_refresh_token(user.id)

    session.add(
        RefreshToken(
            jti=jti,
            user_id=user.id,
            expires_at=expires_at,
            user_agent=(user_agent or "")[:255] or None,
        )
    )

    return IssuedSession(
        user=user,
        access_token=access_token,
        refresh_token=refresh_token,
        csrf_token=generate_csrf_token(),
    )


async def _get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(
        select(User).where(User.email == email, User.deleted_at.is_(None))
    )
    return result.scalar_one_or_none()


async def _ensure_wallet(session: AsyncSession, user: User) -> None:
    exists = await session.execute(
        select(UserWallet.id).where(UserWallet.user_id == user.id)
    )
    if exists.scalar_one_or_none() is None:
        session.add(UserWallet(user_id=user.id, balance_paise=0))


# ------------------------------------------------------------------- sign up
async def sign_up(
    session: AsyncSession,
    *,
    name: str,
    email: str,
    password: str,
    user_agent: str | None = None,
) -> IssuedSession:
    email = _validate_email(email)
    name = name.strip()

    if not name:
        raise ValidationError("Please enter your name.")
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValidationError(
            f"Password must be at least {MIN_PASSWORD_LENGTH} characters."
        )

    if await _get_user_by_email(session, email) is not None:
        # Deliberately explicit: the sign-up form needs to tell the user to sign
        # in instead. Enumeration here is an acceptable trade for usability,
        # and the login path stays non-enumerating.
        raise ConflictError("An account with that email already exists.")

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=UserRole.STUDENT,
    )
    session.add(user)
    await session.flush()
    await _ensure_wallet(session, user)

    logger.info("User signed up", extra={"user_id": user.id})
    return await _issue_session(session, user, user_agent=user_agent)


# --------------------------------------------------------------------- login
async def sign_in(
    session: AsyncSession,
    *,
    email: str,
    password: str,
    user_agent: str | None = None,
) -> IssuedSession:
    user = await _get_user_by_email(session, normalise_email(email))

    # One generic message and the same work either way, so the response does not
    # reveal whether the address is registered.
    if user is None or not verify_password(password, user.password_hash):
        raise AuthenticationError("Incorrect email or password.")

    if not user.is_active:
        raise AuthenticationError("That account has been disabled.")

    # Transparent upgrade from the legacy bcrypt hashes to argon2 on first
    # successful login.
    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(password)

    await _ensure_wallet(session, user)
    logger.info("User signed in", extra={"user_id": user.id})
    return await _issue_session(session, user, user_agent=user_agent)


# ------------------------------------------------------------------- refresh
async def refresh_session(
    session: AsyncSession,
    *,
    refresh_token: str,
    user_agent: str | None = None,
) -> IssuedSession:
    """Rotate a refresh token, detecting reuse of an already-consumed one."""
    try:
        claims = decode_token(refresh_token, TokenType.refresh)
    except TokenError as exc:
        raise AuthenticationError(
            "Your session has expired. Please sign in again."
        ) from exc

    stored = await session.get(RefreshToken, claims.jti)
    if stored is None:
        raise AuthenticationError("Your session has expired. Please sign in again.")

    if stored.revoked_at is not None:
        # A revoked token being presented means it was captured and replayed.
        # The safe response is to kill every session for that user.
        logger.warning(
            "Refresh token reuse detected; revoking all sessions",
            extra={"user_id": stored.user_id},
        )
        await revoke_all_sessions(session, stored.user_id)
        raise AuthenticationError("Your session has expired. Please sign in again.")

    if stored.expires_at <= datetime.now(UTC):
        raise AuthenticationError("Your session has expired. Please sign in again.")

    user = await session.get(User, stored.user_id)
    if user is None or not user.is_active or user.deleted_at is not None:
        raise AuthenticationError("That account is no longer available.")

    issued = await _issue_session(session, user, user_agent=user_agent)

    stored.revoked_at = datetime.now(UTC)
    stored.replaced_by_jti = decode_token(issued.refresh_token, TokenType.refresh).jti

    return issued


# -------------------------------------------------------------------- logout
async def sign_out(session: AsyncSession, *, refresh_token: str | None) -> None:
    if not refresh_token:
        return
    try:
        claims = decode_token(refresh_token, TokenType.refresh)
    except TokenError:
        return

    stored = await session.get(RefreshToken, claims.jti)
    if stored is not None and stored.revoked_at is None:
        stored.revoked_at = datetime.now(UTC)


async def revoke_all_sessions(session: AsyncSession, user_id: str) -> None:
    await session.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
    )


# ----------------------------------------------------------------------- CAS
def cas_login_url() -> str:
    from cas import CASClient

    client = CASClient(
        version=3,
        server_url=settings.cas_server_url,
        service_url=settings.cas_service_url,
    )
    return client.get_login_url()


async def verify_cas_ticket(
    session: AsyncSession,
    *,
    ticket: str,
    user_agent: str | None = None,
) -> IssuedSession:
    from cas import CASClient

    client = CASClient(
        version=3,
        server_url=settings.cas_server_url,
        service_url=settings.cas_service_url,
    )

    username, attributes, _ = client.verify_ticket(ticket)
    if not username:
        raise AuthenticationError("That single sign-on ticket is not valid.")

    attributes = attributes or {}
    email = normalise_email(
        attributes.get("email")
        or attributes.get("mail")
        or f"{username}@{settings.cas_email_domain}"
    )
    display_name = (
        attributes.get("name")
        or attributes.get("cn")
        or attributes.get("firstname")
        or username
    )

    user = await _get_user_by_email(session, email)
    if user is None:
        # CAS accounts carry no password; `verify_password` handles the null
        # hash by returning False rather than raising, so the password form
        # simply rejects them.
        user = User(name=display_name, email=email, role=UserRole.STUDENT)
        session.add(user)
        await session.flush()
        logger.info("Provisioned user from CAS", extra={"user_id": user.id})

    if not user.is_active:
        raise AuthenticationError("That account has been disabled.")

    await _ensure_wallet(session, user)
    return await _issue_session(session, user, user_agent=user_agent)
