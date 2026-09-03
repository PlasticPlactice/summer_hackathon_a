import base64
import binascii
import hashlib
import hmac
import json
import time

from fastapi import HTTPException, Request, status

from app.core.config import settings

ADMIN_SESSION_COOKIE = "admin_session"


def verify_password(password: str, encoded_hash: str) -> bool:
    """PBKDF2-SHA256形式のパスワードハッシュを検証する。"""
    try:
        algorithm, iterations, salt, expected_hash = encoded_hash.split(":", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        actual_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            int(iterations),
        ).hex()
        return hmac.compare_digest(actual_hash, expected_hash)
    except (TypeError, ValueError):
        return False


def authenticate_admin(username: str, password: str) -> bool:
    """環境変数で設定された管理者情報と照合する。"""
    username_matches = hmac.compare_digest(
        username.encode("utf-8"),
        settings.admin_username.encode("utf-8"),
    )
    password_matches = verify_password(password, settings.admin_password_hash)
    return username_matches and password_matches


def _encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def create_admin_session() -> str:
    """有効期限付きの署名済み管理者セッションを生成する。"""
    payload = {
        "sub": settings.admin_username,
        "role": "admin",
        "exp": int(time.time()) + settings.auth_session_ttl_seconds,
    }
    encoded_payload = _encode(
        json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    )
    signature = hmac.new(
        settings.auth_secret.encode("utf-8"),
        encoded_payload.encode("ascii"),
        hashlib.sha256,
    ).digest()
    return f"{encoded_payload}.{_encode(signature)}"


def verify_admin_session(token: str | None) -> bool:
    """セッションの署名、管理者、権限、有効期限を検証する。"""
    if not token:
        return False
    try:
        encoded_payload, encoded_signature = token.split(".", 1)
        expected_signature = hmac.new(
            settings.auth_secret.encode("utf-8"),
            encoded_payload.encode("ascii"),
            hashlib.sha256,
        ).digest()
        if not hmac.compare_digest(_decode(encoded_signature), expected_signature):
            return False
        payload = json.loads(_decode(encoded_payload))
        return (
            payload.get("sub") == settings.admin_username
            and payload.get("role") == "admin"
            and int(payload.get("exp", 0)) > int(time.time())
        )
    except (ValueError, TypeError, AttributeError, binascii.Error, json.JSONDecodeError):
        return False


def require_admin(request: Request) -> str:
    """管理者セッションが有効でなければAPIアクセスを拒否する。"""
    if not settings.authorization_enabled:
        return settings.admin_username

    if not verify_admin_session(request.cookies.get(ADMIN_SESSION_COOKIE)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required",
        )
    return settings.admin_username
