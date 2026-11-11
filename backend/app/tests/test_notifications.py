"""Tests for notification endpoints — auth gates."""
import pytest
from fastapi.testclient import TestClient


@pytest.mark.unit
def test_list_notifications_requires_auth(client: TestClient):
    resp = client.get("/api/v1/notifications/")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_mark_notification_read_requires_auth(client: TestClient):
    resp = client.post("/api/v1/notifications/some-id/read")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_mark_all_read_requires_auth(client: TestClient):
    resp = client.post("/api/v1/notifications/read-all")
    assert resp.status_code in (401, 403)
