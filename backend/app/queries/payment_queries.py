import strawberry
from typing import List, Optional
from strawberry.types import Info
from sqlalchemy.orm import Session

from app.models.payment import Payment as PaymentModel, PaymentType as PaymentGQL

def _convert_payment_model_to_type(payment: PaymentModel) -> PaymentGQL:
    """Converts a Payment SQLAlchemy model to a PaymentGQL type."""
    return PaymentGQL(
        id=payment.id,
        order_id=payment.order_id,
        user_id=payment.user_id,
        merchant_id=payment.merchant_id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        payment_status=payment.payment_status,
        transaction_id=payment.transaction_id,
        razorpay_order_id=payment.razorpay_order_id,
        razorpay_payment_id=payment.razorpay_payment_id,
        payment_response=payment.payment_response,
        # Convert datetime objects to ISO 8601 string format
        created_at=payment.created_at.isoformat() if payment.created_at else None,
        updated_at=payment.updated_at.isoformat() if payment.updated_at else None,
    )

@strawberry.type
class PaymentQueries:
    @strawberry.field
    def get_payment_by_id(self, payment_id: int, info: Info) -> Optional[PaymentGQL]:
        """Get a specific payment by its ID."""
        db: Session = info.context["db"]
        payment = db.query(PaymentModel).filter(PaymentModel.id == payment_id).first()
        
        return _convert_payment_model_to_type(payment) if payment else None

    @strawberry.field
    def get_user_payment_history(self, user_id: str, info: Info) -> List[PaymentGQL]:
        """Get the full payment history for a specific user."""
        db: Session = info.context["db"]
        payments = db.query(PaymentModel).filter(PaymentModel.user_id == user_id).all()
        
        return [_convert_payment_model_to_type(p) for p in payments]