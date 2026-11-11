"""Freelancer profile management routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, get_current_user
from app.schemas.profile import (
    FreelancerProfileUpdate,
    FreelancerProfileResponse,
    OnboardingData,
    ProfileCompletion,
    SkillRef,
)

router = APIRouter(prefix="/freelancer/profile", tags=["Freelancer Profile"])


def calculate_completion(profile_data: dict, skills: list) -> tuple[int, list]:
    """Calculate profile completion percentage."""
    fields = [
        ("full_name", profile_data.get("full_name")),
        ("headline", profile_data.get("headline")),
        ("bio", profile_data.get("bio")),
        ("city", profile_data.get("city")),
        ("phone", profile_data.get("phone")),
        ("program", profile_data.get("program")),
        ("department", profile_data.get("department")),
        ("campus", profile_data.get("campus")),
        ("experience_level", profile_data.get("experience_level")),
        ("github_url", profile_data.get("github_url")),
        ("linkedin_url", profile_data.get("linkedin_url")),
    ]
    # Skills are separate
    has_skills = len(skills) >= 3
    has_portfolio = False  # Checked separately

    total = len(fields) + 2  # +2 for skills and portfolio
    filled = sum(1 for _, v in fields if v)
    if has_skills:
        filled += 1
    if has_portfolio:
        filled += 1

    percentage = int((filled / total) * 100)
    missing = [name for name, v in fields if not v]
    if not has_skills:
        missing.append("skills (add at least 3)")

    return percentage, missing


@router.get("/", response_model=FreelancerProfileResponse)
async def get_freelancer_profile(
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> FreelancerProfileResponse:
    """Get the current freelancer's profile."""
    if user.role != "freelancer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only freelancers can access this endpoint",
        )

    # Load profile
    profile_resp = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user.user_id)
        .single()
        .execute()
    )
    if not profile_resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Load freelancer profile
    fl_resp = (
        supabase.table("freelancer_profiles")
        .select("*")
        .eq("user_id", user.user_id)
        .single()
        .execute()
    )

    # Load skills
    skills_resp = (
        supabase.table("freelancer_skills")
        .select("skill_id, level, skills(name)")
        .eq("freelancer_id", user.user_id)
        .execute()
    )

    # Load portfolio
    portfolio_resp = (
        supabase.table("portfolio_items")
        .select("*")
        .eq("freelancer_id", user.user_id)
        .execute()
    )

    # Merge data
    profile_data = {**profile_resp.data, **(fl_resp.data or {})}
    profile_data["skills"] = [
        {"name": s["skills"]["name"], "level": s["level"]}
        for s in (skills_resp.data or [])
    ]
    profile_data["portfolio"] = portfolio_resp.data or []

    return FreelancerProfileResponse(**profile_data)


@router.put("/", response_model=FreelancerProfileResponse)
async def update_freelancer_profile(
    update: FreelancerProfileUpdate,
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> FreelancerProfileResponse:
    """Update the current freelancer's profile."""
    if user.role != "freelancer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only freelancers can access this endpoint",
        )

    # Separate profile fields from freelancer_profile fields
    profile_fields = ["full_name", "phone", "city", "headline", "bio", "avatar_url"]
    fl_fields = [
        "program", "department", "campus", "semester", "experience_level",
        "availability", "budget_pref", "work_mode",
        "github_url", "linkedin_url", "site_url",
    ]

    # Update profiles table
    profile_updates = {
        k: v for k, v in update.model_dump(exclude_unset=True).items()
        if k in profile_fields and v is not None
    }
    if profile_updates:
        supabase.table("profiles").update(profile_updates).eq("id", user.user_id).execute()

    # Update freelancer_profiles table
    fl_updates = {
        k: v for k, v in update.model_dump(exclude_unset=True).items()
        if k in fl_fields and v is not None
    }
    if fl_updates:
        supabase.table("freelancer_profiles").update(fl_updates).eq("user_id", user.user_id).execute()

    # Return updated profile
    return await get_freelancer_profile(user=user, supabase=supabase)


