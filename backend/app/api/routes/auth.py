from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.auth import (
    ADMIN_SESSION_COOKIE,
    authenticate_admin,
    create_admin_session,
    require_admin,
)
from app.core.config import settings
from app.schemas.auth import AdminLoginRequest, AdminSessionResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=AdminSessionResponse)
def login(credentials: AdminLoginRequest, response: Response):
    if not authenticate_admin(credentials.username, credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    response.set_cookie(
        key=ADMIN_SESSION_COOKIE,
        value=create_admin_session(),
        max_age=settings.auth_session_ttl_seconds,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite="lax",
        path="/",
    )
    return AdminSessionResponse(authenticated=True, username=settings.admin_username)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    response.delete_cookie(
        key=ADMIN_SESSION_COOKIE,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite="lax",
        path="/",
    )


@router.get("/me", response_model=AdminSessionResponse)
def get_current_admin(username: str = Depends(require_admin)):
    return AdminSessionResponse(authenticated=True, username=username)
