import strawberry
from typing import List, Optional
from datetime import datetime
from app.models.order import Order, OrderItem
from app.models.menu_item import MenuItem
from app.models.canteen import Canteen
from app.models.user import User
from app.core.database import get_db

@strawberry.type
class OrderMutationResponse:
    success: bool
    message: str
    orderId: Optional[int] = None

@strawberry.input
class OrderItemInput:
    itemId: int
    quantity: int
    customizations: Optional[List[str]] = None
    note: Optional[str] = None

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_order(
        self,
        userId: int,
        canteenId: int,
        items: List[OrderItemInput],
        paymentMethod: str,
        phone: str,
        customerNote: Optional[str] = None,
        isPreOrder: bool = False,
        pickupTime: Optional[str] = None,
    ) -> OrderMutationResponse:
        """Create a new order"""
        db = next(get_db())
        try:
            # Calculate total amount
            totalAmount = 0
            for item in items:
                menu_item = db.query(MenuItem).filter(MenuItem.id == item.itemId).first()
                if not menu_item:
                    return OrderMutationResponse(
                        success=False,
                        message=f"Menu item with ID {item.itemId} not found"
                    )
                totalAmount += menu_item.price * item.quantity

            # Create order
            new_order = Order(
                userId=userId,
                canteenId=canteenId,
                items=[{
                    "itemId": item.itemId,
                    "quantity": item.quantity,
                    "customizations": item.customizations,
                    "note": item.note
                } for item in items],
                totalAmount=totalAmount,
                status="pending",
                orderTime=datetime.utcnow().isoformat(),
                paymentMethod=paymentMethod,
                paymentStatus="Pending",
                customerNote=customerNote,
                phone=phone,
                isPreOrder=isPreOrder,
                pickupTime=pickupTime
            )
            db.add(new_order)
            db.commit()
            
            return OrderMutationResponse(
                success=True,
                message="Order created successfully",
                orderId=new_order.id
            )
        except Exception as e:
            db.rollback()
            return OrderMutationResponse(
                success=False,
                message=f"Failed to create order: {str(e)}"
            )

    @strawberry.mutation
    def update_order_status(
        self,
        orderId: int,
        status: str,
        currentUserId: int,  # Changed from user_email to currentUserId for authorization
    ) -> OrderMutationResponse:
        """Update order status - only canteen vendor can update status"""
        db = next(get_db())
        order = db.query(Order).filter(Order.id == orderId).first()
        
        if not order:
            return OrderMutationResponse(success=False, message="Order not found")
        
        # Check if the current user is the vendor of the canteen
        canteen = db.query(Canteen).filter(Canteen.id == order.canteenId).first()
        if not canteen:
            return OrderMutationResponse(success=False, message="Canteen not found")
            
        # Ensure the current user is the canteen vendor
        if canteen.userId != currentUserId:
            return OrderMutationResponse(
                success=False,
                message="Unauthorized: Only the canteen vendor can update order status"
            )
        
        try:
            # Update status and corresponding timestamp
            order.status = status
            if status == "confirmed":
                order.confirmedTime = datetime.utcnow().isoformat()
            elif status == "preparing":
                order.preparingTime = datetime.utcnow().isoformat()
            elif status == "ready":
                order.readyTime = datetime.utcnow().isoformat()
            elif status == "delivered":
                order.deliveryTime = datetime.utcnow().isoformat()
            elif status == "cancelled":
                order.cancelledTime = datetime.utcnow().isoformat()
            
            db.commit()
            return OrderMutationResponse(
                success=True,
                message=f"Order status updated to {status}",
                orderId=order.id
            )
        except Exception as e:
            db.rollback()
            return OrderMutationResponse(
                success=False,
                message=f"Failed to update order status: {str(e)}"
            )

    @strawberry.mutation
    def cancel_order(
        self,
        orderId: int,
        userId: int,
        reason: str
    ) -> OrderMutationResponse:
        """Cancel an order - can be done by the user who placed the order or the canteen vendor"""
        db = next(get_db())
        order = db.query(Order).filter(Order.id == orderId).first()
        
        if not order:
            return OrderMutationResponse(success=False, message="Order not found")
        
        # Get the canteen for this order
        canteen = db.query(Canteen).filter(Canteen.id == order.canteenId).first()
        if not canteen:
            return OrderMutationResponse(success=False, message="Canteen not found")
            
        # Check if the current user :
        # The canteen vendor
        if canteen.userId != userId:
            return OrderMutationResponse(
                success=False,
                message="Unauthorized: Only the canteen vendor can cancel this order"
            )
            
        try:
            order.status = "cancelled"
            order.cancelledTime = datetime.utcnow().isoformat()
            order.cancellationReason = reason
            
            db.commit()
            return OrderMutationResponse(
                success=True,
                message="Order cancelled successfully",
                orderId=order.id
            )
        except Exception as e:
            db.rollback()
            return OrderMutationResponse(
                success=False,
                message=f"Failed to cancel order: {str(e)}"
            )

    @strawberry.mutation
    def update_payment_status(
        self,
        orderId: int,
        paymentStatus: str,
        currentUserId: int,  # Changed from user_email to currentUserId for authorization
    ) -> OrderMutationResponse:
        """Update payment status - only canteen vendor can update payment status"""
        db = next(get_db())
        order = db.query(Order).filter(Order.id == orderId).first()
        
        if not order:
            return OrderMutationResponse(success=False, message="Order not found")
        
        # Check if the current user is the vendor of the canteen
        canteen = db.query(Canteen).filter(Canteen.id == order.canteenId).first()
        if not canteen:
            return OrderMutationResponse(success=False, message="Canteen not found")
            
        # Ensure the current user is the canteen vendor
        if canteen.userId != currentUserId:
            return OrderMutationResponse(
                success=False,
                message="Unauthorized: Only the canteen vendor can update payment status"
            )
        
        try:
            order.paymentStatus = paymentStatus
            db.commit()
            return OrderMutationResponse(
                success=True,
                message=f"Payment status updated to {paymentStatus}",
                orderId=order.id
            )
        except Exception as e:
            db.rollback()
            return OrderMutationResponse(
                success=False,
                message=f"Failed to update payment status: {str(e)}"
            )

mutations = [
    strawberry.field(name="createOrder", resolver=Mutation.create_order),
    strawberry.field(name="updateOrderStatus", resolver=Mutation.update_order_status),
    strawberry.field(name="cancelOrder", resolver=Mutation.cancel_order),
    strawberry.field(name="updatePaymentStatus", resolver=Mutation.update_payment_status),
]