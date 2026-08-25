"""テスト用の共通フィクスチャを定義"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient
import pytest

from app.db.base import Base
from app.db.session import get_db
from app.main import app

# テスト用データベース URL (SQLite インメモリ)
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def test_db():
    """テスト用データベースセッションを作成"""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
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
    app.dependency_overrides[get_db] = override_get_db
    
    db = TestingSessionLocal()
    yield db
    db.close()
    
    # テーブルを削除
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    """テストクライアントを作成"""
    return TestClient(app)
