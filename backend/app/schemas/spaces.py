from typing import Literal

from pydantic import BaseModel, ConfigDict, field_validator


def normalize_space_type(value: str | None) -> str:
    """旧データの "standard" / "normal" を新しい "compact" / "large" に正規化する。"""
    if value is None:
        return value  # type: ignore[return-value]

    normalized = str(value).strip().lower()
    legacy_aliases = {"standard", "normal"}
    if normalized in legacy_aliases:
        return "compact"
    if normalized in {"compact", "large"}:
        return normalized
    raise ValueError(f"Unsupported parking space type: {value}")


class ParkingSpaceBase(BaseModel):
    parking_number: int
    type: Literal["compact", "large"]
    status: int
    parking_id: int | None = None
    sensor_id: int | None = None
    x: float | None = None
    y: float | None = None
    width: float | None = None
    height: float | None = None

    @field_validator("type", mode="before")
    @classmethod
    def validate_type(cls, value):
        return normalize_space_type(value)


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

    @field_validator("type", mode="before")
    @classmethod
    def validate_type(cls, value):
        if value is None:
            return None
        return normalize_space_type(value)


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

    @field_validator("type", mode="before")
    @classmethod
    def validate_type(cls, value):
        return normalize_space_type(value)


class ParkingPreviewResponse(BaseModel):
    """プレビューAPI のレスポンス"""
    image_width: int
    image_height: int
    image_path: str
    spaces: list[ParkingSpacePreviewCreate]

    model_config = ConfigDict(from_attributes=True)


