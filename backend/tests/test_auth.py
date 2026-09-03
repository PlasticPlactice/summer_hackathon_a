"""管理者認証・認可のテスト"""
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings


@pytest.fixture(autouse=True)
def enable_authorization(monkeypatch: pytest.MonkeyPatch):
    """認可機能自体のテストでは明示的に有効化する。"""
    monkeypatch.setattr(settings, "authorization_enabled", True)


def test_login_sets_http_only_cookie(unauthenticated_client: TestClient):
    response = unauthenticated_client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "admin"},
    )

    assert response.status_code == 200
    assert response.json() == {"authenticated": True, "username": "admin"}
    assert "admin_session=" in response.headers["set-cookie"]
    assert "HttpOnly" in response.headers["set-cookie"]
    assert "SameSite=lax" in response.headers["set-cookie"]


def test_login_rejects_invalid_credentials(unauthenticated_client: TestClient):
    response = unauthenticated_client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert "admin_session" not in unauthenticated_client.cookies


def test_login_rejects_unknown_unicode_username(unauthenticated_client: TestClient):
    response = unauthenticated_client.post(
        "/api/v1/auth/login",
        json={"username": "管理者", "password": "admin"},
    )

    assert response.status_code == 401


def test_protected_api_rejects_unauthenticated_request(
    unauthenticated_client: TestClient,
):
    response = unauthenticated_client.get("/api/v1/sensors")

    assert response.status_code == 401


def test_protected_api_rejects_tampered_cookie(unauthenticated_client: TestClient):
    unauthenticated_client.cookies.set("admin_session", "tampered.token")

    response = unauthenticated_client.get("/api/v1/sensors")

    assert response.status_code == 401


def test_protected_api_allows_unauthenticated_request_when_authorization_disabled(
    unauthenticated_client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(settings, "authorization_enabled", False)

    response = unauthenticated_client.get("/api/v1/sensors")

    assert response.status_code == 200


def test_public_parking_api_does_not_require_login(
    unauthenticated_client: TestClient,
):
    response = unauthenticated_client.get("/api/v1/parkings")

    assert response.status_code == 200


def test_sensor_event_api_does_not_require_login(
    unauthenticated_client: TestClient,
):
    response = unauthenticated_client.post(
        "/api/v1/sensors/event",
        json={"device_id": "PUBLIC_SENSOR", "status": 1},
    )

    assert response.status_code == 200


def test_logout_clears_session(client: TestClient):
    assert client.get("/api/v1/auth/me").status_code == 200

    logout_response = client.post("/api/v1/auth/logout")

    assert logout_response.status_code == 204
    assert client.get("/api/v1/auth/me").status_code == 401
