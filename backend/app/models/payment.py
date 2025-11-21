import strawberry
from typing import Optional, List
from enum import Enum as PyEnum

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

# ===================================================================
# 1. ENUMS
# ===================================================================

# Using Python's Enum class for robust, reusable status and method definitions.
class PaymentStatus(PyEnum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(PyEnum):
    UPI = "upi"
    WALLET = "wallet"
    PAY_LATER = "pay_later"
    CASH = "cash" # Added for completeness

# Registering the enums with Strawberry to expose them in the GraphQL schema.
PaymentStatusEnum = strawberry.enum(PaymentStatus)
PaymentMethodEnum = strawberry.enum(PaymentMethod)

# ===================================================================
# 2. STRAWBERRY GRAPHQL OUTPUT TYPES (for Queries)
# ===================================================================

@strawberry.type
class PaymentType:
    """The Payment object as exposed through the GraphQL API (uses camelCase)."""
    id: int
    orderId: int
    userId: str
    merchantId: int
    amount: float
    # Fields are now strongly typed with the GraphQL enums.
    paymentMethod: PaymentMethodEnum
    paymentStatus: PaymentStatusEnum
    transactionId: Optional[str] = None
    razorpayOrderId: Optional[str] = None
    razorpayPaymentId: Optional[str] = None
    paymentResponse: Optional[str] = None
    createdAt: str
    updatedAt: str

@strawberry.type
class MerchantType:
    """The Merchant object as exposed through the GraphQL API."""
    id: int
    canteenId: int
    name: str
    razorpayMerchantId: str
    isActive: bool
    createdAt: str
    updatedAt: str

@strawberry.type
class UserWalletType:
    """The UserWallet object as exposed through the GraphQL API."""
    id: int
    userId: str
    balance: float
    isPrivileged: bool
    creditLimit: float
    createdAt: str
    updatedAt: str

@strawberry.type
class WalletTransactionType:
    """The WalletTransaction object as exposed through the GraphQL API."""
    id: int
    walletId: int
    amount: float
    description: str
    paymentId: Optional[int] = None
    createdAt: str

# ===================================================================
# 3. SQLAlchemy DATABASE MODELS
# ===================================================================

class Payment(Base):
    """The SQLAlchemy model for a Payment transaction."""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    amount = Column(Float, nullable=False)
    
    # Use the Enum type in the database for data integrity.
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    
    transaction_id = Column(String, unique=True, nullable=True)
    razorpay_order_id = Column(String, unique=True, nullable=True)
    razorpay_payment_id = Column(String, unique=True, nullable=True)
    razorpay_signature = Column(String, nullable=True)
    payment_response = Column(String, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # --- Relationships ---
    order = relationship("Order", back_populates="payments")
    user = relationship("User", back_populates="payments")
    merchant = relationship("Merchant", back_populates="merchant_payments")

class Merchant(Base):
    """The SQLAlchemy model for a Merchant, typically a canteen that accepts payments."""
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    canteen_id = Column(Integer, ForeignKey("canteens.id"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    razorpay_merchant_id = Column(String, nullable=False, unique=True)
    razorpay_key_id = Column(String, nullable=False)
    razorpay_key_secret = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # --- Relationships ---
    canteen = relationship("Canteen", back_populates="merchant")
    merchant_payments = relationship("Payment", back_populates="merchant")

class UserWallet(Base):
    """The SQLAlchemy model for a User's wallet."""
    __tablename__ = "user_wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    balance = Column(Float, default=0.0)
    is_privileged = Column(Boolean, default=False)
    credit_limit = Column(Float, default=0.0)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # --- Relationships ---
    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan")

class WalletTransaction(Base):
    """The SQLAlchemy model for a transaction associated with a UserWallet."""
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("user_wallets.id"), nullable=False)
    amount = Column(Float, nullable=False) # Can be positive (credit) or negative (debit)
    description = Column(String, nullable=False)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    # --- Relationships ---
    wallet = relationship("UserWallet", back_populates="transactions")