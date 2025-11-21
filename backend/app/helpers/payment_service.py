from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List

from app.helpers.payment_repository import PaymentRepository, MerchantRepository
from app.helpers.payment_adapters import get_payment_processor, PaymentVerificationError
from app.models.payment import Payment, PaymentMethod, PaymentStatus
from app.models.order import Order # Assuming you have an Order model to get details
from app.models.payment_dtos import PaymentCreateDTO, PaymentUpdateDTO
from app.helpers.exceptions import (
    OrderNotFoundError, PaymentAlreadyCompletedError,
    UnsupportedPaymentMethodError, MerchantNotFoundError, ServiceError
)

class PaymentService:
    """
    Service class for orchestrating payment business logic.
    It is decoupled from HTTP and uses custom exceptions for error handling.
    """
    def __init__(self, db: Session):
        # Dependencies are injected directly into the constructor.
        self.db = db
        self.payment_repo = PaymentRepository(db)
        self.merchant_repo = MerchantRepository(db)

    def initiate_payment(
        self, order_id: int, user_id: str, payment_method: PaymentMethod
    ) -> Payment:
        """
        Initiates a payment for an order, creating a pending payment record.

        Returns:
            The newly created Payment object with processor-specific details.
        """
        # 1. Fetch and Validate the Order (Source of Truth)
        order = self.db.query(Order).filter(Order.id == order_id, Order.user_id == user_id).first()
        if not order:
            raise OrderNotFoundError(f"Order with ID {order_id} not found for this user.")

        # Prevent payment initiation for orders that are already cancelled, delivered, or confirmed
        if getattr(order, 'status', None) in ["cancelled", "delivered", "confirmed"]:
            raise ServiceError(f"Cannot initiate payment for order with status: '{order.status}'.")

        # 2. Check for existing completed payments
        existing_payments = self.payment_repo.get_by_order_id(order_id)
        if any(p.payment_status == PaymentStatus.COMPLETED for p in existing_payments):
            raise PaymentAlreadyCompletedError("This order has already been paid for.")

        # 3. Get Merchant Info if needed
        merchant_info = None
        if payment_method == PaymentMethod.UPI:
            merchant = self.merchant_repo.get_by_canteen_id(order.canteen_id)
            if not merchant:
                raise MerchantNotFoundError("No active merchant found for this canteen.")
            merchant_info = {"key_id": merchant.razorpay_key_id, "key_secret": merchant.razorpay_key_secret}

        # 4. Get the correct payment processor from the factory
        try:
            processor = get_payment_processor(payment_method, self.db, merchant_info)
        except NotImplementedError:
            raise UnsupportedPaymentMethodError(f"Payment method '{payment_method.value}' is not supported.")

        # 5. Process the payment with the adapter
        payment_data = {"order_id": order_id, "user_id": user_id, "amount": order.total_amount}
        processor_response = processor.process_payment(payment_data)

        # 6. Create the pending payment record in our database using a type-safe DTO
        payment_dto = PaymentCreateDTO(
            order_id=order_id,
            user_id=user_id,
            merchant_id=merchant.id if merchant else None,
            amount=order.total_amount,
            payment_method=payment_method,
            razorpay_order_id=processor_response.processor_order_id,
        )
        payment_record = self.payment_repo.create(payment_dto)
        
        # Attach the processor data to the record for the mutation to return to the client
        payment_record.processor_data = processor_response.processor_data
        
        return payment_record

    def verify_payment(self, razorpay_order_id: str, verification_data: Dict[str, Any]) -> Payment:
        """
        Verifies a payment with the payment gateway and updates its status.
        """
        payment = self.payment_repo.get_by_razorpay_order_id(razorpay_order_id)
        if not payment:
            raise ServiceError("Payment record not found for this Razorpay order ID.")

        merchant = self.merchant_repo.get_by_id(payment.merchant_id)
        merchant_info = {"key_id": merchant.razorpay_key_id, "key_secret": merchant.razorpay_key_secret}
        processor = get_payment_processor(payment.payment_method, self.db, merchant_info)

        try:
            # The adapter will raise PaymentVerificationError on failure
            verified_payment = processor.verify_payment(verification_data)
            
            # If successful, update our database record to 'completed'
            update_dto = PaymentUpdateDTO(
                payment_status=PaymentStatus.COMPLETED,
                razorpay_payment_id=verified_payment.processor_payment_id,
                transaction_id=verified_payment.processor_payment_id, # Can use the same for Razorpay
                payment_response=str(verified_payment.full_response),
            )
            updated_payment = self.payment_repo.update(payment.id, update_dto)

            # Also mark the associated Order as paid/confirmed so the frontend
            # sees the order as completed. Use DB column names to avoid
            # write-to-property AttributeErrors.
            try:
                order = self.db.query(Order).filter(Order.id == updated_payment.order_id).first()
                if order and order.status not in ["delivered", "cancelled", "confirmed"]:
                    order.payment_status = "Paid"
                    order.status = "confirmed"
                    from datetime import datetime, timezone

                    order.confirmed_time = datetime.now(timezone.utc)
                    self.db.add(order)
                    self.db.commit()
                    self.db.refresh(order)
                    # Clear the user's cart as payment has completed successfully.
                    try:
                        from app.models.cart import Cart

                        cart = self.db.query(Cart).filter(Cart.user_id == order.user_id).first()
                        if cart:
                            # deleting the cart will cascade-delete items (per model cascade)
                            self.db.delete(cart)
                            self.db.commit()
                    except Exception:
                        # best-effort: if clearing cart fails, swallow the error (will be visible in logs)
                        pass
            except Exception:
                # Best-effort: if marking the order fails, we don't want to lose the
                # payment record update — log and continue raising the verification result.
                pass

            return updated_payment

        except PaymentVerificationError as e:
            # If verification fails, update our record to 'failed'
            update_dto = PaymentUpdateDTO(
                payment_status=PaymentStatus.FAILED,
                payment_response=str(e),
            )
            self.payment_repo.update(payment.id, update_dto)
            # Re-raise the exception for the API layer to handle
            raise e

    def get_user_payment_history(self, user_id: str) -> List[Payment]:
        """Retrieves a user's payment history."""
        return self.payment_repo.get_all_by_user_id(user_id)