@router.post("/onboarding/complete", response_model=FreelancerProfileResponse)
async def complete_onboarding(
    data: OnboardingData,
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> FreelancerProfileResponse:
    """Complete the onboarding wizard and save all data."""
    if user.role != "freelancer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only freelancers can access this endpoint",
        )

    # 1. Update profiles table
    profile_updates = {
        "full_name": data.full_name,
        "phone": data.phone,
        "city": data.city,
        "headline": data.headline,
        "bio": data.bio,
    }
    supabase.table("profiles").update(profile_updates).eq("id", user.user_id).execute()

    # 2. Update freelancer_profiles table
    fl_updates = {
        "program": data.program,
        "department": data.department,
        "campus": data.campus,
        "semester": data.semester,
        "experience_level": data.experience_level,
        "availability": data.availability,
        "budget_pref": data.budget_pref,
        "work_mode": data.work_mode,
        "github_url": data.github_url,
        "linkedin_url": data.linkedin_url,
        "site_url": data.site_url,
        "onboarding_complete": True,
    }
    supabase.table("freelancer_profiles").update(fl_updates).eq("user_id", user.user_id).execute()

    # 3. Save skills (replace all)
    # First, delete existing skills
    supabase.table("freelancer_skills").delete().eq("freelancer_id", user.user_id).execute()

    # Then, add new skills
    for skill in data.skills:
        # Find or create skill by name (case-insensitive)
        skill_resp = (
            supabase.table("skills")
            .select("id")
            .ilike("name", skill.name)
            .execute()
        )
        if skill_resp.data:
            skill_id = skill_resp.data[0]["id"]
        else:
            # Create new skill
            new_skill = supabase.table("skills").insert({"name": skill.name}).execute()
            skill_id = new_skill.data[0]["id"]

        # Add to freelancer_skills
        supabase.table("freelancer_skills").insert({
            "freelancer_id": user.user_id,
            "skill_id": skill_id,
            "level": skill.level,
        }).execute()

    # 4. Save portfolio item (if provided)
    if data.portfolio_title:
        tech_list = [t.strip() for t in (data.portfolio_tech or "").split(",") if t.strip()]
        supabase.table("portfolio_items").insert({
            "freelancer_id": user.user_id,
            "title": data.portfolio_title,
            "description": data.portfolio_description,
            "technologies": tech_list,
            "link": data.portfolio_link,
        }).execute()

    # 5. Update profile completion
    # Load updated profile for completion calculation
    profile_resp = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user.user_id)
        .single()
        .execute()
    )
    fl_resp = (
        supabase.table("freelancer_profiles")
        .select("*")
        .eq("user_id", user.user_id)
        .single()
        .execute()
    )
    skills_resp = (
        supabase.table("freelancer_skills")
        .select("skill_id, level")
        .eq("freelancer_id", user.user_id)
        .execute()
    )

    all_data = {**profile_resp.data, **(fl_resp.data or {})}
    completion, _ = calculate_completion(all_data, skills_resp.data or [])
    supabase.table("freelancer_profiles").update({"profile_completion": completion}).eq("user_id", user.user_id).execute()

    # Return updated profile
    return await get_freelancer_profile(user=user, supabase=supabase)


@router.get("/completion", response_model=ProfileCompletion)
async def get_profile_completion(
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
) -> ProfileCompletion:
    """Get profile completion percentage and missing fields."""
    if user.role != "freelancer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only freelancers can access this endpoint",
        )

    profile_resp = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user.user_id)
        .single()
        .execute()
    )
    fl_resp = (
        supabase.table("freelancer_profiles")
        .select("*")
        .eq("user_id", user.user_id)
        .single()
        .execute()
    )
    skills_resp = (
        supabase.table("freelancer_skills")
        .select("skill_id, level")
        .eq("freelancer_id", user.user_id)
        .execute()
    )

    all_data = {**profile_resp.data, **(fl_resp.data or {})}
    completion, missing = calculate_completion(all_data, skills_resp.data or [])

    return ProfileCompletion(completion=completion, missing_fields=missing)
