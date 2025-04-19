import razorpay
import uuid
from typing import Dict, Any
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..repositories.payment_repository import WalletRepository

class PaymentProcessor:
    """
    Abstract base class defining the payment processor interface
    
    Rationale:
    - Defines a consistent interface for all payment methods
    - Enables easy addition of new payment methods in the future
    - Allows service layer to work with different payment methods uniformly
    """
    def process_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Initiate payment processing"""
        raise NotImplementedError

    def verify_payment(self, verification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Verify payment completion"""
        raise NotImplementedError

    def refund_payment(self, payment_id: str) -> Dict[str, Any]:
        """Process payment refund"""
        raise NotImplementedError

class RazorpayAdapter(PaymentProcessor):
    """
    Adapter for Razorpay payment gateway
    
    Rationale:
    - Adapts Razorpay's API to the common PaymentProcessor interface
    - Isolates Razorpay-specific implementation details
    - Makes it easy to replace with a different provider if needed
    """
    def __init__(self, key_id: str, key_secret: str):
        self.client = razorpay.Client(auth=(key_id, key_secret))

    def process_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Convert amount to paise (Razorpay requires amount in smallest currency unit)
            amount_in_paise = int(payment_data["amount"] * 100)

            # Create Razorpay order
            order_data = {
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": f"order_{uuid.uuid4().hex[:10]}",
                "notes": {
                    "order_id": str(payment_data["order_id"]),
                    "user_id": str(payment_data["user_id"])
                }
            }

            razorpay_order = self.client.order.create(data=order_data)

            return {
                "razorpay_order_id": razorpay_order["id"],
                "amount": payment_data["amount"],
                "currency": "INR"
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to create payment: {str(e)}")

    def verify_payment(self, verification_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Verification parameters
            params_dict = {
                'razorpay_order_id': verification_data['razorpay_order_id'],
                'razorpay_payment_id': verification_data['razorpay_payment_id'],
                'razorpay_signature': verification_data['razorpay_signature']
            }

            # Verify the payment signature
            self.client.utility.verify_payment_signature(params_dict)

            # Get payment details to confirm status
            payment = self.client.payment.fetch(verification_data['razorpay_payment_id'])

            if payment['status'] != 'captured':
                return {
                    "status": "failed",
                    "error": f"Payment not captured, current status: {payment['status']}"
                }

            # If verification succeeds, return success
            return {
                "status": "success",
                "payment_id": verification_data['razorpay_payment_id'],
                "payment_details": payment
            }
        except Exception as e:
            # If verification fails
            return {
                "status": "failed",
                "error": str(e)
            }

    def refund_payment(self, payment_id: str) -> Dict[str, Any]:
        try:
            # Process refund
            refund = self.client.payment.refund(payment_id)
            return {
                "status": "success",
                "refund_id": refund["id"]
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Refund failed: {str(e)}")

class WalletAdapter(PaymentProcessor):
    """
    Adapter for wallet-based payments
    
    Rationale:
    - Adapts wallet operations to the PaymentProcessor interface
    - Enables wallet payments using the same payment flow as other methods
    """
    def __init__(self, db: Session):
        self.wallet_repo = WalletRepository(db)

    def process_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        user_id = payment_data["user_id"]
        amount = payment_data["amount"]

        # Get user wallet
        wallet = self.wallet_repo.get_wallet_by_user_id(user_id)
        if not wallet:
            # Create wallet if it doesn't exist
            wallet = self.wallet_repo.create_wallet(user_id)

        # Check if user has sufficient balance
        if wallet.balance < amount:
            raise HTTPException(status_code=400, detail="Insufficient balance in wallet")

        # Generate transaction ID
        transaction_id = f"wallet_{uuid.uuid4().hex[:10]}"

        return {
            "transaction_id": transaction_id,
            "wallet_id": wallet.id,
            "amount": amount
        }

    def verify_payment(self, verification_data: Dict[str, Any]) -> Dict[str, Any]:
        wallet_id = verification_data["wallet_id"]
        amount = verification_data["amount"]
        payment_id = verification_data.get("payment_id")

        # Deduct amount from wallet
        wallet = self.wallet_repo.update_wallet_balance(wallet_id, -amount)
        if not wallet:
            return {"status": "failed", "error": "Wallet not found"}

        # Record transaction
        transaction = self.wallet_repo.add_transaction(
            wallet_id=wallet_id,
            amount=-amount,
            description=f"Payment for order {verification_data.get('order_id')}",
            payment_id=payment_id
        )

        return {
            "status": "success",
            "transaction_id": verification_data["transaction_id"]
        }

    def refund_payment(self, payment_id: str) -> Dict[str, Any]:
        # This would be implemented for wallet refunds
        raise NotImplementedError("Wallet refunds not implemented yet")