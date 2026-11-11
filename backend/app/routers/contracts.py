"""Contracts / active-projects endpoints for freelancers."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, require_approved_freelancer
from app.schemas.contract import (
    ActivityItem,
    ContractDetail,
    ContractListItem,
    DisputeRequest,
    DisputeResponse,
    MilestoneItem,
    SignedDeliverableUrlResponse,
    SubmitWorkRequest,
    SubmissionItem,
)
from app.config import get_settings

router = APIRouter(prefix="/contracts", tags=["Contracts"])


# ── helpers ────────────────────────────────────────────────────────────────────

def _get_my_active_project_ids(user_id: str, supabase: Client) -> list[dict]:
    """Return project rows where this freelancer has an accepted bid."""
    bids_resp = (
        supabase.table("bids")
        .select("project_id, amount, projects(id, title, description, status, deadline)")
        .eq("freelancer_id", user_id)
        .eq("status", "accepted")
        .execute()
    )
    rows = []
    for b in bids_resp.data or []:
        proj = b.get("projects")
        if proj and proj.get("status") in ("in_progress", "submitted"):
            rows.append({
                "project_id":  proj["id"],
                "title":       proj["title"],
                "description": proj.get("description"),
                "status":      proj["status"],
                "deadline":    proj.get("deadline"),
                "bid_amount":  b.get("amount", 0),
            })
    return rows


def _load_milestones(project_id: str, supabase: Client) -> list[dict]:
    resp = (
        supabase.table("milestones")
        .select("*")
        .eq("project_id", project_id)
        .order("position")
        .execute()
    )
    return resp.data or []


def _load_activity(project_id: str, supabase: Client) -> list[dict]:
    resp = (
        supabase.table("activity_log")
        .select("id, project_id, actor_id, text, created_at")
        .eq("project_id", project_id)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    rows = resp.data or []
    # Attach actor names
    if rows:
        actor_ids = list({r["actor_id"] for r in rows if r.get("actor_id")})
        if actor_ids:
            names_resp = (
                supabase.table("profiles")
                .select("id, full_name")
                .in_("id", actor_ids)
                .execute()
            )
            name_map = {p["id"]: p["full_name"] for p in (names_resp.data or [])}
        else:
            name_map = {}
        for r in rows:
            r["actor_name"] = name_map.get(r.get("actor_id")) if r.get("actor_id") else None
    return rows


def _load_submissions(project_id: str, supabase: Client) -> list[dict]:
    resp = (
        supabase.table("submissions")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", desc=True)
        .execute()
    )
    return resp.data or []


def _load_client_name(project_id: str, supabase: Client) -> str | None:
    resp = (
        supabase.table("projects")
        .select("client_id, profiles!projects_client_id_fkey(full_name)")
        .eq("id", project_id)
        .single()
        .execute()
    )
    if resp.data:
        prof = resp.data.get("profiles")
        return prof.get("full_name") if prof else None
    return None


def _verify_access(project_id: str, user_id: str, supabase: Client) -> dict:
    """Verify the freelancer has an accepted bid on this project. Returns bid row."""
    bid_resp = (
        supabase.table("bids")
        .select("id, amount, project_id")
        .eq("project_id", project_id)
        .eq("freelancer_id", user_id)
        .eq("status", "accepted")
        .maybe_single()
        .execute()
    )
    if not bid_resp.data:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail="You don't have an active contract on this project.",
        )
    return bid_resp.data


# ── endpoints ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[ContractListItem])
async def list_my_contracts(
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Return all active projects where the freelancer has an accepted bid."""
    rows = _get_my_active_project_ids(user.user_id, supabase)

    # Attach milestones summary
    items: list[ContractListItem] = []
    for r in rows:
        milestones = _load_milestones(r["project_id"], supabase)
        done = sum(1 for m in milestones if m.get("done"))
        total = len(milestones)
        progress = round((done / total) * 100) if total else 0
        client_name = _load_client_name(r["project_id"], supabase)
        items.append(ContractListItem(
            project_id=r["project_id"],
            title=r["title"],
            client_name=client_name,
            status=r["status"],
            deadline=r.get("deadline"),
            progress=progress,
            milestones_done=done,
            milestones_total=total,
            bid_amount=r["bid_amount"],
        ))
    return items


