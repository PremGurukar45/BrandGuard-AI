from fastapi import APIRouter, Depends, status

from app.core.security import get_current_user, get_access_token
from app.schemas.analysis import (
    ContentAnalysisRequest,
    ContentAnalysisResponse
)
from app.services.analysis_service import analysis_service

router = APIRouter(prefix="/analyses", tags=["Content Analysis"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def analyze_content(
    payload: ContentAnalysisRequest,
    current_user: dict = Depends(get_current_user),
    access_token: str = Depends(get_access_token)
):
    return analysis_service.analyze_content(
        payload=payload.model_dump(),
        user_id=current_user["id"],
        access_token=access_token
    )


@router.get("")
async def get_analysis_history(
    current_user: dict = Depends(get_current_user),
    access_token: str = Depends(get_access_token)
):
    client = analysis_service.get_client(access_token)

    result = (
        client.table("content_analyses")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []