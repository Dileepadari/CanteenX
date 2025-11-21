import strawberry
from typing import Optional, List
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.helpers.time_utils import to_ist_iso

# =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
# 1. STRAWBERRY GRAPHQL OUTPUT TYPES (for Queries)
# =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=

@strawberry.type
class Customizations:
    """Represents the selected customizations for an ordered item."""
    size: Optional[str] = None
    additions: Optional[List[str]] = None
    removals: Optional[List[str]] = None
    notes: Optional[str] = None

@strawberry.type
class OrderItemType:
    """The OrderItem object as exposed through the GraphQL API (uses camelCase)."""
    id: int
    itemId: int
    name: Optional[str] = None
    price: float = 0.0
    quantity: int
    customizations: Optional[Customizations] = None
    note: Optional[str] = None

@strawberry.type
class OrderStepType:
    """Represents a step in the order tracking process."""
    id: int
    orderId: int
    status: str
    description: str
    time: Optional[str] = None
    completed: bool
    current: bool

@strawberry.type
class OrderType:
    """The entire Order object, including all its items (uses camelCase)."""
    id: int
    userId: str
    canteenId: int
    items: List[OrderItemType]
    totalAmount: float
    subtotal: float
    tax: float
    status: str
    orderTime: str  # Exposed as ISO 8601 string
    confirmedTime: Optional[str] = None
    preparingTime: Optional[str] = None
    readyTime: Optional[str] = None
    deliveryTime: Optional[str] = None
    paymentMethod: str
    paymentStatus: str
    customerNote: Optional[str] = None
    discount: float
    phone: str
    pickupTime: Optional[str] = None
    isPreOrder: bool
    cancelledTime: Optional[str] = None
    cancellationReason: Optional[str] = None
    # Assuming OrderStepType is desired here
    steps: Optional[List[OrderStepType]] = None

# = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
# 2. STRAWBERRY GRAPHQL INPUT TYPES (for Mutations)
# = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

@strawberry.input
class CreateOrderInput:
    """Input for creating a new order."""
    userId: str
    canteenId: int
    items: List["CreateOrderItemInput"]
    totalAmount: float
    paymentMethod: str
    phone: str
    customerNote: Optional[str] = None
    pickupTime: Optional[str] = None
    isPreOrder: bool = False

@strawberry.input
class OrderItemInput:
    """Input for updating an existing order (all fields optional)."""
    status: Optional[str] = None
    customerNote: Optional[str] = None
    discount: Optional[float] = None
    phone: Optional[str] = None
    pickupTime: Optional[str] = None
    isPreOrder: Optional[bool] = None


# ---------------------------------------------------------------------------
# Input types used when creating orders
# ---------------------------------------------------------------------------
@strawberry.input
class CreateOrderItemInput:
    """Input representation of an order item when creating an order."""
    itemId: int
    quantity: int = 1
    customizations: Optional["OrderCustomizationsInput"] = None
    note: Optional[str] = None


@strawberry.input
class OrderCustomizationsInput:
    """Input type for item customizations in an order."""
    size: Optional[str] = None
    additions: Optional[List[str]] = None
    removals: Optional[List[str]] = None
    notes: Optional[str] = None

# =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
# 4. SQLAlchemy DATABASE MODELS
# =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=

