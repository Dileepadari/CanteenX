from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Cart(Base):
    __tablename__ = "carts"
    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"))
    items = Column(JSON)  # Store as JSON array
    totalAmount = Column(Float, default=0)
    canteenId = Column(Integer, ForeignKey("canteens.id"))
    createdAt = Column(String)
    updatedAt = Column(String)
    
    # Relationships
    user = relationship("User", backref="cart")
    canteen = relationship("Canteen")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"))
    menuItemId = Column(Integer, ForeignKey("menu_items.id"))
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    customizations = Column(String, nullable=True)  # Stored as JSON string
    image = Column(String, nullable=True)
    description = Column(String, nullable=True)
    vendorName = Column(String, nullable=True)