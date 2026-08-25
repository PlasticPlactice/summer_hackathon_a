from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SensorBase(BaseModel):
    device_id: str
    status: int


class SensorCreate(SensorBase):
    pass


class SensorUpdate(BaseModel):
    device_id: str | None = None
    status: int | None = None


class SensorResponse(SensorBase):
    id: int
    last_sens_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
