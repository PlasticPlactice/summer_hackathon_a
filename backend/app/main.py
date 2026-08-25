from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health
from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401 (すべてのモデルをBaseに登録させるために読み込む)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # アプリ起動時にDBテーブルを自動作成
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Parking Availability API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
