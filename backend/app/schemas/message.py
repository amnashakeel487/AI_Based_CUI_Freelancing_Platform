"""Pydantic schemas for messaging endpoints."""
from typing import Optional
from pydantic import BaseModel, field_validator


class ConversationItem(BaseModel):
    id: str
    project_id: Optional[str] = None
    project_title: Optional[str] = None
    other_party_name: str
    other_party_id: str
    last_message: Optional[str] = None
    last_message_at: Optional[str] = None
    unread_count: int = 0

    class Config:
        from_attributes = True


class MessageItem(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    body: str
    created_at: str
    read_at: Optional[str] = None
    is_mine: bool = False

    class Config:
        from_attributes = True


class SendMessageRequest(BaseModel):
    body: str

    @field_validator("body")
    @classmethod
    def body_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Message cannot be empty.")
        return v
