"""Pydantic schemas for review endpoints."""
from typing import List, Optional
from pydantic import BaseModel


class ReviewItem(BaseModel):
    id: str
    project_id: str
    project_title: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    client_name: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class ReviewSummary(BaseModel):
    avg_rating: float
    total_reviews: int
    breakdown: dict  # {5: 8, 4: 3, ...}
    recent_reviews: List[ReviewItem] = []
