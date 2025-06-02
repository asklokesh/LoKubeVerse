import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "k8s-Dash API"}

def test_read_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_read_version():
    response = client.get("/version")
    assert response.status_code == 200
    assert "version" in response.json()

def test_auth_login():
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_auth_register():
    response = client.post("/auth/register", json={
        "email": "new@example.com",
        "password": "password123",
        "name": "Test User"
    })
    assert response.status_code == 200
    assert "id" in response.json()

def test_clusters_list():
    response = client.get("/clusters")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_deployments_list():
    response = client.get("/deployments")
    assert response.status_code == 200
    assert isinstance(response.json(), list) 