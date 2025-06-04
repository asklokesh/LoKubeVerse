import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime

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
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    clusters = relationship("Cluster", back_populates="user")

class Cluster(Base):
    __tablename__ = 'clusters'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    provider = Column(String)  # aws, azure, gcp
    region = Column(String)
    status = Column(String, default="provisioning")  # running, stopped, provisioning
    node_count = Column(Integer)
    instance_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    pod_count = Column(Integer, default=0)
    cpu_usage = Column(Float, default=0)
    memory_usage = Column(Float, default=0)
    user = relationship("User", back_populates="clusters")
    workloads = relationship("Workload", back_populates="cluster")

class Namespace(Base):
    __tablename__ = 'namespaces'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cluster_id = Column(UUID(as_uuid=True), ForeignKey('clusters.id'))
    name = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Workload(Base):
    __tablename__ = 'workloads'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # deployment, statefulset, daemonset
    namespace = Column(String, default="default")
    cluster_id = Column(Integer, ForeignKey("clusters.id"))
    replicas = Column(Integer, default=1)
    image = Column(String)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    cluster = relationship("Cluster", back_populates="workloads")

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