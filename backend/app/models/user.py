from sqlalchemy import Column, Integer, String, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="student")
    favoriteCanteens = Column(JSON, default=lambda: [])  # Store as JSON array
    recentOrders = Column(JSON, default=lambda: [])  # Store as JSON array
    
    # Relationships
    orders = relationship("Order", back_populates="user")
    canteens = relationship("Canteen", back_populates="user")
    
    # For authentication
    hashed_password = Column(String, nullable=True)  # Made nullable for mock data
    isActive = Column(Boolean, default=True)
