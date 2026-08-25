from sqlalchemy import Column, Integer, String, DateTime, SmallInteger
from sqlalchemy.sql import func
from app.db.base import Base


class Sensers(Base):
    __tablename__ = "sensers"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, nullable=False, unique=True)
    status = Column(SmallInteger, nullable=False)
    last_sens_at = Column(DateTime(timezone=True), server_default=func.now())
