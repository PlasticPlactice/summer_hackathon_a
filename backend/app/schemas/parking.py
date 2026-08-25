from pydantic import BaseModel, ConfigDict


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
