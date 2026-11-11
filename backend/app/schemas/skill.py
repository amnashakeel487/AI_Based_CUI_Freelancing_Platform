"""Pydantic schemas for skills endpoints."""
from typing import List, Optional
from pydantic import BaseModel, field_validator


VALID_LEVELS = {"Beginner", "Intermediate", "Advanced"}


class SkillCatalogItem(BaseModel):
    """A skill from the master catalog."""
    id: str
    name: str


class FreelancerSkillItem(BaseModel):
    """A skill attached to a freelancer, with proficiency level."""
    skill_id: str
    name: str
    level: str


class SkillAddRequest(BaseModel):
    """Add a single skill to the freelancer's list."""
    name: str
    level: str

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Skill name cannot be blank.")
        return v

    @field_validator("level")
    @classmethod
    def level_valid(cls, v: str) -> str:
        if v not in VALID_LEVELS:
            raise ValueError(f"Level must be one of: {', '.join(sorted(VALID_LEVELS))}")
        return v


class SkillsReplaceRequest(BaseModel):
    """Replace the freelancer's entire skill list at once."""
    skills: List[SkillAddRequest]

    @field_validator("skills")
    @classmethod
    def no_duplicates(cls, v: List[SkillAddRequest]) -> List[SkillAddRequest]:
        seen: set[str] = set()
        for item in v:
            key = item.name.lower()
            if key in seen:
                raise ValueError(f"Duplicate skill: '{item.name}'")
            seen.add(key)
        return v
