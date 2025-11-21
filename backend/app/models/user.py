from __future__ import annotations

import strawberry
from typing import Optional, List

from sqlalchemy import Column, String, JSON, Table, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship, object_session
from app.core.database import Base
from app.models.canteen import CanteenType, ScheduleType  # noqa: F401
from app.models.order import OrderType  # noqa: F401

# Use string forward references for GraphQL types to avoid circular imports
# Strawberry will resolve these when the full schema is created.
# e.g. "CanteenType" refers to `app.models.canteen.CanteenType`

# ===================================================================
# 1. MANY-TO-MANY ASSOCIATION TABLE
# ===================================================================

# This is the standard SQLAlchemy pattern for a many-to-many relationship.
# This table holds the links between users and their favorite canteens.
user_favorite_canteen_association = Table(
    'user_favorite_canteen_association', Base.metadata,
    Column('user_id', String, ForeignKey('users.id'), primary_key=True),
    Column('canteen_id', Integer, ForeignKey('canteens.id'), primary_key=True)
)

# Many-to-many association table for canteen staff assignment
canteen_staff_association = Table(
    'canteen_staff_association', Base.metadata,
    Column('user_id', String, ForeignKey('users.id'), primary_key=True),
    Column('canteen_id', Integer, ForeignKey('canteens.id'), primary_key=True)
)


# ===================================================================
# 2. STRAWBERRY GRAPHQL OUTPUT TYPES (for Queries)
# ===================================================================

@strawberry.type
class UserType:
    """The User object as exposed through the GraphQL API (uses camelCase)."""
    id: str
    name: str
    email: str
    role: str
    profilePicture: Optional[str] = None
    preferredPayment: Optional[str] = None
    isVegetarian: Optional[bool] = False
    notifPrefs: Optional[List[str]] = None
    # Backwards-compatible shape expected by the frontend: lists of IDs
    favoriteCanteens: Optional[List[int]] = None
    # Frontend expects recentOrders to be a list of order IDs (not full objects)
    recentOrders: Optional[List[int]] = None
    # CRITICAL: The password field is REMOVED. It should never be exposed.


@strawberry.type
class AuthResponse:
    """A standardized, consistent response for all authentication/user creation mutations."""
    success: bool
    message: str
    role: Optional[str] = None
    user: Optional[UserType] = None
    # The token itself should be handled via httpOnly cookies,
    # but can be included here if another auth method is used.
    token: Optional[str] = None

# ===================================================================
# 3. STRAWBERRY GRAPHQL INPUT TYPES (for Mutations)
# ===================================================================

@strawberry.input
class RegisterUserInput:
    """Input for creating a new user."""
    name: str
    email: str
    password: str
    profilePicture: Optional[str] = None
    preferredPayment: Optional[str] = None
    isVegetarian: Optional[bool] = False
    notifPrefs: Optional[List[str]] = None

@strawberry.input
class UpdateUserProfileInput:
    """Input for updating an existing user (all fields optional)."""
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    profilePicture: Optional[str] = None
    preferredPayment: Optional[str] = None
    isVegetarian: Optional[bool] = None
    notifPrefs: Optional[List[str]] = None

# ===================================================================
# 3. SQLAlchemy DATABASE MODEL
# ===================================================================

