from sqlalchemy import Column, Integer, String, ForeignKey, SmallInteger, Numeric
from app.db.base import Base


class Parking_spaces(Base):
    __tablename__ = "parking_spaces"

    id = Column(Integer, primary_key=True, index=True)
    parking_number = Column(Integer, nullable=False)
    type = Column(String, nullable=False)
    status = Column(SmallInteger, nullable=False)
    parking_id = Column(Integer, ForeignKey("parkings.id"))
    sensor_id = Column(Integer, ForeignKey("sensors.id"))
    x = Column(Numeric, nullable=True)
    y = Column(Numeric, nullable=True)
    width = Column(Numeric, nullable=True)
    height = Column(Numeric, nullable=True)
