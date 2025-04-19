import strawberry
from typing import List, Optional, Dict
from datetime import datetime
from app.models.order import Order, OrderItem
from app.models.menu_item import MenuItem
from app.models.canteen import Canteen
from app.models.user import User
from app.core.database import get_db
import json
from sqlalchemy.orm import Session
from app.schemas.common import CustomizationsInput
from app.mutations.cart_mutations import CartMutation

@strawberry.type
class OrderMutationResponse:
    success: bool
    message: str
    orderId: Optional[int] = None

@strawberry.input
class OrderItemInput:
    itemId: int
    quantity: int
    customizations: Optional[CustomizationsInput] = None
    note: Optional[str] = None

@strawberry.type
class OrderMutation:
    @strawberry.mutation
    def create_order(
        self,
        userId: str,
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

            # Process the items for the order
            processed_items = []
            for item in items:
                item_dict = {
                    "itemId": item.itemId,
                    "quantity": item.quantity,
                    "note": item.note
                }
                
                # Handle customizations, removing __typename if present
                if item.customizations:
                    customizations_dict = {}
                    if hasattr(item.customizations, 'size'):
                        customizations_dict['size'] = item.customizations.size
                    if hasattr(item.customizations, 'additions'):
                        customizations_dict['additions'] = item.customizations.additions
                    if hasattr(item.customizations, 'removals'):
                        customizations_dict['removals'] = item.customizations.removals
                    if hasattr(item.customizations, 'notes'):
                        customizations_dict['notes'] = item.customizations.notes
                    # Add customizations only if we have valid data
                    if customizations_dict:
                        item_dict["customizations"] = customizations_dict
                
                processed_items.append(item_dict)

            # Create order
            new_order = Order(
                userId=userId,
                canteenId=canteenId,
                items=processed_items,
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
            cart_mutation = CartMutation()
            cart_mutation.clear_cart(userId)
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
        currentUserId: str,
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
    def place_scheduled_order(
        self,
        userId: str,
        canteenId: int,
        items: List[OrderItemInput],
        subtotal: float,
        totalAmount: float,
        paymentMethod: Optional[str] = None,
        pickupTime: Optional[str] = None,
        customerNote: Optional[str] = None,
        phone: str = "",
    ) -> OrderMutationResponse:
        """Place a scheduled order"""
        db = next(get_db())
        try:
            # Process the items for the order
            processed_items = []
            for item in items:
                item_dict = {
                    "itemId": item.itemId,
                    "quantity": item.quantity,
                    "note": item.note
                }
                
                # Handle customizations, removing __typename if present
                if item.customizations:
                    customizations_dict = {}
                    if hasattr(item.customizations, 'size'):
                        customizations_dict['size'] = item.customizations.size
                    if hasattr(item.customizations, 'additions'):
                        customizations_dict['additions'] = item.customizations.additions
                    if hasattr(item.customizations, 'removals'):
                        customizations_dict['removals'] = item.customizations.removals
                    if hasattr(item.customizations, 'notes'):
                        customizations_dict['notes'] = item.customizations.notes
                    # Add customizations only if we have valid data
                    if customizations_dict:
                        item_dict["customizations"] = customizations_dict
                
                processed_items.append(item_dict)

            new_order = Order(
                userId=userId,
                canteenId=canteenId,
                items=processed_items,
                totalAmount=totalAmount,
                status="scheduled",
                orderTime=datetime.utcnow().isoformat(),
                paymentMethod=paymentMethod or "Cash",
                paymentStatus="Pending",
                customerNote=customerNote,
                phone=phone,
                isPreOrder=True,
                pickupTime=pickupTime
            )
            db.add(new_order)
            db.commit()
            
            return OrderMutationResponse(
                success=True,
                message=f"Scheduled order #{new_order.id} placed successfully",
                orderId=new_order.id
            )
        except Exception as e:
            db.rollback()
            return OrderMutationResponse(
                success=False,
                message=f"Failed to place scheduled order: {str(e)}"
            )

    @strawberry.mutation
    def update_order(
        self,
        orderId: int,
        status: Optional[str] = None,
        paymentStatus: Optional[str] = None,
        paymentMethod: Optional[str] = None,
        pickupTime: Optional[str] = None,
        customerNote: Optional[str] = None,
    ) -> OrderMutationResponse:
        """Update an existing order"""
        db = next(get_db())
        order = db.query(Order).filter(Order.id == orderId).first()

        if not order:
            return OrderMutationResponse(success=False, message="Order not found")

        try:
            if status:
                order.status = status
            if paymentStatus:
                order.paymentStatus = paymentStatus
            if paymentMethod:
                order.paymentMethod = paymentMethod
            if pickupTime:
                order.pickupTime = pickupTime
            if customerNote:
                order.customerNote = customerNote
                
            order.updated_at = datetime.utcnow().isoformat()
            db.commit()
            
            return OrderMutationResponse(
                success=True,
                message="Order updated successfully",
                orderId=order.id
            )
        except Exception as e:
            db.rollback()
            return OrderMutationResponse(
                success=False, 
                message=f"Failed to update order: {str(e)}"
            )

    @strawberry.mutation
    def cancel_order(
        self,
        userId: str,
        orderId: int,
        reason: Optional[str] = None,
    ) -> OrderMutationResponse:
        """Cancel an order"""
        db = next(get_db())
        order = db.query(Order).filter(Order.id == orderId).first()
        
        if not order:
            return OrderMutationResponse(success=False, message="Order not found")
            
        # Check if the user is authorized to cancel this order
        if order.userId != userId:
            return OrderMutationResponse(
                success=False,
                message="Unauthorized: You can only cancel your own orders"
            )
            
        # Check if the order can be cancelled (not already delivered, etc.)
        if order.status in ["delivered", "completed"]:
            return OrderMutationResponse(
                success=False,
                message="Cannot cancel order: Order is already delivered or completed"
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
        currentUserId: str,
    ) -> OrderMutationResponse:
        """Update payment status - only canteen vendor or admin can update"""
        db = next(get_db())
        order = db.query(Order).filter(Order.id == orderId).first()
        
        if not order:
            return OrderMutationResponse(success=False, message="Order not found")
        
        # Check if the current user is the vendor of the canteen or an admin
        canteen = db.query(Canteen).filter(Canteen.id == order.canteenId).first()
        user = db.query(User).filter(User.id == currentUserId).first()
        
        if not canteen or not user:
            return OrderMutationResponse(success=False, message="Canteen or user not found")
            
        # Ensure the current user is authorized
        if canteen.userId != currentUserId and user.role != "admin":
            return OrderMutationResponse(
                success=False,
                message="Unauthorized: Only the canteen vendor or admin can update payment status"
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

# Export the mutation fields
mutations = [
    strawberry.field(name="createOrder", resolver=OrderMutation.create_order),
    strawberry.field(name="updateOrderStatus", resolver=OrderMutation.update_order_status),
    strawberry.field(name="placeScheduledOrder", resolver=OrderMutation.place_scheduled_order),
    strawberry.field(name="updateOrder", resolver=OrderMutation.update_order),
    strawberry.field(name="cancelOrder", resolver=OrderMutation.cancel_order),
    strawberry.field(name="updatePaymentStatus", resolver=OrderMutation.update_payment_status),
]