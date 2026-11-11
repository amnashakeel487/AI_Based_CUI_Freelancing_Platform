"""Projects browse, detail, save/unsave endpoints."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, get_current_user, require_approved_freelancer
from app.schemas.project import (
    CategoryItem,
    ProjectDetail,
    ProjectListItem,
    ProjectListResponse,
    SavedProjectResponse,
)

router = APIRouter(prefix="/projects", tags=["Projects"])


def _attach_skills(project_ids: list, supabase: Client) -> dict[str, list]:
    """Return a dict of project_id → [skill_name, …] for a batch of projects."""
    if not project_ids:
        return {}
    resp = (
        supabase.table("project_skills")
        .select("project_id, skills(name)")
        .in_("project_id", project_ids)
        .execute()
    )
    mapping: dict[str, list] = {pid: [] for pid in project_ids}
    for row in resp.data or []:
        pid = row["project_id"]
        name = row.get("skills", {}).get("name")
        if name:
            mapping[pid].append(name)
    return mapping


def _get_saved_ids(user_id: str, supabase: Client) -> set[str]:
    resp = (
        supabase.table("saved_projects")
        .select("project_id")
        .eq("freelancer_id", user_id)
        .execute()
    )
    return {r["project_id"] for r in (resp.data or [])}


@router.get("/categories", response_model=List[CategoryItem])
async def list_categories(
    _user: CurrentUser = Depends(get_current_user),   # auth only, no approval needed
    supabase: Client = Depends(get_supabase),
):
    """Return all project categories."""
    resp = supabase.table("categories").select("id, name").order("name").execute()
    return resp.data or []


@router.get("/", response_model=ProjectListResponse)
async def browse_projects(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    min_budget: Optional[float] = Query(None),
    deadline_before: Optional[str] = Query(None),
    project_type: Optional[str] = Query(None),
    sort: Optional[str] = Query("created_at"),   # created_at | budget | deadline
    page: int = Query(1, ge=1),
    page_size: int = Query(9, ge=1, le=50),
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Browse open projects with server-side filtering, sorting and pagination."""
    query = (
        supabase.table("projects")
        .select(
            "id, title, description, requirements, budget, project_type, deadline, status, "
            "categories(name), profiles!projects_client_id_fkey(full_name)"
        )
        .eq("status", "open")
    )

    # Text search
    if q and q.strip():
        query = query.ilike("title", f"%{q.strip()}%")

    # Category filter
    if category:
        cat_resp = (
            supabase.table("categories")
            .select("id")
            .eq("name", category)
            .limit(1)
            .execute()
        )
        if cat_resp.data:
            query = query.eq("category_id", cat_resp.data[0]["id"])

    # Budget filter
    if min_budget is not None:
        query = query.gte("budget", min_budget)

    # Deadline filter
    if deadline_before:
        query = query.lte("deadline", deadline_before)

    # Project type filter
    if project_type:
        query = query.eq("project_type", project_type)

    # Sorting
    if sort == "budget":
        query = query.order("budget", desc=True)
    elif sort == "deadline":
        query = query.order("deadline")
    else:
        query = query.order("created_at", desc=True)

    resp = query.execute()
    rows = resp.data or []

    # Attach skills
    project_ids = [r["id"] for r in rows]
    skills_map = _attach_skills(project_ids, supabase)
    saved_ids = _get_saved_ids(user.user_id, supabase)

    # Skill filter (post-query since it's on a join)
    if skill:
        rows = [r for r in rows if skill in skills_map.get(r["id"], [])]

    # Build response items
    items = []
    for r in rows:
        items.append(ProjectListItem(
            id=r["id"],
            title=r["title"],
            description=r["description"],
            category=r.get("categories", {}).get("name") if r.get("categories") else None,
            budget=r["budget"],
            project_type=r["project_type"],
            deadline=r.get("deadline"),
            status=r["status"],
            client_name=r.get("profiles", {}).get("full_name") if r.get("profiles") else None,
            skills=skills_map.get(r["id"], []),
            saved=r["id"] in saved_ids,
        ))

    total = len(items)
    pages = max(1, -(-total // page_size))  # ceiling division
    start = (page - 1) * page_size
    page_items = items[start: start + page_size]

    return ProjectListResponse(
        items=page_items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{project_id}", response_model=ProjectDetail)
async def get_project(
    project_id: str,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Get full project details."""
    resp = (
        supabase.table("projects")
        .select(
            "id, title, description, requirements, budget, project_type, deadline, "
            "status, client_id, categories(name), "
            "profiles!projects_client_id_fkey(full_name)"
        )
        .eq("id", project_id)
        .single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Project not found.")

    r = resp.data
    skills_map = _attach_skills([project_id], supabase)
    saved_ids = _get_saved_ids(user.user_id, supabase)

    return ProjectDetail(
        id=r["id"],
        title=r["title"],
        description=r["description"],
        requirements=r.get("requirements") or [],
        category=r.get("categories", {}).get("name") if r.get("categories") else None,
        budget=r["budget"],
        project_type=r["project_type"],
        deadline=r.get("deadline"),
        status=r["status"],
        client_id=r.get("client_id"),
        client_name=r.get("profiles", {}).get("full_name") if r.get("profiles") else None,
        skills=skills_map.get(project_id, []),
        saved=project_id in saved_ids,
    )


@router.post("/{project_id}/save", response_model=SavedProjectResponse)
async def save_project(
    project_id: str,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Bookmark a project (idempotent)."""
    supabase.table("saved_projects").upsert({
        "freelancer_id": user.user_id,
        "project_id": project_id,
    }).execute()
    return SavedProjectResponse(saved=True, project_id=project_id)


@router.delete("/{project_id}/save", response_model=SavedProjectResponse)
async def unsave_project(
    project_id: str,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Remove a bookmark (idempotent)."""
    supabase.table("saved_projects").delete().eq(
        "freelancer_id", user.user_id
    ).eq("project_id", project_id).execute()
    return SavedProjectResponse(saved=False, project_id=project_id)
