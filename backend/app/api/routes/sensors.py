from datetime import datetime
import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.sensor import Sensor
from app.models.spaces import Parking_spaces
from app.schemas.sensor import SensorCreate, SensorBatchCreate, SensorEventRequest, SensorResponse

router = APIRouter(prefix="/sensors", tags=["sensors"])


@router.get("", response_model=list[SensorResponse])
def get_sensors(db: Session = Depends(get_db)):
    """センサーの一覧を取得します"""
    sensors = db.query(Sensor).all()
    return sensors


@router.post("", response_model=SensorResponse, status_code=status.HTTP_201_CREATED)
def create_sensor(
    sensor_in: SensorCreate,
    db: Session = Depends(get_db),
):
    """センサーを新規作成します"""
    sensor = Sensor(**sensor_in.model_dump())
    db.add(sensor)
    db.commit()
    db.refresh(sensor)
    return sensor


@router.post("/batch", response_model=list[SensorResponse], status_code=status.HTTP_201_CREATED)
def create_sensors_batch(
    batch_in: SensorBatchCreate,
    db: Session = Depends(get_db),
):
    """
    センサーを一括作成します。
    既存の device_id から最大の番号を検出し、その続きの連番（例: SENSOR_UP_003, 004...）で自動作成します。
    """
    if batch_in.count <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="count must be a positive integer",
        )

    prefix = batch_in.prefix or "SENSOR_UP_"
    existing_sensors = db.query(Sensor).filter(Sensor.device_id.like(f"{prefix}%")).all()

    max_num = 0
    pattern = re.compile(rf"^{re.escape(prefix)}(\d+)$")
    for s in existing_sensors:
        match = pattern.match(s.device_id)
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num

    new_sensors = []
    for i in range(1, batch_in.count + 1):
        next_num = max_num + i
        device_id = f"{prefix}{next_num:03d}"
        sensor = Sensor(
            device_id=device_id,
            status=batch_in.status,
            last_sens_at=datetime.now(),
        )
        new_sensors.append(sensor)

    db.add_all(new_sensors)
    db.commit()
    for s in new_sensors:
        db.refresh(s)

    return new_sensors


@router.get("/{sensor_id}", response_model=SensorResponse)
def get_sensor(sensor_id: int, db: Session = Depends(get_db)):
    """ID指定でセンサーを取得します"""
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sensor with id {sensor_id} not found",
        )
    return sensor


@router.put("/{sensor_id}", response_model=SensorResponse)
def update_sensor(
    sensor_id: int,
    sensor_in: SensorCreate,
    db: Session = Depends(get_db),
):
    """センサー情報を更新します"""
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sensor with id {sensor_id} not found",
        )
    for key, value in sensor_in.model_dump().items():
        setattr(sensor, key, value)
    db.commit()
    db.refresh(sensor)
    return sensor


@router.delete("/{sensor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sensor(sensor_id: int, db: Session = Depends(get_db)):
    """センサーを削除します"""
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sensor with id {sensor_id} not found",
        )
    db.delete(sensor)
    db.commit()
    return None


@router.post("/event", response_model=SensorResponse)
def receive_sensor_event(
    event: SensorEventRequest,
    db: Session = Depends(get_db),
):
    """センサの状態、検知結果を受け取り、センサおよび紐づく駐車スペースの状況を更新します"""
    sensor = db.query(Sensor).filter(Sensor.device_id == event.device_id).first()
    if not sensor:
        sensor = Sensor(
            device_id=event.device_id,
            status=event.status,
            last_sens_at=event.sens_at or datetime.now(),
        )
        db.add(sensor)
        db.flush()
    else:
        sensor.status = event.status
        sensor.last_sens_at = event.sens_at or datetime.now()

    # 該当センサーに紐づく駐車スペースのステータスも更新
    spaces = db.query(Parking_spaces).filter(Parking_spaces.sensor_id == sensor.id).all()
    for space in spaces:
        space.status = event.status

    db.commit()
    db.refresh(sensor)
    return sensor
