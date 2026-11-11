"""Pydantic schemas for account/settings endpoints."""
from typing import Optional
from pydantic import BaseModel


class AccountSettingsUpdate(BaseModel):
    """Update account settings (visibility, notification preferences)."""
    visibility: Optional[str] = None  # public | clients | private
    notify_proposals: Optional[bool] = None
    notify_messages: Optional[bool] = None
    notify_projects: Optional[bool] = None
    notify_news: Optional[bool] = None
