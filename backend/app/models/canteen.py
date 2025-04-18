from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Canteen(Base):
    __tablename__ = "canteens"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    image = Column(String)
    location = Column(String)
    rating = Column(Float, default=0.0)
    openTime = Column(String)  # Changed from Time to String to match frontend
    closeTime = Column(String)  # Changed from Time to String to match frontend
    isOpen = Column(Boolean, default=True)  # Changed from is_open to match frontend
    description = Column(String)
    phone = Column(String)
    userId = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    menuItems = relationship("MenuItem", back_populates="canteen")
    orders = relationship("Order", back_populates="canteen")
    user = relationship("User", back_populates="canteens")