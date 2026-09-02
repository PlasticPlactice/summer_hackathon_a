"""センサーエンドポイントのテスト"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Sensor


def test_create_sensor(client: TestClient, test_db: Session):
    """センサーを作成できることを確認"""
    sensor_data = {
        "device_id": "TEST_SENSOR_001",
        "status": 0,
    }
    response = client.post("/api/v1/sensors", json=sensor_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["device_id"] == "TEST_SENSOR_001"
    assert data["status"] == 0
    assert "id" in data


def test_get_all_sensors(client: TestClient, test_db: Session):
    """全センサーを取得できることを確認"""
    # テストデータを作成
    sensor1 = Sensor(device_id="SENSOR_001", status=0)
    sensor2 = Sensor(device_id="SENSOR_002", status=1)
    test_db.add_all([sensor1, sensor2])
    test_db.commit()
    
    response = client.get("/api/v1/sensors")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["device_id"] == "SENSOR_001"
    assert data[1]["device_id"] == "SENSOR_002"


def test_get_sensor_by_id(client: TestClient, test_db: Session):
    """ID指定でセンサーを取得できることを確認"""
    sensor = Sensor(device_id="TEST_SENSOR", status=0)
    test_db.add(sensor)
    test_db.commit()
    test_db.refresh(sensor)
    
    response = client.get(f"/api/v1/sensors/{sensor.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sensor.id
    assert data["device_id"] == "TEST_SENSOR"
    assert data["status"] == 0


def test_get_sensor_not_found(client: TestClient):
    """存在しないセンサー取得時に 404 を返すことを確認"""
    response = client.get("/api/v1/sensors/9999")
    
    assert response.status_code == 404


def test_update_sensor(client: TestClient, test_db: Session):
    """センサーを更新できることを確認"""
    sensor = Sensor(device_id="TEST_SENSOR", status=0)
    test_db.add(sensor)
    test_db.commit()
    test_db.refresh(sensor)
    
    update_data = {
        "device_id": "UPDATED_SENSOR",
        "status": 1,
    }
    response = client.put(f"/api/v1/sensors/{sensor.id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["device_id"] == "UPDATED_SENSOR"
    assert data["status"] == 1


def test_delete_sensor(client: TestClient, test_db: Session):
    """センサーを削除できることを確認"""
    sensor = Sensor(device_id="TEST_SENSOR", status=0)
    test_db.add(sensor)
    test_db.commit()
    test_db.refresh(sensor)
    
    response = client.delete(f"/api/v1/sensors/{sensor.id}")
    
    assert response.status_code == 204
    
    # 削除されたことを確認
    assert test_db.query(Sensor).filter(Sensor.id == sensor.id).first() is None


def test_create_sensors_batch_auto_numbering(client: TestClient, test_db: Session):
    """センサーの一括登録と連番自動作成のテスト"""
    sensor1 = Sensor(device_id="SENSOR_UP_001", status=0)
    sensor2 = Sensor(device_id="SENSOR_UP_002", status=0)
    test_db.add_all([sensor1, sensor2])
    test_db.commit()

    batch_data = {
        "count": 3,
        "prefix": "SENSOR_UP_",
        "status": 0
    }
    response = client.post("/api/v1/sensors/batch", json=batch_data)

    assert response.status_code == 201
    data = response.json()
    assert len(data) == 3
    assert data[0]["device_id"] == "SENSOR_UP_003"
    assert data[1]["device_id"] == "SENSOR_UP_004"
    assert data[2]["device_id"] == "SENSOR_UP_005"
