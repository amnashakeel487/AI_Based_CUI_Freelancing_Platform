"""Pydantic schemas for project endpoints."""
from typing import List, Optional
from pydantic import BaseModel


class SkillTag(BaseModel):
    id: str
    name: str


class ProjectListItem(BaseModel):
    """Project row returned in list/search results."""
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

    class Config:
        from_attributes = True


class ProjectDetail(ProjectListItem):
    """Full project detail including requirements."""
    requirements: List[str] = []
    client_id: Optional[str] = None


class ProjectListResponse(BaseModel):
    """Paginated list of projects."""
    items: List[ProjectListItem]
    total: int
    page: int
    page_size: int
    pages: int


class CategoryItem(BaseModel):
    id: str
    name: str


class SavedProjectResponse(BaseModel):
    saved: bool
    project_id: str
