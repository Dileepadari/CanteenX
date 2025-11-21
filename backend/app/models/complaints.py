import strawberry
from typing import Optional, List
from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

# ===================================================================
# 1. STRAWBERRY GRAPHQL OUTPUT TYPE (for Queries)
# ===================================================================

@strawberry.type
class ComplaintType:
    """The Complaint object as exposed through the GraphQL API (uses camelCase)."""
    id: int
    userId: str
    orderId: Optional[int] = None
    complaintText: str
    heading: Optional[str] = None
    complaintType: Optional[str] = None
    status: Optional[str] = None
    isEscalated: bool
    responseText: Optional[str] = None
    # These will always exist on a created record, so they should be non-optional strings
    createdAt: str  # Exposed as ISO 8601 string
    updatedAt: str  # Exposed as ISO 8601 string

# ===================================================================
# 2. STRAWBERRY GRAPHQL INPUT TYPES (for Mutations)
# ===================================================================

@strawberry.input
class CreateComplaintInput:
    """Input for creating a new complaint (uses snake_case)."""
    # CRITICAL: userId is removed. It must be taken from the authenticated user context.
    order_id: Optional[int] = None
    complaint_text: str
    heading: Optional[str] = None
    complaint_type: Optional[str] = None

@strawberry.input
class UpdateComplaintInput:
    """Input for updating a complaint, typically by an admin (uses snake_case)."""
    # The ID of the complaint to update is passed as a separate argument in the mutation
    status: Optional[str] = strawberry.UNSET
    response_text: Optional[str] = strawberry.UNSET
    is_escalated: Optional[bool] = strawberry.UNSET
    
# ===================================================================
# 3. STRAWBERRY MUTATION RESPONSE TYPE
# ===================================================================

@strawberry.type
class ComplaintMutationResponse:
    """
    Standard response for complaint mutations.
    Returns the full complaint object on success.
    """
    success: bool
    message: str
    complaint: Optional[ComplaintType] = None

# ===================================================================
# 4. SQLAlchemy DATABASE MODEL
# ===================================================================
    
class Complaint(Base):
    """
    The SQLAlchemy model for a Complaint (uses snake_case for table columns).
    """
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    # Corrected: snake_case for column names
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    complaint_text = Column(String, nullable=False)
    heading = Column(String, nullable=True)
    complaint_type = Column(String, nullable=True)
    status = Column(String, default="pending")
    is_escalated = Column(Boolean, default=False)
    response_text = Column(String, nullable=True)
    
    # This is a robust way to handle timestamps at the database level.
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # --- Relationships ---
    # `back_populates` creates a robust bidirectional link.
    
    # The `User` model should have: `complaints = relationship("Complaint", back_populates="user")`
    user = relationship("User", back_populates="complaints")
    
    # The `Order` model should have: `complaints = relationship("Complaint", back_populates="order")`
    order = relationship("Order", back_populates="complaints")