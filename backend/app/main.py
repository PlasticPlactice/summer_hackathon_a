from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import api_router, health
from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401 (すべてのモデルをBaseに登録させるために読み込む)
import asyncio
from services.image_service import PARKING_IMAGE_DIR, ensure_directories
from services.sensor_monitor import start_sensor_monitor


@asynccontextmanager
async def lifespan(app: FastAPI):
    # アプリ起動時にDBテーブルを自動作成
    Base.metadata.create_all(bind=engine)
    # センサーモニタリングタスクの開始
    monitor_task = asyncio.create_task(start_sensor_monitor())
    yield
    # アプリ終了時のクリーンアップ処理
    monitor_task.cancel()


app = FastAPI(title="Parking Availability API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(api_router, prefix="/api/v1")

# 登録済み駐車場の写真をフロントエンドから直接参照できるよう静的配信する
# (マウント前にディレクトリが存在しないとStaticFilesの初期化に失敗するため作成しておく)
ensure_directories()
app.mount("/parking_images", StaticFiles(directory=PARKING_IMAGE_DIR), name="parking_images")

