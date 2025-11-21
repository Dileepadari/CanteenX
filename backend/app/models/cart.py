import strawberry
from typing import Optional, List, Any
from datetime import datetime, timezone
from app.helpers.time_utils import to_ist_iso

from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

# ===================================================================
# 1. STRAWBERRY GRAPHQL OUTPUT TYPES (for Queries)
# ===================================================================

@strawberry.type
class CustomizationsType:
    """Represents the selected customizations for a cart item (for reading data)."""
    size: Optional[str] = None
    additions: Optional[List[str]] = None
    removals: Optional[List[str]] = None
    notes: Optional[str] = None


@strawberry.type
class CartItemType:
    """The CartItem object as exposed through the GraphQL API (uses camelCase)."""
    id: int
    menuItemId: int
    quantity: int
    name: Optional[str] = None
    price: Optional[float] = None
    canteenId: Optional[int] = None
    canteenName: Optional[str] = None
    cartId: Optional[int] = None
    specialInstructions: Optional[str] = None
    location: Optional[str] = None
    customizations: Optional[CustomizationsType] = None


@strawberry.type
class CartType:
    """The entire Cart object, including all its items (uses camelCase)."""
    id: int
    userId: str
    createdAt: str  # Exposed as ISO 8601 string
    updatedAt: str  # Exposed as ISO 8601 string
    pickupDate: Optional[str] = None
    pickupTime: Optional[str] = None
    items: Optional[List[CartItemType]] = None


# ===================================================================
# 2. STRAWBERRY GRAPHQL INPUT TYPES (for Mutations)
# ===================================================================

@strawberry.input
class CustomizationsInput:
    """Input for providing item customizations during mutations."""
    size: Optional[str] = strawberry.UNSET
    additions: Optional[List[str]] = strawberry.UNSET
    removals: Optional[List[str]] = strawberry.UNSET
    notes: Optional[str] = strawberry.UNSET


@strawberry.input
class AddToCartInput:
    """A clean and secure input for adding an item to the cart."""
    # Accept the frontend's camelCase shape so clients can pass everything they know
    # (we only need menuItemId and quantity server-side; other fields are optional
    # and accepted for convenience and future use).
    menuItemId: int
    quantity: int = 1
    customizations: Optional[CustomizationsInput] = None
    # Optional extra fields the frontend sends — accepted but not required by server logic
    name: Optional[str] = None
    price: Optional[float] = None
    canteenId: Optional[int] = None
    canteenName: Optional[str] = None


# ===================================================================
# 3. STRAWBERRY MUTATION RESPONSE TYPE
# ===================================================================

@strawberry.type
class CartMutationResponse:
    """
    Standard response for cart mutations.
    Returns the entire updated cart on success for a better client experience.
    """
    success: bool
    message: str
    cart: Optional[CartType] = None
    # When a single cart item is added/modified, clients may request it directly.
    cartItem: Optional[CartItemType] = None


# ===================================================================
# 4. SQLAlchemy DATABASE MODELS
# ===================================================================

class Cart(Base):
    """
    The SQLAlchemy model for a Cart. It has a one-to-one relationship with a User.
    It does NOT store items directly; it uses a one-to-many relationship to CartItem.
    """
    __tablename__ = "carts"
    
    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)) 
    pickup_date = Column(DateTime, nullable=True)
    pickup_time = Column(String, nullable=True)
    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan", lazy="joined")

    @property
    def createdAt(self) -> Optional[str]:
        return to_ist_iso(getattr(self, "created_at", None))

    @property
    def updatedAt(self) -> Optional[str]:
        return to_ist_iso(getattr(self, "updated_at", None))


class CartItem(Base):
    """
    The SQLAlchemy model for a single item within a cart.
    This is the source of truth for what a user has in their cart.
    It does NOT store redundant data like name or price.
    """
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    quantity = Column(Integer, default=1, nullable=False)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    customizations = Column(JSON, nullable=True)
    cart = relationship("Cart", back_populates="items")
    menu_item = relationship("MenuItem", lazy="joined")