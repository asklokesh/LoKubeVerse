import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock, patch, AsyncMock
from main import app
from db import get_db, Base
import tempfile
import os

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def client():
    # Create test database tables
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    # Clean up
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def mock_k8s_client():
    """Mock Kubernetes client for testing"""
    with patch('services.k8s_client.KubernetesClient') as mock:
        mock_instance = Mock()
        mock.return_value = mock_instance
        yield mock_instance

@pytest.fixture
def mock_aws_client():
    """Mock AWS client for testing"""
    with patch('services.cloud_providers.aws.AWSProvider') as mock:
        mock_instance = Mock()
        mock.return_value = mock_instance
        yield mock_instance

@pytest.fixture
def mock_azure_client():
    """Mock Azure client for testing"""
    with patch('services.cloud_providers.azure.AzureProvider') as mock:
        mock_instance = Mock()
        mock.return_value = mock_instance
        yield mock_instance

@pytest.fixture
def mock_gcp_client():
    """Mock GCP client for testing"""
    with patch('services.cloud_providers.gcp.GCPProvider') as mock:
        mock_instance = Mock()
        mock.return_value = mock_instance
        yield mock_instance

@pytest.fixture
def sample_cluster_data():
    return {
        "name": "test-cluster",
        "cloud": "aws",
        "region": "us-west-2",
        "config": {
            "node_count": 3,
            "instance_type": "t3.medium"
        }
    }

@pytest.fixture
def sample_tenant_data():
    return {
        "name": "test-tenant",
        "plan": "enterprise"
    }

@pytest.fixture
def sample_user_data():
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "role": "admin"
    }
