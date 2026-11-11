"""Pydantic schemas for recommendation endpoints."""
from typing import List, Optional
from pydantic import BaseModel


class RecommendedProject(BaseModel):
    """A project with match metadata attached."""
    id: str
    title: str
    description: str
    category: Optional[str] = None
    budget: float
    project_type: str
    deadline: Optional[str] = None
    status: str
    client_name: Optional[str] = None
    client_rating: Optional[float] = None
    skills: List[str] = []
    saved: bool = False
    # Recommendation fields
    match_percent: int
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    reason: str
    engine: str = "rule-based"
