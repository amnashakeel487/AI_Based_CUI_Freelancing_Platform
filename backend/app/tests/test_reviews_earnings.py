"""Tests for review, earnings, and complaint endpoints — auth gates and schema validation."""
import pytest
from fastapi.testclient import TestClient


# ── review auth gates ─────────────────────────────────────────────────────────

@pytest.mark.unit
def test_review_summary_requires_auth(client: TestClient):
    resp = client.get("/api/v1/reviews/summary")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_list_reviews_requires_auth(client: TestClient):
    resp = client.get("/api/v1/reviews/")
    assert resp.status_code in (401, 403)


# ── earnings auth gates ───────────────────────────────────────────────────────

@pytest.mark.unit
def test_earnings_summary_requires_auth(client: TestClient):
    resp = client.get("/api/v1/earnings/summary")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_list_transactions_requires_auth(client: TestClient):
    resp = client.get("/api/v1/earnings/transactions")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_get_transaction_requires_auth(client: TestClient):
    resp = client.get("/api/v1/earnings/transactions/some-id")
    assert resp.status_code in (401, 403)


# ── complaint schema + auth gates ─────────────────────────────────────────────

@pytest.mark.unit
def test_complaint_create_rejects_blank_subject():
    from app.schemas.complaint import ComplaintCreate
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        ComplaintCreate(subject="  ", description="A" * 25)


@pytest.mark.unit
def test_complaint_create_rejects_short_desc():
    from app.schemas.complaint import ComplaintCreate
    import pydantic
    with pytest.raises(pydantic.ValidationError) as exc:
        ComplaintCreate(subject="Payment issue", description="too short")
    assert "20 characters" in str(exc.value)


@pytest.mark.unit
def test_complaint_create_accepts_valid():
    from app.schemas.complaint import ComplaintCreate
    c = ComplaintCreate(
        subject="Payment not received",
        description="I completed the milestone but haven't been paid.",
    )
    assert c.subject == "Payment not received"


@pytest.mark.unit
def test_list_complaints_requires_auth(client: TestClient):
    resp = client.get("/api/v1/complaints/")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_create_complaint_requires_auth(client: TestClient):
    resp = client.post("/api/v1/complaints/", json={
        "subject": "Test", "description": "A" * 25
    })
    assert resp.status_code in (401, 403)


# ── account settings auth gates ───────────────────────────────────────────────

@pytest.mark.unit
def test_update_settings_requires_auth(client: TestClient):
    resp = client.put("/api/v1/account/settings", json={"visibility": "public"})
    assert resp.status_code in (401, 403)
