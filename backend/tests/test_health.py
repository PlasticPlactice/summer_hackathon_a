"""ヘルスチェックエンドポイントのテスト"""
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """ヘルスチェックが正常に動作することを確認"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
