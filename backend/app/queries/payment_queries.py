# backend/app/queries/payment_queries.py
from ariadne import ObjectType
from typing import Dict, Any, List
from ..services.payment_service import PaymentService
from ..models.payment import PaymentMethod

payment_query = ObjectType("Query")
payment_mutation = ObjectType("Mutation")

@payment_query.field("getPaymentById")
async def resolve_get_payment_by_id(_, info, payment_id: int):
    """GraphQL query resolver for fetching a payment by ID"""
    payment_service = PaymentService(db=info.context["db"])
    payment = payment_service.payment_repo.get_payment_by_id(payment_id)
    if not payment:
        return None

    return {
        "id": payment.id,
        "orderId": payment.order_id,
        "userId": payment.user_id,
        "amount": payment.amount,
        "paymentMethod": payment.payment_method,
        "status": payment.payment_status,
        "createdAt": payment.created_at
    }

@payment_query.field("getUserPaymentHistory")
async def resolve_get_user_payment_history(_, info, user_id: int):
    """GraphQL query resolver for fetching payment history for a user"""
    payment_service = PaymentService(db=info.context["db"])
    payments = await payment_service.get_payment_history(user_id)
    return payments

@payment_mutation.field("initiatePayment")
async def resolve_initiate_payment(_, info, input: Dict[str, Any]):
    """GraphQL mutation resolver for initiating a payment"""
    payment_service = PaymentService(db=info.context["db"])

    # Extract input parameters
    order_id = input.get("orderId")
    user_id = input.get("userId")
    payment_method = input.get("paymentMethod")
    merchant_id = input.get("merchantId")

    # Initiate payment
    result = await payment_service.initiate_payment(
        order_id=order_id,
        user_id=user_id,
        payment_method=payment_method,
        merchant_id=merchant_id
    )

    return result

@payment_mutation.field("verifyPayment")
async def resolve_verify_payment(_, info, input: Dict[str, Any]):
    """GraphQL mutation resolver for verifying a payment"""
    payment_service = PaymentService(db=info.context["db"])

    # Extract input parameters
    payment_id = input.get("paymentId")
    verification_data = {
        "razorpay_order_id": input.get("razorpayOrderId"),
        "razorpay_payment_id": input.get("razorpayPaymentId"),
        "razorpay_signature": input.get("razorpaySignature")
    }

    # Verify payment
    result = await payment_service.verify_payment(
        payment_id=payment_id,
        verification_data=verification_data
    )

    return result