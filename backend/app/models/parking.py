from sqlalchemy import Column, Integer, String
from app.db.base import Base


class Parking(Base):
    __tablename__ = "parkings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
