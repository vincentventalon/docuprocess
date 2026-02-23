"""Centralized Supabase client singleton"""

from supabase import create_client, Client
from app.core.config import settings

# Singleton Supabase client - created once at module import
_supabase_client: Client = create_client(
    settings.NEXT_PUBLIC_SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY
)


def get_supabase() -> Client:
    """Get the shared Supabase client instance"""
    return _supabase_client
