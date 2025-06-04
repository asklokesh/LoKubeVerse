from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class TenantBase(BaseModel):
    name: str

class TenantCreate(TenantBase):
    pass

class Tenant(TenantBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class User(UserBase):
    id: str
    username: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ClusterBase(BaseModel):
    name: str
    provider: str
    region: str

class ClusterCreate(BaseModel):
    name: str
    provider: str
    region: str
    node_count: int
    instance_type: str

class Cluster(ClusterBase):
    id: str
    owner_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class NamespaceBase(BaseModel):
    name: str

class NamespaceCreate(NamespaceBase):
    cluster_id: UUID

class Namespace(NamespaceBase):
    id: UUID
    cluster_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True

class WorkloadBase(BaseModel):
    name: str
    spec: Dict[str, Any]
    status: Optional[str]

class WorkloadCreate(BaseModel):
    name: str
    type: str
    namespace: str
    cluster_id: int
    replicas: int
    image: str

class Workload(WorkloadBase):
    id: UUID
    cluster_id: UUID
    namespace_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True

class RBACBase(BaseModel):
    rules: Dict[str, Any]

class RBACCreate(RBACBase):
    cluster_id: UUID

class RBAC(RBACBase):
    id: UUID
    cluster_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True

class QuotaBase(BaseModel):
    spec: Dict[str, Any]

class QuotaCreate(QuotaBase):
    cluster_id: UUID
    namespace_id: UUID

class Quota(QuotaBase):
    id: UUID
    cluster_id: UUID
    namespace_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True

class NetworkPolicyBase(BaseModel):
    spec: Dict[str, Any]

class NetworkPolicyCreate(NetworkPolicyBase):
    cluster_id: UUID
    namespace_id: UUID

class NetworkPolicy(NetworkPolicyBase):
    id: UUID
    cluster_id: UUID
    namespace_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True

class DeploymentBase(BaseModel):
    name: str
    spec: Dict[str, Any]
    status: Optional[str]

class DeploymentCreate(DeploymentBase):
    cluster_id: UUID
    namespace_id: UUID

class Deployment(DeploymentBase):
    id: UUID
    cluster_id: UUID
    namespace_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True

class AuditLogBase(BaseModel):
    action: str
    resource: str
    details: Dict[str, Any]

class AuditLogCreate(AuditLogBase):
    tenant_id: UUID
    user_id: UUID

class AuditLog(AuditLogBase):
    id: UUID
    tenant_id: UUID
    user_id: UUID
    created_at: datetime
    class Config:
        from_attributes = True

class CostBase(BaseModel):
    amount: float
    currency: str = 'USD'
    period: str

class CostCreate(CostBase):
    cluster_id: UUID
    namespace_id: Optional[UUID]

class Cost(CostBase):
    id: UUID
    cluster_id: UUID
    namespace_id: Optional[UUID]
    created_at: datetime
    class Config:
        from_attributes = True

# Authentication schemas
class UserLogin(UserBase):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str
    email: EmailStr

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# Cluster schemas
class ClusterResponse(BaseModel):
    id: int
    name: str
    provider: str
    region: str
    status: str
    node_count: int
    instance_type: str
    created_at: datetime
    pod_count: Optional[int] = 0
    cpu_usage: Optional[float] = 0
    memory_usage: Optional[float] = 0
    
    class Config:
        from_attributes = True

# Workload schemas
class WorkloadResponse(BaseModel):
    id: int
    name: str
    type: str
    namespace: str
    cluster_id: int
    replicas: int
    image: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Dashboard schemas
class DashboardStats(BaseModel):
    clusters: dict
    workloads: dict
    health: dict
    costs: dict