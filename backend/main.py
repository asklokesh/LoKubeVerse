from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uuid

from db import get_db
from routers import auth, cluster, monitoring, deployment, gateway, namespace
import schemas
import crud

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(cluster.router, prefix="/api/clusters", tags=["clusters"])
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["monitoring"])
app.include_router(deployment.router, prefix="/api/deployments", tags=["deployments"])
app.include_router(gateway.router, prefix="/api/gateway", tags=["gateway"])
app.include_router(namespace.router, prefix="/api/namespaces", tags=["namespaces"])

@app.get("/")
def read_root():
    return {"message": "Welcome to K8s-Dash API"}

# Example: Tenant CRUD
@app.post("/tenants/", response_model=schemas.Tenant)
def create_tenant(tenant: schemas.TenantCreate, db: Session = Depends(get_db)):
    return crud.create_tenant(db, tenant)

@app.get("/tenants/{tenant_id}", response_model=schemas.Tenant)
def get_tenant(tenant_id: str, db: Session = Depends(get_db)):
    t = crud.get_tenant(db, tenant_id)
    if not t:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return t

# Example: User CRUD
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/{user_id}", response_model=schemas.User)
def get_user(user_id: str, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Example: Cluster CRUD
@app.post("/clusters/", response_model=schemas.Cluster)
def create_cluster(cluster: schemas.ClusterCreate, db: Session = Depends(get_db)):
    # TODO: Add proper authentication
    owner_id = "test-owner-id"  # Temporary for testing
    return crud.create_cluster(db=db, cluster=cluster, owner_id=owner_id)

@app.get("/clusters/{cluster_id}", response_model=schemas.Cluster)
def get_cluster(cluster_id: str, db: Session = Depends(get_db)):
    db_cluster = crud.get_cluster(db, cluster_id=cluster_id)
    if db_cluster is None:
        raise HTTPException(status_code=404, detail="Cluster not found")
    return db_cluster

# Placeholder routers for core services
# from .routers import auth, cluster, monitoring, deployment, gateway
# app.include_router(auth.router)
# app.include_router(cluster.router)
# app.include_router(monitoring.router)
# app.include_router(deployment.router)
# app.include_router(gateway.router) 