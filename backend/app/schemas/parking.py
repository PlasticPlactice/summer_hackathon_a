from pydantic import BaseModel, ConfigDict
from app.schemas.spaces import ParkingSpaceResponse


class ParkingBase(BaseModel):
    name: str
    capacity: int


class ParkingCreate(ParkingBase):
    pass


class ParkingUpdate(BaseModel):
    name: str | None = None
    capacity: int | None = None


class ParkingResponse(ParkingBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ParkingStatusResponse(ParkingResponse):
    available_spaces: int
    occupied_spaces: int
    spaces: list[ParkingSpaceResponse] = []

