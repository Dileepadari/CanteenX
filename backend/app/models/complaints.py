from sqlalchemy import Column, Integer, String, Boolean, Enum
from app.core.database import Base
from pydantic import BaseModel
from typing import List, Optional
import strawberry

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, nullable=False)  # Assuming userId is a foreign key to the users table
    orderId = Column(Integer, nullable=False)  # Assuming orderId is a foreign key to the orders table
    complaintText = Column(String, nullable=False)
    heading = Column(String, nullable=False)  # Subject or heading of the complaint
    complaintType = Column(Enum("food_quality", "wrong_order", "billing_issue", "pickup_issue", "poor_service", "other"), nullable=False)
    status = Column(Enum("pending", "resolved", "rejected"), default="pending")
    isEscalated = Column(Boolean, default=False)  # Whether the complaint has been escalated to higher authorities
    responseText = Column(String, nullable=True)  # Response from the canteen or admin
    createdAt = Column(String, nullable=False) 
    updatedAt = Column(String, nullable=True)  
    
    
@strawberry.type
class ComplaintType:
    id: int
    userId: int
    orderId: int
    complaintText: str
    heading: str
    complaintType: str
    status: str
    isEscalated: bool
    responseText: Optional[str] = None
    createdAt: str
    updatedAt: Optional[str] = None
    
