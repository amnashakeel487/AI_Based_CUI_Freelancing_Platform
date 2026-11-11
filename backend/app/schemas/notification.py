"""Pydantic schemas for notification endpoints."""
from typing import Optional
from pydantic import BaseModel


class NotificationItem(BaseModel):
    id: str
    user_id: str
    type: str
    body: str
    read: bool
    created_at: str

    class Config:
        from_attributes = True


class MarkReadResponse(BaseModel):
    id: str
    read: bool
