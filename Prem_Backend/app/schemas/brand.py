
from pydantic import BaseModel, ConfigDict, Field


class BrandProfileCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    brand_name: str = Field(min_length=2, max_length=150)
    brand_tone: str = Field(min_length=2, max_length=500)
    brand_guidelines: str = Field(min_length=5, max_length=5000)
    prohibited_words: list[str] = Field(default_factory=list)


class BrandProfileResponse(BaseModel):
    id: str
    user_id: str
    brand_name: str
    brand_tone: str | None = None
    brand_guidelines: str | None = None
    prohibited_words: list[str] = Field(default_factory=list)
    created_at: str | None = None
