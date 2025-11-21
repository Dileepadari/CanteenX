import strawberry
from typing import Optional
from strawberry.types import Info
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.complaints import Complaint, ComplaintType, CreateComplaintInput, UpdateComplaintInput
from app.models.user import User
from datetime import timedelta
from sqlalchemy import and_

def _get_complaint_as_admin(db: Session, complaint_id: int, admin_user: User) -> Complaint:
    """
    Fetches a complaint, raising an error if not found or if the user is not an admin.
    """
    if not admin_user or admin_user.role != 'admin':
        raise strawberry.GraphQLError("Unauthorized: This action requires admin privileges.")
        
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise strawberry.GraphQLError("Complaint not found.")
        
    return complaint

@strawberry.type
class ComplaintMutations:
    @strawberry.mutation
    def create_complaint(self, info: Info, input: CreateComplaintInput) -> ComplaintType:
        """
        Creates a new complaint for the currently authenticated user.
        """
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        if not current_user:
            raise strawberry.GraphQLError("You must be logged in to create a complaint.")
        
        now = datetime.now(timezone.utc)
        
        new_complaint = Complaint(
            userId=current_user.id,
            orderId=input.order_id,
            complaintText=input.complaint_text,
            heading=input.heading,
            complaintType=input.complaint_type,
            status="pending", # Default status on creation
            isEscalated=False,
            createdAt=now,
            updatedAt=now
        )
        
        db.add(new_complaint)
        db.commit()
        db.refresh(new_complaint)
        
        return new_complaint
    
    @strawberry.mutation
    def update_complaint(self, info: Info, complaint_id: int, input: UpdateComplaintInput) -> ComplaintType:
        """
        Updates a complaint. This action requires admin privileges.
        """
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        
        complaint = _get_complaint_as_admin(db, complaint_id, current_user)
        
        # Dynamically update provided fields
        update_data = {k: v for k, v in input.__dict__.items() if v is not strawberry.UNSET}
        if not update_data:
            raise strawberry.GraphQLError("No update data provided.")

        for key, value in update_data.items():
            # A simple mapping for snake_case input to camelCase model
            model_key = key.replace('_', '')
            model_key = model_key[0].lower() + ''.join(word.capitalize() for word in model_key[1:].split('_'))
            setattr(complaint, model_key, value)
        
        complaint.updatedAt = datetime.now(timezone.utc)
        db.commit()
        db.refresh(complaint)
        
        return complaint
    
    @strawberry.mutation
    def close_complaint(self, info: Info, complaint_id: int) -> ComplaintType:
        """
        Closes a complaint by setting its status to 'resolved'. Requires admin privileges.
        """
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        
        complaint = _get_complaint_as_admin(db, complaint_id, current_user)
        
        complaint.status = "resolved"
        complaint.updatedAt = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(complaint)
        
        return complaint
    
    @strawberry.mutation
    def escalate_complaint(self, info: Info, complaint_id: int) -> ComplaintType:
        """

        Escalates a complaint. Requires admin privileges.
        """
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        
        complaint = _get_complaint_as_admin(db, complaint_id, current_user)
        
        complaint.isEscalated = True
        complaint.updatedAt = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(complaint)
        
        return complaint

    @strawberry.mutation
    def escalate_stale_complaints(self, info: Info, days: int = 7) -> int:
        """Admin-only: mark complaints older than `days` and still unresolved as escalated. Returns number escalated."""
        db: Session = info.context["db"]
        current_user = info.context.get("user")
        if not current_user or current_user.role != 'admin':
            raise strawberry.GraphQLError("Unauthorized: admin privileges required.")

        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        stale = db.query(Complaint).filter(and_(Complaint.created_at < cutoff, Complaint.status != 'resolved', Complaint.is_escalated == False)).all()
        count = 0
        for c in stale:
            c.is_escalated = True
            c.updated_at = datetime.now(timezone.utc)
            count += 1

        if count > 0:
            db.commit()

        return count