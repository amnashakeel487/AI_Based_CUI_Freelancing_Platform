"""Recommendation endpoints — rule-based project matching."""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, require_approved_freelancer
from app.schemas.recommendation import RecommendedProject
from app.services.recommendation import rank_projects
from app.routers.projects import _attach_skills, _get_saved_ids

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/projects", response_model=List[RecommendedProject])
async def get_recommended_projects(
    category: Optional[str] = Query(None),
    sort: Optional[str] = Query("match"),   # match | deadline
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """
    Return open projects ranked by skill-overlap score.

    Scoring is rule-based (skill level weights + category preference bonus).
    The response includes match_percent, matched_skills, missing_skills, reason,
    and engine="rule-based" so the UI can label it honestly.
    """
    # 1. Load freelancer's skills
    skills_resp = (
        supabase.table("freelancer_skills")
        .select("skill_id, level, skills(name)")
        .eq("freelancer_id", user.user_id)
        .execute()
    )
    freelancer_skills = [
        {"name": row["skills"]["name"], "level": row["level"]}
        for row in (skills_resp.data or [])
    ]

    # 2. Load freelancer's preferred categories (from freelancer_profiles)
    pref_resp = (
        supabase.table("freelancer_profiles")
        .select("budget_pref")  # preferred_categories not stored yet; use empty
        .eq("user_id", user.user_id)
        .single()
        .execute()
    )
    preferred_categories: list[str] = []  # extend when we store this field

    # 3. Fetch open projects
    proj_query = (
        supabase.table("projects")
        .select(
            "id, title, description, budget, project_type, deadline, status, "
            "categories(name), profiles!projects_client_id_fkey(full_name)"
        )
        .eq("status", "open")
    )
    if category:
        cat_resp = (
            supabase.table("categories")
            .select("id")
            .eq("name", category)
            .limit(1)
            .execute()
        )
        if cat_resp.data:
            proj_query = proj_query.eq("category_id", cat_resp.data[0]["id"])

    proj_resp = proj_query.execute()
    rows = proj_resp.data or []

    # 4. Attach skills to projects
    project_ids = [r["id"] for r in rows]
    skills_map = _attach_skills(project_ids, supabase)
    saved_ids = _get_saved_ids(user.user_id, supabase)

    # 5. Build flat project dicts for the scoring service
    projects_flat = []
    for r in rows:
        projects_flat.append({
            "id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "category": r.get("categories", {}).get("name") if r.get("categories") else None,
            "budget": r["budget"],
            "project_type": r["project_type"],
            "deadline": r.get("deadline"),
            "status": r["status"],
            "client_name": r.get("profiles", {}).get("full_name") if r.get("profiles") else None,
            "skills": skills_map.get(r["id"], []),
        })

    # 6. Score and rank
    ranked = rank_projects(
        projects=projects_flat,
        freelancer_skills=freelancer_skills,
        preferred_categories=preferred_categories,
        saved_ids=list(saved_ids),
    )

    # 7. Secondary sort by deadline if requested
    if sort == "deadline":
        ranked.sort(key=lambda p: p.get("deadline") or "9999-12-31")

    return [RecommendedProject(**p) for p in ranked]
