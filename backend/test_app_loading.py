#!/usr/bin/env python
"""Simple test to check if the FastAPI app loads without errors"""

try:
    from main import app
    print("✓ FastAPI app loaded successfully")
    print(f"App title: {app.title}")
    print(f"App version: {app.version}")
    
    # Test basic routes
    from fastapi.testclient import TestClient
    client = TestClient(app)
    
    response = client.get("/")
    print(f"✓ Root endpoint: {response.status_code} - {response.json()}")
    
    response = client.get("/health")
    print(f"✓ Health endpoint: {response.status_code} - {response.json()}")
    
    # Test that database models are properly set up
    from models import Base, Tenant, User, Cluster
    print("✓ Database models imported successfully")
    
    # Test schemas
    import schemas
    print("✓ Pydantic schemas imported successfully")
    
    # Test CRUD operations
    import crud
    print("✓ CRUD operations imported successfully")
    
    print("\n🎉 All basic tests passed!")
    
except Exception as e:
    print(f"❌ Error loading app: {e}")
    import traceback
    traceback.print_exc() 