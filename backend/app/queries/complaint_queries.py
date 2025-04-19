import strawberry
from typing import List, Optional
from app.models.complaints import ComplaintType, Complaint
from app.core.database import get_db

def resolve_get_all_complaints() -> List[ComplaintType]:
    # Get database session
    db = next(get_db())
    
    # Query for the specific user
    complaints = db.query(Complaint).all()
    
    return [ComplaintType(
        id=complaint.id,
        userId=complaint.userId,
        orderId=complaint.orderId,
        complaintText=complaint.complaintText,
        heading=complaint.heading,
        complaintType=complaint.complaintType,
        status=complaint.status,
        isEscalated=complaint.isEscalated,
        responseText=complaint.responseText,
        createdAt=complaint.createdAt,
        updatedAt=complaint.updatedAt
    ) for complaint in complaints]


def resolve_get_complaint_by_id(complaintId: int) -> Optional[ComplaintType]:
    # Get database session
    db = next(get_db())
    
    # Query for the specific complaint
    complaint = db.query(Complaint).filter(Complaint.id == complaintId).first()
    
    if not complaint:
        return None

    return ComplaintType(
        id=complaint.id,
        userId=complaint.userId,
        orderId=complaint.orderId,
        complaintText=complaint.complaintText,
        heading=complaint.heading,
        complaintType=complaint.complaintType,
        status=complaint.status,
        isEscalated=complaint.isEscalated,
        responseText=complaint.responseText,
        createdAt=complaint.createdAt,
        updatedAt=complaint.updatedAt
    )

def resolve_get_complaints_by_user_id(userId: int) -> List[ComplaintType]:
    # Get database session
    db = next(get_db())
    
    # Query for the specific user
    complaints = db.query(Complaint).filter(Complaint.userId == userId).all()
    
    return [ComplaintType(
        id=complaint.id,
        userId=complaint.userId,
        orderId=complaint.orderId,
        complaintText=complaint.complaintText,
        heading=complaint.heading,
        complaintType=complaint.complaintType,
        status=complaint.status,
        isEscalated=complaint.isEscalated,
        responseText=complaint.responseText,
        createdAt=complaint.createdAt,
        updatedAt=complaint.updatedAt
    ) for complaint in complaints]
    
def resolve_get_complaints_by_order_id(orderId: int) -> List[ComplaintType]:
    # Get database session
    db = next(get_db())
    
    # Query for the specific order
    complaints = db.query(Complaint).filter(Complaint.orderId == orderId).all()
    
    return [ComplaintType(
        id=complaint.id,
        userId=complaint.userId,
        orderId=complaint.orderId,
        complaintText=complaint.complaintText,
        heading=complaint.heading,
        complaintType=complaint.complaintType,
        status=complaint.status,
        isEscalated=complaint.isEscalated,
        responseText=complaint.responseText,
        createdAt=complaint.createdAt,
        updatedAt=complaint.updatedAt
    ) for complaint in complaints]

# Create properly decorated fields with resolvers and matching frontend field names
getAllComplaints = strawberry.field(name="getAllComplaints", resolver=resolve_get_all_complaints)
getComplaintById = strawberry.field(name="getComplaintById", resolver=resolve_get_complaint_by_id)
getComplaintsByUserId = strawberry.field(name="getComplaintsByUserId", resolver=resolve_get_complaints_by_user_id)
getComplaintsByOrderId = strawberry.field(name="getComplaintsByOrderId", resolver=resolve_get_complaints_by_order_id)

# Add the queries to the list
queries = [
    getAllComplaints,
    getComplaintById,
    getComplaintsByUserId,
    getComplaintsByOrderId,
]