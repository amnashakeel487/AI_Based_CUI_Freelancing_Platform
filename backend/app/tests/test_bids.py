"""Tests for bid schema validation and auth/approval gates."""
import pytest
from fastapi.testclient import TestClient


# ── schema validation ─────────────────────────────────────────────────────────

@pytest.mark.unit
def test_bid_create_rejects_short_cover():
    from app.schemas.bid import BidCreate
    import pydantic
    with pytest.raises(pydantic.ValidationError) as exc:
        BidCreate(
            project_id="some-id",
            cover_letter="Too short.",
            amount=5000,
            delivery_days=7,
        )
    assert "50 characters" in str(exc.value)


@pytest.mark.unit
def test_bid_create_rejects_zero_amount():
    from app.schemas.bid import BidCreate
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        BidCreate(
            project_id="some-id",
            cover_letter="A" * 60,
            amount=0,
            delivery_days=7,
        )


@pytest.mark.unit
def test_bid_create_rejects_negative_amount():
    from app.schemas.bid import BidCreate
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        BidCreate(
            project_id="some-id",
            cover_letter="A" * 60,
            amount=-100,
            delivery_days=7,
        )


@pytest.mark.unit
def test_bid_create_rejects_zero_days():
    from app.schemas.bid import BidCreate
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        BidCreate(
            project_id="some-id",
            cover_letter="A" * 60,
            amount=5000,
            delivery_days=0,
        )


@pytest.mark.unit
def test_bid_create_accepts_valid():
    from app.schemas.bid import BidCreate
    bid = BidCreate(
        project_id="some-id",
        cover_letter="I have built similar projects and can deliver with full test coverage.",
        amount=25000,
        delivery_days=14,
    )
    assert bid.amount == 25000
    assert bid.delivery_days == 14


@pytest.mark.unit
def test_bid_update_rejects_short_cover():
    from app.schemas.bid import BidUpdate
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        BidUpdate(cover_letter="Too short.")


@pytest.mark.unit
def test_bid_update_accepts_partial():
    """BidUpdate with only one field set is valid."""
    from app.schemas.bid import BidUpdate
    upd = BidUpdate(amount=30000)
    assert upd.amount == 30000
    assert upd.cover_letter is None


# ── auth / approval gates ─────────────────────────────────────────────────────

@pytest.mark.unit
def test_create_bid_requires_auth(client: TestClient):
    resp = client.post("/api/v1/bids/", json={
        "project_id": "x", "cover_letter": "A" * 60,
        "amount": 1000, "delivery_days": 7,
    })
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_list_bids_requires_auth(client: TestClient):
    resp = client.get("/api/v1/bids/")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_get_bid_requires_auth(client: TestClient):
    resp = client.get("/api/v1/bids/some-id")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_update_bid_requires_auth(client: TestClient):
    resp = client.put("/api/v1/bids/some-id", json={"amount": 2000})
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_withdraw_bid_requires_auth(client: TestClient):
    resp = client.post("/api/v1/bids/some-id/withdraw")
    assert resp.status_code in (401, 403)
