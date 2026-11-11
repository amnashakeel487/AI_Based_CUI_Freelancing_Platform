"""Complaint endpoints."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, require_approved_freelancer
from app.schemas.complaint import ComplaintCreate, ComplaintItem

router = APIRouter(prefix="/complaints", tags=["Complaints"])


def _enrich(rows: list, supabase: Client) -> list[dict]:
    """Attach project title."""
    if not rows:
        return []
    project_ids = list({r.get("project_id") for r in rows if r.get("project_id")})
    if not project_ids:
        return [{**r, "project_title": None} for r in rows]
    titles_resp = (
        supabase.table("projects")
        .select("id, title")
        .in_("id", project_ids)
        .execute()
    )
    title_map = {p["id"]: p["title"] for p in (titles_resp.data or [])}
    return [{**r, "project_title": title_map.get(r.get("project_id"))} for r in rows]


@router.get("/", response_model=List[ComplaintItem])
async def list_my_complaints(
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Return all complaints filed by the current freelancer."""
    resp = (
        supabase.table("complaints")
        .select("*")
        .eq("user_id", user.user_id)
        .order("created_at", desc=True)
        .execute()
    )
    rows = resp.data or []
    enriched = _enrich(rows, supabase)
    return [
        ComplaintItem(
            id=r["id"],
            subject=r["subject"],
            description=r["description"],
            project_id=r.get("project_id"),
            project_title=r.get("project_title"),
            status=r["status"],
            created_at=r["created_at"],
        )
        for r in enriched
    ]


@router.post("/", response_model=ComplaintItem, status_code=201)
async def create_complaint(
    body: ComplaintCreate,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """File a new complaint."""
    resp = supabase.table("complaints").insert({
        "user_id": user.user_id,
        "subject": body.subject,
        "description": body.description,
        "project_id": body.project_id,
        "status": "open",
    }).execute()

    row = resp.data[0]
    enriched = _enrich([row], supabase)[0]
    return ComplaintItem(
        id=enriched["id"],
        subject=enriched["subject"],
        description=enriched["description"],
        project_id=enriched.get("project_id"),
        project_title=enriched.get("project_title"),
        status=enriched["status"],
        created_at=enriched["created_at"],
    )
