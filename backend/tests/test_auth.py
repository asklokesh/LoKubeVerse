import pytest
from fastapi.testclient import TestClient
from fastapi import HTTPException
from unittest.mock import patch, MagicMock
import json
from datetime import datetime, timedelta

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import after setting DEV_MODE to ensure it's available during module loading
os.environ['DEV_MODE'] = 'true'
from main import app
from auth_service import AuthService, JWT_SECRET, JWT_ALGORITHM

client = TestClient(app)

@pytest.fixture
def auth_service():
    return AuthService()

@pytest.fixture 
def mock_db():
    return MagicMock()

class TestAuth:
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "wrong_password"
        })
        assert response.status_code == 401
        
    def test_register_success(self):
        """Test successful user registration"""
        response = client.post("/api/auth/register", json={
            "username": "newuser",
            "password": "newpass123",
            "email": "newuser@example.com"
        })
        assert response.status_code == 201
        data = response.json()
        assert "user_id" in data
        assert "message" in data
        
    def test_token_validation(self, auth_service):
        """Test JWT token validation"""
        # Create a token
        token = auth_service.create_access_token({"sub": "admin", "user_id": "admin-001"})
        
        # Validate the token
        payload = auth_service.verify_token(token)
        assert payload["sub"] == "admin"
        assert payload["user_id"] == "admin-001"
        
    def test_token_expiration(self, auth_service):
        """Test token expiration"""
        # Create token with very short expiration
        short_expiration = timedelta(seconds=1)
        token = auth_service.create_access_token({"sub": "admin"}, expires_delta=short_expiration)
        
        # Wait for token to expire
        import time
        time.sleep(2)
        
        # Try to verify expired token
        with pytest.raises(HTTPException) as exc_info:
            auth_service.verify_token(token)
        assert exc_info.value.status_code == 401
            
    def test_protected_endpoint_without_token(self):
        """Test accessing protected endpoint without token"""
        response = client.get("/api/auth/me")
        assert response.status_code == 403  # FastAPI returns 403 for missing auth header
        
    def test_protected_endpoint_with_valid_token(self):
        """Test accessing protected endpoint with valid token"""
        # First login to get token
        login_response = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        token = login_response.json()["access_token"]
        
        # Use token to access protected endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "username" in data
        assert "permissions" in data

def test_dev_login():
    """Test that the dev login endpoint returns a valid token when DEV_MODE is enabled"""
    response = client.get('/api/dev/login')
    assert response.status_code == 200
    data = response.json()
    assert 'access_token' in data
    assert 'token_type' in data
    assert data['token_type'] == 'bearer'
    assert 'user' in data
    assert data['user']['email'] == 'dev@k8sdash.com'
    
def test_regular_login_with_valid_credentials():
    """Test regular login endpoint with valid credentials"""
    response = client.post(
        '/api/auth/login',
        data={'username': 'demo@k8sdash.com', 'password': 'demo123'},
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    assert response.status_code == 200
    data = response.json()
    assert 'access_token' in data
    
def test_regular_login_with_invalid_credentials():
    """Test regular login endpoint with invalid credentials"""
    response = client.post(
        '/api/auth/login',
        data={'username': 'wrong@example.com', 'password': 'wrongpass'},
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    assert response.status_code == 401
    data = response.json()
    assert 'detail' in data
    assert data['detail'] == 'Invalid credentials'
    
def test_protected_route_without_token():
    """Test that a protected route returns 401 without a token"""
    response = client.get('/api/users/me')
    assert response.status_code == 401
    
def test_protected_route_with_token():
    """Test that a protected route works with a valid token"""
    # First get a token
    login_response = client.get('/api/dev/login')
    token = login_response.json()['access_token']
    
    # Then use it to access a protected route
    response = client.get(
        '/api/users/me',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = response.json()
    assert 'email' in data
    assert data['email'] == 'dev@k8sdash.com'
