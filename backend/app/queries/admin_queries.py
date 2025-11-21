import strawberry
from typing import List, Optional
from strawberry.types import Info
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.canteen import Canteen, CanteenType
from app.models.order import Order
from app.models.menu_item import MenuItem, MenuItemType
from app.models.user import User, UserType
from app.models.complaints import Complaint, ComplaintType


@strawberry.type
class CanteenStatsType:
    canteenId: int
    name: str
    orderCount: int
    totalRevenue: float
    isOpen: bool


def _convert_menu_item_to_type(item: MenuItem) -> MenuItemType:
    # reuse existing model converters pattern
    return MenuItemType(
        id=item.id,
        name=item.name,
        price=item.price,
        category=item.category,
        isPopular=bool(getattr(item, "is_popular", False)),
        image=item.image,
        description=item.description,
        tags=item.tags or [],
        preparationTime=getattr(item, "preparation_time", None),
        rating=getattr(item, "rating", 0.0),
        ratingCount=getattr(item, "rating_count", 0),
        canteenId=item.canteen_id,
        canteenName=getattr(item, "canteen_name", None),
        isAvailable=getattr(item, "is_available", True),
        stockCount=getattr(item, "stock_count", None),
    )


def _convert_complaint_to_type(c: Complaint) -> ComplaintType:
    from app.helpers.time_utils import to_ist_iso

    def _iso(dt):
        return to_ist_iso(dt)

    return ComplaintType(
        id=c.id,
        userId=c.user_id,
        orderId=c.order_id,
        complaintText=c.complaint_text,
        heading=c.heading,
        complaintType=c.complaint_type,
        status=c.status,
        isEscalated=bool(c.is_escalated),
        responseText=c.response_text,
        createdAt=_iso(c.created_at),
        updatedAt=_iso(c.updated_at),
    )


@strawberry.type
class AdminQueries:
    @strawberry.field
    def get_canteen_stats(self, info: Info) -> List[CanteenStatsType]:
        """Returns basic stats (order count, revenue) per canteen."""
        db: Session = info.context["db"]
        # Left join orders to canteens and aggregate
        q = (
            db.query(
                Canteen.id.label("cid"),
                Canteen.name.label("name"),
                func.count(Order.id).label("order_count"),
                func.coalesce(func.sum(Order.total_amount), 0.0).label("revenue"),
                Canteen.is_open.label("is_open"),
            )
            .outerjoin(Order, Order.canteen_id == Canteen.id)
            .group_by(Canteen.id)
        )

        results = q.all()
        stats = []
        for r in results:
            stats.append(
                CanteenStatsType(
                    canteenId=r.cid,
                    name=r.name,
                    orderCount=int(r.order_count or 0),
                    totalRevenue=float(r.revenue or 0.0),
                    isOpen=bool(getattr(r, "is_open", False)),
                )
            )

        return stats

    @strawberry.field
    def get_canteen_detail(self, canteen_id: int, info: Info) -> Optional[CanteenType]:
        """Return canteen detail with owner, menu items and complaints."""
        db: Session = info.context["db"]
        canteen = db.query(Canteen).filter(Canteen.id == canteen_id).first()
        if not canteen:
            return None

        # Build a CanteenType using the existing fields
        ct = CanteenType(
            id=canteen.id,
            name=canteen.name,
            email=canteen.email,
            image=canteen.image,
            location=canteen.location,
            rating=canteen.rating,
            openTime=(canteen.open_time.strftime("%H:%M") if getattr(canteen, "open_time", None) is not None else None),
            closeTime=(canteen.close_time.strftime("%H:%M") if getattr(canteen, "close_time", None) is not None else None),
            isOpen=bool(getattr(canteen, "is_open", False)),
            description=canteen.description,
            phone=canteen.phone,
            userId=canteen.user_id,
            tags=canteen.tags or [],
        )

        # Attach menu and complaints as dynamic attributes (not part of CanteenType by default)
        menu_items = db.query(MenuItem).filter(MenuItem.canteen_id == canteen.id).all()
        complaints = db.query(Complaint).filter(Complaint.order_id == None, Complaint.order_id == None).all()  # placeholder: fetch all complaints related to this canteen via orders

        # A better approach is to fetch complaints for orders placed at this canteen
        order_ids = [o.id for o in db.query(Order.id).filter(Order.canteen_id == canteen.id).all()]
        complaint_objs = db.query(Complaint).filter(Complaint.order_id.in_(order_ids)).all() if order_ids else []

        # attach convenience attrs
        setattr(ct, "menuItems", [_convert_menu_item_to_type(m) for m in menu_items])
        setattr(ct, "complaints", [_convert_complaint_to_type(c) for c in complaint_objs])

        # owner
        owner = db.query(User).filter(User.id == canteen.user_id).first()
        setattr(ct, "owner", UserType(id=owner.id, name=owner.name, email=owner.email, role=owner.role) if owner else None)

        return ct
