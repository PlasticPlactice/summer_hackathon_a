from fastapi import APIRouter

from app.api.routes import health, parkings, sensors, spaces

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(sensors.router)
api_router.include_router(spaces.router)
api_router.include_router(parkings.router)
