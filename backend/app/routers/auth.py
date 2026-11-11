"""Authentication routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, get_current_user
from app.config import get_settings
from app.schemas.auth import (
    EmailValidationRequest,
    EmailValidationResponse,
    PostSignupRequest,
    UserProfile,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> UserProfile:
    """
    Get current authenticated user's profile.
    
    Returns complete profile information including role, approval status,
    and onboarding completion for routing logic on the frontend.
    """
    # Load full profile
    profile_response = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user.user_id)
        .single()
        .execute()
    )

    if not profile_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    profile_data = profile_response.data

    # Load freelancer-specific data if applicable
    if user.role == "freelancer":
        freelancer_response = (
            supabase.table("freelancer_profiles")
            .select("approval_status, onboarding_complete, avg_rating, profile_completion")
            .eq("user_id", user.user_id)
            .single()
            .execute()
        )

        if freelancer_response.data:
            profile_data.update(freelancer_response.data)

    return UserProfile(**profile_data)


@router.post("/validate-registration", response_model=EmailValidationResponse)
async def validate_registration_email(
    request: EmailValidationRequest,
) -> EmailValidationResponse:
    """
    Validate email domain before registration.
    
    Checks if the provided email belongs to an allowed domain
    (COMSATS-related domains configured in backend).
    
    This endpoint is called BEFORE the user clicks "Create account"
    to provide immediate feedback.
    """
    settings = get_settings()
    allowed_domains = settings.allowed_domains_list

    email_domain = request.email.split("@")[1].lower()

    # Check if email domain is in allowed list
    is_valid = email_domain in allowed_domains

    if is_valid:
        return EmailValidationResponse(
            valid=True,
            message="Email domain is valid",
            allowed_domains=allowed_domains,
        )
    else:
        return EmailValidationResponse(
            valid=False,
            message=f"Only COMSATS email addresses are allowed. Please use an email from: {', '.join(allowed_domains)}",
            allowed_domains=allowed_domains,
        )


@router.post("/register-complete", status_code=201)
async def complete_registration(
    request: PostSignupRequest,
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Create profile rows after Supabase Auth signup.

    Called once after the user verifies their email and the session is active.
    Creates the `profiles` row and (for freelancers) the `freelancer_profiles` row.
    Idempotent: safe to call again if a previous attempt failed.
    """
    # Check profile doesn't already exist
    existing = (
        supabase.table("profiles")
        .select("id")
        .eq("id", user.user_id)
        .execute()
    )
    if not existing.data:
        # Create profiles row
        supabase.table("profiles").insert({
            "id": user.user_id,
            "role": request.role,
            "full_name": request.full_name,
            "email": user.email,
            "phone": request.phone,
        }).execute()

    # For freelancers, also create freelancer_profiles row
    if request.role == "freelancer":
        existing_fl = (
            supabase.table("freelancer_profiles")
            .select("user_id")
            .eq("user_id", user.user_id)
            .execute()
        )
        if not existing_fl.data:
            supabase.table("freelancer_profiles").insert({
                "user_id": user.user_id,
                "approval_status": "pending",
                "onboarding_complete": False,
                "profile_completion": 0,
            }).execute()

    return {"detail": "Profile created successfully"}
