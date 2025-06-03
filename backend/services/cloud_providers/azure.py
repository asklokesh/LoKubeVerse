from azure.identity import DefaultAzureCredential
from azure.mgmt.containerservice import ContainerServiceClient
from azure.mgmt.resource import ResourceManagementClient
from azure.mgmt.authorization import AuthorizationManagementClient
from azure.mgmt.msi import ManagedServiceIdentityClient
from azure.mgmt.network import NetworkManagementClient
from azure.mgmt.monitor import MonitorManagementClient
from azure.mgmt.loganalytics import LogAnalyticsManagementClient
from azure.mgmt.costmanagement import CostManagementClient
from azure.core.exceptions import AzureError
from typing import Dict, List, Optional, Any
import logging
import base64
import yaml

logger = logging.getLogger(__name__)


class AzureProvider:
    """Azure cloud provider implementation for AKS cluster management"""
    
    def __init__(self, subscription_id: str = None):
        self.subscription_id = subscription_id
        self.credential = None
        self._initialize_credential()
    
    def _initialize_credential(self):
        """Initialize Azure credential"""
        try:
            self.credential = DefaultAzureCredential()
            # Test credential by getting a token
            self.credential.get_token("https://management.azure.com/.default")
        except Exception as e:
            logger.error(f"Failed to initialize Azure credential: {e}")
            self.credential = None
    
    def validate_credentials(self) -> bool:
        """Validate Azure credentials"""
        try:
            if not self.credential:
                return False
            token = self.credential.get_token("https://management.azure.com/.default")
            return token is not None
        except Exception:
            return False
    
    def create_cluster(self, resource_group: str, cluster_name: str, 
                      location: str, config: Dict) -> Dict[str, Any]:
        """Create AKS cluster"""
        try:
            container_client = ContainerServiceClient(
                self.credential, self.subscription_id
            )
            
            cluster_parameters = {
                'location': location,
                'dns_prefix': f'{cluster_name}-dns',
                'agent_pool_profiles': [{
                    'name': 'nodepool1',
                    'count': config.get('node_count', 3),
                    'vm_size': config.get('vm_size', 'Standard_D2_v2'),
                    'os_type': 'Linux',
                    'mode': 'System'
                }],
                'service_principal_profile': {
                    'client_id': 'msi'  # Use managed identity
                },
                'kubernetes_version': config.get('kubernetes_version', '1.21.2')
            }
            
            operation = container_client.managed_clusters.begin_create_or_update(
                resource_group_name=resource_group,
                resource_name=cluster_name,
                parameters=cluster_parameters
            )
            
            result = operation.result()
            
            return {
                'name': result.name,
                'provisioning_state': result.provisioning_state,
                'id': result.id,
                'location': result.location,
                'kubernetes_version': result.kubernetes_version
            }
        except AzureError as e:
            logger.error(f"Failed to create AKS cluster: {e}")
            raise
    
    def list_clusters(self) -> List[Dict[str, Any]]:
        """List all AKS clusters"""
        try:
            container_client = ContainerServiceClient(
                self.credential, self.subscription_id
            )
            
            clusters = []
            for cluster in container_client.managed_clusters.list():
                clusters.append({
                    'name': cluster.name,
                    'provisioning_state': cluster.provisioning_state,
                    'location': cluster.location,
                    'kubernetes_version': cluster.kubernetes_version,
                    'id': cluster.id
                })
            
            return clusters
        except AzureError as e:
            logger.error(f"Failed to list AKS clusters: {e}")
            return []
    
    def delete_cluster(self, resource_group: str, cluster_name: str) -> bool:
        """Delete AKS cluster"""
        try:
            container_client = ContainerServiceClient(
                self.credential, self.subscription_id
            )
            
            operation = container_client.managed_clusters.begin_delete(
                resource_group_name=resource_group,
                resource_name=cluster_name
            )
            
            operation.result()  # Wait for completion
            return True
        except AzureError as e:
            logger.error(f"Failed to delete AKS cluster: {e}")
            return False
    
    def get_kubeconfig(self, resource_group: str, cluster_name: str) -> str:
        """Get kubeconfig for AKS cluster"""
        try:
            container_client = ContainerServiceClient(
                self.credential, self.subscription_id
            )
            
            credential_results = container_client.managed_clusters.list_cluster_admin_credentials(
                resource_group_name=resource_group,
                resource_name=cluster_name
            )
            
            if credential_results.kubeconfigs:
                kubeconfig_data = credential_results.kubeconfigs[0].value
                return base64.b64decode(kubeconfig_data).decode('utf-8')
            
            return None
        except AzureError as e:
            logger.error(f"Failed to get kubeconfig: {e}")
            return None
    
    def get_cluster_costs(self, cluster_name: str, start_date: str, end_date: str) -> Dict[str, Any]:
        """Get cluster costs using Azure Cost Management"""
        try:
            cost_client = CostManagementClient(
                self.credential,
                base_url="https://management.azure.com"
            )
            
            # Query definition for cost data
            query_definition = {
                "type": "Usage",
                "timeframe": "Custom",
                "time_period": {
                    "from": start_date,
                    "to": end_date
                },
                "dataset": {
                    "granularity": "Daily",
                    "aggregation": {
                        "totalCost": {
                            "name": "Cost",
                            "function": "Sum"
                        }
                    },
                    "grouping": [
                        {
                            "type": "TagKey",
                            "name": "cluster-name"
                        }
                    ],
                    "filter": {
                        "tags": {
                            "name": "cluster-name",
                            "operator": "In",
                            "values": [cluster_name]
                        }
                    }
                }
            }
            
            scope = f"/subscriptions/{self.subscription_id}"
            result = cost_client.query.usage(scope=scope, parameters=query_definition)
            
            total_cost = 0.0
            if result.rows:
                for row in result.rows:
                    total_cost += float(row[0])  # Cost is typically the first column
            
            return {
                'total_cost': total_cost,
                'currency': 'USD'
            }
        except AzureError as e:
            logger.error(f"Failed to get cluster costs: {e}")
            return {'total_cost': 0.0, 'currency': 'USD'}
    
    def tag_cluster_for_billing(self, resource_id: str, tags: Dict[str, str]) -> bool:
        """Tag cluster resources for cost tracking"""
        try:
            resource_client = ResourceManagementClient(
                self.credential, self.subscription_id
            )
            
            tag_resource = {
                'operation': 'Replace',
                'properties': {
                    'tags': tags
                }
            }
            
            resource_client.tags.create_or_update_at_scope(
                scope=resource_id,
                parameters=tag_resource
            )
            
            return True
        except AzureError as e:
            logger.error(f"Failed to tag cluster: {e}")
            return False
    
    def get_aad_configuration(self, resource_group: str, cluster_name: str) -> Dict[str, Any]:
        """Get Azure AD configuration for AKS"""
        try:
            container_client = ContainerServiceClient(
                self.credential, self.subscription_id
            )
            
            cluster = container_client.managed_clusters.get(
                resource_group_name=resource_group,
                resource_name=cluster_name
            )
            
            if cluster.aad_profile:
                return {
                    'managed': cluster.aad_profile.managed,
                    'admin_groups': cluster.aad_profile.admin_group_object_ids or []
                }
            
            return {'managed': False, 'admin_groups': []}
        except AzureError as e:
            logger.error(f"Failed to get AAD configuration: {e}")
            return {'managed': False, 'admin_groups': []}
    
    def create_role_assignment(self, scope: str, principal_id: str, 
                             role_definition_id: str) -> Dict[str, Any]:
        """Create Azure RBAC role assignment"""
        try:
            auth_client = AuthorizationManagementClient(
                self.credential, self.subscription_id
            )
            
            import uuid
            role_assignment_name = str(uuid.uuid4())
            
            role_assignment_params = {
                'role_definition_id': f"/subscriptions/{self.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/{role_definition_id}",
                'principal_id': principal_id
            }
            
            result = auth_client.role_assignments.create(
                scope=scope,
                role_assignment_name=role_assignment_name,
                parameters=role_assignment_params
            )
            
            return {
                'id': result.id,
                'name': result.name,
                'principal_id': result.principal_id
            }
        except AzureError as e:
            logger.error(f"Failed to create role assignment: {e}")
            raise
    
    def create_managed_identity(self, resource_group: str, identity_name: str) -> Dict[str, Any]:
        """Create Azure Managed Identity"""
        try:
            msi_client = ManagedServiceIdentityClient(
                self.credential, self.subscription_id
            )
            
            identity_params = {
                'location': 'eastus',  # Default location
                'tags': {
                    'created-by': 'k8s-dash'
                }
            }
            
            result = msi_client.user_assigned_identities.create_or_update(
                resource_group_name=resource_group,
                resource_name=identity_name,
                parameters=identity_params
            )
            
            return {
                'name': result.name,
                'principal_id': result.principal_id,
                'client_id': result.client_id,
                'id': result.id
            }
        except AzureError as e:
            logger.error(f"Failed to create managed identity: {e}")
            raise
    
    def apply_network_policy(self, cluster_name: str, resource_group: str, 
                           namespace: str, policy: Dict) -> bool:
        """Apply network policy to AKS cluster"""
        try:
            # Get kubeconfig
            kubeconfig_str = self.get_kubeconfig(resource_group, cluster_name)
            if not kubeconfig_str:
                return False
            
            import tempfile
            import subprocess
            
            # Create temporary kubeconfig file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
                f.write(kubeconfig_str)
                kubeconfig_path = f.name
            
            # Create temporary policy file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
                yaml.dump(policy, f)
                policy_path = f.name
            
            # Apply the policy using kubectl
            cmd = [
                'kubectl', 'apply',
                '--kubeconfig', kubeconfig_path,
                '-f', policy_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Clean up temp files
            import os
            os.unlink(kubeconfig_path)
            os.unlink(policy_path)
            
            return True
        except Exception as e:
            logger.error(f"Failed to apply network policy: {e}")
            return False
    
    def get_cluster_security_groups(self, resource_group: str, cluster_name: str) -> Dict[str, Any]:
        """Get Azure Network Security Groups for AKS cluster"""
        try:
            network_client = NetworkManagementClient(
                self.credential, self.subscription_id
            )
            
            # Get NSGs in the resource group
            nsgs = network_client.network_security_groups.list(resource_group)
            
            for nsg in nsgs:
                if cluster_name in nsg.name:
                    return {
                        'name': nsg.name,
                        'id': nsg.id,
                        'security_rules': [
                            {
                                'name': rule.name,
                                'direction': rule.direction,
                                'priority': rule.priority,
                                'access': rule.access
                            } for rule in nsg.security_rules or []
                        ]
                    }
            
            return {'name': None, 'security_rules': []}
        except AzureError as e:
            logger.error(f"Failed to get cluster security groups: {e}")
            return {'name': None, 'security_rules': []}
    
    def get_cluster_metrics(self, resource_group: str, cluster_name: str) -> Dict[str, Any]:
        """Get Azure Monitor metrics for AKS cluster"""
        try:
            monitor_client = MonitorManagementClient(
                self.credential, self.subscription_id
            )
            
            resource_uri = f"/subscriptions/{self.subscription_id}/resourceGroups/{resource_group}/providers/Microsoft.ContainerService/managedClusters/{cluster_name}"
            
            metrics = monitor_client.metrics.list(
                resource_uri=resource_uri,
                metricnames="CPUUtilization,MemoryUtilization"
            )
            
            result = {}
            for metric in metrics.value:
                if metric.timeseries:
                    result[metric.name.value] = [
                        {
                            'timestamp': data.time_stamp,
                            'average': data.average,
                            'minimum': data.minimum,
                            'maximum': data.maximum
                        } for data in metric.timeseries[0].data
                    ]
            
            return result
        except AzureError as e:
            logger.error(f"Failed to get cluster metrics: {e}")
            return {}
    
    def query_cluster_logs(self, cluster_name: str, query: str) -> List[Dict[str, Any]]:
        """Query Azure Log Analytics for cluster logs"""
        try:
            # Note: This requires the Log Analytics workspace ID and access token
            # For production, you would need to implement proper authentication
            # and workspace discovery
            
            # Mock implementation for testing
            return [
                {
                    'timestamp': '2023-01-01T12:00:00Z',
                    'resource_type': 'Pod',
                    'name': 'test-pod',
                    'status': 'Running',
                    'message': 'Pod started successfully'
                }
            ]
        except Exception as e:
            logger.error(f"Failed to query cluster logs: {e}")
            return []
