from pydantic import BaseModel, ConfigDict
from app.schemas.spaces import ParkingSpaceResponse, ParkingSpacePreviewCreate


class ParkingBase(BaseModel):
    name: str
    capacity: int
    compact_capacity: int
    large_capacity: int
    image_path: str | None = None


class ParkingCreate(ParkingBase):
    image_path: str | None = None


class ParkingUpdate(BaseModel):
    name: str | None = None
    capacity: int | None = None
    compact_capacity: int | None = None
    large_capacity: int | None = None
    image_path: str | None = None


class ParkingResponse(ParkingBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ParkingStatusResponse(ParkingResponse):
    available_spaces: int
    occupied_spaces: int
    spaces: list[ParkingSpaceResponse] = []


class ParkingRegisterRequest(BaseModel):
    """駐車場登録確定時のリクエスト"""
    name: str
    capacity: int
    compact_capacity: int
    large_capacity: int
    image_path: str
    spaces: list[ParkingSpacePreviewCreate]

    model_config = ConfigDict(from_attributes=True)



