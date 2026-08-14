"""User and authentication GraphQL types."""

from __future__ import annotations

from datetime import datetime

import strawberry

from app.api.graphql.types.enums import UserRole
from app.db.models import User


@strawberry.type(name="User")
class UserType:
    id: strawberry.ID
    name: str
    email: str
    role: UserRole
    phone: str | None
    avatar_url: str | None
    upi_id: str | None
    is_vegetarian: bool
    is_active: bool
    created_at: datetime


@strawberry.type(
    name="PublicUser", description="The subset safe to show to other users."
)
class PublicUserType:
    id: strawberry.ID
    name: str
    avatar_url: str | None


@strawberry.type
class AuthPayload:
    user: UserType
    #: Echoed so the SPA can seed its CSRF header without reading the cookie
    #: on first paint. The tokens themselves stay in httpOnly cookies.
    csrf_token: str


def to_user(model: User) -> UserType:
    return UserType(
        id=strawberry.ID(model.id),
        name=model.name,
        email=model.email,
        role=model.role,
        phone=model.phone,
        avatar_url=model.avatar_url,
        upi_id=model.upi_id,
        is_vegetarian=model.is_vegetarian,
        is_active=model.is_active,
        created_at=model.created_at,
    )


def to_public_user(model: User) -> PublicUserType:
    return PublicUserType(
        id=strawberry.ID(model.id),
        name=model.name,
        avatar_url=model.avatar_url,
    )
