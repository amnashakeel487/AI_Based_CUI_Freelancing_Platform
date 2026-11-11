"""Authentication and authorization dependencies."""
import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from app.db import get_supabase

logger = logging.getLogger(__name__)
security = HTTPBearer()


class CurrentUser:
    def __init__(self, user_id, email, role=None, approval_status=None, onboarding_complete=None):
        self.user_id = user_id
        self.email = email
        self.role = role
        self.approval_status = approval_status
        self.onboarding_complete = onboarding_complete

    @property
    def is_approved_freelancer(self):
        return self.role == "freelancer" and self.approval_status == "approved"

    @property
    def is_pending_freelancer(self):
        return self.role == "freelancer" and self.approval_status == "pending"

    @property
    def is_client(self):
        return self.role == "client"

    @property
    def is_admin(self):
        return self.role == "admin"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase),
) -> CurrentUser:
    token = credentials.credentials

    # Use Supabase to verify the token — avoids all JWT library issues
    try:
        auth_resp = supabase.auth.get_user(token)
        if not auth_resp or not auth_resp.user:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user_id = auth_resp.user.id
        email   = auth_resp.user.email or ""
    except Exception as e:
        logger.error("Token verification failed: %s", e)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    # Load profile
    try:
        p = supabase.table("profiles").select("id,email,role").eq("id", user_id).maybe_single().execute()
        if not p.data:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Profile not found. Please complete registration.")

        role = p.data.get("role")
        approval_status = onboarding_complete = None

        if role == "freelancer":
            fp = supabase.table("freelancer_profiles").select("approval_status,onboarding_complete").eq("user_id", user_id).maybe_single().execute()
            if fp.data:
                approval_status     = fp.data.get("approval_status")
                onboarding_complete = fp.data.get("onboarding_complete")

        return CurrentUser(user_id=user_id, email=email or p.data.get("email",""), role=role, approval_status=approval_status, onboarding_complete=onboarding_complete)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Profile load error: %s", e)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


def require_role(allowed_roles: list[str]):
    def checker(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in allowed_roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail=f"Required: {', '.join(allowed_roles)}")
        return user
    return checker


def require_approved_freelancer(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if not user.is_approved_freelancer:
        if user.is_pending_freelancer:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Your account is pending approval.")
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Only approved freelancers can access this.")
    return user
