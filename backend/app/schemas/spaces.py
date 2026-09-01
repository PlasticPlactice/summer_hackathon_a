from typing import Literal

from pydantic import BaseModel, ConfigDict


class ParkingSpaceBase(BaseModel):
    type: Literal["compact", "large"]
    status: int
    parking_id: int | None = None
    sensor_id: int | None = None
    x: float | None = None
    y: float | None = None
    width: float | None = None
    height: float | None = None


class ParkingSpaceCreate(ParkingSpaceBase):
    pass


class ParkingSpaceUpdate(BaseModel):
    type: Literal["compact", "large"] | None = None
    status: int | None = None
    parking_id: int | None = None
    sensor_id: int | None = None
    x: float | None = None
    y: float | None = None
    width: float | None = None
    height: float | None = None


class ParkingSpaceResponse(ParkingSpaceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ParkingSpaceSensorUpdate(BaseModel):
    sensor_id: int | None = None


class ParkingSpaceStatusUpdate(BaseModel):
    status: int


class ParkingSpacePreviewCreate(BaseModel):
    """プレビュー時の駐車スペース情報"""
    x: int
    y: int
    width: int
    height: int
    confidence: float
    type: Literal["compact", "large"] = "compact"


class ParkingPreviewResponse(BaseModel):
    """プレビューAPI のレスポンス"""
    image_width: int
    image_height: int
    image_path: str
    spaces: list[ParkingSpacePreviewCreate]

    model_config = ConfigDict(from_attributes=True)


