"""駐車スペースエンドポイントのテスト"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Parking, Sensor, Parking_spaces


def test_create_parking_space(client: TestClient, test_db: Session):
    """駐車スペースを作成できることを確認"""
    # 駐車場とセンサーを事前に作成
    parking = Parking(name="テスト駐車場", capacity=50, compact_capacity=15, large_capacity=10)
    sensor = Sensor(device_id="TEST_SENSOR", status=0)
    test_db.add_all([parking, sensor])
    test_db.flush()
    
    space_data = {
        "type": "standard",
        "status": 0,
        "parking_id": parking.id,
        "sensor_id": sensor.id,
    }
    response = client.post("/api/v1/spaces", json=space_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "compact"
    assert data["status"] == 0
    assert data["parking_id"] == parking.id
    assert data["sensor_id"] == sensor.id


def test_get_all_spaces(client: TestClient, test_db: Session):
    """全駐車スペースを取得できることを確認"""
    # テストデータを作成
    parking = Parking(name="テスト駐車場", capacity=50, compact_capacity=15, large_capacity=10)
    sensor1 = Sensor(device_id="SENSOR_001", status=0)
    sensor2 = Sensor(device_id="SENSOR_002", status=1)
    test_db.add_all([parking, sensor1, sensor2])
    test_db.flush()
    
    space1 = Parking_spaces(type="standard", status=0, parking_id=parking.id, sensor_id=sensor1.id)
    space2 = Parking_spaces(type="compact", status=1, parking_id=parking.id, sensor_id=sensor2.id)
    test_db.add_all([space1, space2])
    test_db.commit()
    
    response = client.get("/api/v1/spaces")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["type"] == "compact"
    assert data[1]["type"] == "compact"


def test_get_space_by_id(client: TestClient, test_db: Session):
    """ID指定で駐車スペースを取得できることを確認"""
    parking = Parking(name="テスト駐車場", capacity=50, compact_capacity=15, large_capacity=10)
    sensor = Sensor(device_id="TEST_SENSOR", status=0)
    test_db.add_all([parking, sensor])
    test_db.flush()
    
    space = Parking_spaces(type="standard", status=0, parking_id=parking.id, sensor_id=sensor.id)
    test_db.add(space)
    test_db.commit()
    test_db.refresh(space)
    
    response = client.get(f"/api/v1/spaces/{space.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == space.id
    assert data["type"] == "compact"
    assert data["status"] == 0


def test_get_space_not_found(client: TestClient):
    """存在しない駐車スペース取得時に 404 を返すことを確認"""
    response = client.get("/api/v1/spaces/9999")
    
    assert response.status_code == 404


def test_update_space_status(client: TestClient, test_db: Session):
    """駐車スペースの状態を更新できることを確認"""
    parking = Parking(name="テスト駐車場", capacity=50, compact_capacity=15, large_capacity=10)
    sensor = Sensor(device_id="TEST_SENSOR", status=0)
    test_db.add_all([parking, sensor])
    test_db.flush()
    
    space = Parking_spaces(type="standard", status=0, parking_id=parking.id, sensor_id=sensor.id)
    test_db.add(space)
    test_db.commit()
    test_db.refresh(space)
    
    update_data = {
        "status": 1,
    }
    response = client.patch(f"/api/v1/spaces/{space.id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == 1


def test_delete_space(client: TestClient, test_db: Session):
    """駐車スペースを削除できることを確認"""
    parking = Parking(name="テスト駐車場", capacity=50, compact_capacity=15, large_capacity=10)
    sensor = Sensor(device_id="TEST_SENSOR", status=0)
    test_db.add_all([parking, sensor])
    test_db.flush()
    
    space = Parking_spaces(type="standard", status=0, parking_id=parking.id, sensor_id=sensor.id)
    test_db.add(space)
    test_db.commit()
    test_db.refresh(space)
    
    response = client.delete(f"/api/v1/spaces/{space.id}")
    
    assert response.status_code == 204
    
    # 削除されたことを確認
    assert test_db.query(Parking_spaces).filter(Parking_spaces.id == space.id).first() is None
