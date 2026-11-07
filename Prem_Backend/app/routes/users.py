from fastapi import APIRouter, Depends

from app.core.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
async def get_my_profile(
    current_user: dict = Depends(get_current_user),
):
    return {
        "message": "Authenticated user retrieved successfully.",
        "user": {
            "id": current_user.get("id"),
            "email": current_user.get("email"),
            "role": current_user.get("role"),
        },
    }
