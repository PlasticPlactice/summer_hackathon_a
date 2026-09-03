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


def test_get_parking_by_id_includes_image_path(client: TestClient, test_db: Session):
    """image_path を保存済みの駐車場を取得すると、そのパスがレスポンスに含まれることを確認"""
    parking = Parking(
        name="画像付き駐車場",
        capacity=50,
        compact_capacity=15,
        large_capacity=10,
        image_path="parking_images/1/parking_20260101_000000.jpg",
    )
    test_db.add(parking)
    test_db.commit()
    test_db.refresh(parking)

    response = client.get(f"/api/v1/parkings/{parking.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["image_path"] == "parking_images/1/parking_20260101_000000.jpg"


def test_get_all_parkings_includes_image_path(client: TestClient, test_db: Session):
    """一覧取得でも image_path が欠落しないことを確認"""
    parking_with_image = Parking(
        name="画像あり駐車場",
        capacity=10,
        compact_capacity=5,
        large_capacity=3,
        image_path="parking_images/2/parking_20260101_000000.jpg",
    )
    parking_without_image = Parking(
        name="画像なし駐車場",
        capacity=10,
        compact_capacity=5,
        large_capacity=3,
    )
    test_db.add_all([parking_with_image, parking_without_image])
    test_db.commit()

    response = client.get("/api/v1/parkings")

    assert response.status_code == 200
    data = response.json()
    by_name = {item["name"]: item["image_path"] for item in data}
    assert by_name["画像あり駐車場"] == "parking_images/2/parking_20260101_000000.jpg"
    assert by_name["画像なし駐車場"] is None


def test_create_parking_with_uploaded_image_and_auto_detect_spaces(client: TestClient, test_db: Session, monkeypatch):
    """画像を添付して登録し、YOLOで検出したスペースを自動登録できることを確認"""
    monkeypatch.setattr(
        "app.api.routes.parkings.detect_parking_spaces",
        lambda image_path: [{"x1": 10, "y1": 20, "x2": 110, "y2": 90, "confidence": 0.91}],
    )
    monkeypatch.setattr(
        "app.api.routes.parkings.convert_detections_to_spaces",
        lambda detections, image_width, image_height: [{
            "x": 10,
            "y": 20,
            "width": 100,
            "height": 70,
            "confidence": 0.91,
            "type": "compact",
        }],
    )

    from PIL import Image
    from io import BytesIO
    buffer = BytesIO()
    Image.new("RGB", (200, 200), color="white").save(buffer, format="PNG")
    buffer.seek(0)

    response = client.post(
        "/api/v1/parkings",
        files={"file": ("parking.png", buffer.getvalue(), "image/png")},
        data={
            "name": "自動検出駐車場",
            "capacity": 10,
            "compact_capacity": 6,
            "large_capacity": 4,
        },
    )

    assert response.status_code == 201, response.text
    data = response.json()
    assert data["name"] == "自動検出駐車場"
    assert len(data["spaces"]) == 1
    assert data["spaces"][0]["type"] == "compact"
    # 画像アップロード時は image_path が保存され、レスポンスにも含まれることを確認
    assert data["image_path"] is not None
    assert str(data["id"]) in data["image_path"].replace("\\", "/")

    saved_parking = test_db.query(Parking).filter(Parking.id == data["id"]).first()
    assert saved_parking.image_path == data["image_path"]


def test_create_parking_without_image_has_null_image_path(client: TestClient, test_db: Session):
    """画像を添付しない場合、image_path は null のまま登録されることを確認"""
    response = client.post(
        "/api/v1/parkings",
        json={
            "name": "画像なし駐車場",
            "capacity": 10,
            "compact_capacity": 6,
            "large_capacity": 4,
        },
    )

    assert response.status_code == 201, response.text
    data = response.json()
    assert data["image_path"] is None


def test_create_parking_rolls_back_when_space_detection_fails(client: TestClient, test_db: Session, monkeypatch):
    """YOLO検出が失敗した場合は parkings と parking_spaces をともにロールバックする"""
    monkeypatch.setattr(
        "app.api.routes.parkings.detect_parking_spaces",
        lambda image_path: (_ for _ in ()).throw(RuntimeError("YOLO error")),
    )

    from PIL import Image
    from io import BytesIO
    buffer = BytesIO()
    Image.new("RGB", (200, 200), color="white").save(buffer, format="PNG")
    buffer.seek(0)

    response = client.post(
        "/api/v1/parkings",
        files={"file": ("parking.png", buffer.getvalue(), "image/png")},
        data={
            "name": "失敗駐車場",
            "capacity": 10,
            "compact_capacity": 6,
            "large_capacity": 4,
        },
    )

    assert response.status_code == 400
    assert test_db.query(Parking).count() == 0
    assert test_db.query(Parking_spaces).count() == 0


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
        Parking_spaces(parking_number=1, type="standard", status=0, parking_id=parking.id, sensor_id=sensors[0].id),
        Parking_spaces(parking_number=2, type="standard", status=1, parking_id=parking.id, sensor_id=sensors[1].id),
        Parking_spaces(parking_number=3, type="compact", status=0, parking_id=parking.id, sensor_id=sensors[2].id),
        Parking_spaces(parking_number=4, type="compact", status=1, parking_id=parking.id, sensor_id=sensors[3].id),
        Parking_spaces(parking_number=5, type="large", status=0, parking_id=parking.id, sensor_id=sensors[4].id),
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
