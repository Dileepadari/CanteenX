from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.payment import Merchant
from app.services.payment_service import PaymentService
from typing import Dict, Any
import uuid
import json
from datetime import datetime

router = APIRouter(prefix="/api/payment", tags=["payment"])

@router.get("/merchant/{canteen_id}")
async def get_merchant_details(canteen_id: int, db: Session = Depends(get_db)):
    """Get merchant details for a specific canteen"""
    merchant = db.query(Merchant).filter(Merchant.canteen_id == canteen_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    
    return {
        "razorpay_key_id": merchant.razorpay_key_id,
        "name": merchant.name,
        "canteen_id": merchant.canteen_id
    }

@router.post("/create-order")
async def create_payment_order(order_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new payment order"""
    try:
        canteen_id = order_data.get("canteenId", 1)
        
        # Get merchant details
        merchant = db.query(Merchant).filter(Merchant.canteen_id == canteen_id).first()
        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant not found")
        
        # Create a simple order ID
        receipt = f"receipt_{uuid.uuid4().hex[:8]}"
        
        # Create payment service
        payment_service = PaymentService(db=db)
        
        # Create payment with Razorpay adapter
        payment_processor = payment_service.get_payment_processor(
            payment_method="UPI", 
            merchant_id=merchant.id
        )
        
        razorpay_order = payment_processor.process_payment({
            "amount": order_data["amount"] / 100,  # Convert back to rupees
            "currency": order_data["currency"],
            "receipt": receipt,
            "order_id": order_data.get("orderId", receipt),
            "user_id": order_data.get("userId", "1")
        })
        
        return {
            "id": razorpay_order["razorpay_order_id"],
            "amount": order_data["amount"],
            "currency": order_data["currency"],
            "receipt": receipt
        }
    except Exception as e:
        print(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@router.post("/verify")
async def verify_payment(payment_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Verify Razorpay payment"""
    try:
        # This would normally verify the payment with Razorpay
        # For demo, we'll just return success
        return {
            "success": True,
            "payment_id": payment_data.get("razorpay_payment_id", ""),
            "order_id": payment_data.get("razorpay_order_id", "")
        }
    except Exception as e:
        print(f"Error verifying payment: {e}")
        raise HTTPException(status_code=500, detail=str(e))