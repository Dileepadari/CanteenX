"""Domain enumerations.

Every one of these replaces a free-text string column. `Order.status` used to
accept any string at all, and the codebase wrote "Pending", "pending", "Paid",
and "Completed" for overlapping concepts, so no query could reliably filter it.
"""

from __future__ import annotations

import enum


class UserRole(str, enum.Enum):
    STUDENT = "student"
    STAFF = "staff"
    VENDOR = "vendor"
    ADMIN = "admin"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

    @property
    def is_terminal(self) -> bool:
        return self in (OrderStatus.COMPLETED, OrderStatus.CANCELLED)

    @property
    def is_active(self) -> bool:
        return not self.is_terminal


#: Allowed vendor-driven transitions. Anything not listed here is rejected by
#: the ordering service, so a client cannot push an order backwards or skip
#: straight from `pending` to `completed`.
ORDER_STATUS_TRANSITIONS: dict[OrderStatus, frozenset[OrderStatus]] = {
    OrderStatus.PENDING: frozenset({OrderStatus.CONFIRMED, OrderStatus.CANCELLED}),
    OrderStatus.CONFIRMED: frozenset({OrderStatus.PREPARING, OrderStatus.CANCELLED}),
    OrderStatus.PREPARING: frozenset({OrderStatus.READY, OrderStatus.CANCELLED}),
    OrderStatus.READY: frozenset({OrderStatus.COMPLETED, OrderStatus.CANCELLED}),
    OrderStatus.COMPLETED: frozenset(),
    OrderStatus.CANCELLED: frozenset(),
}


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, enum.Enum):
    UPI = "upi"
    CARD = "card"
    WALLET = "wallet"
    CASH = "cash"


class ComplaintStatus(str, enum.Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    CLOSED = "closed"


class ComplaintCategory(str, enum.Enum):
    FOOD_QUALITY = "food_quality"
    WRONG_ORDER = "wrong_order"
    DELAY = "delay"
    PAYMENT = "payment"
    HYGIENE = "hygiene"
    STAFF_BEHAVIOUR = "staff_behaviour"
    OTHER = "other"


class NotificationType(str, enum.Enum):
    ORDER_STATUS = "order_status"
    ORDER_PLACED = "order_placed"
    PAYMENT = "payment"
    PROMOTION = "promotion"
    COMPLAINT = "complaint"
    SYSTEM = "system"


class PromotionType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FLAT = "flat"


class ReservationStatus(str, enum.Enum):
    HELD = "held"
    COMMITTED = "committed"
    RELEASED = "released"


class BulkOrderStatus(str, enum.Enum):
    REQUESTED = "requested"
    QUOTED = "quoted"
    CONFIRMED = "confirmed"
    FULFILLED = "fulfilled"
    DECLINED = "declined"
    CANCELLED = "cancelled"
