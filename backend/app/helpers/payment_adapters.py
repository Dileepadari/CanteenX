import uuid
from typing import Dict, Any, Optional

import razorpay
from sqlalchemy.orm import Session
from pydantic import BaseModel

# It's good practice to have a central place for your custom exceptions
from app.helpers.exceptions import PaymentProcessingError, PaymentVerificationError, RefundError
from app.models.payment import PaymentMethod # Assuming you have a PaymentMethod enum
from app.helpers.payment_repository import WalletRepository

# ===================================================================
# 1. STANDARDIZED DATA CONTRACTS (PYDANTIC MODELS)
# ===================================================================

class ProcessPaymentOutput(BaseModel):
    """Standardized response after successfully initiating a payment."""
    # This ID is from the payment processor (e.g., Razorpay's 'order_id_...')
    processor_order_id: str
    # Contains any other data the client might need, like amount, currency, etc.
    processor_data: Dict[str, Any]


class VerifyPaymentOutput(BaseModel):
    """Standardized response after a payment is successfully verified."""
    # This ID is the final transaction/payment ID from the processor.
    processor_payment_id: str
    # The full response from the payment gateway can be useful for logging.
    full_response: Dict[str, Any]


class RefundOutput(BaseModel):
    """Standardized response after a payment is successfully refunded."""
    processor_refund_id: str
    status: str
    full_response: Dict[str, Any]

# ===================================================================
# 2. ABSTRACT BASE CLASS AND ADAPTER IMPLEMENTATIONS
# ===================================================================

class PaymentProcessor:
    """
    Abstract base class defining the payment processor interface.
    All methods should raise custom exceptions on failure and return
    Pydantic models on success.
    """
    def process_payment(self, payment_data: Dict[str, Any]) -> ProcessPaymentOutput:
        raise NotImplementedError

    def verify_payment(self, verification_data: Dict[str, Any]) -> VerifyPaymentOutput:
        raise NotImplementedError

    def refund_payment(self, payment_id: str, amount: float) -> RefundOutput:
        raise NotImplementedError


class RazorpayAdapter(PaymentProcessor):
    def __init__(self, key_id: str, key_secret: str):
        try:
            self.client = razorpay.Client(auth=(key_id, key_secret))
        except Exception as e:
            # Handle initialization failure
            raise ConnectionError(f"Failed to initialize Razorpay client: {e}")

    def process_payment(self, payment_data: Dict[str, Any]) -> ProcessPaymentOutput:
        try:
            amount_in_paise = int(payment_data["amount"] * 100)
            order_data = {
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": f"order_{uuid.uuid4().hex[:10]}",
                "notes": {
                    "order_id": str(payment_data["order_id"]),
                    "user_id": str(payment_data["user_id"]),
                },
            }
            razorpay_order = self.client.order.create(data=order_data)
            return ProcessPaymentOutput(
                processor_order_id=razorpay_order["id"],
                processor_data={"amount": razorpay_order["amount"], "currency": "INR"},
            )
        except Exception as e:
            raise PaymentProcessingError(f"Razorpay failed to create order: {e}")

    def verify_payment(self, verification_data: Dict[str, Any]) -> VerifyPaymentOutput:
        try:
            self.client.utility.verify_payment_signature(verification_data)
            payment = self.client.payment.fetch(verification_data["razorpay_payment_id"])

            if payment.get("status") != "captured":
                raise PaymentVerificationError(f"Payment not captured. Status: {payment.get('status')}")
            
            return VerifyPaymentOutput(
                processor_payment_id=verification_data["razorpay_payment_id"],
                full_response=payment,
            )
        except Exception as e:
            raise PaymentVerificationError(f"Razorpay signature verification failed: {e}")

    def refund_payment(self, payment_id: str, amount: float) -> RefundOutput:
        try:
            amount_in_paise = int(amount * 100)
            refund = self.client.payment.refund(payment_id, {"amount": amount_in_paise})
            return RefundOutput(
                processor_refund_id=refund["id"],
                status=refund["status"],
                full_response=refund
            )
        except Exception as e:
            raise RefundError(f"Razorpay refund failed: {e}")


class MockRazorpayAdapter(PaymentProcessor):
    """
    A lightweight mock adapter for development/demo environments.
    It does not call external services and returns deterministic fake IDs.
    """
    def process_payment(self, payment_data: Dict[str, Any]) -> ProcessPaymentOutput:
        # Create a fake processor order id and return basic processor data
        processor_order_id = f"mock_order_{uuid.uuid4().hex[:10]}"
        return ProcessPaymentOutput(
            processor_order_id=processor_order_id,
            processor_data={"amount": int(payment_data["amount"] * 100), "currency": "INR"}
        )

    def verify_payment(self, verification_data: Dict[str, Any]) -> VerifyPaymentOutput:
        # For demo, accept any payment id and echo it back as 'captured'
        proc_payment_id = verification_data.get("razorpay_payment_id") or f"mock_payment_{uuid.uuid4().hex[:8]}"
        return VerifyPaymentOutput(processor_payment_id=proc_payment_id, full_response={"status": "captured"})

    def refund_payment(self, payment_id: str, amount: float) -> RefundOutput:
        return RefundOutput(processor_refund_id=f"mock_refund_{uuid.uuid4().hex[:8]}", status="completed", full_response={"status": "completed"})


