from fastapi import APIRouter

from app.api.routes import auth, health, parkings, sensors, spaces, sensor_response

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(health.router)
api_router.include_router(sensors.router)
api_router.include_router(spaces.router)
api_router.include_router(parkings.router)
api_router.include_router(sensor_response.router)
