"""Messaging endpoints — conversations and messages."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.db import get_supabase
from app.deps import CurrentUser, require_approved_freelancer
from app.schemas.message import ConversationItem, MessageItem, SendMessageRequest

router = APIRouter(prefix="/messages", tags=["Messages"])


def _resolve_other_party(conversation: dict, my_id: str) -> str:
    """Return the name of the person who isn't the current user."""
    if conversation["client_id"] == my_id:
        other_id = conversation["freelancer_id"]
    else:
        other_id = conversation["client_id"]
    return other_id


def _load_party_name(user_id: str, supabase: Client) -> str:
    resp = (
        supabase.table("profiles")
        .select("full_name")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    return resp.data.get("full_name") if resp.data else "Unknown"


@router.get("/conversations", response_model=List[ConversationItem])
async def list_conversations(
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Return all conversations for the current freelancer."""
    resp = (
        supabase.table("conversations")
        .select("*")
        .or_(f"client_id.eq.{user.user_id},freelancer_id.eq.{user.user_id}")
        .order("updated_at", desc=True)
        .execute()
    )
    rows = resp.data or []
    items = []
    for c in rows:
        other_id = _resolve_other_party(c, user.user_id)
        other_name = _load_party_name(other_id, supabase)

        # Last message
        last_msg_resp = (
            supabase.table("messages")
            .select("body, created_at")
            .eq("conversation_id", c["id"])
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        last_message = last_msg_resp.data[0]["body"] if last_msg_resp.data else None
        last_at = last_msg_resp.data[0]["created_at"] if last_msg_resp.data else c.get("created_at")

        # Unread count (messages not from me and not read)
        unread_resp = (
            supabase.table("messages")
            .select("id", count="exact")
            .eq("conversation_id", c["id"])
            .neq("sender_id", user.user_id)
            .is_("read_at", "null")
            .execute()
        )
        unread = unread_resp.count or 0

        # Project title (optional)
        project_title = None
        if c.get("project_id"):
            proj_resp = (
                supabase.table("projects")
                .select("title")
                .eq("id", c["project_id"])
                .maybe_single()
                .execute()
            )
            if proj_resp.data:
                project_title = proj_resp.data["title"]

        items.append(ConversationItem(
            id=c["id"],
            project_id=c.get("project_id"),
            project_title=project_title,
            other_party_name=other_name,
            other_party_id=other_id,
            last_message=last_message,
            last_message_at=last_at,
            unread_count=unread,
        ))
    return items


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageItem])
async def get_messages(
    conversation_id: str,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Return all messages in a conversation (must be a participant)."""
    # Verify participation
    conv_resp = (
        supabase.table("conversations")
        .select("id, client_id, freelancer_id")
        .eq("id", conversation_id)
        .maybe_single()
        .execute()
    )
    if not conv_resp.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
    conv = conv_resp.data
    if user.user_id not in (conv["client_id"], conv["freelancer_id"]):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You are not a participant in this conversation.")

    resp = (
        supabase.table("messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .execute()
    )
    rows = resp.data or []
    return [
        MessageItem(
            id=r["id"],
            conversation_id=r["conversation_id"],
            sender_id=r["sender_id"],
            body=r["body"],
            created_at=r["created_at"],
            read_at=r.get("read_at"),
            is_mine=(r["sender_id"] == user.user_id),
        )
        for r in rows
    ]


@router.post("/conversations/{conversation_id}/messages", response_model=MessageItem, status_code=201)
async def send_message(
    conversation_id: str,
    body: SendMessageRequest,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Send a message in a conversation (must be a participant)."""
    conv_resp = (
        supabase.table("conversations")
        .select("id, client_id, freelancer_id")
        .eq("id", conversation_id)
        .maybe_single()
        .execute()
    )
    if not conv_resp.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
    conv = conv_resp.data
    if user.user_id not in (conv["client_id"], conv["freelancer_id"]):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You are not a participant in this conversation.")

    resp = supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "sender_id": user.user_id,
        "body": body.body,
    }).execute()

    # Update conversation timestamp
    supabase.table("conversations").update({"updated_at": "now()"}).eq("id", conversation_id).execute()

    row = resp.data[0]
    return MessageItem(
        id=row["id"],
        conversation_id=row["conversation_id"],
        sender_id=row["sender_id"],
        body=row["body"],
        created_at=row["created_at"],
        read_at=row.get("read_at"),
        is_mine=True,
    )


@router.post("/conversations/{conversation_id}/read", status_code=204)
async def mark_conversation_read(
    conversation_id: str,
    user: CurrentUser = Depends(require_approved_freelancer),
    supabase: Client = Depends(get_supabase),
):
    """Mark all messages from the other party as read."""
    # Verify participation
    conv_resp = (
        supabase.table("conversations")
        .select("id, client_id, freelancer_id")
        .eq("id", conversation_id)
        .maybe_single()
        .execute()
    )
    if not conv_resp.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
    conv = conv_resp.data
    if user.user_id not in (conv["client_id"], conv["freelancer_id"]):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You are not a participant in this conversation.")

    # Mark unread messages from the other party as read
    supabase.table("messages").update({"read_at": "now()"}).eq(
        "conversation_id", conversation_id
    ).neq("sender_id", user.user_id).is_("read_at", "null").execute()
