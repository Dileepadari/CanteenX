from pydantic import BaseModel
from typing import Optional
from app.models.payment import PaymentStatus, PaymentMethod # Import your enums

# --- Payment DTOs ---
class PaymentCreateDTO(BaseModel):
    order_id: int
    user_id: str
    merchant_id: int
    amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus = PaymentStatus.PENDING
    razorpay_order_id: Optional[str] = None

class PaymentUpdateDTO(BaseModel):
    payment_status: Optional[PaymentStatus] = None
    transaction_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    payment_response: Optional[str] = None

# --- Merchant DTOs ---
class MerchantCreateDTO(BaseModel):
    canteen_id: int
    name: str
    razorpay_merchant_id: str
    razorpay_key_id: str
    razorpay_key_secret: str
    is_active: bool = True

class MerchantUpdateDTO(BaseModel):
    name: Optional[str] = None
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    is_active: Optional[bool] = None

# --- Wallet DTOs ---
class WalletTransactionCreateDTO(BaseModel):
    wallet_id: int
    amount: float
    description: str
    payment_id: Optional[int] = None