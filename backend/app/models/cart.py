from sqlalchemy import Column, Integer, String,Float, ForeignKey, JSON, DateTime
from datetime import datetime
from sqlalchemy.orm import relationship
from app.core.database import Base
from typing import Optional, List
import strawberry


class Cart(Base):
    __tablename__ = "carts"
    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"))
    items = Column(JSON)  # Store as JSON array
    totalAmount = Column(Float, default=0)
    canteenId = Column(Integer, ForeignKey("canteens.id"))
    createdAt = Column(String)
    updatedAt = Column(String)
    pickupDate = Column(DateTime, nullable=True)
    pickupTime = Column(String, nullable=True) 
    # Relationships
    user = relationship("User", backref="cart")
    canteen = relationship("Canteen")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    cartId = Column(Integer, ForeignKey("carts.id"))
    menuItemId = Column(Integer, ForeignKey("menu_items.id"))
    price = Column(Float, nullable=True)
    quantity = Column(Integer, default=1)
    selectedSize = Column(String, nullable=True)  # Updated to match AddToCartInput
    selectedExtras = Column(String, nullable=True)  # Updated to match AddToCartInput
    specialInstructions = Column(String, nullable=True)
    location = Column(String, nullable=True)  # e.g., "Faculty Lounge", "Main Mess"
    name = Column(String, nullable=True)  # Added to match AddToCartInput
    canteenId = Column(Integer, nullable=True)  # Added to match AddToCartInput
    canteenName = Column(String, nullable=True)  # Added to match AddToCartInput
    customizations = Column(JSON, nullable=True)  # Store as JSON