from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.senser import Sensers
from app.models.spaces import Parking_spaces
from app.schemas.sensor import SensorEventRequest, SensorResponse

router = APIRouter(prefix="/sensors", tags=["sensors"])


@router.get("", response_model=list[SensorResponse])
def get_sensors(db: Session = Depends(get_db)):
    """センサーの一覧を取得します"""
    sensors = db.query(Sensers).all()
    return sensors


@router.post("/event", response_model=SensorResponse)
def receive_sensor_event(
    event: SensorEventRequest,
    db: Session = Depends(get_db),
):
    """センサの状態、検知結果を受け取り、センサおよび紐づく駐車スペースの状況を更新します"""
    sensor = db.query(Sensers).filter(Sensers.device_id == event.device_id).first()
    if not sensor:
        sensor = Sensers(
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
