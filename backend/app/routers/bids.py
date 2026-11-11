"""Bid (proposal) endpoints for freelancers."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, require_approved_freelancer
from app.schemas.bid import BidCreate, BidResponse, BidUpdate

router = APIRouter(prefix="/bids", tags=["Bids"])


def _enrich_bids(rows: list, supabase: Client) -> list[dict]:
    """Attach project title to each bid row."""
    if not rows:
        return []
    project_ids = list({r["project_id"] for r in rows})
    titles_resp = (
        supabase.table("projects")
        .select("id, title")
        .in_("id", project_ids)
        .execute()
    )
    title_map = {r["id"]: r["title"] for r in (titles_resp.data or [])}
    return [{**row, "project_title": title_map.get(row["project_id"])} for row in rows]


@router.post("/", response_model=BidResponse, status_code=201)
async def create_bid(
    body: BidCreate,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """
    Submit a proposal on an open project.
    Rules enforced:
      - Freelancer must be approved (handled by require_approved_freelancer)
      - Project must be open
      - Only one bid per freelancer per project (DB UNIQUE constraint)
    """
    # Verify project is open
    proj_resp = (
        supabase.table("projects")
        .select("id, status")
        .eq("id", body.project_id)
        .single()
        .execute()
    )
    if not proj_resp.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Project not found.")
    if proj_resp.data["status"] != "open":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={"detail": "This project is no longer accepting proposals.", "code": "PROJECT_CLOSED"},
        )

    # Check for existing bid (belt-and-suspenders on top of DB UNIQUE)
    existing = (
        supabase.table("bids")
        .select("id")
        .eq("project_id", body.project_id)
        .eq("freelancer_id", user.user_id)
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={"detail": "You have already submitted a proposal for this project.", "code": "DUPLICATE_BID"},
        )

    resp = supabase.table("bids").insert({
        "project_id": body.project_id,
        "freelancer_id": user.user_id,
        "cover_letter": body.cover_letter,
        "amount": body.amount,
        "delivery_days": body.delivery_days,
        "portfolio_item_id": body.portfolio_item_id,
        "status": "pending",
    }).execute()

    row = resp.data[0]
    enriched = _enrich_bids([row], supabase)
    return BidResponse(**enriched[0])


@router.get("/", response_model=List[BidResponse])
async def list_my_bids(
    bid_status: Optional[str] = Query(None, alias="status"),
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Return all bids submitted by the current freelancer, newest first."""
    query = (
        supabase.table("bids")
        .select("*")
        .eq("freelancer_id", user.user_id)
        .order("created_at", desc=True)
    )
    if bid_status:
        query = query.eq("status", bid_status)

    resp = query.execute()
    enriched = _enrich_bids(resp.data or [], supabase)
    return [BidResponse(**r) for r in enriched]


@router.get("/{bid_id}", response_model=BidResponse)
async def get_bid(
    bid_id: str,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Get a single bid (ownership enforced)."""
    resp = (
        supabase.table("bids")
        .select("*")
        .eq("id", bid_id)
        .eq("freelancer_id", user.user_id)
        .single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Bid not found.")
    enriched = _enrich_bids([resp.data], supabase)
    return BidResponse(**enriched[0])


@router.put("/{bid_id}", response_model=BidResponse)
async def update_bid(
    bid_id: str,
    body: BidUpdate,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Edit a pending bid (only allowed while status=pending)."""
    # Load and verify ownership
    resp = (
        supabase.table("bids")
        .select("id, status, freelancer_id")
        .eq("id", bid_id)
        .eq("freelancer_id", user.user_id)
        .single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Bid not found.")
    if resp.data["status"] != "pending":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={"detail": "Only pending bids can be edited.", "code": "BID_NOT_PENDING"},
        )

    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No fields to update.")

    updated = (
        supabase.table("bids")
        .update(updates)
        .eq("id", bid_id)
        .eq("freelancer_id", user.user_id)
        .execute()
    )
    enriched = _enrich_bids(updated.data, supabase)
    return BidResponse(**enriched[0])


@router.post("/{bid_id}/withdraw", response_model=BidResponse)
async def withdraw_bid(
    bid_id: str,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Withdraw a pending bid."""
    resp = (
        supabase.table("bids")
        .select("id, status, freelancer_id")
        .eq("id", bid_id)
        .eq("freelancer_id", user.user_id)
        .single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Bid not found.")
    if resp.data["status"] != "pending":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={"detail": "Only pending bids can be withdrawn.", "code": "BID_NOT_PENDING"},
        )

    updated = (
        supabase.table("bids")
        .update({"status": "withdrawn"})
        .eq("id", bid_id)
        .eq("freelancer_id", user.user_id)
        .execute()
    )
    enriched = _enrich_bids(updated.data, supabase)
    return BidResponse(**enriched[0])
