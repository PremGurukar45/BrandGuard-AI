from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import SignupRequest, LoginRequest
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest):
    try:
        result = await auth_service.signup(
            email=payload.email,
            password=payload.password,
            full_name=payload.full_name,
        )

        return {
            "message": "Registration successful.",
            "user": result.get("user"),
            "session": result.get("session"),
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.post("/login")
async def login(payload: LoginRequest):
    try:
        result = await auth_service.login(
            email=payload.email,
            password=payload.password,
        )

        return {
            "message": "Login successful.",
            "access_token": result.get("access_token"),
            "refresh_token": result.get("refresh_token"),
            "token_type": result.get("token_type", "bearer"),
            "user": result.get("user"),
        }

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )