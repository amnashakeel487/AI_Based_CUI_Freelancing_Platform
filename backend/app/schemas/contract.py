"""Pydantic schemas for contracts / active-projects endpoints."""
from typing import List, Optional
from pydantic import BaseModel, field_validator


class MilestoneItem(BaseModel):
    """A project milestone."""
    id: str
    project_id: str
    title: str
    done: bool
    position: int

    class Config:
        from_attributes = True


class ActivityItem(BaseModel):
    """A single entry in the project activity log."""
    id: str
    project_id: str
    actor_id: Optional[str] = None
    actor_name: Optional[str] = None
    text: str
    created_at: str

    class Config:
        from_attributes = True


class SubmissionItem(BaseModel):
    """A work submission record."""
    id: str
    project_id: str
    freelancer_id: str
    notes: Optional[str] = None
    file_path: Optional[str] = None
    link: Optional[str] = None
    status: str   # pending | approved | revision_requested | rejected
    created_at: str

    class Config:
        from_attributes = True


class ContractListItem(BaseModel):
    """An active project in the freelancer's list."""
    project_id: str
    title: str
    client_name: Optional[str] = None
    status: str          # in_progress | submitted
    deadline: Optional[str] = None
    progress: int        # % milestones done
    milestones_done: int
    milestones_total: int
    bid_amount: float

    class Config:
        from_attributes = True


class ContractDetail(ContractListItem):
    """Full workspace data: milestones, activity, submissions."""
    description: Optional[str] = None
    milestones: List[MilestoneItem] = []
    activity: List[ActivityItem] = []
    submissions: List[SubmissionItem] = []


class SubmitWorkRequest(BaseModel):
    """Submit deliverable work for client review."""
    notes: str
    file_path: Optional[str] = None   # path in Supabase Storage deliverables bucket
    link: Optional[str] = None

    @field_validator("notes")
    @classmethod
    def notes_min_length(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError("Describe what you are submitting (at least 10 characters).")
        return v.strip()

    @field_validator("link")
    @classmethod
    def link_valid(cls, v: Optional[str]) -> Optional[str]:
        if v and not v.startswith(("http://", "https://")):
            raise ValueError("Link must start with http:// or https://")
        return v or None


class DisputeRequest(BaseModel):
    """Raise a dispute on a project."""
    reason: str

    @field_validator("reason")
    @classmethod
    def reason_min_length(cls, v: str) -> str:
        if len(v.strip()) < 20:
            raise ValueError("Describe the issue in at least 20 characters.")
        return v.strip()


class DisputeResponse(BaseModel):
    """Dispute record returned after creation."""
    id: str
    project_id: str
    raised_by: str
    reason: str
    status: str
    created_at: str

    class Config:
        from_attributes = True


class SignedDeliverableUrlResponse(BaseModel):
    """Signed upload URL for a deliverable file."""
    upload_url: str
    path: str
    expires_in: int = 3600
