"""Domain enums exposed to GraphQL.

Registering the SQLAlchemy enums directly keeps one definition rather than a
parallel GraphQL copy that can drift.
"""

from __future__ import annotations

import strawberry

from app.db.models import enums as domain_enums

OrderStatus = strawberry.enum(domain_enums.OrderStatus, name="OrderStatus")
PaymentStatus = strawberry.enum(domain_enums.PaymentStatus, name="PaymentStatus")
PaymentMethod = strawberry.enum(domain_enums.PaymentMethod, name="PaymentMethod")
UserRole = strawberry.enum(domain_enums.UserRole, name="UserRole")
ComplaintStatus = strawberry.enum(domain_enums.ComplaintStatus, name="ComplaintStatus")
ComplaintCategory = strawberry.enum(
    domain_enums.ComplaintCategory, name="ComplaintCategory"
)
NotificationType = strawberry.enum(
    domain_enums.NotificationType, name="NotificationType"
)
PromotionType = strawberry.enum(domain_enums.PromotionType, name="PromotionType")
BulkOrderStatus = strawberry.enum(domain_enums.BulkOrderStatus, name="BulkOrderStatus")

__all__ = [
    "BulkOrderStatus",
    "ComplaintCategory",
    "ComplaintStatus",
    "NotificationType",
    "OrderStatus",
    "PaymentMethod",
    "PaymentStatus",
    "PromotionType",
    "UserRole",
]
