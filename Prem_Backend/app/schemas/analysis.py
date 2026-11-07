from pydantic import BaseModel, Field
from typing import Literal


class ContentAnalysisRequest(BaseModel):
    brand_profile_id: str
    content_text: str = Field(min_length=10, max_length=10000)
    content_type: Literal[
        "social_media",
        "advertisement",
        "email",
        "website"
    ] = "social_media"


class ContentAnalysisResponse(BaseModel):
    id: str
    brand_profile_id: str
    content_text: str
    content_type: str
    compliance_score: int
    ai_summary: str
    violations: list
    corrected_content: str
    created_at: str | None = None