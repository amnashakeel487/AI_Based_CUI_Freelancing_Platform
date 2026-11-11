"""Freelancer skills management routes."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, get_current_user
from app.schemas.skill import (
    FreelancerSkillItem,
    SkillAddRequest,
    SkillCatalogItem,
    SkillsReplaceRequest,
)

router = APIRouter(prefix="/freelancer/skills", tags=["Freelancer Skills"])


# ── helpers ──────────────────────────────────────────────────────────────────

def _get_or_create_skill(supabase: Client, name: str) -> str:
    """
    Look up a skill by name (case-insensitive).
    Create it if it doesn't exist yet.
    Returns the skill's UUID.
    """
    resp = (
        supabase.table("skills")
        .select("id")
        .ilike("name", name.strip())
        .limit(1)
        .execute()
    )
    if resp.data:
        return resp.data[0]["id"]

    # Create new skill – the unique index on lower(name) prevents races
    new_resp = (
        supabase.table("skills")
        .insert({"name": name.strip()})
        .execute()
    )
    return new_resp.data[0]["id"]


def _load_my_skills(user_id: str, supabase: Client) -> List[FreelancerSkillItem]:
    """Return the current freelancer's skills with names."""
    resp = (
        supabase.table("freelancer_skills")
        .select("skill_id, level, skills(name)")
        .eq("freelancer_id", user_id)
        .execute()
    )
    return [
        FreelancerSkillItem(
            skill_id=row["skill_id"],
            name=row["skills"]["name"],
            level=row["level"],
        )
        for row in (resp.data or [])
    ]


# ── endpoints ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[FreelancerSkillItem])
async def get_my_skills(
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Return the current freelancer's skills."""
    if user.role != "freelancer":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Freelancers only.")
    return _load_my_skills(user.user_id, supabase)


@router.get("/catalog", response_model=List[SkillCatalogItem])
async def get_skills_catalog(
    q: Optional[str] = Query(None, description="Search term (prefix/substring)"),
    _user: CurrentUser = Depends(get_current_user),   # auth only, no approval needed
    supabase: Client = Depends(get_supabase),
):
    """
    Return up to 20 skills from the master catalog matching `q`.
    Used by SkillPicker to populate suggestions.
    Returns all skills when `q` is omitted.
    """
    query = supabase.table("skills").select("id, name").order("name")
    if q and q.strip():
        query = query.ilike("name", f"%{q.strip()}%")
    resp = query.limit(20).execute()
    return resp.data or []


@router.put("/", response_model=List[FreelancerSkillItem])
async def replace_skills(
    body: SkillsReplaceRequest,
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Replace the freelancer's entire skill list.
    Deletes all existing skills then inserts the new set.
    Duplicate names within the request are rejected by the schema validator.
    """
    if user.role != "freelancer":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Freelancers only.")

    # Resolve / create skill IDs first so we can detect dupes by case-insensitive name
    seen: set[str] = set()
    rows: list[dict] = []
    for item in body.skills:
        key = item.name.lower()
        if key in seen:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Duplicate skill after case normalisation: '{item.name}'",
            )
        seen.add(key)
        skill_id = _get_or_create_skill(supabase, item.name)
        rows.append({
            "freelancer_id": user.user_id,
            "skill_id": skill_id,
            "level": item.level,
        })

    # Atomic replace: delete then insert
    supabase.table("freelancer_skills").delete().eq("freelancer_id", user.user_id).execute()
    if rows:
        supabase.table("freelancer_skills").insert(rows).execute()

    return _load_my_skills(user.user_id, supabase)


@router.post("/", response_model=List[FreelancerSkillItem], status_code=201)
async def add_skill(
    body: SkillAddRequest,
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Add one skill to the freelancer's list.
    Rejects if the skill (case-insensitive) already exists.
    """
    if user.role != "freelancer":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Freelancers only.")

    skill_id = _get_or_create_skill(supabase, body.name)

    # Check for existing entry
    existing = (
        supabase.table("freelancer_skills")
        .select("skill_id")
        .eq("freelancer_id", user.user_id)
        .eq("skill_id", skill_id)
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={"detail": f"'{body.name}' is already in your skill list.", "code": "DUPLICATE_SKILL"},
        )

    supabase.table("freelancer_skills").insert({
        "freelancer_id": user.user_id,
        "skill_id": skill_id,
        "level": body.level,
    }).execute()

    return _load_my_skills(user.user_id, supabase)


@router.delete("/{skill_id}", status_code=204)
async def delete_skill(
    skill_id: str,
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Remove one skill from the freelancer's list by skill_id."""
    if user.role != "freelancer":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Freelancers only.")

    result = (
        supabase.table("freelancer_skills")
        .delete()
        .eq("freelancer_id", user.user_id)
        .eq("skill_id", skill_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Skill not found in your list.")
