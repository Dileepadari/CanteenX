import json
import strawberry
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.complaints import Complaint, ComplaintType

from datetime import datetime, timezone


@strawberry.type
class ComplaintMutationResponse:
    success: bool
    message: str
    
@strawberry.type
class ComplaintMutation:
    @strawberry.mutation
    def create_complaint(
        self,
        userId: int,
        orderId: int,
        complaintText: str,
        heading: str,
        complaintType: str,
        status: str = "pending",
        isEscalated: bool = False,
        responseText: Optional[str] = None,
    ) -> ComplaintMutationResponse:
        db: Session = next(get_db())
        
        now = datetime.now(timezone.utc)
        
        new_complaint = Complaint(
            userId=userId,
            orderId=orderId,
            complaintText=complaintText,
            heading=heading,
            complaintType=complaintType,
            status=status,
            isEscalated=isEscalated,
            responseText=responseText,
            createdAt=now.isoformat(),
            updatedAt=now.isoformat()
        )
        
        db.add(new_complaint)
        db.commit()
        db.refresh(new_complaint)
        
        return ComplaintMutationResponse(success=True, message="Complaint created successfully.")
    
    @strawberry.mutation
    def update_complaint(
        self,
        complaintId: int,
        complaintText: Optional[str] = None,
        heading: Optional[str] = None,
        complaintType: Optional[str] = None,
        status: Optional[str] = None,
        isEscalated: Optional[bool] = None,
        responseText: Optional[str] = None,
    ) -> ComplaintMutationResponse:
        db: Session = next(get_db())
        
        complaint = db.query(Complaint).filter(Complaint.id == complaintId).first()
        
        if not complaint:
            return ComplaintMutationResponse(success=False, message="Complaint not found.")
        
        if complaintText:
            complaint.complaintText = complaintText
        if heading:
            complaint.heading = heading
        if complaintType:
            complaint.complaintType = complaintType
        if status:
            complaint.status = status
        if isEscalated is not None:
            complaint.isEscalated = isEscalated
        if responseText:
            complaint.responseText = responseText
        
        now = datetime.now(timezone.utc)
        complaint.updatedAt = now.isoformat()
        
        db.commit()
        
        return ComplaintMutationResponse(success=True, message="Complaint updated successfully.")
    
    @strawberry.mutation
    def close_complaint(
        self,
        complaintId: int,
    ) -> ComplaintMutationResponse:
        db: Session = next(get_db())
        
        complaint = db.query(Complaint).filter(Complaint.id == complaintId).first()
        
        if not complaint:
            return ComplaintMutationResponse(success=False, message="Complaint not found.")
        
        complaint.status = "resolved"
        
        now = datetime.now(timezone.utc)
        complaint.updatedAt = now.isoformat()
        
        db.commit()
        
        return ComplaintMutationResponse(success=True, message="Complaint closed successfully.")
    
    @strawberry.mutation
    def escalate_complaint(
        self,
        complaintId: int,
    ) -> ComplaintMutationResponse:
        db: Session = next(get_db())
        
        complaint = db.query(Complaint).filter(Complaint.id == complaintId).first()
        
        if not complaint:
            return ComplaintMutationResponse(success=False, message="Complaint not found.")
        
        complaint.isEscalated = True
        
        now = datetime.now(timezone.utc)
        complaint.updatedAt = now.isoformat()
        
        db.commit()
        
        return ComplaintMutationResponse(success=True, message="Complaint escalated successfully.")
    

mutations = [
    strawberry.field(name="createComplaint", resolver=ComplaintMutation.create_complaint),
    strawberry.field(name="updateComplaint", resolver=ComplaintMutation.update_complaint),
    strawberry.field(name="closeComplaint", resolver=ComplaintMutation.close_complaint),
    strawberry.field(name="escalateComplaint", resolver=ComplaintMutation.escalate_complaint),
]