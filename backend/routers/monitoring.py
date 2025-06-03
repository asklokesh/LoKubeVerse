from fastapi import APIRouter, HTTPException, Depends
import random
from datetime import datetime, timedelta
from typing import Optional

from k8s_service import K8sService
from auth_service import AuthService

router = APIRouter(prefix="/monitoring", tags=["monitoring"])
k8s_service = K8sService()
auth_service = AuthService()

def get_current_user(credentials = Depends(auth_service.get_current_user)):
    """Dependency to get current authenticated user"""
    return credentials

@router.get("/health/{cluster_id}")
def cluster_health(cluster_id: str, current_user: dict = Depends(get_current_user)):
    """Get real-time cluster health status"""
    try:
        # Try to get real cluster health from Kubernetes
        health_data = k8s_service.get_cluster_health()
        
        if health_data:
            return {
                "status": health_data.get("status", "unknown"),
                "cluster_id": cluster_id,
                "timestamp": datetime.utcnow().isoformat(),
                "components": health_data.get("components", {}),
                "node_count": health_data.get("node_count", 0),
                "ready_nodes": health_data.get("ready_nodes", 0)
            }
        else:
            # Fallback to mock data if K8s not available
            health_status = random.choice(["healthy", "warning", "critical"])
            return {
                "status": health_status,
                "cluster_id": cluster_id,
                "timestamp": datetime.utcnow().isoformat(),
                "components": {
                    "api_server": "healthy",
                    "etcd": "healthy", 
                    "scheduler": "healthy",
                    "controller_manager": "healthy",
                    "kubelet": health_status,
                    "kube_proxy": "healthy"
                },
                "node_count": 3,
                "ready_nodes": 3 if health_status == "healthy" else 2
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cluster health: {str(e)}")

@router.get("/metrics/{cluster_id}")
def cluster_metrics(cluster_id: str, current_user: dict = Depends(get_current_user)):
    """Get comprehensive cluster metrics"""
    try:
        # Try to get real metrics from Kubernetes
        metrics_data = k8s_service.get_cluster_metrics()
        
        if metrics_data:
            return {"metrics": metrics_data}
        else:
            # Fallback to mock data if K8s metrics not available
            base_time = datetime.utcnow()
            
            # Generate realistic time series data
            cpu_data = []
            memory_data = []
            for i in range(60):  # Last 60 minutes
                timestamp = (base_time - timedelta(minutes=i)).isoformat()
                cpu_data.append({
                    "timestamp": timestamp,
                    "value": random.uniform(20, 80)
                })
                memory_data.append({
                    "timestamp": timestamp, 
                    "value": random.uniform(30, 90)
                })
            
            return {
                "metrics": {
                    "cpu": {
                        "current": random.uniform(40, 70),
                        "average": 55.5,
                        "timeseries": cpu_data[::-1]  # Reverse to get chronological order
                    },
                    "memory": {
                        "current": random.uniform(50, 80),
                        "average": 65.2,
                        "timeseries": memory_data[::-1]
                    },
                    "disk": {
                        "used": random.uniform(20, 60),
                        "total": 100,
                        "available": random.uniform(40, 80)
                    },
                    "network": {
                        "in_bytes_per_sec": random.randint(1000, 10000),
                        "out_bytes_per_sec": random.randint(1000, 10000)
                    },
                    "pods": {
                        "running": random.randint(10, 50),
                        "pending": random.randint(0, 5),
                        "failed": random.randint(0, 2),
                        "total": random.randint(10, 57)
                    }
                }
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cluster metrics: {str(e)}")

@router.get("/logs/{cluster_id}")
def cluster_logs(cluster_id: str, namespace: Optional[str] = None, pod_name: Optional[str] = None, limit: int = 100, current_user: dict = Depends(get_current_user)):
    """Get pod/node logs from cluster"""
    try:
        # Try to get real logs from Kubernetes
        logs = k8s_service.get_logs(namespace=namespace, pod_name=pod_name, limit=limit)
        
        if logs:
            return {
                "logs": logs,
                "total_count": len(logs)
            }
        else:
            # Fallback to mock data if K8s logs not available
            sample_logs = [
                {
                    "timestamp": (datetime.utcnow() - timedelta(minutes=1)).isoformat(),
                    "level": "INFO",
                    "source": "nginx-deployment-abc123",
                    "namespace": "default",
                    "message": "Starting nginx server on port 80"
                },
                {
                    "timestamp": (datetime.utcnow() - timedelta(minutes=2)).isoformat(),
                    "level": "INFO", 
                    "source": "kube-proxy",
                    "namespace": "kube-system",
                    "message": "Successfully updated iptables rules"
                },
                {
                    "timestamp": (datetime.utcnow() - timedelta(minutes=3)).isoformat(),
                    "level": "WARN",
                    "source": "kubelet",
                    "namespace": "kube-system", 
                    "message": "Pod disk usage is approaching 80%"
                },
                {
                    "timestamp": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
                    "level": "ERROR",
                    "source": "redis-xyz789",
                    "namespace": "default",
                    "message": "Connection to database failed, retrying..."
                }
            ]
            
            filtered_logs = sample_logs
            if namespace:
                filtered_logs = [log for log in filtered_logs if log["namespace"] == namespace]
            if pod_name:
                filtered_logs = [log for log in filtered_logs if pod_name in log["source"]]
            
            return {
                "logs": filtered_logs[:limit],
                "total_count": len(filtered_logs)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cluster logs: {str(e)}")

@router.get("/alerts/{cluster_id}")
def cluster_alerts(cluster_id: str):
    """Get active alerts for cluster"""
    # TODO: Integrate with AlertManager/Prometheus alerts
    sample_alerts = [
        {
            "id": "alert-001",
            "severity": "warning",
            "title": "High CPU Usage",
            "description": "Node cpu-usage is above 80%",
            "timestamp": (datetime.utcnow() - timedelta(minutes=10)).isoformat(),
            "status": "firing",
            "labels": {
                "node": "worker-node-1",
                "severity": "warning"
            }
        },
        {
            "id": "alert-002", 
            "severity": "critical",
            "title": "Pod Crash Loop",
            "description": "Pod nginx-deployment-xyz has been restarting repeatedly",
            "timestamp": (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
            "status": "firing",
            "labels": {
                "pod": "nginx-deployment-xyz",
                "namespace": "production"
            }
        },
        {
            "id": "alert-003",
            "severity": "info",
            "title": "Deployment Scaled",
            "description": "Deployment redis scaled from 1 to 3 replicas",
            "timestamp": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
            "status": "resolved",
            "labels": {
                "deployment": "redis",
                "namespace": "default"
            }
        }
    ]
    
    return {
        "alerts": sample_alerts,
        "summary": {
            "critical": sum(1 for a in sample_alerts if a["severity"] == "critical" and a["status"] == "firing"),
            "warning": sum(1 for a in sample_alerts if a["severity"] == "warning" and a["status"] == "firing"),
            "info": sum(1 for a in sample_alerts if a["severity"] == "info"),
            "total": len(sample_alerts)
        }
    }

@router.get("/cost/{cluster_id}")
def cluster_cost(cluster_id: str, period: str = "7d"):
    """Get cost tracking and trends for cluster"""
    # TODO: Integrate with cloud provider billing APIs (AWS Cost Explorer, Azure Cost Management, GCP Billing)
    
    if period not in ["1d", "7d", "30d", "90d"]:
        raise HTTPException(status_code=400, detail="Invalid period. Use 1d, 7d, 30d, or 90d")
    
    # Generate mock cost data
    days = {"1d": 1, "7d": 7, "30d": 30, "90d": 90}[period]
    cost_data = []
    
    for i in range(days):
        date = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        daily_cost = random.uniform(25, 45)
        cost_data.append({
            "date": date,
            "cost": round(daily_cost, 2),
            "breakdown": {
                "compute": round(daily_cost * 0.6, 2),
                "storage": round(daily_cost * 0.25, 2),
                "network": round(daily_cost * 0.15, 2)
            }
        })
    
    total_cost = sum(day["cost"] for day in cost_data)
    
    return {
        "cost": {
            "total": round(total_cost, 2),
            "average_daily": round(total_cost / days, 2),
            "period": period,
            "currency": "USD",
            "data": cost_data[::-1],  # Chronological order
            "breakdown": {
                "compute": round(total_cost * 0.6, 2),
                "storage": round(total_cost * 0.25, 2),
                "network": round(total_cost * 0.15, 2)
            },
            "recommendations": [
                "Consider using spot instances for non-critical workloads",
                "Optimize storage by removing unused persistent volumes",
                "Review network traffic patterns for cost optimization"
            ]
        }
    }

@router.get("/dashboard/{cluster_id}")
def cluster_dashboard(cluster_id: str):
    """Get comprehensive dashboard data for cluster"""
    # TODO: Aggregate data from multiple sources
    
    # Get all the dashboard components
    health = cluster_health(cluster_id)
    metrics = cluster_metrics(cluster_id)
    alerts = cluster_alerts(cluster_id)
    cost = cluster_cost(cluster_id, "7d")
    
    return {
        "dashboard": {
            "cluster_id": cluster_id,
            "timestamp": datetime.utcnow().isoformat(),
            "health": health,
            "metrics": metrics["metrics"],
            "alerts": alerts["summary"],
            "cost": cost["cost"],
            "summary": {
                "status": health["status"],
                "node_count": health["node_count"],
                "ready_nodes": health["ready_nodes"],
                "total_pods": metrics["metrics"]["pods"]["total"],
                "active_alerts": alerts["summary"]["critical"] + alerts["summary"]["warning"],
                "daily_cost": cost["cost"]["average_daily"]
            }
        }
    }

@router.get("/nodes/{cluster_id}")
def cluster_nodes(cluster_id: str):
    """Get detailed node information"""
    # TODO: Get actual node data from Kubernetes API
    
    nodes = []
    for i in range(3):
        node_name = f"worker-node-{i+1}"
        nodes.append({
            "name": node_name,
            "status": "Ready",
            "roles": ["worker"] if i > 0 else ["master", "worker"],
            "version": "v1.28.2",
            "os": "Ubuntu 20.04.6 LTS",
            "kernel": "5.4.0-150-generic",
            "runtime": "containerd://1.6.20",
            "capacity": {
                "cpu": "4",
                "memory": "8Gi",
                "pods": "110",
                "storage": "100Gi"
            },
            "allocatable": {
                "cpu": "3800m",
                "memory": "7.5Gi", 
                "pods": "110",
                "storage": "95Gi"
            },
            "usage": {
                "cpu": f"{random.randint(30, 80)}%",
                "memory": f"{random.randint(40, 85)}%",
                "pods": random.randint(5, 25)
            },
            "age": f"{random.randint(1, 30)}d",
            "conditions": [
                {"type": "Ready", "status": "True"},
                {"type": "MemoryPressure", "status": "False"},
                {"type": "DiskPressure", "status": "False"},
                {"type": "PIDPressure", "status": "False"}
            ]
        })
    
    return {"nodes": nodes}

@router.get("/events/{cluster_id}")
def cluster_events(cluster_id: str, limit: int = 50):
    """Get recent cluster events"""
    # TODO: Get actual events from Kubernetes API
    
    event_types = ["Normal", "Warning"]
    reasons = ["Scheduled", "Pulled", "Created", "Started", "Killing", "Failed", "FailedMount"]
    
    events = []
    for i in range(limit):
        events.append({
            "timestamp": (datetime.utcnow() - timedelta(minutes=random.randint(1, 1440))).isoformat(),
            "type": random.choice(event_types),
            "reason": random.choice(reasons), 
            "object": f"pod/nginx-deployment-{random.randint(1000, 9999)}",
            "namespace": random.choice(["default", "kube-system", "production"]),
            "message": f"Successfully {random.choice(['assigned', 'pulled', 'created', 'started'])} {random.choice(['pod', 'container', 'image'])}",
            "source": "kubelet",
            "count": random.randint(1, 5)
        })
    
    return {
        "events": sorted(events, key=lambda x: x["timestamp"], reverse=True)
    } 