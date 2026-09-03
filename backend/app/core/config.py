from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://postgres:postgres@db:5432/parking"
    # 現在は実証用センサー1台を監視する。接続先や対象は環境変数で変更可能にする。
    sensor_api_url: str = "http://192.168.120.238:3000/status"
    target_sensor_id: int = 1
    target_device_id: str = "SENSOR_UP_001"


settings = Settings()
