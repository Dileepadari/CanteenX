from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.order import Order, OrderItem

router = APIRouter(prefix="/api/dev", tags=["Dev"])


@router.post("/create_demo_order")
async def create_demo_order(db: Session = Depends(get_db), user_id: str | None = None):
    """
    Creates a small demo order for the seeded dev user and returns its ID.
    This is a convenience endpoint for local development only.
    """
    # Default to the seeded 'John' user if none provided
    demo_user = user_id or "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

    # Create a minimal order (canteen 1, single item placeholder)
    order = Order(user_id=demo_user, canteen_id=1, total_amount=60.0, payment_method="UPI", phone="9999999999")
    db.add(order)
    db.flush()

    # Add one OrderItem referencing menu_item 101 if available
    db.add(OrderItem(order_id=order.id, item_id=101, quantity=1))
    db.commit()
    db.refresh(order)

    return {"order_id": order.id, "message": "Demo order created"}
