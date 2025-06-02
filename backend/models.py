import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

def default_uuid():
    return str(uuid.uuid4())

class Tenant(Base):
    __tablename__ = 'tenants'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class User(Base):
    __tablename__ = 'users'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id'))
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  # encrypted
    role = Column(String, default='user')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    clusters = relationship("Cluster", back_populates="owner")

class Cluster(Base):
    __tablename__ = 'clusters'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id'))
    name = Column(String, nullable=False)
    cloud = Column(String, nullable=False)  # aws/azure/gcp
    config = Column(JSON)  # encrypted
    status = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    owner = relationship("User", back_populates="clusters")

class Namespace(Base):
    __tablename__ = 'namespaces'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cluster_id = Column(UUID(as_uuid=True), ForeignKey('clusters.id'))
    name = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Workload(Base):
    __tablename__ = 'workloads'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cluster_id = Column(UUID(as_uuid=True), ForeignKey('clusters.id'))
    namespace_id = Column(UUID(as_uuid=True), ForeignKey('namespaces.id'))
    name = Column(String, nullable=False)
    spec = Column(JSON)
    status = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class RBAC(Base):
    __tablename__ = 'rbac'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cluster_id = Column(UUID(as_uuid=True), ForeignKey('clusters.id'))
    rules = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Quota(Base):
    __tablename__ = 'quotas'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cluster_id = Column(UUID(as_uuid=True), ForeignKey('clusters.id'))
    namespace_id = Column(UUID(as_uuid=True), ForeignKey('namespaces.id'))
    spec = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class NetworkPolicy(Base):
    __tablename__ = 'network_policies'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cluster_id = Column(UUID(as_uuid=True), ForeignKey('clusters.id'))
    namespace_id = Column(UUID(as_uuid=True), ForeignKey('namespaces.id'))
    spec = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Deployment(Base):
    __tablename__ = 'deployments'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cluster_id = Column(UUID(as_uuid=True), ForeignKey('clusters.id'))
    namespace_id = Column(UUID(as_uuid=True), ForeignKey('namespaces.id'))
    name = Column(String, nullable=False)
    spec = Column(JSON)
    status = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    action = Column(String)
    resource = Column(String)
    details = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

class Cost(Base):
    __tablename__ = 'costs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cluster_id = Column(UUID(as_uuid=True), ForeignKey('clusters.id'))
    namespace_id = Column(UUID(as_uuid=True), ForeignKey('namespaces.id'), nullable=True)
    amount = Column(Float)
    currency = Column(String, default='USD')
    period = Column(String)  # e.g. '2024-06'
    created_at = Column(DateTime, server_default=func.now()) 