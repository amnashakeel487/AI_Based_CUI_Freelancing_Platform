"""Tests for contracts endpoints — schema validation and auth/approval gates."""
import pytest
from fastapi.testclient import TestClient


# ── schema validation ─────────────────────────────────────────────────────────

@pytest.mark.unit
def test_submit_work_rejects_short_notes():
    from app.schemas.contract import SubmitWorkRequest
    import pydantic
    with pytest.raises(pydantic.ValidationError) as exc:
        SubmitWorkRequest(notes="Too short")
    assert "10 characters" in str(exc.value)


@pytest.mark.unit
def test_submit_work_rejects_bad_link():
    from app.schemas.contract import SubmitWorkRequest
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        SubmitWorkRequest(notes="A" * 15, link="not-a-url")


@pytest.mark.unit
def test_submit_work_accepts_valid():
    from app.schemas.contract import SubmitWorkRequest
    s = SubmitWorkRequest(
        notes="Here is the completed deliverable with all requested features.",
        link="https://example.com/deliverable",
    )
    assert s.link == "https://example.com/deliverable"


@pytest.mark.unit
def test_submit_work_link_optional():
    from app.schemas.contract import SubmitWorkRequest
    s = SubmitWorkRequest(notes="A" * 20)
    assert s.link is None
    assert s.file_path is None


@pytest.mark.unit
def test_dispute_rejects_short_reason():
    from app.schemas.contract import DisputeRequest
    import pydantic
    with pytest.raises(pydantic.ValidationError) as exc:
        DisputeRequest(reason="short")
    assert "20 characters" in str(exc.value)


@pytest.mark.unit
def test_dispute_accepts_valid():
    from app.schemas.contract import DisputeRequest
    d = DisputeRequest(reason="The client has not responded in two weeks.")
    assert len(d.reason) >= 20


# ── auth / approval gates ─────────────────────────────────────────────────────

@pytest.mark.unit
def test_list_contracts_requires_auth(client: TestClient):
    resp = client.get("/api/v1/contracts/")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_get_contract_requires_auth(client: TestClient):
    resp = client.get("/api/v1/contracts/some-id")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_submit_work_requires_auth(client: TestClient):
    resp = client.post("/api/v1/contracts/some-id/submit",
                       json={"notes": "A" * 20})
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_raise_dispute_requires_auth(client: TestClient):
    resp = client.post("/api/v1/contracts/some-id/dispute",
                       json={"reason": "A" * 25})
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_deliverable_upload_url_requires_auth(client: TestClient):
    resp = client.post("/api/v1/contracts/some-id/deliverable-upload-url")
    assert resp.status_code in (401, 403)
