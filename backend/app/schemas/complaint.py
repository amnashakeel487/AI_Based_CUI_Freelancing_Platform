"""Pydantic schemas for complaint endpoints."""
from typing import Optional
from pydantic import BaseModel, field_validator


class ComplaintCreate(BaseModel):
    subject: str
    description: str
    project_id: Optional[str] = None

    @field_validator("subject")
    @classmethod
    def subject_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Subject cannot be blank.")
        return v

    @field_validator("description")
    @classmethod
    def desc_min_length(cls, v: str) -> str:
        if len(v.strip()) < 20:
            raise ValueError("Describe the issue in at least 20 characters.")
        return v.strip()


class ComplaintItem(BaseModel):
    id: str
    subject: str
    description: str
    project_id: Optional[str] = None
    project_title: Optional[str] = None
    status: str
    created_at: str

    class Config:
        from_attributes = True
