from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://postgres:postgres@db:5432/parking"
    # 現在は実証用センサー1台を監視する。接続先や対象は環境変数で変更可能にする。
    sensor_api_url: str = "http://192.168.120.238:3000/status"
    target_sensor_id: int = 1
    target_device_id: str = "SENSOR_UP_001"
    admin_username: str = "admin"
    admin_password_hash: str = (
        "pbkdf2_sha256:600000:park-now-dev:"
        "496edc52ada195ac4ece176a317d5a651d872e96c0ab3161bbf5508ec5aa5111"
    )
    auth_secret: str = "change-this-secret-in-production"
    auth_session_ttl_seconds: int = 28800
    auth_cookie_secure: bool = False
    # 管理APIの認可を無効にできる。
    authorization_enabled: bool = False


settings = Settings()
