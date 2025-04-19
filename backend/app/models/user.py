from sqlalchemy import Column, String, JSON
from app.core.base import Base  # Import Base from the new module
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String)
    favoriteCanteens = Column(JSON, default=lambda: [])  # Store as JSON array
    recentOrders = Column(JSON, default=lambda: [])  # Store as JSON array
    upi_id = Column(String, nullable=True)
    wallet = relationship("UserWallet", back_populates="user", uselist=False)
    payments = relationship("Payment", back_populates="user")
    # Relationships
    orders = relationship("Order", back_populates="user")
    canteens = relationship("Canteen", back_populates="user")