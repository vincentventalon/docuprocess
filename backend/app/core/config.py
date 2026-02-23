"""Application configuration"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='../.env.local', env_file_encoding='utf-8', extra="ignore")

    """Application settings"""

    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # Add your production domains here:
        # "https://example.com",
        # "https://www.example.com",
        # "https://api.example.com",
    ]

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # PDF Generation Settings
    MAX_PDF_SIZE_MB: int = 50
    DEFAULT_PAGE_SIZE: str = "A4"

    # PDF Conversion Settings
    MAX_PDF_CONVERSION_SIZE_MB: int = 10
    PDF_FETCH_TIMEOUT_SECONDS: int = 30

    # Supabase Configuration
    # Used for:
    # 1. Validating API keys from the profiles table
    # 2. Verifying JWT tokens from Supabase Auth
    # 3. Fetching templates from storage
    NEXT_PUBLIC_SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET: str

    # Fernet encryption key for S3 credentials (from Google Cloud Secret Manager)
    STORAGE_ENCRYPTION_KEY: str = ""

    # Internal API key for server-to-server communication (free tools)
    INTERNAL_API_KEY: str = ""

    # Demo session token secret (must match DEMO_SESSION_SECRET in Next.js)
    DEMO_SESSION_SECRET: str = ""

    # Cloud Tasks configuration for async PDF generation
    CLOUD_TASKS_PROJECT: str = "your-gcp-project"
    CLOUD_TASKS_REGION: str = "us-central1"
    CLOUD_TASKS_QUEUE: str = "pdf-generation"
    CLOUD_TASKS_SERVICE_URL: str = ""
    CLOUD_TASKS_SERVICE_ACCOUNT: str = ""
    ASYNC_PDF_TIMEOUT_SECONDS: int = 300

settings = Settings()
