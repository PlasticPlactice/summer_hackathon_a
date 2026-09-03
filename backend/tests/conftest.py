# """テスト用の共通フィクスチャを定義"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
import pytest

from app.db.base import Base
from app.db.session import get_db
from app.main import app as fastapi_app
import app.models  # noqa: F401

# テスト用データベース URL (SQLite インメモリ)
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def test_db():
    """テスト用データベースセッションを作成"""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # テーブルを作成
    Base.metadata.create_all(bind=engine)
    
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    # 依存性を上書き
    fastapi_app.dependency_overrides[get_db] = override_get_db
    
    db = TestingSessionLocal()
    yield db
    db.close()
    
    # テーブルを削除
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    """管理者としてログイン済みのテストクライアントを作成"""
    test_client = TestClient(fastapi_app)
    response = test_client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "admin"},
    )
    assert response.status_code == 200
    return test_client


@pytest.fixture(scope="function")
def unauthenticated_client(test_db):
    """未認証状態のテストクライアントを作成"""
    return TestClient(fastapi_app)
