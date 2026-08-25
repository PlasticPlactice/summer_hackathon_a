from pydantic import BaseModel, ConfigDict


class ParkingSpaceBase(BaseModel):
    type: str
    status: int
    parking_id: int | None = None
    sensor_id: int | None = None


class ParkingSpaceCreate(ParkingSpaceBase):
    pass


class ParkingSpaceUpdate(BaseModel):
    type: str | None = None
    status: int | None = None
    parking_id: int | None = None
    sensor_id: int | None = None


class ParkingSpaceResponse(ParkingSpaceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ParkingSpaceSensorUpdate(BaseModel):
    sensor_id: int | None = None


class ParkingSpaceStatusUpdate(BaseModel):
    status: int

