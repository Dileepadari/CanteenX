import strawberry
from typing import Optional, List
from datetime import time as time_obj

from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON, Time
from sqlalchemy.orm import relationship
from app.core.database import Base

# ===================================================================
# 1. STRAWBERRY GRAPHQL OUTPUT TYPES (for Queries)
# ===================================================================

@strawberry.type
class ScheduleType:
    """Represents the canteen's schedule in the GraphQL schema (for reading data)."""
    breakfast: Optional[str] = None
    lunch: Optional[str] = None
    dinner: Optional[str] = None
    regular: Optional[str] = None
    evening: Optional[str] = None
    night: Optional[str] = None
    weekday: Optional[str] = None
    weekend: Optional[str] = None


@strawberry.type
class CanteenType:
    """The Canteen object as exposed through the GraphQL API (uses camelCase)."""
    id: int
    name: str
    userId: str
    isOpen: bool
    image: Optional[str] = None
    location: Optional[str] = None
    rating: Optional[float] = 0.0
    # Times are exposed as strings in the API for simplicity (e.g., "09:00")
    openTime: Optional[str] = None
    closeTime: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    # The schedule is a structured object, not a plain string
    schedule: Optional[ScheduleType] = None
    tags: Optional[List[str]] = None

# ===================================================================
# 2. STRAWBERRY GRAPHQL INPUT TYPES (for Mutations)
# ===================================================================

@strawberry.input
class ScheduleInput:
    """Input for providing a canteen's schedule during creation or updates."""
    breakfast: Optional[str] = strawberry.UNSET
    lunch: Optional[str] = strawberry.UNSET
    dinner: Optional[str] = strawberry.UNSET
    regular: Optional[str] = strawberry.UNSET
    evening: Optional[str] = strawberry.UNSET
    night: Optional[str] = strawberry.UNSET
    weekday: Optional[str] = strawberry.UNSET
    weekend: Optional[str] = strawberry.UNSET


@strawberry.input
class CreateCanteenInput:
    """Input for creating a new canteen (uses snake_case for Python consistency)."""
    name: str
    location: str
    phone: str
    open_time: str  # Expected format: "HH:MM"
    close_time: str # Expected format: "HH:MM"
    user_id: str    # The admin assigns a vendor (user) to this canteen
    description: Optional[str] = None
    image: Optional[str] = None
    email: Optional[str] = None
    schedule: Optional[ScheduleInput] = None
    tags: Optional[List[str]] = None

@strawberry.input
class UpdateCanteenInput:
    """Input for updating an existing canteen (all fields optional)."""
    name: Optional[str] = strawberry.UNSET
    location: Optional[str] = strawberry.UNSET
    phone: Optional[str] = strawberry.UNSET
    open_time: Optional[str] = strawberry.UNSET  # Expected format: "HH:MM"
    close_time: Optional[str] = strawberry.UNSET # Expected format: "HH:MM"
    description: Optional[str] = strawberry.UNSET
    image: Optional[str] = strawberry.UNSET
    email: Optional[str] = strawberry.UNSET
    schedule: Optional[ScheduleInput] = strawberry.UNSET
    tags: Optional[List[str]] = strawberry.UNSET


# ===================================================================
# 3. STRAWBERRY MUTATION RESPONSE TYPE
# ===================================================================

@strawberry.type
class CanteenMutationResponse:
    """Standard response for canteen mutations."""
    success: bool
    message: str
    canteen_id: Optional[int] = None

# ===================================================================
# 4. SQLAlchemy DATABASE MODEL
# ===================================================================

class Canteen(Base):
    """
    The SQLAlchemy model for a Canteen (uses snake_case for table columns).
    This is the single source of truth for the database schema.
    """
    __tablename__ = "canteens"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    image = Column(String, nullable=True)
    location = Column(String, nullable=True)
    rating = Column(Float, default=0.0)

    open_time = Column(Time, nullable=True)
    close_time = Column(Time, nullable=True)
    is_open = Column(Boolean, default=True)
    
    description = Column(String, nullable=True)
    phone = Column(String, unique=True, nullable=True)
    email = Column(String, unique=True, nullable=True)
    schedule = Column(JSON, nullable=True)
    tags = Column(JSON, nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="canteens")
    menu_items = relationship("MenuItem", back_populates="canteen")
    orders = relationship("Order", back_populates="canteen")
    merchant = relationship("Merchant", back_populates="canteen", uselist=False)

    favorited_by_users = relationship(
        "User",
        secondary="user_favorite_canteen_association",
        back_populates="favorite_canteens"
    )

    # Many-to-many relation: staff assigned to this canteen (vendors/staff accounts)
    staff = relationship("User", secondary="canteen_staff_association", back_populates="staff_canteens")

    # Backwards-compatible camelCase accessors expected by the GraphQL layer
    @property
    def openTime(self) -> Optional[str]:
        try:
            return self.open_time.strftime("%H:%M") if getattr(self, "open_time", None) is not None else None
        except Exception:
            return None

    @property
    def closeTime(self) -> Optional[str]:
        try:
            return self.close_time.strftime("%H:%M") if getattr(self, "close_time", None) is not None else None
        except Exception:
            return None

    @property
    def isOpen(self) -> bool:
        return bool(getattr(self, "is_open", False))

    @property
    def userId(self) -> Optional[str]:
        return getattr(self, "user_id", None)