"""Tests for freelancer portfolio endpoints."""
import pytest
from fastapi.testclient import TestClient


# ── schema validation ─────────────────────────────────────────────────────────

@pytest.mark.unit
def test_portfolio_create_rejects_blank_title():
    from app.schemas.portfolio import PortfolioItemCreate
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        PortfolioItemCreate(title="  ")


@pytest.mark.unit
def test_portfolio_create_rejects_bad_link():
    from app.schemas.portfolio import PortfolioItemCreate
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        PortfolioItemCreate(title="My App", link="not-a-url")


@pytest.mark.unit
def test_portfolio_create_accepts_valid():
    from app.schemas.portfolio import PortfolioItemCreate
    item = PortfolioItemCreate(
        title="Campus Map",
        description="Interactive campus map.",
        technologies=["React", "Tailwind CSS"],
        link="https://example.com",
    )
    assert item.title == "Campus Map"
    assert len(item.technologies) == 2


@pytest.mark.unit
def test_portfolio_create_csv_technologies():
    """technologies can be passed as a comma-separated string."""
    from app.schemas.portfolio import PortfolioItemCreate
    item = PortfolioItemCreate(title="App", technologies="React, Python, FastAPI")
    assert item.technologies == ["React", "Python", "FastAPI"]


@pytest.mark.unit
def test_portfolio_create_null_link_ok():
    from app.schemas.portfolio import PortfolioItemCreate
    item = PortfolioItemCreate(title="App", link=None)
    assert item.link is None


@pytest.mark.unit
def test_portfolio_create_empty_link_coerced_to_none():
    from app.schemas.portfolio import PortfolioItemCreate
    item = PortfolioItemCreate(title="App", link="")
    assert item.link is None


# ── auth gates ────────────────────────────────────────────────────────────────

@pytest.mark.unit
def test_list_portfolio_requires_auth(client: TestClient):
    resp = client.get("/api/v1/freelancer/portfolio/")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_create_portfolio_requires_auth(client: TestClient):
    resp = client.post("/api/v1/freelancer/portfolio/", json={"title": "App"})
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_update_portfolio_requires_auth(client: TestClient):
    resp = client.put("/api/v1/freelancer/portfolio/some-id", json={"title": "Updated"})
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_delete_portfolio_requires_auth(client: TestClient):
    resp = client.delete("/api/v1/freelancer/portfolio/some-id")
    assert resp.status_code in (401, 403)
