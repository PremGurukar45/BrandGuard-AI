import httpx

from app.core.config import settings


class AuthService:
    def __init__(self):
        self.base_url = settings.SUPABASE_URL.rstrip("/")
        self.api_key = settings.SUPABASE_ANON_KEY

    async def signup(self, email: str, password: str, full_name: str):
        url = f"{self.base_url}/auth/v1/signup"

        headers = {
            "apikey": self.api_key,
            "Content-Type": "application/json",
        }

        payload = {
            "email": email,
            "password": password,
            "data": {
                "full_name": full_name,
            },
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                url,
                headers=headers,
                json=payload,
            )

        return self._handle_response(response)

    async def login(self, email: str, password: str):
        url = f"{self.base_url}/auth/v1/token?grant_type=password"

        headers = {
            "apikey": self.api_key,
            "Content-Type": "application/json",
        }

        payload = {
            "email": email,
            "password": password,
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                url,
                headers=headers,
                json=payload,
            )

        return self._handle_response(response)

    @staticmethod
    def _handle_response(response: httpx.Response):
        try:
            data = response.json()
        except ValueError:
            raise RuntimeError("Invalid response from authentication service.")

        if response.is_error:
            message = data.get("msg") or data.get("message") or data.get("error_description") or "Authentication failed."
            raise ValueError(message)

        return data


auth_service = AuthService()
