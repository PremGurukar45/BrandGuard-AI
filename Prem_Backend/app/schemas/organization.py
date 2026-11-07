
import re

from pydantic import BaseModel, ConfigDict, Field, field_validator


class OrganizationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=2, max_length=100)
    slug: str = Field(min_length=3, max_length=50)

    @field_validator("name", "slug")
    @classmethod
    def strip_whitespace(cls, value: str) -> str:
        return value.strip()

    @field_validator("slug")
    @classmethod
    def validate_slug_format(cls, value: str) -> str:
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", value):
            raise ValueError(
                "Slug must contain lowercase letters, numbers, "
                "and single hyphens only."
            )
        return value


class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    created_at: str | None = None
