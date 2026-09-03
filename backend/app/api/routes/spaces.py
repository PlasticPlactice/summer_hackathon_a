from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.auth import require_admin
from app.models.sensor import Sensor
from app.models.spaces import Parking_spaces
from app.schemas.spaces import (
    ParkingSpaceCreate,
    ParkingSpaceResponse,
    ParkingSpaceSensorUpdate,
    ParkingSpaceStatusUpdate,
)

router = APIRouter(
    prefix="/spaces",
    tags=["spaces"],
    dependencies=[Depends(require_admin)],
)


@router.post("", response_model=ParkingSpaceResponse, status_code=status.HTTP_201_CREATED)
def create_parking_space(
    space_in: ParkingSpaceCreate,
    db: Session = Depends(get_db),
):
    """駐車スペースを新規登録します（センサー未指定の場合、空きセンサーを自動割り当て）"""
    space_data = space_in.model_dump()
    if space_data.get("sensor_id") is None:
        used_sensor_ids = set(
            r[0] for r in db.query(Parking_spaces.sensor_id).filter(Parking_spaces.sensor_id.isnot(None)).all()
        )
        available_sensor = (
            db.query(Sensor)
            .filter(~Sensor.id.in_(used_sensor_ids) if used_sensor_ids else True)
            .order_by(Sensor.id.asc())
            .first()
        )
        if available_sensor:
            space_data["sensor_id"] = available_sensor.id
            space_data["status"] = available_sensor.status

    space = Parking_spaces(**space_data)
    db.add(space)
    db.commit()
    db.refresh(space)
    return space


@router.put("/{space_id}/sensor", response_model=ParkingSpaceResponse)
def update_space_sensor(
    space_id: int,
    sensor_update: ParkingSpaceSensorUpdate,
    db: Session = Depends(get_db),
):
    """駐車場（駐車スペース）とセンサの紐づけを変更します"""
    space = db.query(Parking_spaces).filter(Parking_spaces.id == space_id).first()
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parking space with id {space_id} not found",
        )

    if sensor_update.sensor_id is not None:
        sensor = db.query(Sensor).filter(Sensor.id == sensor_update.sensor_id).first()
        if not sensor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sensor with id {sensor_update.sensor_id} not found",
            )
        space.sensor_id = sensor.id
        # 紐づけ変更時、センサーの現在の状態をスペースに反映
        space.status = sensor.status
    else:
        # 紐づけ解除
        space.sensor_id = None

    db.commit()
    db.refresh(space)
    return space


@router.get("", response_model=list[ParkingSpaceResponse])
def get_all_spaces(db: Session = Depends(get_db)):
    """駐車スペース一覧を取得します"""
    spaces = db.query(Parking_spaces).all()
    return spaces


@router.get("/{space_id}", response_model=ParkingSpaceResponse)
def get_space_by_id(space_id: int, db: Session = Depends(get_db)):
    """ID指定で駐車スペースを取得します"""
    space = db.query(Parking_spaces).filter(Parking_spaces.id == space_id).first()
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parking space with id {space_id} not found",
        )
    return space


@router.delete("/{space_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_space(space_id: int, db: Session = Depends(get_db)):
    """駐車スペースを削除します"""
    space = db.query(Parking_spaces).filter(Parking_spaces.id == space_id).first()
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parking space with id {space_id} not found",
        )
    db.delete(space)
    db.commit()
    return None


@router.patch("/{space_id}", response_model=ParkingSpaceResponse)
@router.patch("/{space_id}/status", response_model=ParkingSpaceResponse)
def update_space_status(
    space_id: int,
    status_update: ParkingSpaceStatusUpdate,
    db: Session = Depends(get_db),
):
    """駐車スペースのステータス（満車/空車等）を変更します"""
    space = db.query(Parking_spaces).filter(Parking_spaces.id == space_id).first()
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parking space with id {space_id} not found",
        )

    space.status = status_update.status
    db.commit()
    db.refresh(space)
    return space

