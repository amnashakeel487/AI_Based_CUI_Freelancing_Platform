"""Pytest configuration and fixtures."""
import os
from typing import Generator

import pytest
from fastapi.testclient import TestClient

# Set test environment variables before importing app
os.environ["SUPABASE_URL"] = "https://test.supabase.co"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "test-service-role-key"
os.environ["SUPABASE_JWT_SECRET"] = "test-jwt-secret"
os.environ["ALLOWED_EMAIL_DOMAINS"] = "comsats.edu.pk,cuilahore.edu.pk"
os.environ["FRONTEND_ORIGIN"] = "http://localhost:5173"
os.environ["ENVIRONMENT"] = "testing"

from app.main import app


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """
    Test client fixture.
    
    Provides a FastAPI test client for making requests to the API.
    """
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def test_jwt_secret() -> str:
    """JWT secret for testing."""
    return "test-jwt-secret"


@pytest.fixture
def sample_user_id() -> str:
    """Sample user UUID for testing."""
    return "12345678-1234-1234-1234-123456789012"


@pytest.fixture
def sample_email() -> str:
    """Sample email for testing."""
    return "test@cuilahore.edu.pk"
