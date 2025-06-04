import os
import pytest
from fastapi.testclient import TestClient

# Ensure DEV_MODE is enabled for test
os.environ['DEV_MODE'] = 'true'
from main import app  # import after setting DEV_MODE

client = TestClient(app)

@pytest.fixture(autouse=True)
def override_env(monkeypatch):
    monkeypatch.setenv('DEV_MODE', 'true')
    return

def test_dev_login():
    response = client.get('/api/dev/login')
    assert response.status_code == 200
    data = response.json()
    assert 'access_token' in data
    assert data['user']['email'] == 'dev@k8sdash.com'

def test_dashboard_stats_dev():
    response = client.get('/api/dashboard/stats-dev')
    assert response.status_code == 200
    data = response.json()
    assert 'clusters' in data
    assert isinstance(data['clusters']['total'], int)

def test_dashboard_stats():
    response = client.get('/api/dashboard/stats')
    assert response.status_code == 200
    data = response.json()
    assert 'workloads' in data

@pytest.mark.parametrize('endpoint', ['/api/clusters', '/api/workloads', '/api/deployments', '/api/monitoring/metrics', '/api/monitoring/alerts', '/api/costs'])
def test_protected_endpoints_require_auth(endpoint):
    # Without token header, should get 401
    response = client.get(endpoint)
    assert response.status_code == 401 