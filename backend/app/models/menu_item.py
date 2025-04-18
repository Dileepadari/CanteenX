from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"
    
    id = Column(Integer, primary_key=True, index=True)
    canteenId = Column(Integer, ForeignKey("canteens.id"))
    canteenName = Column(String)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    category = Column(String)
    image = Column(String)
    tags = Column(JSON)  # Store as JSON array
    rating = Column(Float, default=0.0)
    ratingCount = Column(Integer, default=0)
    isAvailable = Column(Boolean, default=True)
    preparationTime = Column(Integer)  # in minutes
    isPopular = Column(Boolean, default=False)
    customizationOptions = Column(JSON)  # Store as JSON object
    
    # Relationships
    canteen = relationship("Canteen", back_populates="menu_items")
    # Removed order_items relationship since we're using JSON for order items