class Order(Base):
    """
    The SQLAlchemy model for an Order.
    It does NOT store items directly; it uses a one-to-many relationship to OrderItem.
    """
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    canteen_id = Column(Integer, ForeignKey("canteens.id"), nullable=False)
    
    total_amount = Column(Float, nullable=False)
    subtotal = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    status = Column(String, default="pending")
    
    # Use timezone-aware DateTime for all timestamps. Store in UTC; serialize as IST.
    order_time = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    confirmed_time = Column(DateTime(timezone=True), nullable=True)
    preparing_time = Column(DateTime(timezone=True), nullable=True)
    ready_time = Column(DateTime(timezone=True), nullable=True)
    delivery_time = Column(DateTime(timezone=True), nullable=True)
    cancelled_time = Column(DateTime(timezone=True), nullable=True)
    
    payment_method = Column(String)
    payment_status = Column(String, default="Pending")
    customer_note = Column(String, nullable=True)
    cancellation_reason = Column(String, nullable=True)
    discount = Column(Float, default=0)
    phone = Column(String)
    pickup_time = Column(String, nullable=True)
    is_pre_order = Column(Boolean, default=False)

    # --- Relationships ---
    # The `User` model should have: `orders = relationship("Order", back_populates="user")`
    user = relationship("User", back_populates="orders")
    
    # The `Canteen` model should have: `orders = relationship("Order", back_populates="canteen")`
    canteen = relationship("Canteen", back_populates="orders")
    
    # The `Payment` model should have: `order = relationship("Order", back_populates="payments")`
    payments = relationship("Payment", back_populates="order")

    # This is the core of the normalized structure.
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    steps = relationship("OrderStep", back_populates="order", cascade="all, delete-orphan")
    # One-to-many: an Order may have multiple complaints
    complaints = relationship("Complaint", back_populates="order")

    # Backwards-compatible camelCase accessors expected by GraphQL layer
    @property
    def orderTime(self) -> Optional[str]:
        return to_ist_iso(getattr(self, "order_time", None))

    @property
    def confirmedTime(self) -> Optional[str]:
        return to_ist_iso(getattr(self, "confirmed_time", None))

    @property
    def preparingTime(self) -> Optional[str]:
        return to_ist_iso(getattr(self, "preparing_time", None))

    @property
    def readyTime(self) -> Optional[str]:
        return to_ist_iso(getattr(self, "ready_time", None))

    @property
    def deliveryTime(self) -> Optional[str]:
        return to_ist_iso(getattr(self, "delivery_time", None))

    @property
    def cancelledTime(self) -> Optional[str]:
        return to_ist_iso(getattr(self, "cancelled_time", None))

    @property
    def cancellationReason(self) -> Optional[str]:
        return getattr(self, "cancellation_reason", None)

    @property
    def canteenId(self) -> Optional[int]:
        return getattr(self, "canteen_id", None)

    @property
    def userId(self) -> Optional[str]:
        return getattr(self, "user_id", None)

    @property
    def totalAmount(self) -> float:
        return float(getattr(self, "total_amount", 0.0) or 0.0)

    @property
    def paymentMethod(self) -> Optional[str]:
        # Return a safe default (empty string) for non-nullable GraphQL fields
        val = self.__dict__.get("payment_method", None)
        return val if val is not None else ""

    @property
    def paymentStatus(self) -> Optional[str]:
        # Prefer the stored value, fall back to 'Pending' to match DB default
        val = self.__dict__.get("payment_status", None)
        return val if val is not None else "Pending"

    @property
    def customerNote(self) -> Optional[str]:
        return getattr(self, "customer_note", None)

    @property
    def discount(self) -> float:
        # Avoid recursion: read the underlying mapped value from __dict__
        val = self.__dict__.get("discount", None)
        return float(val or 0)

    @property
    def phone(self) -> Optional[str]:
        # Avoid recursion by reading the raw attribute value stored in __dict__
        # and provide an empty string for GraphQL non-nullable field.
        val = self.__dict__.get("phone", None)
        return val if val is not None else ""

    @phone.setter
    def phone(self, value: Optional[str]):
        # Allow assigning to the underlying mapped column even though we
        # expose a @property for reading. Store directly into __dict__ to
        # avoid invoking this property again.
        self.__dict__["phone"] = value

    @property
    def pickupTime(self) -> Optional[str]:
        return getattr(self, "pickup_time", None)

    @property
    def isPreOrder(self) -> bool:
        return bool(getattr(self, "is_pre_order", False))

class OrderItem(Base):
    """The SQLAlchemy model for a single item within an order."""
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    quantity = Column(Integer, default=1)
    note = Column(String, nullable=True)
    
    # Foreign keys linking this item to an order and a menu item.
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    
    # A single JSON column to store all structured customization data.
    customizations = Column(JSON, nullable=True)
    # Snapshot fields: store the name and unit price at the time of order
    snapshot_name = Column(String, nullable=True)
    snapshot_price = Column(Float, nullable=True)
    
    # --- Relationships ---
    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem")

    # CamelCase accessors
    @property
    def itemId(self) -> int:
        return getattr(self, "item_id", None)

    @property
    def name(self) -> Optional[str]:
        # Prefer stored snapshot name, fall back to linked menu_item.name
        return self.__dict__.get("snapshot_name") or (getattr(self.menu_item, 'name', None) if getattr(self, 'menu_item', None) is not None else None)

    @property
    def price(self) -> float:
        # Prefer stored snapshot price, fall back to linked menu_item.price
        val = self.__dict__.get("snapshot_price", None)
        if val is not None:
            return float(val or 0.0)
        return float(getattr(self.menu_item, 'price', 0.0) or 0.0)

    @property
    def customizations(self):
        # Read the underlying JSON value directly to avoid recursion
        return self.__dict__.get("customizations", None)

    @customizations.setter
    def customizations(self, value):
        # Allow setting JSON customizations directly when constructing
        # or updating OrderItem instances.
        self.__dict__["customizations"] = value

class OrderStep(Base):
    """The SQLAlchemy model for a step in the order tracking process."""
    __tablename__ = "order_steps"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    status = Column(String, nullable=False)
    description = Column(String, nullable=False)
    time = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False)
    current = Column(Boolean, default=False)
    
    # --- Relationship ---
    order = relationship("Order", back_populates="steps")

    @property
    def orderId(self) -> int:
        return getattr(self, "order_id", None)

    @property
    def time(self) -> Optional[str]:
        raw = self.__dict__.get("time", None)
        return to_ist_iso(raw) if raw is not None else None
