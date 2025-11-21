import strawberry
from typing import List, Optional
from strawberry.types import Info
from sqlalchemy.orm import Session

from app.models.complaints import Complaint, ComplaintType

def convert_complaint_model_to_type(complaint: Complaint) -> ComplaintType:
    """Converts a Complaint SQLAlchemy model to a ComplaintType."""
    def _iso(dt):
        return dt.isoformat() if dt is not None else None

    return ComplaintType(
        id=complaint.id,
        userId=complaint.user_id,
        orderId=complaint.order_id,
        complaintText=complaint.complaint_text,
        heading=complaint.heading,
        complaintType=complaint.complaint_type,
        status=complaint.status,
        isEscalated=complaint.is_escalated,
        responseText=complaint.response_text,
        createdAt=_iso(complaint.created_at),
        updatedAt=_iso(complaint.updated_at),
    )

@strawberry.type
class ComplaintQueries:
    @strawberry.field
    def get_all_complaints(self, info: Info) -> List[ComplaintType]:
        """Get all complaints."""
        db: Session = info.context["db"]
        complaints = db.query(Complaint).all()
        return [convert_complaint_model_to_type(c) for c in complaints]

    @strawberry.field
    def get_complaint_by_id(self, complaint_id: int, info: Info) -> Optional[ComplaintType]:
        """Get a specific complaint by its ID."""
        db: Session = info.context["db"]
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            return None
        return convert_complaint_model_to_type(complaint)

    @strawberry.field
    def get_complaints_by_user_id(self, user_id: str, info: Info) -> List[ComplaintType]:
        """Get all complaints filed by a specific user."""
        db: Session = info.context["db"]
        complaints = db.query(Complaint).filter(Complaint.user_id == user_id).all()
        return [convert_complaint_model_to_type(c) for c in complaints]

    @strawberry.field
    def get_complaints_by_order_id(self, order_id: int, info: Info) -> List[ComplaintType]:
        """Get all complaints related to a specific order."""
        db: Session = info.context["db"]
        complaints = db.query(Complaint).filter(Complaint.order_id == order_id).all()
        return [convert_complaint_model_to_type(c) for c in complaints]