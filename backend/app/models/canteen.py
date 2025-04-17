from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Canteen(Base):
    __tablename__ = "canteens"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    opening_time = Column(String, nullable=True)
    closing_time = Column(String, nullable=True)