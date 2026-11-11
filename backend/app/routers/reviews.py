"""Review endpoints — read-only for freelancers."""
from fastapi import APIRouter, Depends
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, require_approved_freelancer
from app.schemas.review import ReviewItem, ReviewSummary

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("/summary", response_model=ReviewSummary)
async def get_review_summary(
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Return the freelancer's rating summary: average, breakdown, recent reviews."""
    # Load all reviews
    resp = (
        supabase.table("reviews")
        .select("id, project_id, rating, comment, created_at, projects(title), profiles(full_name)")
        .eq("freelancer_id", user.user_id)
        .order("created_at", desc=True)
        .execute()
    )
    rows = resp.data or []

    # Compute summary
    total = len(rows)
    avg = sum(r["rating"] for r in rows) / total if total else 0.0
    breakdown = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    for r in rows:
        breakdown[r["rating"]] = breakdown.get(r["rating"], 0) + 1

    # Build review items (recent 20)
    review_items = []
    for r in rows[:20]:
        review_items.append(ReviewItem(
            id=r["id"],
            project_id=r["project_id"],
            project_title=r.get("projects", {}).get("title") if r.get("projects") else None,
            rating=r["rating"],
            comment=r.get("comment"),
            client_name=r.get("profiles", {}).get("full_name") if r.get("profiles") else None,
            created_at=r["created_at"],
        ))

    return ReviewSummary(
        avg_rating=round(avg, 2),
        total_reviews=total,
        breakdown=breakdown,
        recent_reviews=review_items,
    )


@router.get("/", response_model=list[ReviewItem])
async def list_reviews(
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Return all reviews for the freelancer."""
    resp = (
        supabase.table("reviews")
        .select("id, project_id, rating, comment, created_at, projects(title), profiles(full_name)")
        .eq("freelancer_id", user.user_id)
        .order("created_at", desc=True)
        .execute()
    )
    rows = resp.data or []
    return [
        ReviewItem(
            id=r["id"],
            project_id=r["project_id"],
            project_title=r.get("projects", {}).get("title") if r.get("projects") else None,
            rating=r["rating"],
            comment=r.get("comment"),
            client_name=r.get("profiles", {}).get("full_name") if r.get("profiles") else None,
            created_at=r["created_at"],
        )
        for r in rows
    ]
