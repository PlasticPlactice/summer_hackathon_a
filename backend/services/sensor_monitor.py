from datetime import datetime
import asyncio
from collections import deque
import logging
import time
import httpx
from app.core.config import settings
from app.db.session import SessionLocal
from app.models.sensor import Sensor
from app.models.spaces import Parking_spaces

CHECK_INTERVAL_SECONDS = 1  # 1秒おきにデータ取得
WINDOW_SIZE = 10  # 10秒（10サンプル）のウィンドウ
OCCUPIED_THRESHOLD = 3  # 10回のうち3回以上検知されたら駐車状態と判定
COOLDOWN_SECONDS = 10  # DB更新後、次の検知を始めるまでの待機時間

logger = logging.getLogger("uvicorn.error")


async def start_sensor_monitor():
    """
    実証用の対象センサー1台について、1秒ごとに状態をチェックし、10秒間（10回）の履歴から
    人や動物などの一時的な通過（1〜3秒）による誤検知を除外してステータス更新を行うバックグラウンドタスク

    接続先と対象センサーは SENSOR_API_URL、TARGET_SENSOR_ID、TARGET_DEVICE_ID
    の各環境変数で変更できる。
    """
    history = deque(maxlen=WINDOW_SIZE)
    cooldown_until = None

    logger.warning(
        "[Sensor Monitor] ========== 検知チェック開始 "
        "========== required_samples=%s estimated_seconds=%s",
        WINDOW_SIZE,
        WINDOW_SIZE * CHECK_INTERVAL_SECONDS,
    )

    async with httpx.AsyncClient(timeout=3.0) as client:
        while True:
            try:
                response = await client.get(settings.sensor_api_url)
                response.raise_for_status()
                data = response.json()

                # APIレスポンスから現在の瞬間検知フラグ（1 or 0）を取得
                raw_sample = None
                if isinstance(data, dict):
                    if "motion" in data:
                        raw_sample = 1 if data["motion"] else 0
                    elif "status" in data:
                        raw_sample = int(data["status"])
                    elif settings.target_device_id in data:
                        raw_sample = int(data[settings.target_device_id])
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict):
                            if "motion" in item:
                                raw_sample = 1 if item["motion"] else 0
                                break
                            elif (
                                item.get("id") == settings.target_sensor_id
                                or item.get("device_id") == settings.target_device_id
                            ):
                                raw_sample = int(item.get("status", 0))
                                break

                if raw_sample is not None:
                    # クールダウン中の取得値は判定履歴に含めず破棄する
                    if cooldown_until is not None:
                        remaining_seconds = cooldown_until - time.monotonic()
                        if remaining_seconds > 0:
                            logger.info(
                                "[Sensor Monitor] クールダウン中（検知値は破棄）: "
                                "time=%s device_id=%s value=%s remaining_seconds=%.1f",
                                datetime.now().astimezone().isoformat(timespec="seconds"),
                                settings.target_device_id,
                                raw_sample,
                                remaining_seconds,
                            )
                            await asyncio.sleep(CHECK_INTERVAL_SECONDS)
                            continue

                        cooldown_until = None
                        logger.warning(
                            "[Sensor Monitor] ========== クールダウン終了・検知チェック再開 "
                            "========== time=%s required_samples=%s",
                            datetime.now().astimezone().isoformat(timespec="seconds"),
                            WINDOW_SIZE,
                        )

                    # 検知チェック期間のサンプルだけを履歴に追加する
                    history.append(raw_sample)
                    remaining_samples = WINDOW_SIZE - len(history)
                    logger.info(
                        "[Sensor Monitor] 検知チェック中: time=%s device_id=%s "
                        "value=%s history=%s/%s remaining_samples=%s",
                        datetime.now().astimezone().isoformat(timespec="seconds"),
                        settings.target_device_id,
                        raw_sample,
                        len(history),
                        WINDOW_SIZE,
                        remaining_samples,
                    )

                    # ウィンドウサイズ分サンプルが溜まったら判定とDB更新
                    if len(history) == WINDOW_SIZE:
                        occupied_count = sum(history)
                        should_toggle_status = occupied_count >= OCCUPIED_THRESHOLD

                        logger.warning(
                            "[Sensor Monitor] ========== 10秒チェック終了 "
                            "========== time=%s samples=%s detected=%s/%s action=%s",
                            datetime.now().astimezone().isoformat(timespec="seconds"),
                            list(history),
                            occupied_count,
                            WINDOW_SIZE,
                            "toggle_status" if should_toggle_status else "no_change",
                        )

                        # 閾値を超えた場合だけ状態を反転する。
                        # それ以外は現在のDB状態を維持する。
                        if should_toggle_status:
                            db = SessionLocal()
                            try:
                                sensor = db.query(Sensor).filter(Sensor.id == settings.target_sensor_id).first()
                                if not sensor:
                                    sensor = db.query(Sensor).filter(Sensor.device_id == settings.target_device_id).first()

                                if not sensor:
                                    # センサーが存在しない場合は最初の検知を満車として作成
                                    previous_status = None
                                    new_status = 1
                                    sensor = Sensor(
                                        id=settings.target_sensor_id,
                                        device_id=settings.target_device_id,
                                        status=new_status,
                                        last_sens_at=datetime.now(),
                                    )
                                    db.add(sensor)
                                    db.flush()

                                    spaces = db.query(Parking_spaces).filter(Parking_spaces.sensor_id == sensor.id).all()
                                    for space in spaces:
                                        space.status = new_status

                                    db.commit()
                                else:
                                    # 空車なら満車、満車なら空車へ切り替える
                                    previous_status = sensor.status
                                    new_status = 0 if previous_status == 1 else 1
                                    sensor.status = new_status
                                    sensor.last_sens_at = datetime.now()

                                    spaces = db.query(Parking_spaces).filter(Parking_spaces.sensor_id == sensor.id).all()
                                    for space in spaces:
                                        space.status = new_status

                                    db.commit()

                                logger.warning(
                                    "[Sensor Monitor] ========== DBステータス更新完了 "
                                    "========== time=%s sensor_id=%s device_id=%s "
                                    "previous_status=%s new_status=%s detected=%s/%s "
                                    "updated_spaces=%s",
                                    datetime.now().astimezone().isoformat(timespec="seconds"),
                                    sensor.id,
                                    sensor.device_id,
                                    previous_status,
                                    new_status,
                                    occupied_count,
                                    WINDOW_SIZE,
                                    len(spaces),
                                )
                            finally:
                                db.close()

                            cooldown_until = time.monotonic() + COOLDOWN_SECONDS
                            logger.warning(
                                "[Sensor Monitor] ========== クールダウン開始（検知停止） "
                                "========== time=%s cooldown_seconds=%s",
                                datetime.now().astimezone().isoformat(timespec="seconds"),
                                COOLDOWN_SECONDS,
                            )

                        # 判定済みの10サンプルは結果にかかわらず使い回さない
                        history.clear()

                        if not should_toggle_status:
                            logger.warning(
                                "[Sensor Monitor] ========== 次の検知チェック開始 "
                                "========== time=%s required_samples=%s",
                                datetime.now().astimezone().isoformat(timespec="seconds"),
                                WINDOW_SIZE,
                            )
                else:
                    logger.warning(
                        "[Sensor Monitor] センサー情報は取得しましたが、検知値を解析できません: "
                        "time=%s device_id=%s response=%s",
                        datetime.now().astimezone().isoformat(timespec="seconds"),
                        settings.target_device_id,
                        data,
                    )

            except Exception:
                logger.exception("[Sensor Monitor] センサー情報の取得または更新に失敗しました")

            await asyncio.sleep(CHECK_INTERVAL_SECONDS)
