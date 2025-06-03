from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uuid
import os
import logging

from db import get_db, engine
from models import Base
from routers import auth, cluster, monitoring, deployment, gateway, namespace
import schemas
import crud
from auth_service import AuthService

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kubernetes Dashboard API",
    description="Multi-cloud Kubernetes management platform",
    version="1.0.0"
)

# Configure CORS
allowed_origins = [
    "http://localhost:3000",  # Next.js dev server
    "http://localhost:8080",  # Frontend dev server
    "http://frontend:3000",   # Frontend service in Docker
    "http://frontend:8080",   # Frontend service in Docker alternative
]

# Add any additional origins from environment variable
if os.getenv("ALLOWED_ORIGINS"):
    allowed_origins.extend(os.getenv("ALLOWED_ORIGINS").split(","))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "X-Total-Count"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(cluster.router, prefix="/api/clusters", tags=["clusters"])
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["monitoring"])
app.include_router(deployment.router, prefix="/api/deployments", tags=["deployments"])
app.include_router(gateway.router, prefix="/api/gateway", tags=["gateway"])
app.include_router(namespace.router, prefix="/api/namespaces", tags=["namespaces"])

@app.get("/")
def read_root():
    return {"message": "Welcome to K8s-Dash API", "version": "1.0.0", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": "2024-12-03T02:58:00Z"}

# Tenant CRUD endpoints
@app.post("/api/tenants/", response_model=schemas.Tenant)
def create_tenant(tenant: schemas.TenantCreate, db: Session = Depends(get_db)):
    return crud.create_tenant(db, tenant)

@app.get("/api/tenants/{tenant_id}", response_model=schemas.Tenant)
def get_tenant(tenant_id: str, db: Session = Depends(get_db)):
    t = crud.get_tenant(db, tenant_id)
    if not t:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return t

# User CRUD endpoints
@app.post("/api/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if not user.password:
        raise HTTPException(status_code=422, detail="Password is required")
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/api/users/{user_id}", response_model=schemas.User)
def get_user(user_id: str, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Initialize AuthService
auth_service = AuthService()

# Authentication endpoint
@app.post("/api/auth/login")
def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username=username)
    if not user or not auth_service.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = auth_service.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Quick API endpoints for frontend
@app.get("/api/clusters/")
def list_clusters_api(db: Session = Depends(get_db)):
    """List all clusters for the current user"""
    try:
        clusters = crud.list_clusters(db, tenant_id=None)  # TODO: Add tenant filtering
        return {
            "success": True,
            "data": [
                {
                    "id": str(cluster.id),
                    "name": cluster.name,
                    "provider": cluster.cloud,
                    "status": cluster.status or "running",
                    "region": "us-east-1",  # TODO: Extract from config
                    "nodes": 3,  # TODO: Get from k8s API
                    "pods": 12,  # TODO: Get from k8s API
                    "cpu_usage": 45,  # TODO: Get from metrics
                    "memory_usage": 60  # TODO: Get from metrics
                }
                for cluster in clusters
            ]
        }
    except Exception as e:
        logger.error(f"Error listing clusters: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/clusters/{cluster_id}/metrics")
def get_cluster_metrics_api(cluster_id: str):
    """Get metrics for a specific cluster"""
    return {
        "success": True,
        "data": {
            "cpu_usage": 45,
            "memory_usage": 60,
            "disk_usage": 30,
            "network_in": 1024,
            "network_out": 2048,
            "alerts": [
                {"severity": "warning", "message": "High CPU usage detected"}
            ]
        }
    }

@app.get("/api/cost-summary")
def get_cost_summary_api():
    """Get cost summary across all clusters"""
    return {
        "success": True,
        "data": {
            "monthly_total": 2847,
            "daily_average": 95,
            "breakdown": {
                "compute": 1800,
                "storage": 500,
                "network": 347,
                "other": 200
            }
        }
    }

@app.get("/api/audit-logs")
def get_audit_logs_api():
    """Get recent audit logs"""
    return {
        "success": True,
        "data": [
            {
                "action": "deployment_created",
                "description": "Deployed nginx-app to production-east cluster",
                "user": "john.doe@company.com",
                "timestamp": "2024-12-03T02:30:00Z",
                "status": "success"
            },
            {
                "action": "cluster_created", 
                "description": "Created new cluster dev-central in Azure",
                "user": "jane.smith@company.com",
                "timestamp": "2024-12-03T00:30:00Z",
                "status": "success"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)