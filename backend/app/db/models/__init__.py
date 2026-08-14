"""SQLAlchemy models.

Importing this package registers every mapper, which Alembic's autogenerate and
the relationship resolver both depend on. Import it, never individual modules,
when you need "all models loaded".
"""

from app.db.models.base import (
    IntPKMixin,
    Money,
    TimestampMixin,
    TZDateTime,
    UUIDPKMixin,
    new_uuid,
    utcnow,
)
from app.db.models.bulk_order import BulkOrder
from app.db.models.canteen import Canteen
from app.db.models.cart import Cart, CartItem
from app.db.models.complaint import Complaint
from app.db.models.enums import (
    ORDER_STATUS_TRANSITIONS,
    BulkOrderStatus,
    ComplaintCategory,
    ComplaintStatus,
    NotificationType,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    PromotionType,
    ReservationStatus,
    UserRole,
)
from app.db.models.menu import MenuItem
from app.db.models.notification import Notification
from app.db.models.order import Order, OrderItem, OrderStatusEvent, StockReservation
from app.db.models.payment import (
    Payment,
    PaymentWebhookEvent,
    UserWallet,
    WalletTransaction,
)
from app.db.models.promotion import Promotion, PromotionRedemption
from app.db.models.review import Review
from app.db.models.setting import PlatformSetting
from app.db.models.user import (
    RefreshToken,
    User,
    canteen_staff,
    user_favorite_canteens,
)

__all__ = [
    "ORDER_STATUS_TRANSITIONS",
    "BulkOrder",
    "BulkOrderStatus",
    "Canteen",
    "Cart",
    "CartItem",
    "Complaint",
    "ComplaintCategory",
    "ComplaintStatus",
    "IntPKMixin",
    "MenuItem",
    "Money",
    "Notification",
    "NotificationType",
    "Order",
    "OrderItem",
    "OrderStatus",
    "OrderStatusEvent",
    "Payment",
    "PaymentMethod",
    "PaymentStatus",
    "PaymentWebhookEvent",
    "PlatformSetting",
    "Promotion",
    "PromotionRedemption",
    "PromotionType",
    "RefreshToken",
    "ReservationStatus",
    "Review",
    "StockReservation",
    "TZDateTime",
    "TimestampMixin",
    "UUIDPKMixin",
    "User",
    "UserRole",
    "UserWallet",
    "WalletTransaction",
    "canteen_staff",
    "new_uuid",
    "user_favorite_canteens",
    "utcnow",
]
