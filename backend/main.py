from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import asyncio
import json

from database import get_db, engine, Base
from models import User, Cluster, Workload
from schemas import (
    UserCreate, UserResponse, ClusterCreate, ClusterResponse,
    WorkloadCreate, WorkloadResponse, DashboardStats, LoginResponse
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="K8s Dash API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "K8s Dash API", "version": "1.0.0"}

# Authentication endpoints
@app.post("/api/auth/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Check for demo credentials
    if form_data.username == "demo@k8sdash.com" and form_data.password == "demo123":
        # Create demo user response
        access_token = create_access_token(data={"sub": form_data.username})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": 1,
                "email": "demo@k8sdash.com",
                "name": "Demo User"
            }
        }
    
    # Normal authentication flow
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    }

@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse.from_orm(db_user)

# Dashboard endpoints
@app.get("/api/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    clusters = db.query(Cluster).all()
    
    # Calculate stats
    total_clusters = len(clusters)
    aws_clusters = len([c for c in clusters if c.provider == "aws"])
    azure_clusters = len([c for c in clusters if c.provider == "azure"])
    gcp_clusters = len([c for c in clusters if c.provider == "gcp"])
    running_clusters = len([c for c in clusters if c.status == "running"])
    stopped_clusters = len([c for c in clusters if c.status == "stopped"])
    
    # Mock data for demo
    return {
        "clusters": {
            "total": total_clusters or 12,
            "aws": aws_clusters or 5,
            "azure": azure_clusters or 3,
            "gcp": gcp_clusters or 4,
            "running": running_clusters or 10,
            "stopped": stopped_clusters or 2
        },
        "workloads": {
            "total": 47,
            "deployments": 25,
            "statefulsets": 12,
            "daemonsets": 10
        },
        "health": {
            "uptime": 99.9,
            "incidents": 2
        },
        "costs": {
            "total": 2847,
            "aws": 1245,
            "azure": 897,
            "gcp": 705
        }
    }

@app.get("/api/dashboard/activity")
async def get_recent_activity(current_user: User = Depends(get_current_user)):
    # Mock activity data
    return [
        {
            "id": 1,
            "type": "deployment",
            "message": "prod-web-app deployment successful",
            "timestamp": datetime.utcnow().isoformat(),
            "severity": "success"
        },
        {
            "id": 2,
            "type": "alert",
            "message": "staging-cluster CPU usage high (85%)",
            "timestamp": (datetime.utcnow() - timedelta(minutes=15)).isoformat(),
            "severity": "warning"
        },
        {
            "id": 3,
            "type": "user",
            "message": "New user sarah@company.com added",
            "timestamp": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
            "severity": "info"
        }
    ]

# Cluster endpoints
@app.get("/api/clusters", response_model=List[ClusterResponse])
async def get_clusters(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    clusters = db.query(Cluster).all()
    
    # Return mock data if no clusters exist
    if not clusters:
        return [
            {
                "id": 1,
                "name": "production-cluster",
                "provider": "aws",
                "region": "us-east-1",
                "status": "running",
                "node_count": 12,
                "instance_type": "m5.large",
                "created_at": datetime.utcnow().isoformat(),
                "pod_count": 247,
                "cpu_usage": 67,
                "memory_usage": 72
            },
            {
                "id": 2,
                "name": "staging-cluster",
                "provider": "azure",
                "region": "eastus",
                "status": "running",
                "node_count": 6,
                "instance_type": "Standard_D4s_v3",
                "created_at": datetime.utcnow().isoformat(),
                "pod_count": 89,
                "cpu_usage": 45,
                "memory_usage": 38
            },
            {
                "id": 3,
                "name": "dev-cluster",
                "provider": "gcp",
                "region": "us-central1",
                "status": "stopped",
                "node_count": 3,
                "instance_type": "n1-standard-4",
                "created_at": datetime.utcnow().isoformat(),
                "pod_count": 0,
                "cpu_usage": 0,
                "memory_usage": 0
            }
        ]
    
    return clusters

@app.post("/api/clusters", response_model=ClusterResponse)
async def create_cluster(cluster: ClusterCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_cluster = Cluster(**cluster.dict(), user_id=current_user.id)
    db.add(db_cluster)
    db.commit()
    db.refresh(db_cluster)
    
    # Broadcast update via WebSocket
    await manager.broadcast(json.dumps({
        "type": "cluster_created",
        "data": {"id": db_cluster.id, "name": db_cluster.name}
    }))
    
    return db_cluster

@app.patch("/api/clusters/{cluster_id}")
async def update_cluster(
    cluster_id: int,
    updates: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
    
    for key, value in updates.items():
        setattr(cluster, key, value)
    
    db.commit()
    db.refresh(cluster)
    
    return cluster

@app.delete("/api/clusters/{cluster_id}")
async def delete_cluster(
    cluster_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
    
    db.delete(cluster)
    db.commit()
    
    return {"success": True}

# Workload endpoints
@app.get("/api/workloads", response_model=List[WorkloadResponse])
async def get_workloads(
    cluster_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Workload)
    if cluster_id:
        query = query.filter(Workload.cluster_id == cluster_id)
    
    workloads = query.all()
    
    # Return mock data if no workloads exist
    if not workloads:
        return [
            {
                "id": 1,
                "name": "web-frontend",
                "type": "deployment",
                "namespace": "production",
                "cluster_id": 1,
                "replicas": 3,
                "image": "nginx:latest",
                "status": "running",
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": 2,
                "name": "redis-cache",
                "type": "statefulset",
                "namespace": "production",
                "cluster_id": 1,
                "replicas": 1,
                "image": "redis:7-alpine",
                "status": "running",
                "created_at": datetime.utcnow().isoformat()
            }
        ]
    
    return workloads

@app.post("/api/workloads", response_model=WorkloadResponse)
async def deploy_workload(
    workload: WorkloadCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_workload = Workload(**workload.dict())
    db.add(db_workload)
    db.commit()
    db.refresh(db_workload)
    
    return db_workload

# Monitoring endpoints
@app.get("/api/monitoring/metrics")
async def get_metrics(
    timeRange: str = "1h",
    current_user: User = Depends(get_current_user)
):
    # Mock metrics data
    return {
        "cpu": 45.2,
        "memory": 62.8,
        "network": 125.5,
        "disk": 38.9,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/monitoring/alerts")
async def get_alerts(current_user: User = Depends(get_current_user)):
    # Mock alerts data
    return [
        {
            "id": 1,
            "severity": "warning",
            "message": "High CPU usage on production-cluster",
            "timestamp": datetime.utcnow().isoformat(),
            "acknowledged": False
        },
        {
            "id": 2,
            "severity": "info",
            "message": "Scheduled maintenance window approaching",
            "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
            "acknowledged": True
        }
    ]

# Cost endpoints
@app.get("/api/costs")
async def get_cost_data(
    timeRange: str = "month",
    current_user: User = Depends(get_current_user)
):
    # Mock cost data
    return {
        "total": 2847,
        "breakdown": {
            "aws": 1245,
            "azure": 897,
            "gcp": 705
        },
        "trend": [
            {"date": "2024-01-01", "cost": 2650},
            {"date": "2024-01-08", "cost": 2720},
            {"date": "2024-01-15", "cost": 2810},
            {"date": "2024-01-22", "cost": 2847}
        ]
    }

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = None):
    await manager.connect(websocket)
    try:
        # Send initial connection message
        await websocket.send_text(json.dumps({
            "type": "connection",
            "message": "Connected to real-time updates"
        }))
        
        # Keep connection alive and send periodic updates
        while True:
            # Wait for messages or send periodic updates
            await asyncio.sleep(30)
            
            # Send mock metric update
            await websocket.send_text(json.dumps({
                "type": "metrics_update",
                "data": {
                    "cpu": 45 + (await asyncio.get_event_loop().run_in_executor(None, __import__('random').randint, -5, 5)),
                    "memory": 62 + (await asyncio.get_event_loop().run_in_executor(None, __import__('random').randint, -3, 3)),
                    "timestamp": datetime.utcnow().isoformat()
                }
            }))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)