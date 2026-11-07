from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.organizations import router as organizations_router
from app.routes.brands import router as brands_router
from app.routes.analyses import router as analyses_router


# ==========================================
# BRANDGUARD AI - MAIN APPLICATION
# ==========================================

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Brand Governance Platform",
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)


# ==========================================
# CORS CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
    ],
)


# API ROUTERS

app.include_router(
    auth_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    users_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    organizations_router,
    prefix=settings.API_V1_PREFIX,
)
app.include_router(
    brands_router,
    prefix=settings.API_V1_PREFIX,
)
app.include_router(
    analyses_router, 
    prefix=settings.API_V1_PREFIX
)

# ==========================================
# ROOT ENDPOINT
# ==========================================

@app.get("/", tags=["General"])
async def home():
    return {
        "application": settings.APP_NAME,
        "message": "Welcome to BrandGuard AI API",
        "status": "running",
        "version": settings.APP_VERSION,
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/health", tags=["General"])
async def health_check():
    return {
        "status": "healthy",
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# ==========================================
# API STATUS
# ==========================================

@app.get("/api/status", tags=["General"])
async def api_status():
    return {
        "api": "BrandGuard AI",
        "status": "operational",
        "environment": settings.ENVIRONMENT,
        "api_version": settings.API_V1_PREFIX,
    }
