
from fastapi import HTTPException, status
from supabase import create_client

from app.core.config import settings


class BrandService:

    def get_client(self, access_token: str):
        client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY,
        )
        client.postgrest.auth(access_token)
        return client

    def create_brand(self, brand_data: dict, user_id: str, access_token: str):
        try:
            client = self.get_client(access_token)

            payload = {
                **brand_data,
                "user_id": user_id,
            }

            result = (
                client.table("brand_profiles")
                .insert(payload)
                .execute()
            )

            if not result.data:
                raise HTTPException(
                    status_code=500,
                    detail="Brand profile creation failed.",
                )

            return result.data[0]

        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to create brand profile. Check your input and permissions.",
            )

    def get_brands(self, user_id: str, access_token: str):
        try:
            client = self.get_client(access_token)

            result = (
                client.table("brand_profiles")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )

            return result.data or []

        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to retrieve brand profiles.",
            )


brand_service = BrandService()
