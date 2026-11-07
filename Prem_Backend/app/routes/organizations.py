
from fastapi import APIRouter, Depends, status

from app.core.security import get_current_user
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationResponse,
)
from app.services.organization_service import organization_service


router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
)


@router.post(
    "",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_organization(
    payload: OrganizationCreate,
    current_user: dict = Depends(get_current_user),
):
    organization = organization_service.create_organization(
        name=payload.name,
        slug=payload.slug,
        user_id=current_user["id"],
    )

    return organization
