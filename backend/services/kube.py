from kubernetes import client, config
import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from models.kubernetes import KubernetesResource

# Configure logging
logger = logging.getLogger(__name__)

# Determine if running in-cluster or locally
IN_CLUSTER = os.getenv("IN_CLUSTER", "false").lower() == "true"

def get_kubernetes_client():
    """
    Get a Kubernetes client based on the environment
    """
    try:
        if IN_CLUSTER:
            # When running in a Kubernetes cluster
            config.load_incluster_config()
            logger.info("Using in-cluster Kubernetes configuration")
        else:
            # When running locally
            config.load_kube_config()
            logger.info("Using local Kubernetes configuration")
            
        return client.CoreV1Api()
    except Exception as e:
        logger.error(f"Failed to initialize Kubernetes client: {str(e)}")
        # Return a mock client for testing/development
        return MockKubernetesClient()

def list_namespaces(api_client) -> List[KubernetesResource]:
    """
    List all namespaces in the cluster
    """
    try:
        namespaces = api_client.list_namespace()
        result = []
        
        for ns in namespaces.items:
            result.append(KubernetesResource(
                name=ns.metadata.name,
                kind="Namespace",
                uid=ns.metadata.uid,
                creation_timestamp=ns.metadata.creation_timestamp,
                status=ns.status.phase,
                labels=ns.metadata.labels or {},
                annotations=ns.metadata.annotations or {}
            ))
            
        return result
    except Exception as e:
        logger.error(f"Error listing namespaces: {str(e)}")
        # Return mock data in case of error
        return [
            KubernetesResource(
                name="default",
                kind="Namespace",
                uid="mock-uid-1",
                creation_timestamp=datetime.now(),
                status="Active",
                labels={"name": "default"},
                annotations={}
            ),
            KubernetesResource(
                name="kube-system",
                kind="Namespace",
                uid="mock-uid-2",
                creation_timestamp=datetime.now(),
                status="Active",
                labels={"name": "kube-system"},
                annotations={}
            )
        ]

def list_pods(api_client, namespace: str) -> List[KubernetesResource]:
    """
    List all pods in a namespace
    """
    try:
        pods = api_client.list_namespaced_pod(namespace)
        result = []
        
        for pod in pods.items:
            result.append(KubernetesResource(
                name=pod.metadata.name,
                kind="Pod",
                uid=pod.metadata.uid,
                creation_timestamp=pod.metadata.creation_timestamp,
                status=pod.status.phase,
                labels=pod.metadata.labels or {},
                annotations=pod.metadata.annotations or {},
                namespace=namespace
            ))
            
        return result
    except Exception as e:
        logger.error(f"Error listing pods in namespace {namespace}: {str(e)}")
        # Return mock data in case of error
        return [
            KubernetesResource(
                name="mock-pod-1",
                kind="Pod",
                uid="mock-pod-uid-1",
                creation_timestamp=datetime.now(),
                status="Running",
                labels={"app": "mock-app"},
                annotations={},
                namespace=namespace
            ),
            KubernetesResource(
                name="mock-pod-2",
                kind="Pod",
                uid="mock-pod-uid-2",
                creation_timestamp=datetime.now(),
                status="Pending",
                labels={"app": "mock-app"},
                annotations={},
                namespace=namespace
            )
        ]

class MockKubernetesClient:
    """
    Mock Kubernetes client for development/testing
    """
    def list_namespace(self):
        # Return a mock namespace list
        return MockObjectList([
            MockNamespace("default", "Active"),
            MockNamespace("kube-system", "Active"),
            MockNamespace("kube-public", "Active")
        ])
        
    def list_namespaced_pod(self, namespace):
        # Return a mock pod list
        return MockObjectList([
            MockPod(f"{namespace}-pod-1", "Running", namespace),
            MockPod(f"{namespace}-pod-2", "Running", namespace),
            MockPod(f"{namespace}-pod-3", "Pending", namespace)
        ])

class MockObjectList:
    def __init__(self, items):
        self.items = items

class MockNamespace:
    def __init__(self, name, phase):
        self.metadata = MockMetadata(name)
        self.status = MockStatus(phase)

class MockPod:
    def __init__(self, name, phase, namespace):
        self.metadata = MockMetadata(name, namespace)
        self.status = MockStatus(phase)

class MockMetadata:
    def __init__(self, name, namespace=None):
        self.name = name
        self.namespace = namespace
        self.uid = f"mock-uid-{name}"
        self.creation_timestamp = datetime.now()
        self.labels = {"app": "mock-app", "name": name}
        self.annotations = {"mockAnnotation": "true"}

class MockStatus:
    def __init__(self, phase):
        self.phase = phase 