"""Tests for messaging endpoints — schema validation and auth gates."""
import pytest
from fastapi.testclient import TestClient


# ── schema validation ─────────────────────────────────────────────────────────

@pytest.mark.unit
def test_send_message_rejects_blank():
    from app.schemas.message import SendMessageRequest
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        SendMessageRequest(body="   ")


@pytest.mark.unit
def test_send_message_accepts_valid():
    from app.schemas.message import SendMessageRequest
    m = SendMessageRequest(body="Hello, can we discuss the project?")
    assert m.body == "Hello, can we discuss the project?"


# ── auth gates ────────────────────────────────────────────────────────────────

@pytest.mark.unit
def test_list_conversations_requires_auth(client: TestClient):
    resp = client.get("/api/v1/messages/conversations")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_get_messages_requires_auth(client: TestClient):
    resp = client.get("/api/v1/messages/conversations/some-id/messages")
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_send_message_requires_auth(client: TestClient):
    resp = client.post("/api/v1/messages/conversations/some-id/messages", json={"body": "Hi"})
    assert resp.status_code in (401, 403)


@pytest.mark.unit
def test_mark_conversation_read_requires_auth(client: TestClient):
    resp = client.post("/api/v1/messages/conversations/some-id/read")
    assert resp.status_code in (401, 403)
