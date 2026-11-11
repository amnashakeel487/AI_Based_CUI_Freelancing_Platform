"""Tests for freelancer skills endpoints."""
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from jose import jwt


def make_token(user_id: str, secret: str = "test-jwt-secret") -> str:
    return jwt.encode({"sub": user_id, "email": f"{user_id}@cuilahore.edu.pk"}, secret, algorithm="HS256")


FREELANCER_ID = "aaaa0000-0000-0000-0000-000000000001"


# ── skill schema validation ───────────────────────────────────────────────────

@pytest.mark.unit
def test_skill_add_request_rejects_blank_name():
    from app.schemas.skill import SkillAddRequest
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        SkillAddRequest(name="  ", level="Beginner")


@pytest.mark.unit
def test_skill_add_request_rejects_invalid_level():
    from app.schemas.skill import SkillAddRequest
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        SkillAddRequest(name="React", level="Expert")


@pytest.mark.unit
def test_skill_add_request_accepts_valid():
    from app.schemas.skill import SkillAddRequest
    s = SkillAddRequest(name="React", level="Advanced")
    assert s.name == "React"
    assert s.level == "Advanced"


@pytest.mark.unit
def test_skills_replace_request_rejects_duplicates():
    from app.schemas.skill import SkillsReplaceRequest, SkillAddRequest
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        SkillsReplaceRequest(skills=[
            SkillAddRequest(name="React", level="Beginner"),
            SkillAddRequest(name="React", level="Advanced"),
        ])


@pytest.mark.unit
def test_skills_replace_request_case_insensitive_duplicates():
    """Duplicates should be caught even when casing differs."""
    from app.schemas.skill import SkillsReplaceRequest, SkillAddRequest
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        SkillsReplaceRequest(skills=[
            SkillAddRequest(name="react", level="Beginner"),
            SkillAddRequest(name="React", level="Advanced"),
        ])


@pytest.mark.unit
def test_skills_replace_request_accepts_unique_skills():
    from app.schemas.skill import SkillsReplaceRequest, SkillAddRequest
    req = SkillsReplaceRequest(skills=[
        SkillAddRequest(name="React", level="Advanced"),
        SkillAddRequest(name="Python", level="Intermediate"),
    ])
    assert len(req.skills) == 2


# ── catalog endpoint (no DB needed) ──────────────────────────────────────────

@pytest.mark.unit
def test_skills_catalog_requires_auth(client: TestClient):
    """Catalog endpoint requires a valid JWT."""
    resp = client.get("/api/v1/freelancer/skills/catalog")
    assert resp.status_code in (401, 403)


# ── approval gate ─────────────────────────────────────────────────────────────

@pytest.mark.unit
def test_get_my_skills_requires_auth(client: TestClient):
    resp = client.get("/api/v1/freelancer/skills/")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_add_skill_requires_auth(client: TestClient):
    resp = client.post("/api/v1/freelancer/skills/", json={"name": "React", "level": "Advanced"})
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_replace_skills_requires_auth(client: TestClient):
    resp = client.put("/api/v1/freelancer/skills/", json={"skills": []})
    assert resp.status_code in (401, 403)
