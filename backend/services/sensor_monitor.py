from datetime import datetime
import asyncio
import httpx
from app.db.session import SessionLocal
from app.models.sensor import Sensor
from app.models.spaces import Parking_spaces

SENSOR_API_URL = "http://192.168.120.205:3000/status"
CHECK_INTERVAL_SECONDS = 5
TARGET_SENSOR_ID = 1
TARGET_DEVICE_ID = "SENSOR_UP_001"


async def start_sensor_monitor():
    """10秒ごとにセンサーの状態をチェックし、変更があればDBのsensorおよび紐づくparking_spacesを更新するバックグラウンドタスク"""
    async with httpx.AsyncClient(timeout=5.0) as client:
        while True:
            try:
                response = await client.get(SENSOR_API_URL)
                response.raise_for_status()
                data = response.json()

                # APIレスポンスからmotionフラグ（bool）を取得してステータス（1 or 0）に変換
                new_status = None
                if isinstance(data, dict):
                    if "motion" in data:
                        # motion: True -> 1 (満車 / 検知あり), False -> 0 (空車 / 検知なし)
                        new_status = 1 if data["motion"] else 0
                    elif "status" in data:
                        new_status = data["status"]
                    elif TARGET_DEVICE_ID in data:
                        new_status = data[TARGET_DEVICE_ID]
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict):
                            if "motion" in item:
                                new_status = 1 if item["motion"] else 0
                                break
                            elif item.get("id") == TARGET_SENSOR_ID or item.get("device_id") == TARGET_DEVICE_ID:
                                new_status = item.get("status")
                                break

                if new_status is not None:
                    db = SessionLocal()
                    try:
                        # テスト用指定: sensor_id = 1（device_id = SENSOR_UP_001）
                        sensor = db.query(Sensor).filter(Sensor.id == TARGET_SENSOR_ID).first()
                        if not sensor:
                            sensor = db.query(Sensor).filter(Sensor.device_id == TARGET_DEVICE_ID).first()

                        if not sensor:
                            # センサーが存在しない場合は作成
                            sensor = Sensor(
                                id=TARGET_SENSOR_ID,
                                device_id=TARGET_DEVICE_ID,
                                status=int(new_status),
                                last_sens_at=datetime.now(),
                            )
                            db.add(sensor)
                            db.flush()

                            spaces = db.query(Parking_spaces).filter(Parking_spaces.sensor_id == sensor.id).all()
                            for space in spaces:
                                space.status = int(new_status)

                            db.commit()
                        elif sensor.status != int(new_status):
                            # 前回の検知から状態が変わっていたら更新
                            sensor.status = int(new_status)
                            sensor.last_sens_at = datetime.now()

                            spaces = db.query(Parking_spaces).filter(Parking_spaces.sensor_id == sensor.id).all()
                            for space in spaces:
                                space.status = int(new_status)

                            db.commit()
                    finally:
                        db.close()

            except Exception as e:
                print(f"[Sensor Monitor Error] {e}")

            await asyncio.sleep(CHECK_INTERVAL_SECONDS)

