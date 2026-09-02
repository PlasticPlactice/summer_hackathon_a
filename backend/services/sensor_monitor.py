from datetime import datetime
import asyncio
from collections import deque
import httpx
from app.db.session import SessionLocal
from app.models.sensor import Sensor
from app.models.spaces import Parking_spaces

SENSOR_API_URL = "http://192.168.120.205:3000/status"
CHECK_INTERVAL_SECONDS = 1  # 1秒おきにデータ取得
WINDOW_SIZE = 10  # 10秒（10サンプル）のウィンドウ
OCCUPIED_THRESHOLD = 3  # 10回のうち5回以上検知されたら駐車状態と判定

TARGET_SENSOR_ID = 1
TARGET_DEVICE_ID = "SENSOR_UP_001"


async def start_sensor_monitor():
    """
    1秒ごとにセンサーの状態をチェックし、10秒間（10回）の履歴から
    人や動物などの一時的な通過（1〜3秒）による誤検知を除外してステータス更新を行うバックグラウンドタスク
    """
    history = deque(maxlen=WINDOW_SIZE)

    async with httpx.AsyncClient(timeout=3.0) as client:
        while True:
            try:
                response = await client.get(SENSOR_API_URL)
                response.raise_for_status()
                data = response.json()

                # APIレスポンスから現在の瞬間検知フラグ（1 or 0）を取得
                raw_sample = None
                if isinstance(data, dict):
                    if "motion" in data:
                        raw_sample = 1 if data["motion"] else 0
                    elif "status" in data:
                        raw_sample = int(data["status"])
                    elif TARGET_DEVICE_ID in data:
                        raw_sample = int(data[TARGET_DEVICE_ID])
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict):
                            if "motion" in item:
                                raw_sample = 1 if item["motion"] else 0
                                break
                            elif item.get("id") == TARGET_SENSOR_ID or item.get("device_id") == TARGET_DEVICE_ID:
                                raw_sample = int(item.get("status", 0))
                                break

                if raw_sample is not None:
                    # 履歴にサンプルを追加
                    history.append(raw_sample)

                    # ウィンドウサイズ分サンプルが溜まったら判定とDB更新
                    if len(history) == WINDOW_SIZE:
                        occupied_count = sum(history)
                        filtered_status = 1 if occupied_count >= OCCUPIED_THRESHOLD else 0

                        db = SessionLocal()
                        try:
                            sensor = db.query(Sensor).filter(Sensor.id == TARGET_SENSOR_ID).first()
                            if not sensor:
                                sensor = db.query(Sensor).filter(Sensor.device_id == TARGET_DEVICE_ID).first()

                            if not sensor:
                                # センサーが存在しない場合は初期作成
                                sensor = Sensor(
                                    id=TARGET_SENSOR_ID,
                                    device_id=TARGET_DEVICE_ID,
                                    status=filtered_status,
                                    last_sens_at=datetime.now(),
                                )
                                db.add(sensor)
                                db.flush()

                                spaces = db.query(Parking_spaces).filter(Parking_spaces.sensor_id == sensor.id).all()
                                for space in spaces:
                                    space.status = filtered_status

                                db.commit()
                            elif sensor.status != filtered_status:
                                # 状態に変更があった場合のみ更新
                                sensor.status = filtered_status
                                sensor.last_sens_at = datetime.now()

                                spaces = db.query(Parking_spaces).filter(Parking_spaces.sensor_id == sensor.id).all()
                                for space in spaces:
                                    space.status = filtered_status

                                db.commit()
                        finally:
                            db.close()

            except Exception as e:
                print(f"[Sensor Monitor Error] {e}")

            await asyncio.sleep(CHECK_INTERVAL_SECONDS)


