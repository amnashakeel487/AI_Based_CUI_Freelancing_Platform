"""Pydantic schemas for authentication endpoints."""
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserProfile(BaseModel):
    """User profile information returned by /me endpoint."""

    id: str
    email: str
    role: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    avatar_url: Optional[str] = None
    headline: Optional[str] = None

    # Freelancer-specific fields
    approval_status: Optional[str] = None
    onboarding_complete: Optional[bool] = None
    avg_rating: Optional[float] = None
    profile_completion: Optional[int] = None

    class Config:
        from_attributes = True


class EmailValidationRequest(BaseModel):
    """Request to validate email domain before registration."""

    email: EmailStr


class EmailValidationResponse(BaseModel):
    """Response for email validation."""

    valid: bool
    message: str
    allowed_domains: Optional[list[str]] = None


class PostSignupRequest(BaseModel):
    """Request to create profile rows after signup."""
    role: str
    full_name: str
    phone: Optional[str] = None
