"""Account settings endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, require_approved_freelancer
from app.schemas.account import AccountSettingsUpdate
from app.routers.freelancer_profile import get_freelancer_profile
from app.schemas.profile import FreelancerProfileResponse

router = APIRouter(prefix="/account", tags=["Account"])


@router.put("/settings", response_model=FreelancerProfileResponse)
async def update_account_settings(
    body: AccountSettingsUpdate,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """
    Update account settings (visibility, notification preferences).

    Visibility and notification preferences are stored on the freelancer_profiles
    table as JSON-compatible fields. For now we store them in budget_pref/work_mode
    columns since dedicated columns haven't been added yet. A proper migration
    can add dedicated columns later.
    """
    # Build updates from the request body
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=422,
            detail="No settings to update.",
        )

    # Map notification preferences into a JSON stored in budget_pref
    # (This is a temporary approach; add proper columns in a migration later)
    fl_updates = {}
    if "visibility" in updates:
        fl_updates["work_mode"] = updates["visibility"]  # temporary mapping
    if any(k.startswith("notify_") for k in updates):
        fl_updates["budget_pref"] = ",".join(
            k.replace("notify_", "") for k, v in updates.items()
            if k.startswith("notify_") and v
        ) or None

    if fl_updates:
        supabase.table("freelancer_profiles").update(fl_updates).eq(
            "user_id", user.user_id
        ).execute()

    # Return updated profile
    return await get_freelancer_profile(user=user, supabase=supabase)
