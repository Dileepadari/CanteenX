"""User, role, and the two user<->canteen association tables."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    Column,
    Enum,
    ForeignKey,
    Index,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.db.models.base import TimestampMixin, TZDateTime, UUIDPKMixin
from app.db.models.enums import UserRole

if TYPE_CHECKING:
    from app.db.models.canteen import Canteen
    from app.db.models.cart import Cart
    from app.db.models.complaint import Complaint
    from app.db.models.notification import Notification
    from app.db.models.order import Order
    from app.db.models.payment import Payment, UserWallet
    from app.db.models.review import Review


user_favorite_canteens = Table(
    "user_favorite_canteens",
    Base.metadata,
    Column(
        "user_id",
        String,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "canteen_id",
        ForeignKey("canteens.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


canteen_staff = Table(
    "canteen_staff",
    Base.metadata,
    Column(
        "user_id",
        String,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "canteen_id",
        ForeignKey("canteens.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class User(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_users_email"),
        Index("ix_users_role", "role"),
    )

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    # Null for CAS-provisioned accounts, which authenticate via SSO only.
    password_hash: Mapped[str | None] = mapped_column(String(255), default=None)
    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            name="user_role",
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
        default=UserRole.STUDENT,
    )

    phone: Mapped[str | None] = mapped_column(String(20), default=None)
    avatar_url: Mapped[str | None] = mapped_column(Text, default=None)
    upi_id: Mapped[str | None] = mapped_column(String(120), default=None)
    is_vegetarian: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    # Soft-delete marker. `delete_own_account` used to hard-delete the row while
    # `orders.user_id` was a non-nullable FK, which raised IntegrityError.
    deleted_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)
    notification_preferences: Mapped[dict] = mapped_column(
        JSONB, nullable=False, default=dict
    )

    # --- relationships -------------------------------------------------------
    orders: Mapped[list["Order"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    cart: Mapped["Cart | None"] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )
    wallet: Mapped["UserWallet | None"] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )
    payments: Mapped[list["Payment"]] = relationship(back_populates="user")
    # `complaints` needs an explicit join: the table has two FKs to users
    # (the author and the admin who responded).
    complaints: Mapped[list["Complaint"]] = relationship(
        back_populates="user", foreign_keys="Complaint.user_id"
    )
    reviews: Mapped[list["Review"]] = relationship(back_populates="user")
    notifications: Mapped[list["Notification"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    owned_canteens: Mapped[list["Canteen"]] = relationship(back_populates="owner")
    favorite_canteens: Mapped[list["Canteen"]] = relationship(
        secondary=user_favorite_canteens, back_populates="favorited_by"
    )
    staffed_canteens: Mapped[list["Canteen"]] = relationship(
        secondary=canteen_staff, back_populates="staff"
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<User {self.id} {self.email} {self.role.value}>"


class RefreshToken(TimestampMixin, Base):
    """Issued refresh tokens, so a session can actually be revoked.

    The previous build set a refresh cookie that nothing ever read: there was no
    refresh endpoint, no rotation, and no revocation, so every session died
    silently 15 minutes after login.
    """

    __tablename__ = "refresh_tokens"

    jti: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    expires_at: Mapped[datetime] = mapped_column(TZDateTime, nullable=False, index=True)
    revoked_at: Mapped[datetime | None] = mapped_column(TZDateTime, default=None)
    # Set when this token is rotated, so reuse of a consumed token can be
    # detected and the whole family revoked.
    replaced_by_jti: Mapped[str | None] = mapped_column(String(64), default=None)
    user_agent: Mapped[str | None] = mapped_column(String(255), default=None)
