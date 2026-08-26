"""駐車場エンドポイントのテスト"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Parking, Sensor, Parking_spaces


def test_create_parking(client: TestClient, test_db: Session):
    """駐車場を作成できることを確認"""
    parking_data = {
        "name": "テスト駐車場",
        "capacity": 100,
        "compact_capacity": 30,
        "large_capacity": 20,
    }
    response = client.post("/api/v1/parkings", json=parking_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "テスト駐車場"
    assert data["capacity"] == 100
    assert data["compact_capacity"] == 30
    assert data["large_capacity"] == 20
    assert "id" in data


def test_get_all_parkings(client: TestClient, test_db: Session):
    """全駐車場を取得できることを確認"""
    # テストデータを作成
    parking1 = Parking(name="駐車場A", capacity=50, compact_capacity=15, large_capacity=10)
    parking2 = Parking(name="駐車場B", capacity=100, compact_capacity=30, large_capacity=20)
    test_db.add_all([parking1, parking2])
    test_db.commit()
    
    response = client.get("/api/v1/parkings")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "駐車場A"
    assert data[1]["name"] == "駐車場B"


def test_get_parking_by_id(client: TestClient, test_db: Session):
    """ID指定で駐車場を取得できることを確認"""
    parking = Parking(name="テスト駐車場", capacity=50, compact_capacity=15, large_capacity=10)
    test_db.add(parking)
    test_db.commit()
    test_db.refresh(parking)
    
    response = client.get(f"/api/v1/parkings/{parking.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == parking.id
    assert data["name"] == "テスト駐車場"
    assert data["capacity"] == 50


def test_get_parking_not_found(client: TestClient):
    """存在しない駐車場取得時に 404 を返すことを確認"""
    response = client.get("/api/v1/parkings/9999")
    
    assert response.status_code == 404


def test_update_parking(client: TestClient, test_db: Session):
    """駐車場を更新できることを確認"""
    parking = Parking(name="テスト駐車場", capacity=50, compact_capacity=15, large_capacity=10)
    test_db.add(parking)
    test_db.commit()
    test_db.refresh(parking)
    
    update_data = {
        "name": "更新テスト駐車場",
        "capacity": 75,
        "compact_capacity": 20,
        "large_capacity": 15,
    }
    response = client.put(f"/api/v1/parkings/{parking.id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "更新テスト駐車場"
    assert data["capacity"] == 75


def test_delete_parking(client: TestClient, test_db: Session):
    """駐車場を削除できることを確認"""
    parking = Parking(name="テスト駐車場", capacity=50, compact_capacity=15, large_capacity=10)
    test_db.add(parking)
    test_db.commit()
    test_db.refresh(parking)
    
    response = client.delete(f"/api/v1/parkings/{parking.id}")
    
    assert response.status_code == 204
    
    # 削除されたことを確認
    assert test_db.query(Parking).filter(Parking.id == parking.id).first() is None


def test_get_parking_status(client: TestClient, test_db: Session):
    """駐車場の状態（空き区画数など）を取得できることを確認"""
    # 駐車場を作成
    parking = Parking(name="テスト駐車場", capacity=5, compact_capacity=2, large_capacity=1)
    test_db.add(parking)
    test_db.flush()
    
    # センサーを作成
    sensors = [
        Sensor(device_id="SENSOR_001", status=0),
        Sensor(device_id="SENSOR_002", status=1),
        Sensor(device_id="SENSOR_003", status=0),
        Sensor(device_id="SENSOR_004", status=1),
        Sensor(device_id="SENSOR_005", status=0),
    ]
    test_db.add_all(sensors)
    test_db.flush()
    
    # 駐車スペースを作成
    spaces = [
        Parking_spaces(type="standard", status=0, parking_id=parking.id, sensor_id=sensors[0].id),
        Parking_spaces(type="standard", status=1, parking_id=parking.id, sensor_id=sensors[1].id),
        Parking_spaces(type="compact", status=0, parking_id=parking.id, sensor_id=sensors[2].id),
        Parking_spaces(type="compact", status=1, parking_id=parking.id, sensor_id=sensors[3].id),
        Parking_spaces(type="large", status=0, parking_id=parking.id, sensor_id=sensors[4].id),
    ]
    test_db.add_all(spaces)
    test_db.commit()
    test_db.refresh(parking)
    
    response = client.get(f"/api/v1/parkings/{parking.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert "available_spaces" in data
    assert "occupied_spaces" in data
    assert "spaces" in data
    # 利用可能（status=0）: 3区画、利用中（status=1）: 2区画
    assert data["available_spaces"] == 3
    assert data["occupied_spaces"] == 2
