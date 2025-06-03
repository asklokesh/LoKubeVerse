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
        orm_mode = True

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ClusterBase(BaseModel):
    name: str
    provider: str
    region: str

class ClusterCreate(ClusterBase):
    kubeconfig: str

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
        orm_mode = True

class WorkloadBase(BaseModel):
    name: str
    spec: Dict[str, Any]
    status: Optional[str]

class WorkloadCreate(WorkloadBase):
    cluster_id: UUID
    namespace_id: UUID

class Workload(WorkloadBase):
    id: UUID
    cluster_id: UUID
    namespace_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        orm_mode = True

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
        orm_mode = True

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
        orm_mode = True

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
        orm_mode = True

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
        orm_mode = True

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
        orm_mode = True

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
        orm_mode = True