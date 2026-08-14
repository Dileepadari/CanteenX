"""User profiles, favourites, staffing, and admin account management."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import delete, func, insert, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import (
    AuthorizationError,
    ConflictError,
    NotFoundError,
    ValidationError,
)
from app.core.security import hash_password
from app.db.models import (
    Canteen,
    User,
    UserRole,
    canteen_staff,
    user_favorite_canteens,
)
from app.domain.services import auth_service


async def get_user(session: AsyncSession, user_id: str) -> User:
    user = await session.get(User, user_id)
    if user is None or user.deleted_at is not None:
        raise NotFoundError("That user does not exist.")
    return user


async def update_profile(
    session: AsyncSession,
    *,
    user: User,
    name: str | None = None,
    phone: str | None = None,
    avatar_url: str | None = None,
    upi_id: str | None = None,
    is_vegetarian: bool | None = None,
    notification_preferences: dict | None = None,
) -> User:
    if name is not None:
        name = name.strip()
        if not name:
            raise ValidationError("Your name cannot be empty.")
        user.name = name

    if phone is not None:
        user.phone = phone.strip() or None
    if avatar_url is not None:
        user.avatar_url = avatar_url or None
    if upi_id is not None:
        user.upi_id = upi_id.strip() or None
    if is_vegetarian is not None:
        user.is_vegetarian = is_vegetarian
    if notification_preferences is not None:
        user.notification_preferences = notification_preferences

    await session.flush()
    return user


async def change_password(
    session: AsyncSession, *, user: User, current_password: str, new_password: str
) -> None:
    from app.core.security import verify_password

    if user.password_hash and not verify_password(current_password, user.password_hash):
        raise AuthorizationError("Your current password is incorrect.")

    user.password_hash = hash_password(new_password)
    # Changing a password must invalidate every other session, or a stolen one
    # survives the very action taken to stop it.
    await auth_service.revoke_all_sessions(session, user.id)
    await session.flush()


async def soft_delete_account(session: AsyncSession, *, user: User) -> None:
    """Deactivate rather than delete.

    Orders reference the user with a RESTRICT foreign key precisely so that
    financial history cannot be erased. The old hard delete raised
    IntegrityError for anyone who had ever ordered.
    """
    user.deleted_at = datetime.now(UTC)
    user.is_active = False
    user.email = f"deleted+{user.id}@canteenx.invalid"
    user.password_hash = None
    user.phone = None
    user.avatar_url = None
    user.upi_id = None
    await auth_service.revoke_all_sessions(session, user.id)
    await session.flush()


# ---------------------------------------------------------------- favourites
async def set_favorite(
    session: AsyncSession, *, user: User, canteen_id: int, favorite: bool
) -> None:
    canteen = await session.get(Canteen, canteen_id)
    if canteen is None:
        raise NotFoundError("That canteen does not exist.")

    if favorite:
        try:
            await session.execute(
                insert(user_favorite_canteens).values(
                    user_id=user.id, canteen_id=canteen_id
                )
            )
        except IntegrityError:
            await session.rollback()  # already a favourite; nothing to do
    else:
        await session.execute(
            delete(user_favorite_canteens).where(
                user_favorite_canteens.c.user_id == user.id,
                user_favorite_canteens.c.canteen_id == canteen_id,
            )
        )
    await session.flush()


async def list_favorites(session: AsyncSession, *, user_id: str) -> list[Canteen]:
    result = await session.execute(
        select(Canteen)
        .join(
            user_favorite_canteens,
            user_favorite_canteens.c.canteen_id == Canteen.id,
        )
        .where(user_favorite_canteens.c.user_id == user_id, Canteen.is_active.is_(True))
        .order_by(Canteen.name)
    )
    return list(result.scalars().all())


# --------------------------------------------------------------------- admin
def _assert_admin(actor: User) -> None:
    if actor.role is not UserRole.ADMIN:
        raise AuthorizationError("Administrator access is required.")


async def list_users(
    session: AsyncSession,
    *,
    actor: User,
    role: UserRole | None = None,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[User]:
    _assert_admin(actor)

    query = select(User).where(User.deleted_at.is_(None))
    if role is not None:
        query = query.where(User.role == role)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(or_(User.name.ilike(pattern), User.email.ilike(pattern)))

    result = await session.execute(
        query.order_by(User.created_at.desc()).limit(limit).offset(offset)
    )
    return list(result.scalars().all())


async def count_users(session: AsyncSession, *, role: UserRole | None = None) -> int:
    query = select(func.count()).select_from(User).where(User.deleted_at.is_(None))
    if role is not None:
        query = query.where(User.role == role)
    return (await session.scalar(query)) or 0


async def create_staff_account(
    session: AsyncSession,
    *,
    actor: User,
    name: str,
    email: str,
    password: str,
    role: UserRole,
) -> User:
    _assert_admin(actor)

    if role not in (UserRole.VENDOR, UserRole.STAFF, UserRole.ADMIN):
        raise ValidationError("That role cannot be assigned here.")

    email = auth_service.normalise_email(email)
    existing = await session.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise ConflictError("An account with that email already exists.")

    user = User(
        name=name.strip(),
        email=email,
        password_hash=hash_password(password),
        role=role,
    )
    session.add(user)
    await session.flush()
    return user


async def set_user_role(
    session: AsyncSession, *, actor: User, user_id: str, role: UserRole
) -> User:
    _assert_admin(actor)

    user = await get_user(session, user_id)
    if user.id == actor.id and role is not UserRole.ADMIN:
        # Removing your own admin rights can leave the platform unadministrable.
        raise ConflictError("You cannot remove your own administrator access.")

    user.role = role
    await session.flush()
    return user


async def set_user_active(
    session: AsyncSession, *, actor: User, user_id: str, is_active: bool
) -> User:
    _assert_admin(actor)

    user = await get_user(session, user_id)
    if user.id == actor.id and not is_active:
        raise ConflictError("You cannot disable your own account.")

    user.is_active = is_active
    if not is_active:
        await auth_service.revoke_all_sessions(session, user.id)
    await session.flush()
    return user


# -------------------------------------------------------------------- staff
async def assign_staff(
    session: AsyncSession, *, actor: User, canteen_id: int, user_ids: list[str]
) -> list[User]:
    from app.domain.services.catalog_service import assert_manages_canteen

    await assert_manages_canteen(session, actor, canteen_id)

    for user_id in user_ids:
        member = await get_user(session, user_id)
        try:
            await session.execute(
                insert(canteen_staff).values(user_id=member.id, canteen_id=canteen_id)
            )
        except IntegrityError:
            await session.rollback()
            continue

        if member.role is UserRole.STUDENT:
            member.role = UserRole.STAFF

    await session.flush()
    return await list_staff(session, canteen_id=canteen_id)


async def remove_staff(
    session: AsyncSession, *, actor: User, canteen_id: int, user_ids: list[str]
) -> list[User]:
    from app.domain.services.catalog_service import assert_manages_canteen

    await assert_manages_canteen(session, actor, canteen_id)

    await session.execute(
        delete(canteen_staff).where(
            canteen_staff.c.canteen_id == canteen_id,
            canteen_staff.c.user_id.in_(user_ids),
        )
    )
    await session.flush()
    return await list_staff(session, canteen_id=canteen_id)


async def list_staff(session: AsyncSession, *, canteen_id: int) -> list[User]:
    result = await session.execute(
        select(User)
        .join(canteen_staff, canteen_staff.c.user_id == User.id)
        .where(canteen_staff.c.canteen_id == canteen_id, User.deleted_at.is_(None))
        .order_by(User.name)
    )
    return list(result.scalars().all())


async def canteens_managed_by(session: AsyncSession, user: User) -> list[Canteen]:
    """Every canteen this user owns or staffs - drives the vendor console."""
    if user.role is UserRole.ADMIN:
        result = await session.execute(
            select(Canteen).where(Canteen.is_active.is_(True)).order_by(Canteen.name)
        )
        return list(result.scalars().all())

    result = await session.execute(
        select(Canteen)
        .outerjoin(canteen_staff, canteen_staff.c.canteen_id == Canteen.id)
        .where(
            or_(Canteen.owner_id == user.id, canteen_staff.c.user_id == user.id),
            Canteen.is_active.is_(True),
        )
        .distinct()
        .order_by(Canteen.name)
    )
    return list(result.scalars().all())