class User(Base):
    """
    The SQLAlchemy model for a User (uses snake_case for table columns).
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String) # This must store a HASHED password.
    role = Column(String, default="student")
    
    # --- Profile-related fields with snake_case naming ---
    profile_picture = Column(String, nullable=True)
    preferred_payment = Column(String, nullable=True)
    is_vegetarian = Column(Boolean, default=False)
    notif_prefs = Column(JSON, nullable=True) # e.g., {"email": true, "sms": false}
    upi_id = Column(String, nullable=True)

    # --- Relationships ---
    
    # Corrected: Use the many-to-many association table.
    # The `Canteen` model should have: `favorited_by_users = relationship("User", secondary=user_favorite_canteen_association, back_populates="favorite_canteens")`
    favorite_canteens = relationship("Canteen", secondary=user_favorite_canteen_association, back_populates="favorited_by_users")
    
    # The `Order` model should have: `user = relationship("User", back_populates="orders")`
    orders = relationship("Order", back_populates="user")
    
    # The `Canteen` model should have: `user = relationship("User", back_populates="canteens")`
    canteens = relationship("Canteen", back_populates="user")

    # Staff membership: many-to-many between users and canteens they work at (vendors/staff)
    staff_canteens = relationship("Canteen", secondary=canteen_staff_association, back_populates="staff")
    
    # The `UserWallet` model should have: `user = relationship("User", back_populates="wallet")`
    wallet = relationship("UserWallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    # The `Payment` model should have: `user = relationship("User", back_populates="payments")`
    payments = relationship("Payment", back_populates="user")

    # One-to-many: a User can file multiple complaints
    # The `Complaint` model declares `user = relationship("User", back_populates="complaints")`
    complaints = relationship("Complaint", back_populates="user")

    # One-to-one relationship: a User has a single Cart
    # The `Cart` model declares `user = relationship("User", back_populates="cart")`
    cart = relationship("Cart", back_populates="user", uselist=False, cascade="all, delete-orphan")

    # Backwards-compatible camelCase accessors expected by the GraphQL layer
    @property
    def favoriteCanteens(self):
        # Return list of canteen IDs for frontend compatibility
        sess = object_session(self)
        if sess is None:
            raw = self.__dict__.get("favorite_canteens", None)
            # If the raw value is a list of Canteen models, convert to ids
            if raw and len(raw) and hasattr(raw[0], "id"):
                return [getattr(c, "id") for c in raw]
            # If it's already a list of ints, return it
            return list(raw) if raw is not None else []

        # Session present: relationship will return Canteen objects
        try:
            return [int(getattr(c, "id")) for c in (self.favorite_canteens or [])]
        except Exception:
            return []

    @favoriteCanteens.setter
    def favoriteCanteens(self, canteen_ids):
        """Accepts a list of canteen IDs and updates the relationship when session is available."""
        sess = object_session(self)
        # If no session, store raw list for later
        if sess is None:
            self.__dict__["favorite_canteens"] = list(canteen_ids) if canteen_ids is not None else []
            return

        # Load canteen objects and assign relationship
        from app.models.canteen import Canteen
        canteens = []
        for cid in (canteen_ids or []):
            c = sess.query(Canteen).filter(Canteen.id == cid).first()
            if c:
                canteens.append(c)
        self.favorite_canteens = canteens

    @property
    def isVegetarian(self) -> bool:
        return bool(getattr(self, "is_vegetarian", False))

    @property
    def notifPrefs(self):
        # Normalize JSON stored preferences to a list for the GraphQL shape
        prefs = getattr(self, "notif_prefs", None)
        if prefs is None:
            return []
        # If stored as a dict, convert truthy keys to a list
        if isinstance(prefs, dict):
            return [k for k, v in prefs.items() if v]
        return prefs

    @property
    def preferredPayment(self):
        return getattr(self, "preferred_payment", None)

    @property
    def profilePicture(self):
        return getattr(self, "profile_picture", None)

    @property
    def recentOrders(self):
        # Return recent order IDs sorted by most recent first for frontend compatibility.
        sess = object_session(self)
        if sess is None:
            val = self.__dict__.get("orders", None)
            orders = list(val) if val is not None else []
            try:
                sorted_orders = sorted(orders, key=lambda o: getattr(o, "order_time", None) or 0, reverse=True)
                return [getattr(o, "id") for o in sorted_orders if getattr(o, "id", None) is not None]
            except Exception:
                # If orders are stored as IDs already, just return them
                return list(orders)

        try:
            sorted_orders = sorted(self.orders or [], key=lambda o: getattr(o, "order_time", None) or 0, reverse=True)
            return [getattr(o, "id") for o in sorted_orders if getattr(o, "id", None) is not None]
        except Exception:
            return [getattr(o, "id") for o in list(self.orders or []) if getattr(o, "id", None) is not None]