from kubernetes import config, client

class KubernetesService:
    """
    Service to interact with Kubernetes API for cluster information.
    """
    def __init__(self):
        """
        Initialize KubernetesService, loading cluster configuration.
        Falls back gracefully if no kubeconfig is found.
        """
        self.core_api = None
        self.apps_api = None
        
        try:
            config.load_kube_config()
        except Exception:
            try:
                config.load_incluster_config()
            except Exception:
                # Could not load any Kubernetes configuration
                return
        try:
            self.core_api = client.CoreV1Api()
            self.apps_api = client.AppsV1Api()
        except Exception:
            self.core_api = None
            self.apps_api = None

    def list_nodes(self):
        """
        List all nodes in the Kubernetes cluster.
        Returns a list of V1Node objects.
        """
        if not self.core_api:
            return []
        try:
            return self.core_api.list_node().items
        except Exception:
            return []
            
    def list_pods(self, namespace=None):
        """
        List all pods in the Kubernetes cluster or in a specific namespace.
        Returns a list of V1Pod objects.
        """
        if not self.core_api:
            return []
        try:
            if namespace:
                return self.core_api.list_namespaced_pod(namespace).items
            else:
                return self.core_api.list_pod_for_all_namespaces().items
        except Exception:
            return []
    
    def list_deployments(self, namespace=None):
        """
        List all deployments in the Kubernetes cluster or in a specific namespace.
        Returns a list of V1Deployment objects.
        """
        if not self.apps_api:
            return []
        try:
            if namespace:
                return self.apps_api.list_namespaced_deployment(namespace).items
            else:
                return self.apps_api.list_deployment_for_all_namespaces().items
        except Exception:
            return []
            
    def list_stateful_sets(self, namespace=None):
        """
        List all stateful sets in the Kubernetes cluster or in a specific namespace.
        Returns a list of V1StatefulSet objects.
        """
        if not self.apps_api:
            return []
        try:
            if namespace:
                return self.apps_api.list_namespaced_stateful_set(namespace).items
            else:
                return self.apps_api.list_stateful_set_for_all_namespaces().items
        except Exception:
            return []
            
    def list_daemon_sets(self, namespace=None):
        """
        List all daemon sets in the Kubernetes cluster or in a specific namespace.
        Returns a list of V1DaemonSet objects.
        """
        if not self.apps_api:
            return []
        try:
            if namespace:
                return self.apps_api.list_namespaced_daemon_set(namespace).items
            else:
                return self.apps_api.list_daemon_set_for_all_namespaces().items
        except Exception:
            return []

    # Additional methods for other resources can be added here 