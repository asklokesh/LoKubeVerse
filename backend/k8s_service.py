from kubernetes import client, config
from kubernetes.client.rest import ApiException
from typing import List, Dict, Any, Optional
import yaml
import json
import logging
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class K8sService:
    """Service for interacting with Kubernetes clusters"""
    
    def __init__(self):
        try:
            config.load_kube_config()
            logger.info("Loaded kubernetes config from kubeconfig")
        except Exception as e:
            logger.warning(f"Could not load Kubernetes config: {e}")
                try:
                    config.load_incluster_config()
                logger.info("Loaded in-cluster kubernetes config")
            except Exception as e2:
                logger.warning(f"Could not load in-cluster config: {e2}")
                # Create a mock client for development
                self._use_mock = True
                logger.info("Using mock k8s client for development")
                return
        
        self._use_mock = False
            self.v1 = client.CoreV1Api()
            self.apps_v1 = client.AppsV1Api()
            self.networking_v1 = client.NetworkingV1Api()
            self.rbac_v1 = client.RbacAuthorizationV1Api()
            
    def _mock_response(self, resource_type="mock"):
        """Return mock data for development when k8s is not available"""
        return {
            "status": "success",
            "data": {"message": f"Mock {resource_type} response - k8s not available"},
            "mock": True
        }
    
    def is_connected(self) -> bool:
        """Check if connected to Kubernetes cluster"""
        try:
            if self.v1:
                self.v1.get_api_version()
                return True
        except Exception:
            pass
        return False
    
    def get_cluster_info(self) -> Dict[str, Any]:
        """Get basic cluster information"""
        if self._use_mock:
            return self._mock_response("cluster_info")
        if not self.is_connected():
            return {"status": "disconnected", "mock": True}
            
        try:
            version = self.v1.get_api_version()
            nodes = self.v1.list_node()
            
            return {
                "status": "connected",
                "version": version,
                "node_count": len(nodes.items),
                "nodes": [
                    {
                        "name": node.metadata.name,
                        "status": "Ready" if any(
                            condition.type == "Ready" and condition.status == "True"
                            for condition in node.status.conditions
                        ) else "NotReady",
                        "version": node.status.node_info.kubelet_version,
                        "os": node.status.node_info.os_image
                    }
                    for node in nodes.items
                ]
            }
        except ApiException as e:
            logger.error(f"Error getting cluster info: {e}")
            return {"status": "error", "error": str(e)}
    
    def get_namespaces(self) -> List[Dict[str, Any]]:
        """Get all namespaces"""
        if self._use_mock:
            return self._mock_response("namespaces")
        if not self.is_connected():
            return self._mock_namespaces()
            
        try:
            namespaces = self.v1.list_namespace()
            return [
                {
                    "name": ns.metadata.name,
                    "status": ns.status.phase,
                    "created": ns.metadata.creation_timestamp.isoformat() if ns.metadata.creation_timestamp else None,
                    "labels": ns.metadata.labels or {}
                }
                for ns in namespaces.items
            ]
        except ApiException as e:
            logger.error(f"Error getting namespaces: {e}")
            return []
    
    def get_pods(self, namespace: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get pods in cluster or specific namespace"""
        if self._use_mock:
            return self._mock_pods()
        if not self.is_connected():
            return self._mock_pods()
            
        try:
            if namespace:
                pods = self.v1.list_namespaced_pod(namespace)
            else:
                pods = self.v1.list_pod_for_all_namespaces()
                
            return [
                {
                    "name": pod.metadata.name,
                    "namespace": pod.metadata.namespace,
                    "status": pod.status.phase,
                    "node": pod.spec.node_name,
                    "created": pod.metadata.creation_timestamp.isoformat() if pod.metadata.creation_timestamp else None,
                    "ready": sum(1 for c in (pod.status.container_statuses or []) if c.ready),
                    "total_containers": len(pod.spec.containers),
                    "restarts": sum(c.restart_count for c in (pod.status.container_statuses or [])),
                    "labels": pod.metadata.labels or {}
                }
                for pod in pods.items
            ]
        except ApiException as e:
            logger.error(f"Error getting pods: {e}")
            return []
    
    def get_services(self, namespace: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get services in cluster or specific namespace"""
        if self._use_mock:
            return self._mock_services()
        if not self.is_connected():
            return self._mock_services()
            
        try:
            if namespace:
                services = self.v1.list_namespaced_service(namespace)
            else:
                services = self.v1.list_service_for_all_namespaces()
                
            return [
                {
                    "name": svc.metadata.name,
                    "namespace": svc.metadata.namespace,
                    "type": svc.spec.type,
                    "cluster_ip": svc.spec.cluster_ip,
                    "external_ips": svc.spec.external_i_ps or [],
                    "ports": [
                        {
                            "port": port.port,
                            "target_port": str(port.target_port),
                            "protocol": port.protocol
                        }
                        for port in (svc.spec.ports or [])
                    ],
                    "selector": svc.spec.selector or {},
                    "created": svc.metadata.creation_timestamp.isoformat() if svc.metadata.creation_timestamp else None
                }
                for svc in services.items
            ]
        except ApiException as e:
            logger.error(f"Error getting services: {e}")
            return []
    
    def get_deployments(self, namespace: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get deployments in cluster or specific namespace"""
        if self._use_mock:
            return self._mock_deployments()
        if not self.is_connected():
            return self._mock_deployments()
            
        try:
            if namespace:
                deployments = self.apps_v1.list_namespaced_deployment(namespace)
            else:
                deployments = self.apps_v1.list_deployment_for_all_namespaces()
                
            return [
                {
                    "name": dep.metadata.name,
                    "namespace": dep.metadata.namespace,
                    "replicas": dep.spec.replicas,
                    "ready_replicas": dep.status.ready_replicas or 0,
                    "available_replicas": dep.status.available_replicas or 0,
                    "updated_replicas": dep.status.updated_replicas or 0,
                    "strategy": dep.spec.strategy.type if dep.spec.strategy else "RollingUpdate",
                    "created": dep.metadata.creation_timestamp.isoformat() if dep.metadata.creation_timestamp else None,
                    "labels": dep.metadata.labels or {}
                }
                for dep in deployments.items
            ]
        except ApiException as e:
            logger.error(f"Error getting deployments: {e}")
            return []
    
    def get_cluster_metrics(self) -> Dict[str, Any]:
        """Get cluster resource metrics"""
        if self._use_mock:
            return self._mock_metrics()
        if not self.is_connected():
            return self._mock_metrics()
            
        try:
            nodes = self.v1.list_node()
            pods = self.v1.list_pod_for_all_namespaces()
            
            # Calculate basic metrics
            total_pods = len(pods.items)
            running_pods = len([p for p in pods.items if p.status.phase == "Running"])
            pending_pods = len([p for p in pods.items if p.status.phase == "Pending"])
            
            return {
                "nodes": {
                    "total": len(nodes.items),
                    "ready": len([n for n in nodes.items if any(
                        c.type == "Ready" and c.status == "True" 
                        for c in n.status.conditions
                    )])
                },
                "pods": {
                    "total": total_pods,
                    "running": running_pods,
                    "pending": pending_pods,
                    "failed": total_pods - running_pods - pending_pods
                },
                "cpu_usage": 65.5,  # Mock values - would integrate with metrics server
                "memory_usage": 72.3,
                "storage_usage": 45.8,
                "timestamp": datetime.utcnow().isoformat()
            }
        except ApiException as e:
            logger.error(f"Error getting cluster metrics: {e}")
            return self._mock_metrics()
    
    def _mock_namespaces(self) -> List[Dict[str, Any]]:
        """Mock namespaces for development/testing"""
        return [
            {"name": "default", "status": "Active", "created": "2024-01-01T00:00:00Z", "labels": {}},
            {"name": "kube-system", "status": "Active", "created": "2024-01-01T00:00:00Z", "labels": {}},
            {"name": "kube-public", "status": "Active", "created": "2024-01-01T00:00:00Z", "labels": {}},
            {"name": "production", "status": "Active", "created": "2024-01-01T00:00:00Z", "labels": {"env": "prod"}},
            {"name": "staging", "status": "Active", "created": "2024-01-01T00:00:00Z", "labels": {"env": "staging"}}
        ]
    
    def _mock_pods(self) -> List[Dict[str, Any]]:
        """Mock pods for development/testing"""
        return [
            {
                "name": "web-app-deployment-7d4b8c8d9f-abc123",
                "namespace": "production",
                "status": "Running",
                "node": "node-1",
                "created": "2024-01-01T10:00:00Z",
                "ready": 1,
                "total_containers": 1,
                "restarts": 0,
                "labels": {"app": "web-app", "env": "production"}
            },
            {
                "name": "api-service-6b9d5c7f8g-def456",
                "namespace": "production", 
                "status": "Running",
                "node": "node-2",
                "created": "2024-01-01T10:05:00Z",
                "ready": 1,
                "total_containers": 1,
                "restarts": 2,
                "labels": {"app": "api-service", "env": "production"}
            }
        ]
    
    def _mock_services(self) -> List[Dict[str, Any]]:
        """Mock services for development/testing"""
        return [
            {
                "name": "web-app-service",
                "namespace": "production",
                "type": "ClusterIP",
                "cluster_ip": "10.96.1.100",
                "external_ips": [],
                "ports": [{"port": 80, "target_port": "8080", "protocol": "TCP"}],
                "selector": {"app": "web-app"},
                "created": "2024-01-01T10:00:00Z"
            }
        ]
    
    def _mock_deployments(self) -> List[Dict[str, Any]]:
        """Mock deployments for development/testing"""
        return [
            {
                "name": "web-app-deployment",
                "namespace": "production",
                "replicas": 3,
                "ready_replicas": 3,
                "available_replicas": 3,
                "updated_replicas": 3,
                "strategy": "RollingUpdate",
                "created": "2024-01-01T10:00:00Z",
                "labels": {"app": "web-app", "env": "production"}
            }
        ]
    
    def _mock_metrics(self) -> Dict[str, Any]:
        """Mock metrics for development/testing"""
        return {
            "nodes": {"total": 3, "ready": 3},
            "pods": {"total": 12, "running": 10, "pending": 1, "failed": 1},
            "cpu_usage": 65.5,
            "memory_usage": 72.3,
            "storage_usage": 45.8,
            "timestamp": datetime.utcnow().isoformat()
        }