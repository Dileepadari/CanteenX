from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    orderId = Column(Integer, ForeignKey("orders.id"))
    itemId = Column(Integer, ForeignKey("menu_items.id"))
    quantity = Column(Integer, default=1)
    customizations = Column(JSON, nullable=True)  # Array of customization strings
    note = Column(String, nullable=True)
    
    # # Relationships
    # order = relationship("Order", back_populates="items")
    # menu_item = relationship("MenuItem", back_populates="order_items")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"))
    canteenId = Column(Integer, ForeignKey("canteens.id"))
    items = Column(JSON)  # Store order items as JSON
    totalAmount = Column(Float, nullable=False)
    status = Column(String)
    orderTime = Column(String)
    confirmedTime = Column(String, nullable=True)
    preparingTime = Column(String, nullable=True)
    readyTime = Column(String, nullable=True)
    deliveryTime = Column(String, nullable=True)
    paymentMethod = Column(String)
    paymentStatus = Column(String)
    customerNote = Column(String, nullable=True)
    discount = Column(Float, default=0)
    phone = Column(String)
    pickupTime = Column(String, nullable=True)
    isPreOrder = Column(Boolean, default=False)
    cancelledTime = Column(String, nullable=True)
    cancellationReason = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    canteen = relationship("Canteen", back_populates="orders")

class OrderStep(Base):
    __tablename__ = "order_steps"
    id = Column(Integer, primary_key=True, index=True)
    orderId = Column(String, ForeignKey("orders.id"))
    status = Column(String, nullable=False)
    description = Column(String, nullable=False)
    time = Column(String, nullable=True)
    completed = Column(Integer, default=0)  # 0 for not completed, 1 for completed
    current = Column(Integer, default=0)    # 0 for not current, 1 for current