"""Freelancer portfolio management routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, get_current_user
from app.schemas.portfolio import (
    PortfolioItemCreate,
    PortfolioItemResponse,
    PortfolioItemUpdate,
    SignedUploadUrlResponse,
)
from app.config import get_settings

router = APIRouter(prefix="/freelancer/portfolio", tags=["Freelancer Portfolio"])


def _own_item_or_404(item_id: str, user_id: str, supabase: Client) -> dict:
    """Load an item and verify ownership; raise 404 if not found or not owned."""
    resp = (
        supabase.table("portfolio_items")
        .select("*")
        .eq("id", item_id)
        .eq("freelancer_id", user_id)
        .single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Portfolio item not found.")
    return resp.data


@router.get("/", response_model=List[PortfolioItemResponse])
async def list_portfolio(
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Return all portfolio items for the current freelancer."""
    if user.role != "freelancer":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Freelancers only.")

    resp = (
        supabase.table("portfolio_items")
        .select("*")
        .eq("freelancer_id", user.user_id)
        .order("created_at")
        .execute()
    )
    return resp.data or []


@router.post("/", response_model=PortfolioItemResponse, status_code=201)
async def create_portfolio_item(
    body: PortfolioItemCreate,
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Create a new portfolio item."""
    if user.role != "freelancer":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Freelancers only.")

    resp = supabase.table("portfolio_items").insert({
        "freelancer_id": user.user_id,
        "title": body.title,
        "description": body.description,
        "technologies": body.technologies,
        "link": body.link,
    }).execute()

    return resp.data[0]


@router.put("/{item_id}", response_model=PortfolioItemResponse)
async def update_portfolio_item(
    item_id: str,
    body: PortfolioItemUpdate,
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Update an existing portfolio item (ownership enforced)."""
    if user.role != "freelancer":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Freelancers only.")

    _own_item_or_404(item_id, user.user_id, supabase)

    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No fields to update.")

    resp = (
        supabase.table("portfolio_items")
        .update(updates)
        .eq("id", item_id)
        .eq("freelancer_id", user.user_id)
        .execute()
    )
    return resp.data[0]


@router.delete("/{item_id}", status_code=204)
async def delete_portfolio_item(
    item_id: str,
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Delete a portfolio item (ownership enforced)."""
    if user.role != "freelancer":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Freelancers only.")

    _own_item_or_404(item_id, user.user_id, supabase)

    supabase.table("portfolio_items").delete().eq("id", item_id).eq("freelancer_id", user.user_id).execute()


@router.post("/upload-url", response_model=SignedUploadUrlResponse)
async def get_upload_url(
    item_id: str,
    user: CurrentUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Return a signed upload URL for a portfolio image.
    The frontend uploads directly to Supabase Storage using this URL,
    then calls PUT /{item_id} with the resulting image_url.
    """
    if user.role != "freelancer":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Freelancers only.")

    _own_item_or_404(item_id, user.user_id, supabase)

    path = f"{user.user_id}/{item_id}.jpg"
    result = supabase.storage.from_("portfolio").create_signed_upload_url(path)

    return SignedUploadUrlResponse(
        upload_url=result["signedURL"],
        path=path,
    )
