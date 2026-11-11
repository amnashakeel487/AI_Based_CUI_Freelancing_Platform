"""Notification endpoints."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, require_approved_freelancer
from app.schemas.notification import NotificationItem, MarkReadResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationItem])
async def list_notifications(
    unread_only: Optional[bool] = Query(None, alias="unread"),
    _user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Return notifications for the current freelancer, newest first."""
    query = (
        supabase.table("notifications")
        .select("*")
        .eq("user_id", _user.user_id)
        .order("created_at", desc=True)
        .limit(50)
    )
    if unread_only:
        query = query.eq("read", False)
    resp = query.execute()
    return resp.data or []


@router.post("/{notification_id}/read", response_model=MarkReadResponse)
async def mark_notification_read(
    notification_id: str,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Mark a single notification as read (ownership enforced)."""
    resp = (
        supabase.table("notifications")
        .update({"read": True})
        .eq("id", notification_id)
        .eq("user_id", user.user_id)
        .execute()
    )
    if not resp.data:
        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )
    return MarkReadResponse(id=notification_id, read=True)


@router.post("/read-all", response_model=MarkReadResponse)
async def mark_all_read(
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Mark all unread notifications as read."""
    supabase.table("notifications").update({"read": True}).eq(
        "user_id", user.user_id
    ).eq("read", False).execute()
    return MarkReadResponse(id="all", read=True)
