
from fastapi import APIRouter, Depends, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.security import get_current_user, get_access_token
from app.schemas.brand import BrandProfileCreate, BrandProfileResponse
from app.services.brand_service import brand_service


router = APIRouter(
    prefix="/brands",
    tags=["Brand Profiles"],
)


@router.post(
    "",
    response_model=BrandProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_brand(
    payload: BrandProfileCreate,
    current_user: dict = Depends(get_current_user),
    access_token: str = Depends(get_access_token),
):
    return brand_service.create_brand(
        brand_data=payload.model_dump(),
        user_id=current_user["id"],
        access_token=access_token,
    )


@router.get(
    "",
    response_model=list[BrandProfileResponse],
)
async def get_brands(
    current_user: dict = Depends(get_current_user),
    access_token: str = Depends(get_access_token),
):
    return brand_service.get_brands(
        user_id=current_user["id"],
        access_token=access_token,
    )
