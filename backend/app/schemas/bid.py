"""Pydantic schemas for bid (proposal) endpoints."""
from typing import Optional
from pydantic import BaseModel, field_validator


class BidCreate(BaseModel):
    """Submit a new bid on a project."""
    project_id: str
    cover_letter: str
    amount: float
    delivery_days: int
    portfolio_item_id: Optional[str] = None

    @field_validator("cover_letter")
    @classmethod
    def cover_min_length(cls, v: str) -> str:
        if len(v.strip()) < 50:
            raise ValueError("Cover letter must be at least 50 characters.")
        return v.strip()

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Bid amount must be greater than zero.")
        return v

    @field_validator("delivery_days")
    @classmethod
    def days_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Delivery days must be at least 1.")
        return v


class BidUpdate(BaseModel):
    """Edit a pending bid."""
    cover_letter: Optional[str] = None
    amount: Optional[float] = None
    delivery_days: Optional[int] = None
    portfolio_item_id: Optional[str] = None

    @field_validator("cover_letter")
    @classmethod
    def cover_min_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v.strip()) < 50:
            raise ValueError("Cover letter must be at least 50 characters.")
        return v.strip() if v else v

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Bid amount must be greater than zero.")
        return v

    @field_validator("delivery_days")
    @classmethod
    def days_positive(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v <= 0:
            raise ValueError("Delivery days must be at least 1.")
        return v


class BidResponse(BaseModel):
    """A bid returned to the freelancer."""
    id: str
    project_id: str
    project_title: Optional[str] = None
    cover_letter: str
    amount: float
    delivery_days: int
    portfolio_item_id: Optional[str] = None
    status: str          # pending | accepted | rejected | withdrawn
    client_response: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True
