from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class KubernetesResource(BaseModel):
    """
    Base model for Kubernetes resources
    """
    name: str
    kind: str
    uid: str
    creation_timestamp: datetime
    status: str
    labels: Dict[str, str] = {}
    annotations: Dict[str, str] = {}
    namespace: Optional[str] = None
    
    class Config:
        """
        Pydantic configuration
        """
        orm_mode = True
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() if dt else None
        } 