"""Pydantic schemas for portfolio endpoints."""
from typing import List, Optional
from pydantic import BaseModel, field_validator


class PortfolioItemCreate(BaseModel):
    """Create a new portfolio item."""
    title: str
    description: Optional[str] = None
    technologies: List[str] = []
    link: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title cannot be blank.")
        return v

    @field_validator("link")
    @classmethod
    def link_valid(cls, v: Optional[str]) -> Optional[str]:
        if v and not v.startswith(("http://", "https://")):
            raise ValueError("Link must start with http:// or https://")
        return v or None

    @field_validator("technologies", mode="before")
    @classmethod
    def clean_technologies(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        return [t.strip() for t in (v or []) if t.strip()]


class PortfolioItemUpdate(PortfolioItemCreate):
    """Update an existing portfolio item (all fields optional)."""
    title: Optional[str] = None


class PortfolioItemResponse(BaseModel):
    """Portfolio item returned to the client."""
    id: str
    freelancer_id: str
    title: str
    description: Optional[str] = None
    technologies: List[str] = []
    link: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class SignedUploadUrlResponse(BaseModel):
    """Signed URL for uploading a portfolio image."""
    upload_url: str
    path: str
    expires_in: int = 3600
