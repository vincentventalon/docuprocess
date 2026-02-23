"""FastAPI backend for YourApp"""

from importlib.metadata import version as get_version, PackageNotFoundError

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.v1 import account as v1_account
from app.core.config import settings

# Version derived from git tags via setuptools-scm
# Falls back to "0.0.0" if package not installed or no tags
try:
    version = get_version("yourapp-backend")
except PackageNotFoundError:
    version = "0.0.0"

app = FastAPI(
    title="YourApp API",
    description="Your SaaS API backend",
    version=version,
    servers=[
        {"url": "https://api.example.com", "description": "Production"},
    ],
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# V1 Public API
app.include_router(v1_account.router, prefix="/v1/account", tags=["Account"])


@app.get("/", include_in_schema=False)
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "YourApp API",
        "version": version,
    }


@app.get("/health", include_in_schema=False)
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "checks": {
            "api": "ok",
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