@router.get("/{project_id}", response_model=ContractDetail)
async def get_contract_detail(
    project_id: str,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Get full workspace data: milestones, activity log, submissions."""
    bid = _verify_access(project_id, user.user_id, supabase)

    # Load project
    proj_resp = (
        supabase.table("projects")
        .select("*")
        .eq("id", project_id)
        .single()
        .execute()
    )
    if not proj_resp.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Project not found.")
    proj = proj_resp.data

    milestones = _load_milestones(project_id, supabase)
    activity   = _load_activity(project_id, supabase)
    submissions = _load_submissions(project_id, supabase)
    client_name = _load_client_name(project_id, supabase)

    done = sum(1 for m in milestones if m.get("done"))
    total = len(milestones)
    progress = round((done / total) * 100) if total else 0

    return ContractDetail(
        project_id=project_id,
        title=proj["title"],
        description=proj.get("description"),
        client_name=client_name,
        status=proj["status"],
        deadline=proj.get("deadline"),
        progress=progress,
        milestones_done=done,
        milestones_total=total,
        bid_amount=bid["amount"],
        milestones=[MilestoneItem(**m) for m in milestones],
        activity=[ActivityItem(**a) for a in activity],
        submissions=[SubmissionItem(**s) for s in submissions],
    )


@router.post("/{project_id}/submit", response_model=SubmissionItem, status_code=201)
async def submit_work(
    project_id: str,
    body: SubmitWorkRequest,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """
    Submit deliverable work for client review.

    1. Creates a submission row.
    2. Sets project status to 'submitted'.
    3. Logs an activity entry.
    4. Creates a notification for the client.
    """
    _verify_access(project_id, user.user_id, supabase)

    # Only allow submission when project is in_progress
    proj_resp = (
        supabase.table("projects")
        .select("id, status, client_id")
        .eq("id", project_id)
        .single()
        .execute()
    )
    proj = proj_resp.data
    if proj["status"] != "in_progress":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={"detail": "Work can only be submitted for in-progress projects.", "code": "NOT_IN_PROGRESS"},
        )

    # 1. Create submission
    sub_resp = supabase.table("submissions").insert({
        "project_id":    project_id,
        "freelancer_id": user.user_id,
        "notes":         body.notes,
        "file_path":     body.file_path,
        "link":          body.link,
        "status":        "pending",
    }).execute()

    submission = sub_resp.data[0]

    # 2. Update project status
    supabase.table("projects").update({"status": "submitted"}).eq("id", project_id).execute()

    # 3. Activity log
    supabase.table("activity_log").insert({
        "project_id": project_id,
        "actor_id":   user.user_id,
        "text":       "Freelancer submitted work for review.",
    }).execute()

    # 4. Notify client
    supabase.table("notifications").insert({
        "user_id": proj["client_id"],
        "type":    "submission",
        "body":    f"Your freelancer has submitted work for review.",
    }).execute()

    return SubmissionItem(**submission)


@router.post("/{project_id}/dispute", response_model=DisputeResponse, status_code=201)
async def raise_dispute(
    project_id: str,
    body: DisputeRequest,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """
    Raise a dispute on a project.
    Records the dispute and notifies the admin (no fund freezing here).
    """
    _verify_access(project_id, user.user_id, supabase)

    # Check no existing open dispute
    existing = (
        supabase.table("disputes")
        .select("id")
        .eq("project_id", project_id)
        .eq("raised_by", user.user_id)
        .in_("status", ["open", "under_review"])
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={"detail": "You already have an open dispute on this project.", "code": "DISPUTE_EXISTS"},
        )

    disp_resp = supabase.table("disputes").insert({
        "project_id": project_id,
        "raised_by": user.user_id,
        "reason":    body.reason,
        "status":    "open",
    }).execute()

    dispute = disp_resp.data[0]

    # Activity log
    supabase.table("activity_log").insert({
        "project_id": project_id,
        "actor_id":   user.user_id,
        "text":       "A dispute was raised on this project.",
    }).execute()

    # Notify admins (find all admins)
    admin_resp = supabase.table("profiles").select("id").eq("role", "admin").execute()
    for admin in admin_resp.data or []:
        supabase.table("notifications").insert({
            "user_id": admin["id"],
            "type":    "dispute",
            "body":    f"A new dispute has been raised on a project.",
        }).execute()

    return DisputeResponse(**dispute)


@router.post("/{project_id}/deliverable-upload-url", response_model=SignedDeliverableUrlResponse)
async def get_deliverable_upload_url(
    project_id: str,
    filename: str = "deliverable",
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """
    Return a signed upload URL for a deliverable file in the private
    'deliverables' bucket.  The freelancer uploads directly to Supabase
    Storage, then passes the resulting path to the submit-work endpoint.
    """
    _verify_access(project_id, user.user_id, supabase)

    path = f"{user.user_id}/{project_id}/{filename}"
    result = supabase.storage.from_("deliverables").create_signed_upload_url(path)

    return SignedDeliverableUrlResponse(
        upload_url=result["signedURL"],
        path=path,
    )
