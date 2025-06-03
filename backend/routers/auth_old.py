from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Dict, Any
import jwt
import os
import boto3
import subprocess
import json
from datetime import datetime, timedelta
import hashlib
import secrets

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

# Pydantic models
class CloudCredentials(BaseModel):
    provider: str  # aws, azure, gcp
    access_key_id: Optional[str] = None
    secret_access_key: Optional[str] = None
    region: Optional[str] = None
    subscription_id: Optional[str] = None
    tenant_id: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    project_id: Optional[str] = None
    service_account_key: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user_id: str
    permissions: list

class SSOConfig(BaseModel):
    provider: str  # okta, auth0, azure_ad, google
    client_id: str
    client_secret: str
    redirect_uri: str
    domain: str

# Mock user database
MOCK_USERS = {
    "admin": {
        "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
        "permissions": ["cluster:read", "cluster:write", "namespace:read", "namespace:write", "workload:read", "workload:write"],
        "user_id": "admin-001"
    },
    "developer": {
        "password_hash": hashlib.sha256("dev123".encode()).hexdigest(),
        "permissions": ["cluster:read", "namespace:read", "workload:read"],
        "user_id": "dev-001"
    },
    "viewer": {
        "password_hash": hashlib.sha256("view123".encode()).hexdigest(),
        "permissions": ["cluster:read"],
        "user_id": "view-001"
    }
}

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-here")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/login", response_model=TokenResponse)
async def login(user_login: UserLogin):
    """Local user authentication"""
    username = user_login.username
    password_hash = hashlib.sha256(user_login.password.encode()).hexdigest()
    
    if username not in MOCK_USERS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    user = MOCK_USERS[username]
    if user["password_hash"] != password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    token_data = {
        "sub": username,
        "user_id": user["user_id"],
        "permissions": user["permissions"]
    }
    access_token = create_access_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=JWT_EXPIRATION_HOURS * 3600,
        user_id=user["user_id"],
        permissions=user["permissions"]
    )

@router.post("/aws")
async def aws_auth(credentials: CloudCredentials):
    """AWS authentication and EKS cluster access setup"""
    try:
        # Mock AWS authentication for demo
        # In production, would validate credentials and update kubeconfig
        return {
            "status": "success",
            "provider": "aws",
            "region": credentials.region or "us-west-2",
            "clusters_found": 2,
            "kubeconfig_updated": ["prod-cluster", "dev-cluster"],
            "message": "AWS authentication configured (mock)"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"AWS authentication failed: {str(e)}"
        )

@router.post("/azure")
async def azure_auth(credentials: CloudCredentials):
    """Azure authentication and AKS cluster access setup"""
    try:
        # Mock Azure authentication for demo
        return {
            "status": "success",
            "provider": "azure",
            "subscription_id": credentials.subscription_id,
            "clusters_found": 1,
            "kubeconfig_updated": ["azure-aks-cluster"],
            "message": "Azure authentication configured (mock)"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Azure authentication failed: {str(e)}"
        )

@router.post("/gcp")
async def gcp_auth(credentials: CloudCredentials):
    """GCP authentication and GKE cluster access setup"""
    try:
        # Mock GCP authentication for demo
        return {
            "status": "success",
            "provider": "gcp",
            "project_id": credentials.project_id,
            "clusters_found": 3,
            "kubeconfig_updated": ["gke-prod", "gke-staging", "gke-dev"],
            "message": "GCP authentication configured (mock)"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GCP authentication failed: {str(e)}"
        )

@router.post("/kubeconfig")
async def kubeconfig_auth():
    """Use existing kubeconfig for authentication"""
    try:
        # Mock kubeconfig validation
        return {
            "status": "success",
            "provider": "kubeconfig",
            "current_context": "minikube",
            "available_contexts": ["minikube", "kind-k8s-dashboard", "docker-desktop"],
            "message": "Using existing kubeconfig (mock)"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Kubeconfig authentication failed: {str(e)}"
        )

@router.post("/sso/{provider}")
async def sso_auth(provider: str, sso_config: SSOConfig):
    """Single Sign-On authentication"""
    if provider not in ["okta", "auth0", "azure_ad", "google"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported SSO provider: {provider}"
        )
    
    # Generate mock SSO response
    state = secrets.token_urlsafe(32)
    auth_url = f"https://{sso_config.domain}/oauth2/authorize"
    
    return {
        "status": "redirect_required",
        "provider": provider,
        "auth_url": auth_url,
        "state": state,
        "message": f"SSO with {provider} configured (mock)"
    }

@router.get("/me")
async def get_current_user(current_user: dict = Depends(verify_token)):
    """Get current authenticated user information"""
    return {
        "user_id": current_user.get("user_id"),
        "username": current_user.get("sub"),
        "permissions": current_user.get("permissions", []),
        "token_expires": current_user.get("exp")
    }

@router.post("/logout")
async def logout():
    """Logout (client should remove token)"""
    return {"status": "logged_out", "message": "Token should be removed from client"}

@router.get("/status")
async def auth_status():
    """Get authentication system status"""
    return {
        "status": "active",
        "supported_providers": ["local", "aws", "azure", "gcp", "kubeconfig", "sso"],
        "sso_providers": ["okta", "auth0", "azure_ad", "google"],
        "jwt_expiration_hours": JWT_EXPIRATION_HOURS,
        "demo_users": {
            "admin": {"password": "admin123", "permissions": "full access"},
            "developer": {"password": "dev123", "permissions": "read access to clusters and workloads"},
            "viewer": {"password": "view123", "permissions": "read access to clusters only"}
        }
    }