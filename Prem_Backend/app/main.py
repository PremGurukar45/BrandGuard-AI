from fastapi import FastAPI

app = FastAPI(
    title="BrandGuard API",
    description="Backend API for the BrandGuard platform",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to BrandGuard API",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }