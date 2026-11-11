"""Earnings and transaction endpoints — read-only for freelancers."""
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, require_approved_freelancer
from app.schemas.transaction import EarningsSummary, TransactionItem

router = APIRouter(prefix="/earnings", tags=["Earnings"])


def _enrich(rows: list, supabase: Client) -> list[dict]:
    """Attach project title to each transaction row."""
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


@router.get("/summary", response_model=EarningsSummary)
async def get_earnings_summary(
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Return earnings summary: total, released, held, refunded, recent transactions."""
    resp = (
        supabase.table("transactions")
        .select("*")
        .eq("payee_id", user.user_id)
        .order("created_at", desc=True)
        .execute()
    )
    rows = resp.data or []

    released = sum(r["amount"] for r in rows if r["status"] == "released")
    held = sum(r["amount"] for r in rows if r["status"] == "held_in_escrow")
    refunded = sum(r["amount"] for r in rows if r["status"] == "refunded")
    total = released + held

    enriched = _enrich(rows[:10], supabase)
    recent = [
        TransactionItem(
            id=r["id"],
            project_id=r.get("project_id"),
            project_title=r.get("project_title"),
            amount=r["amount"],
            status=r["status"],
            created_at=r["created_at"],
            released_at=r.get("released_at"),
        )
        for r in enriched
    ]

    return EarningsSummary(
        total_earned=total,
        released=released,
        held_in_escrow=held,
        refunded=refunded,
        transaction_count=len(rows),
        recent_transactions=recent,
    )


@router.get("/transactions", response_model=list[TransactionItem])
async def list_transactions(
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Return all transactions where the freelancer is the payee."""
    resp = (
        supabase.table("transactions")
        .select("*")
        .eq("payee_id", user.user_id)
        .order("created_at", desc=True)
        .execute()
    )
    rows = resp.data or []
    enriched = _enrich(rows, supabase)
    return [
        TransactionItem(
            id=r["id"],
            project_id=r.get("project_id"),
            project_title=r.get("project_title"),
            amount=r["amount"],
            status=r["status"],
            created_at=r["created_at"],
            released_at=r.get("released_at"),
        )
        for r in enriched
    ]


@router.get("/transactions/{transaction_id}", response_model=TransactionItem)
async def get_transaction(
    transaction_id: str,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Return a single transaction (ownership enforced — freelancer must be payee)."""
    resp = (
        supabase.table("transactions")
        .select("*")
        .eq("id", transaction_id)
        .eq("payee_id", user.user_id)
        .maybe_single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found or you do not have access.",
        )
    enriched = _enrich([resp.data], supabase)[0]
    return TransactionItem(
        id=enriched["id"],
        project_id=enriched.get("project_id"),
        project_title=enriched.get("project_title"),
        amount=enriched["amount"],
        status=enriched["status"],
        created_at=enriched["created_at"],
        released_at=enriched.get("released_at"),
    )
