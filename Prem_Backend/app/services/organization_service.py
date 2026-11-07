
from fastapi import HTTPException, status
from supabase import create_client

from app.core.config import settings


class OrganizationService:

    def create_organization(
        self,
        name: str,
        slug: str,
        access_token: str,
    ):
        try:
            supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY,
            )

            # Forward the authenticated user's JWT
            supabase.postgrest.auth(access_token)

            result = supabase.rpc(
                "create_organization_with_owner",
                {
                    "p_name": name,
                    "p_slug": slug,
                },
            ).execute()

            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Organization creation failed.",
                )

            return result.data

        except HTTPException:
            raise

        except Exception as exc:
            error_message = str(exc).lower()

            if (
                "duplicate key" in error_message
                or "unique constraint" in error_message
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This organization slug is already taken.",
                )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to create organization. Check input and permissions.",
            )


organization_service = OrganizationService()
