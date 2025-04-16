from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime
from typing import List

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    total = Column(Float, nullable=False)
    status = Column(String, default="Processing")  # Processing, Preparing, Ready, Completed, Cancelled
    canteen_name = Column(String, nullable=False)
    vendor_name = Column(String, nullable=False)
    estimated_delivery_time = Column(String, nullable=True)
    current_status = Column(String, default="Order Placed")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    customizations = Column(String, nullable=True)  # Stored as JSON string
    vendor_name = Column(String, nullable=False)

class OrderStep(Base):
    __tablename__ = "order_steps"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"))
    status = Column(String, nullable=False)
    description = Column(String, nullable=False)
    time = Column(String, nullable=True)
    completed = Column(Integer, default=0)  # 0 for not completed, 1 for completed
    current = Column(Integer, default=0)    # 0 for not current, 1 for current