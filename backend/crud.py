from sqlalchemy.orm import Session
from models import *
import schemas
from uuid import UUID
from passlib.context import CryptContext
import uuid
from sqlalchemy.exc import SQLAlchemyError
import logging
from fastapi import HTTPException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)

def create_tenant(db: Session, tenant: schemas.TenantCreate):
    db_obj = Tenant(name=tenant.name)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_tenant(db: Session, tenant_id: str):
    try:
        tenant_uuid = UUID(tenant_id)
    except ValueError:
        logger.error(f"Invalid UUID format for tenant_id: {tenant_id}")
        raise HTTPException(status_code=422, detail="Invalid UUID format for tenant_id")
    try:
        tenant = db.query(Tenant).filter(Tenant.id == tenant_uuid).first()
        if not tenant:
            logger.warning(f"Tenant not found for ID: {tenant_id}")
        return tenant
    except SQLAlchemyError as e:
        logger.error(f"Database error while fetching tenant: {e}")
        raise HTTPException(status_code=500, detail="Database error")

def create_user(db: Session, user: schemas.UserCreate):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        id=str(uuid.uuid4()),
        email=user.email,
            username=user.email.split('@')[0],  # Use email prefix as username
            hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Error creating user")

def get_user(db: Session, user_id: str):
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid UUID format for user_id")
    return db.query(User).filter(User.id == user_uuid).first()

def get_user_by_email(db: Session, email: str):
    """Get user by email address"""
    try:
    return db.query(User).filter(User.email == email).first()
    except SQLAlchemyError as e:
        logger.error(f"Error getting user by email {email}: {e}")
        return None

def get_user_by_username(db: Session, username: str):
    """Get user by username"""
    try:
        return db.query(User).filter(User.username == username).first()
    except SQLAlchemyError as e:
        logger.error(f"Error getting user by username {username}: {e}")
        return None

def create_cluster(db: Session, cluster: schemas.ClusterCreate, owner_id: str):
    db_cluster = Cluster(
        id=str(uuid.uuid4()),
        **cluster.dict(),
        owner_id=owner_id
    )
    db.add(db_cluster)
    db.commit()
    db.refresh(db_cluster)
    return db_cluster

def get_cluster(db: Session, cluster_id: str):
    return db.query(Cluster).filter(Cluster.id == cluster_id).first()

def list_clusters(db: Session, tenant_id: UUID = None):
    if tenant_id:
    return db.query(Cluster).filter(Cluster.tenant_id == tenant_id).all()
    return db.query(Cluster).all()

def create_namespace(db: Session, ns: schemas.NamespaceCreate):
    db_obj = Namespace(**ns.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def create_workload(db: Session, wl: schemas.WorkloadCreate):
    db_obj = Workload(**wl.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def create_rbac(db: Session, rbac: schemas.RBACCreate):
    db_obj = RBAC(**rbac.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def create_quota(db: Session, quota: schemas.QuotaCreate):
    db_obj = Quota(**quota.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def create_network_policy(db: Session, np: schemas.NetworkPolicyCreate):
    db_obj = NetworkPolicy(**np.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def create_deployment(db: Session, dep: schemas.DeploymentCreate):
    db_obj = Deployment(**dep.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def create_audit_log(db: Session, log: schemas.AuditLogCreate):
    db_obj = AuditLog(**log.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def create_cost(db: Session, cost: schemas.CostCreate):
    db_obj = Cost(**cost.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj