from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    category = Column(String, nullable=True)
    canteen_id = Column(Integer, ForeignKey("canteens.id"))
    is_available = Column(Integer, default=1)  # 1 for available, 0 for unavailable
    is_vegetarian = Column(Integer, default=0)  # 1 for vegetarian, 0 for non-vegetarian
    is_featured = Column(Integer, default=0)  # 1 for featured, 0 for non-featured