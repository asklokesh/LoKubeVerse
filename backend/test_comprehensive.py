#!/usr/bin/env python
"""Comprehensive test suite for the backend API"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import tempfile
import os

from main import app
from db import get_db, Base
from models import Tenant, User, Cluster
import schemas
import crud
from auth_service import AuthService

# Test database setup
@pytest.fixture
def test_db():
    """Create a test database for each test"""
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test_temp.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    yield engine
    
    # Cleanup
    app.dependency_overrides.clear()
    os.remove("./test_temp.db")

client = TestClient(app)

class TestBasicEndpoints:
    """Test basic API endpoints"""
    
    def test_root_endpoint(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Welcome to K8s-Dash API"
        assert data["version"] == "1.0.0"
        assert data["status"] == "running"
    
    def test_health_endpoint(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

class TestDatabaseModels:
    """Test database models and CRUD operations"""
    
    def test_tenant_model(self):
        from models import Tenant
        tenant = Tenant(name="test-tenant")
        assert tenant.name == "test-tenant"
    
    def test_user_model(self):
        from models import User
        user = User(
            email="test@example.com",
            username="testuser",
            hashed_password="hashedpass",
            is_active=True
        )
        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.is_active == True

class TestSchemas:
    """Test Pydantic schemas"""
    
    def test_tenant_schema(self):
        tenant_data = {"name": "test-tenant"}
        tenant = schemas.TenantCreate(**tenant_data)
        assert tenant.name == "test-tenant"
    
    def test_user_schema(self):
        user_data = {
            "email": "test@example.com",
            "password": "testpass"
        }
        user = schemas.UserCreate(**user_data)
        assert user.email == "test@example.com"
        assert user.password == "testpass"

class TestAuthentication:
    """Test authentication service"""
    
    def setup_method(self):
        self.auth_service = AuthService()
    
    def test_password_hashing_and_verification(self):
        password = "testpassword123"
        hashed = self.auth_service.hash_password(password)
        
        # Should verify correctly
        assert self.auth_service.verify_password(password, hashed) == True
        # Should fail with wrong password
        assert self.auth_service.verify_password("wrongpass", hashed) == False
    
    def test_token_creation_and_verification(self):
        token = self.auth_service.create_access_token({"sub": "admin"})
        assert token is not None
        
        payload = self.auth_service.verify_token(token)
        assert payload["sub"] == "admin"
        assert "exp" in payload
        assert "iat" in payload

class TestAPIEndpoints:
    """Test API endpoints"""
    
    def test_clusters_list_endpoint(self, test_db):
        response = client.get("/api/clusters/")
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        # When no clusters exist, should still return success with empty data
        assert data["success"] == True
        assert "data" in data
    
    def test_cost_summary_endpoint(self):
        response = client.get("/api/cost-summary")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "monthly_total" in data["data"]
        assert "breakdown" in data["data"]
    
    def test_audit_logs_endpoint(self):
        response = client.get("/api/audit-logs")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert isinstance(data["data"], list)

class TestK8sService:
    """Test Kubernetes service"""
    
    def test_k8s_service_initialization(self):
        from k8s_service import K8sService
        k8s = K8sService()
        # Should initialize with mock mode due to no real k8s cluster
        assert hasattr(k8s, '_use_mock')
    
    def test_cluster_info_mock(self):
        from k8s_service import K8sService
        k8s = K8sService()
        info = k8s.get_cluster_info()
        assert "status" in info
        # Should return mock data when no real cluster
        assert info.get("mock") == True or info.get("status") == "disconnected"

class TestErrorHandling:
    """Test error handling and edge cases"""
    
    def test_invalid_tenant_id(self, test_db):
        response = client.get("/api/tenants/invalid-uuid")
        assert response.status_code == 422
        assert "Invalid UUID format" in response.json()["detail"]
    
    def test_user_creation_validation(self, test_db):
        # Test missing password
        response = client.post("/api/users/", json={"email": "test@example.com"})
        assert response.status_code == 422
    
    def test_duplicate_email(self, test_db):
        # Create first user
        user_data = {"email": "duplicate@example.com", "password": "testpass"}
        response1 = client.post("/api/users/", json=user_data)
        assert response1.status_code == 200
        
        # Try to create second user with same email
        response2 = client.post("/api/users/", json=user_data)
        assert response2.status_code == 400
        assert "already registered" in response2.json()["detail"]

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"]) 