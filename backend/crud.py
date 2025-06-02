from sqlalchemy.orm import Session
from models import *
import backend.schemas as schemas
from uuid import UUID
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_tenant(db: Session, tenant: schemas.TenantCreate):
    db_obj = Tenant(name=tenant.name)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_tenant(db: Session, tenant_id: UUID):
    return db.query(Tenant).filter(Tenant.id == tenant_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        id=str(uuid.uuid4()),
        email=user.email,
        password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

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

def list_clusters(db: Session, tenant_id: UUID):
    return db.query(Cluster).filter(Cluster.tenant_id == tenant_id).all()

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