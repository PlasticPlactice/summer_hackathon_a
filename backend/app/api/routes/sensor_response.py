import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/sensor-response", tags=["sensor-response"])

# センサーの情報を取得（APIのURLは毎日変わるから変えよう）
@router.get("")
def get_sensor_data():

    SENSOR_API_URL = "http://192.168.120.205:3000/status"
    
    try:
        response = httpx.get(SENSOR_API_URL, timeout=5)
        response.raise_for_status()

        data = response.json()

        print("=== SENSOR API Response ===")
        print(data)

        return data

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="SENSOR API request timed out."
        )

    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Could not fetch SENSOR API: {e}"
        )

    except ValueError:
        raise HTTPException(
            status_code=500,
            detail="SENSOR API returned invalid JSON."
        )