class WalletAdapter(PaymentProcessor):
    def __init__(self, db: Session):
        self.wallet_repo = WalletRepository(db)

    def process_payment(self, payment_data: Dict[str, Any]) -> ProcessPaymentOutput:
        user_id = payment_data["user_id"]
        amount = payment_data["amount"]
        
        # Repository methods use different names; use the available API.
        wallet = self.wallet_repo.get_by_user_id(user_id)
        if not wallet:
            wallet = self.wallet_repo.create(user_id)

        if wallet.balance < amount:
            raise PaymentProcessingError("Insufficient balance in wallet.")

        # For wallet, the "order" is just a temporary transaction ID
        transaction_id = f"wallet_txn_{uuid.uuid4().hex[:12]}"
        return ProcessPaymentOutput(
            processor_order_id=transaction_id,
            processor_data={"wallet_id": wallet.id, "amount": amount}
        )

    def verify_payment(self, verification_data: Dict[str, Any]) -> VerifyPaymentOutput:
        wallet_id = verification_data["wallet_id"]
        amount = verification_data["amount"]
        
        try:
            # Deduct balance and create a transaction record
            # update_balance returns the wallet after modification
            updated_wallet = self.wallet_repo.update_balance(wallet_id, -amount)
            # We don't have a transaction DTO handy here; return a synthetic id for demo purposes
            txn_id = f"wallet_txn_{uuid.uuid4().hex[:10]}"
            return VerifyPaymentOutput(
                processor_payment_id=txn_id,
                full_response={"status": "success", "balance_deducted": amount, "wallet_id": getattr(updated_wallet, 'id', wallet_id)}
            )
        except Exception as e:
            # This could happen if the wallet is not found or DB fails
            raise PaymentVerificationError(f"Failed to verify wallet payment: {e}")

    def refund_payment(self, payment_id: str, amount: float) -> RefundOutput:
        # Here, payment_id would be our internal WalletTransaction ID
        try:
            transaction = self.wallet_repo.get_transaction_by_id(int(payment_id))
            if not transaction:
                raise RefundError("Original wallet transaction not found.")

            # Add the amount back to the wallet
            self.wallet_repo.update_wallet_balance(transaction.wallet_id, amount)
            refund_transaction = self.wallet_repo.add_transaction(
                wallet_id=transaction.wallet_id,
                amount=amount, # Positive amount for refund
                description=f"Refund for transaction {payment_id}"
            )
            return RefundOutput(
                processor_refund_id=str(refund_transaction.id),
                status="completed",
                full_response={"status": "success", "balance_credited": amount}
            )
        except Exception as e:
            raise RefundError(f"Wallet refund failed: {e}")


# ===================================================================
# 3. PAYMENT PROCESSOR FACTORY
# ===================================================================

def get_payment_processor(
    method: PaymentMethod,
    db: Session,
    merchant_info: Optional[Dict[str, Any]] = None
) -> PaymentProcessor:
    """
    Factory function to get the correct payment processor instance.

    Args:
        method: The payment method enum (e.g., PaymentMethod.UPI).
        db: The SQLAlchemy database session.
        merchant_info: A dictionary with merchant credentials if required.

    Returns:
        An instance of a PaymentProcessor.
    """
    if method == PaymentMethod.WALLET:
        return WalletAdapter(db)
    
    if method == PaymentMethod.UPI:
        # If merchant credentials are missing or obviously placeholder values (seeded test values),
        # return a Mock adapter so developers can demo the checkout flow without real Razorpay keys.
        if (
            not merchant_info
            or "key_id" not in merchant_info
            or "key_secret" not in merchant_info
            or (isinstance(merchant_info.get("key_id"), str) and "YOUR_KEY" in merchant_info.get("key_id"))
            or (isinstance(merchant_info.get("key_secret"), str) and "YOUR_KEY" in merchant_info.get("key_secret"))
        ):
            return MockRazorpayAdapter()

        return RazorpayAdapter(key_id=merchant_info["key_id"], key_secret=merchant_info["key_secret"]) 
    
    # Add other payment methods like PAY_LATER here
    
    raise NotImplementedError(f"Payment method '{method.value}' is not supported.")