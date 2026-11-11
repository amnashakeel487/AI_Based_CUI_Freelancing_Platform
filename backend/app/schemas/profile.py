"""Pydantic schemas for freelancer profile endpoints."""
from typing import Optional, List

from pydantic import BaseModel, HttpUrl


class SkillRef(BaseModel):
    """A skill reference with level."""
    name: str
    level: str  # Beginner, Intermediate, Advanced


class PortfolioItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: List[str] = []
    link: Optional[str] = None


class PortfolioItemCreate(PortfolioItemBase):
    pass


class PortfolioItem(PortfolioItemBase):
    id: str
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class ExperienceItemBase(BaseModel):
    role: str
    organization: str
    period: str
    description: Optional[str] = None


class ExperienceItemCreate(ExperienceItemBase):
    pass


class ExperienceItem(ExperienceItemBase):
    id: str

    class Config:
        from_attributes = True


class FreelancerProfileUpdate(BaseModel):
    """Profile fields a freelancer can update."""
    # Personal
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    # Academic
    program: Optional[str] = None
    department: Optional[str] = None
    campus: Optional[str] = None
    semester: Optional[str] = None
    experience_level: Optional[str] = None
    # Preferences
    availability: Optional[str] = None
    budget_pref: Optional[str] = None
    work_mode: Optional[str] = None
    # Links
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    site_url: Optional[str] = None


class OnboardingData(BaseModel):
    """Complete onboarding data submitted at the end of the wizard."""
    # Personal
    full_name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    headline: str
    bio: Optional[str] = None
    # Academic
    program: Optional[str] = None
    department: Optional[str] = None
    campus: Optional[str] = None
    semester: Optional[str] = None
    experience_level: Optional[str] = None
    # Skills
    skills: List[SkillRef] = []
    # Links
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    site_url: Optional[str] = None
    # Portfolio (first project)
    portfolio_title: Optional[str] = None
    portfolio_description: Optional[str] = None
    portfolio_tech: Optional[str] = None  # Comma-separated
    portfolio_link: Optional[str] = None
    # Preferences
    preferred_categories: List[str] = []
    tech_pref: Optional[str] = None
    availability: Optional[str] = None
    budget_pref: Optional[str] = None
    work_mode: Optional[str] = None


class ProfileCompletion(BaseModel):
    """Profile completion percentage."""
    completion: int
    missing_fields: List[str] = []


class FreelancerProfileResponse(BaseModel):
    """Full freelancer profile response."""
    id: str
    email: str
    role: str
    full_name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    avatar_url: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    # Academic
    program: Optional[str] = None
    department: Optional[str] = None
    campus: Optional[str] = None
    semester: Optional[str] = None
    experience_level: Optional[str] = None
    # Preferences
    availability: Optional[str] = None
    budget_pref: Optional[str] = None
    work_mode: Optional[str] = None
    # Links
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    site_url: Optional[str] = None
    # Status
    approval_status: str
    onboarding_complete: bool
    avg_rating: float = 0.0
    profile_completion: int = 0
    is_premium: bool = False
    # Skills
    skills: List[SkillRef] = []
    # Portfolio
    portfolio: List[PortfolioItem] = []
