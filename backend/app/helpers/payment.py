from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging
import traceback

from app.core.database import get_db
from app.helpers.payment_service import PaymentService
from app.models.payment import Merchant, PaymentMethod
from sqlalchemy import text
from app.models.order import Order
from app.helpers.exceptions import ServiceError, PaymentVerificationError
from pydantic import BaseModel
from typing import Any, Dict, Optional


# --- Pydantic request/response schemas used by the REST payment endpoints ---
class CreateOrderRequest(BaseModel):
    order_id: int
    payment_method: str


class InitiatePaymentResponse(BaseModel):
    payment_id: int
    order_id: int
    amount: float
    payment_method: str
    processor_order_id: Optional[str]
    processor_data: Optional[Dict[str, Any]]
    status: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    order_id: Optional[int] = None


class VerifyPaymentResponse(BaseModel):
    payment_id: int
    order_id: int
    status: str
    message: Optional[str]


class MerchantDetailsResponse(BaseModel):
    id: int
    canteen_id: int
    name: str
    razorpay_merchant_id: str
    razorpay_key_id: str
    is_active: bool

router = APIRouter(prefix="/api/payment", tags=["Payment"])

@router.get("/merchant/{canteen_id}", response_model=MerchantDetailsResponse)
async def get_merchant_details(canteen_id: int, db: Session = Depends(get_db)):
    """
    Retrieves the public details of a merchant, such as the Razorpay Key ID,
    which is needed by the frontend to initialize the payment process.
    """
    merchant = db.query(Merchant).filter(Merchant.canteen_id == canteen_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found for this canteen.")
    
    return merchant

@router.post("/initiate", response_model=InitiatePaymentResponse)
async def initiate_payment_for_order(
    # The authenticated user would be injected here from a dependency
    # current_user: User = Depends(get_current_user),
    request: CreateOrderRequest,
    db: Session = Depends(get_db)
):
    """
    Initiates the payment process for a given order.
    This endpoint creates a 'pending' payment record and returns the necessary
    details (like Razorpay's order_id) for the client to proceed.
    """
    payment_service = PaymentService(db)
    try:
        # For a real implementation, you would get the user ID from the auth dependency.
        # In dev mode (no auth), fall back to the actual order owner so local testing works.
        user_id_from_auth = None
        try:
            # Try to read the order owner from the DB using a raw query to avoid ORM mapper init issues
            res = db.execute(text('SELECT user_id FROM orders WHERE id = :id'), {'id': request.order_id}).fetchone()
            if res and res[0]:
                user_id_from_auth = res[0]
        except Exception:
            # If anything goes wrong, keep user_id_from_auth as None and let the service validate
            user_id_from_auth = None

        # If still not determined, use a dev placeholder (this will likely fail validation)
        if not user_id_from_auth:
            user_id_from_auth = "some_authenticated_user_id"
        
        # Convert string method to Enum (be forgiving with case from frontend)
        raw_method = request.payment_method
        if isinstance(raw_method, str):
            raw_method = raw_method.lower()
        payment_method_enum = PaymentMethod(raw_method)

        # Log the user id we will use for initiating payment (helps debug permission issues)
        logging.info("Initiating payment for order %s using user_id=%s and method=%s", request.order_id, user_id_from_auth, payment_method_enum)
        payment_record = payment_service.initiate_payment(
            order_id=request.order_id,
            user_id=user_id_from_auth,
            payment_method=payment_method_enum
        )
        
        return InitiatePaymentResponse(
            payment_id=payment_record.id,
            order_id=payment_record.order_id,
            amount=payment_record.amount,
            payment_method=payment_record.payment_method.value,
            processor_order_id=payment_record.razorpay_order_id,
            processor_data=getattr(payment_record, 'processor_data', {}),
            status=payment_record.payment_status.value
        )
    except ServiceError as e:
        # Catch specific business logic errors from the service and return appropriate HTTP statuses.
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log the full traceback for debugging in dev environments, then return a generic 500 to the client.
        logging.exception("Unexpected error in initiate_payment_for_order: %s", e)
        traceback_str = traceback.format_exc()
        # Also print the traceback to stdout so it appears in container logs immediately.
        print(traceback_str)
        raise HTTPException(status_code=500, detail="An unexpected error occurred while initiating payment.")

@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_razorpay_payment(
    request: VerifyPaymentRequest,
    db: Session = Depends(get_db)
):
    """
    Verifies a payment after the client completes the Razorpay checkout process.
    This endpoint confirms the payment signature and updates the order's payment status.
    """
    payment_service = PaymentService(db)
    try:
        # The service handles all verification logic and database updates.
        verified_payment = payment_service.verify_payment(
            razorpay_order_id=request.razorpay_order_id,
            verification_data=request.dict()
        )
        return VerifyPaymentResponse(
            payment_id=verified_payment.id,
            order_id=verified_payment.order_id,
            status=verified_payment.payment_status.value,
            message="Payment verified successfully."
        )
    except PaymentVerificationError as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {e}")
    except ServiceError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred during payment verification.")