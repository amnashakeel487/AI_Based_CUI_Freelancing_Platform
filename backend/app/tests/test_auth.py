"""Tests for authentication endpoints and dependencies."""
import pytest
from fastapi.testclient import TestClient
from jose import jwt


@pytest.mark.unit
def test_email_validation_valid_domain(client: TestClient):
    """Test email validation with valid COMSATS domain."""
    response = client.post(
        "/api/v1/auth/validate-registration",
        json={"email": "student@cuilahore.edu.pk"},
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["valid"] is True
    assert "Email domain is valid" in data["message"]
    assert "cuilahore.edu.pk" in data["allowed_domains"]


@pytest.mark.unit
def test_email_validation_invalid_domain(client: TestClient):
    """Test email validation with non-COMSATS domain."""
    response = client.post(
        "/api/v1/auth/validate-registration",
        json={"email": "student@gmail.com"},
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["valid"] is False
    assert "Only COMSATS email addresses are allowed" in data["message"]
    assert "allowed_domains" in data


@pytest.mark.unit
def test_email_validation_another_valid_domain(client: TestClient):
    """Test email validation with another valid COMSATS domain."""
    response = client.post(
        "/api/v1/auth/validate-registration",
        json={"email": "faculty@comsats.edu.pk"},
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["valid"] is True


@pytest.mark.unit
def test_email_validation_invalid_email_format(client: TestClient):
    """Test email validation with invalid email format."""
    response = client.post(
        "/api/v1/auth/validate-registration",
        json={"email": "not-an-email"},
    )
    
    # Should return 422 Unprocessable Entity for invalid format
    assert response.status_code == 422


@pytest.mark.unit
def test_me_endpoint_without_auth(client: TestClient):
    """Test /me endpoint without authentication token returns 4xx."""
    response = client.get("/api/v1/auth/me")
    # FastAPI HTTPBearer returns 403 or 401 depending on version; either is correct
    assert response.status_code in (401, 403)


@pytest.mark.unit
def test_me_endpoint_with_invalid_token(client: TestClient):
    """Test /me endpoint with invalid JWT token."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid-token-here"},
    )
    
    # Should return 401 Unauthorized
    assert response.status_code == 401
    data = response.json()
    assert "Invalid authentication token" in data["detail"]


@pytest.mark.unit
def test_jwt_token_creation(test_jwt_secret: str, sample_user_id: str, sample_email: str):
    """Test JWT token creation for testing purposes."""
    # Create a test token
    payload = {
        "sub": sample_user_id,
        "email": sample_email,
        "role": "authenticated",
    }
    
    token = jwt.encode(payload, test_jwt_secret, algorithm="HS256")
    
    # Verify we can decode it
    decoded = jwt.decode(token, test_jwt_secret, algorithms=["HS256"])
    
    assert decoded["sub"] == sample_user_id
    assert decoded["email"] == sample_email


@pytest.mark.unit
def test_cors_headers(client: TestClient):
    """Test that CORS headers are set correctly."""
    response = client.options(
        "/api/v1/auth/validate-registration",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    
    # Should have CORS headers
    assert "access-control-allow-origin" in response.headers
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
