# backend/app/services/payment_service.py
from typing import Dict, Any, Optional, List
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.payment_repository import PaymentRepository, MerchantRepository, WalletRepository
from app.services.payment_adapters import PaymentProcessor, RazorpayAdapter, WalletAdapter
from ..models.payment import PaymentStatus, PaymentMethod

class PaymentService:
    """
    Service class for payment operations
    
    Rationale:
    - Implements business logic for payment operations
    - Acts as a facade for the repositories and adapters
    - Coordinates between different components of the payment system
    """
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        self.payment_repo = PaymentRepository(db)
        self.merchant_repo = MerchantRepository(db)
        self.wallet_repo = WalletRepository(db)

    def get_payment_processor(self, payment_method: str, merchant_id: Optional[int] = None) -> PaymentProcessor:
        """Factory method to get the appropriate payment processor based on method"""
        if payment_method == PaymentMethod.UPI.value:
            if not merchant_id:
                raise HTTPException(status_code=400, detail="Merchant ID required for UPI payments")

            merchant = self.merchant_repo.get_merchant_by_id(merchant_id)
            if not merchant:
                raise HTTPException(status_code=404, detail="Merchant not found")

            return RazorpayAdapter(key_id=merchant.razorpay_key_id, key_secret=merchant.razorpay_key_secret)

        elif payment_method == PaymentMethod.WALLET.value:
            return WalletAdapter(db=self.db)

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported payment method: {payment_method}")

    async def get_order_details(self, order_id: int) -> Dict[str, Any]:
        """Get order details from Order service"""
        # In a real implementation, this would call the Order service
        # For now, we'll mock it
        return {
            "id": order_id,
            "total_amount": 250.0,  # Mock value
            "user_id": 1,  # Mock value
            "canteen_id": 1  # Mock value
        }

    async def initiate_payment(self, order_id: int, user_id: int, payment_method: str, merchant_id: Optional[int] = None) -> Dict[str, Any]:
        """Initiate a payment for an order"""
        # Check if order already has a completed payment
        existing_payments = self.payment_repo.get_payment_by_order_id(order_id)
        for payment in existing_payments:
            if payment.payment_status == PaymentStatus.COMPLETED.value:
                raise HTTPException(status_code=400, detail="Order already paid")

        # Get order details
        order = await self.get_order_details(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Get payment processor based on method
        payment_processor = self.get_payment_processor(payment_method, merchant_id)

        # Process payment
        payment_data = {
            "order_id": order_id,
            "user_id": user_id,
            "amount": order["total_amount"]
        }
        payment_response = payment_processor.process_payment(payment_data)

        # Create payment record
        payment_record = self.payment_repo.create_payment({
            "order_id": order_id,
            "user_id": user_id,
            "merchant_id": merchant_id,
            "amount": order["total_amount"],
            "payment_method": payment_method,
            "payment_status": PaymentStatus.PENDING.value,
            "razorpay_order_id": payment_response.get("razorpay_order_id"),
            "payment_response": str(payment_response)
        })

        # Return payment details
        return {
            "payment_id": payment_record.id,
            "order_id": order_id,
            "amount": order["total_amount"],
            "payment_method": payment_method,
            "razorpay_order_id": payment_response.get("razorpay_order_id"),
            "status": "pending"
        }

    async def verify_payment(self, payment_id: int, verification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Verify and complete a payment"""
        # Get payment record
        payment = self.payment_repo.get_payment_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        # Get payment processor
        payment_processor = self.get_payment_processor(payment.payment_method, payment.merchant_id)

        # Add payment details to verification data
        verification_data.update({
            "payment_id": payment.id,
            "order_id": payment.order_id,
            "user_id": payment.user_id,
            "amount": payment.amount
        })

        # Verify payment
        verification_result = payment_processor.verify_payment(verification_data)

        if verification_result["status"] == "success":
            # Update payment status
            updated_payment = self.payment_repo.verify_payment_completion(
                payment_id, 
                verification_data
            )

            # Update order status (this would call Order service in a real implementation)
            # self.update_order_status(payment.order_id, "paid")

            return {
                "payment_id": payment.id,
                "order_id": payment.order_id,
                "status": "completed",
                "message": "Payment verified successfully"
            }
        else:
            # Update payment record with failure
            self.payment_repo.update_payment(payment_id, {
                "payment_status": PaymentStatus.FAILED.value,
                "payment_response": str(verification_result)
            })

            return {
                "payment_id": payment.id,
                "order_id": payment.order_id,
                "status": "failed",
                "message": verification_result.get("error", "Payment verification failed")
            }

    async def get_payment_history(self, user_id: int) -> List[Dict[str, Any]]:
        """Get payment history for a user"""
        payments = self.payment_repo.get_payments_by_user_id(user_id)
        return [
            {
                "payment_id": payment.id,
                "order_id": payment.order_id,
                "amount": payment.amount,
                "payment_method": payment.payment_method,
                "status": payment.payment_status,
                "created_at": payment.created_at
            }
            for payment in payments
        ]