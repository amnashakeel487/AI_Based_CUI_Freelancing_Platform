"""Database client initialization for Supabase."""
from functools import lru_cache

from supabase import Client, create_client

from app.config import get_settings


@lru_cache
def get_supabase_client() -> Client:
    """
    Get Supabase client with service role key.
    
    This client has full access and bypasses RLS policies.
    Use carefully and only on the backend.
    
    Returns:
        Supabase client instance
    """
    settings = get_settings()
    return create_client(
        supabase_url=settings.supabase_url,
        supabase_key=settings.supabase_service_role_key,
    )


def get_supabase() -> Client:
    """
    Dependency for route handlers to get Supabase client.
    
    Usage in routes:
        @router.get("/")
        def my_route(supabase: Client = Depends(get_supabase)):
            ...
    """
    return get_supabase_client()
