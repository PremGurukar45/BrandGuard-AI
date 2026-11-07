
from fastapi import HTTPException
from supabase import create_client

from app.core.config import settings
from app.services.ai_service import ai_service


class AnalysisService:

    def get_client(self, access_token: str):
        client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
        client.postgrest.auth(access_token)
        return client

    def analyze_content(
        self,
        payload: dict,
        user_id: str,
        access_token: str
    ):
        try:
            client = self.get_client(access_token)

            # 1. Get the user's brand profile
            brand_result = (
                client.table("brand_profiles")
                .select("*")
                .eq("id", payload["brand_profile_id"])
                .eq("user_id", user_id)
                .single()
                .execute()
            )

            brand = brand_result.data

            if not brand:
                raise HTTPException(
                    status_code=404,
                    detail="Brand profile not found."
                )

            # 2. Run AI analysis
            ai_result = ai_service.analyze_content(
                brand,
                payload["content_text"]
            )

            # 3. Save analysis in Supabase
            record = {
                "user_id": user_id,
                "brand_profile_id": payload["brand_profile_id"],
                "content_text": payload["content_text"],
                "content_type": payload["content_type"],
                "compliance_score": ai_result["compliance_score"],
                "ai_summary": ai_result["ai_summary"],
                "violations": ai_result["violations"],
                "corrected_content": ai_result["corrected_content"]
            }

            saved = (
                client.table("content_analyses")
                .insert(record)
                .execute()
            )

            if not saved.data:
                raise HTTPException(
                    status_code=500,
                    detail="Analysis could not be saved."
                )

            return saved.data[0]

        except HTTPException:
            raise

        except Exception as exc:
            print("ANALYSIS ERROR:", repr(exc))

            raise HTTPException(
                status_code=500,
                detail="Content analysis failed. Check backend terminal."
            )


analysis_service = AnalysisService()
