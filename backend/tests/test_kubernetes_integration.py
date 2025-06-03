import pytest
from unittest.mock import Mock, patch, AsyncMock
from kubernetes import client, config
from services.k8s_client import KubernetesClient


class TestKubernetesClientAuthentication:
    """Test Kubernetes client authentication and connection"""
    
    def test_kubeconfig_loading(self):
        """Test loading kubeconfig from file"""
        with patch('kubernetes.config.load_kube_config') as mock_load:
            mock_load.return_value = None
            
            k8s_client = KubernetesClient()
            result = k8s_client.load_config('/path/to/kubeconfig')
            
            assert result is True
            mock_load.assert_called_once_with(config_file='/path/to/kubeconfig')

    def test_in_cluster_config_loading(self):
        """Test loading in-cluster configuration"""
        with patch('kubernetes.config.load_incluster_config') as mock_load:
            mock_load.return_value = None
            
            k8s_client = KubernetesClient()
            result = k8s_client.load_incluster_config()
            
            assert result is True
            mock_load.assert_called_once()

    def test_multi_cluster_context_switching(self):
        """Test switching between multiple cluster contexts"""
        with patch('kubernetes.config.load_kube_config') as mock_load:
            mock_load.return_value = None
            
            k8s_client = KubernetesClient()
            result = k8s_client.switch_context('aws-cluster-context')
            
            assert result is True
            mock_load.assert_called_with(context='aws-cluster-context')


class TestKubernetesNamespaceOperations:
    """Test Kubernetes namespace operations"""
    
    def test_list_namespaces(self):
        """Test listing all namespaces"""
        with patch('kubernetes.client.CoreV1Api') as mock_api:
            mock_v1 = Mock()
            mock_api.return_value = mock_v1
            
            mock_namespace_list = Mock()
            mock_namespace_list.items = [
                Mock(metadata=Mock(name='default', creation_timestamp='2023-01-01T00:00:00Z')),
                Mock(metadata=Mock(name='kube-system', creation_timestamp='2023-01-01T00:00:00Z')),
                Mock(metadata=Mock(name='production', creation_timestamp='2023-01-01T00:00:00Z'))
            ]
            mock_v1.list_namespace.return_value = mock_namespace_list
            
            k8s_client = KubernetesClient()
            result = k8s_client.list_namespaces()
            
            assert len(result) == 3
            assert result[0]['name'] == 'default'
            assert result[1]['name'] == 'kube-system'
            assert result[2]['name'] == 'production'

    def test_create_namespace(self):
        """Test creating a new namespace"""
        with patch('kubernetes.client.CoreV1Api') as mock_api:
            mock_v1 = Mock()
            mock_api.return_value = mock_v1
            
            mock_namespace = Mock()
            mock_namespace.metadata.name = 'test-namespace'
            mock_v1.create_namespace.return_value = mock_namespace
            
            k8s_client = KubernetesClient()
            result = k8s_client.create_namespace('test-namespace', labels={'environment': 'test'})
            
            assert result['name'] == 'test-namespace'
            mock_v1.create_namespace.assert_called_once()

    def test_delete_namespace(self):
        """Test deleting a namespace"""
        with patch('kubernetes.client.CoreV1Api') as mock_api:
            mock_v1 = Mock()
            mock_api.return_value = mock_v1
            
            mock_v1.delete_namespace.return_value = Mock()
            
            k8s_client = KubernetesClient()
            result = k8s_client.delete_namespace('test-namespace')
            
            assert result is True
            mock_v1.delete_namespace.assert_called_once_with(name='test-namespace')


class TestKubernetesPodOperations:
    """Test Kubernetes pod operations"""
    
    def test_list_pods(self):
        """Test listing pods in a namespace"""
        with patch('kubernetes.client.CoreV1Api') as mock_api:
            mock_v1 = Mock()
            mock_api.return_value = mock_v1
            
            mock_pod_list = Mock()
            mock_pod_list.items = [
                Mock(
                    metadata=Mock(name='pod-1', namespace='default'),
                    status=Mock(phase='Running', pod_ip='10.244.0.1'),
                    spec=Mock(containers=[Mock(name='app', image='nginx:1.20')])
                ),
                Mock(
                    metadata=Mock(name='pod-2', namespace='default'),
                    status=Mock(phase='Pending', pod_ip=None),
                    spec=Mock(containers=[Mock(name='app', image='redis:6.2')])
                )
            ]
            mock_v1.list_namespaced_pod.return_value = mock_pod_list
            
            k8s_client = KubernetesClient()
            result = k8s_client.list_pods('default')
            
            assert len(result) == 2
            assert result[0]['name'] == 'pod-1'
            assert result[0]['status'] == 'Running'
            assert result[1]['name'] == 'pod-2'
            assert result[1]['status'] == 'Pending'

    def test_create_pod(self):
        """Test creating a pod"""
        with patch('kubernetes.client.CoreV1Api') as mock_api:
            mock_v1 = Mock()
            mock_api.return_value = mock_v1
            
            mock_pod = Mock()
            mock_pod.metadata.name = 'test-pod'
            mock_v1.create_namespaced_pod.return_value = mock_pod
            
            k8s_client = KubernetesClient()
            pod_spec = {
                'apiVersion': 'v1',
                'kind': 'Pod',
                'metadata': {'name': 'test-pod'},
                'spec': {
                    'containers': [{
                        'name': 'test-container',
                        'image': 'nginx:1.20'
                    }]
                }
            }
            result = k8s_client.create_pod('default', pod_spec)
            
            assert result['name'] == 'test-pod'

    def test_delete_pod(self):
        """Test deleting a pod"""
        with patch('kubernetes.client.CoreV1Api') as mock_api:
            mock_v1 = Mock()
            mock_api.return_value = mock_v1
            
            mock_v1.delete_namespaced_pod.return_value = Mock()
            
            k8s_client = KubernetesClient()
            result = k8s_client.delete_pod('default', 'test-pod')
            
            assert result is True
            mock_v1.delete_namespaced_pod.assert_called_once()

    def test_get_pod_logs(self):
        """Test getting pod logs"""
        with patch('kubernetes.client.CoreV1Api') as mock_api:
            mock_v1 = Mock()
            mock_api.return_value = mock_v1
            
            mock_v1.read_namespaced_pod_log.return_value = "Container started\nReady to serve requests\n"
            
            k8s_client = KubernetesClient()
            result = k8s_client.get_pod_logs('default', 'test-pod')
            
            assert 'Container started' in result
            assert 'Ready to serve requests' in result


class TestKubernetesServiceOperations:
    """Test Kubernetes service operations"""
    
    def test_list_services(self):
        """Test listing services in a namespace"""
        with patch('kubernetes.client.CoreV1Api') as mock_api:
            mock_v1 = Mock()
            mock_api.return_value = mock_v1
            
            mock_service_list = Mock()
            mock_service_list.items = [
                Mock(
                    metadata=Mock(name='service-1', namespace='default'),
                    spec=Mock(type='ClusterIP', ports=[Mock(port=80, target_port=8080)]),
                    status=Mock(load_balancer=Mock(ingress=None))
                ),
                Mock(
                    metadata=Mock(name='service-2', namespace='default'),
                    spec=Mock(type='LoadBalancer', ports=[Mock(port=443, target_port=8443)]),
                    status=Mock(load_balancer=Mock(ingress=[Mock(ip='1.2.3.4')]))
                )
            ]
            mock_v1.list_namespaced_service.return_value = mock_service_list
            
            k8s_client = KubernetesClient()
            result = k8s_client.list_services('default')
            
            assert len(result) == 2
            assert result[0]['name'] == 'service-1'
            assert result[0]['type'] == 'ClusterIP'
            assert result[1]['name'] == 'service-2'
            assert result[1]['type'] == 'LoadBalancer'

    def test_create_service(self):
        """Test creating a service"""
        with patch('kubernetes.client.CoreV1Api') as mock_api:
            mock_v1 = Mock()
            mock_api.return_value = mock_v1
            
            mock_service = Mock()
            mock_service.metadata.name = 'test-service'
            mock_v1.create_namespaced_service.return_value = mock_service
            
            k8s_client = KubernetesClient()
            service_spec = {
                'apiVersion': 'v1',
                'kind': 'Service',
                'metadata': {'name': 'test-service'},
                'spec': {
                    'selector': {'app': 'test'},
                    'ports': [{'port': 80, 'targetPort': 8080}]
                }
            }
            result = k8s_client.create_service('default', service_spec)
            
            assert result['name'] == 'test-service'


class TestKubernetesDeploymentOperations:
    """Test Kubernetes deployment operations"""
    
    def test_list_deployments(self):
        """Test listing deployments in a namespace"""
        with patch('kubernetes.client.AppsV1Api') as mock_api:
            mock_apps_v1 = Mock()
            mock_api.return_value = mock_apps_v1
            
            mock_deployment_list = Mock()
            mock_deployment_list.items = [
                Mock(
                    metadata=Mock(name='deployment-1', namespace='default'),
                    spec=Mock(replicas=3),
                    status=Mock(ready_replicas=3, available_replicas=3)
                ),
                Mock(
                    metadata=Mock(name='deployment-2', namespace='default'),
                    spec=Mock(replicas=2),
                    status=Mock(ready_replicas=1, available_replicas=1)
                )
            ]
            mock_apps_v1.list_namespaced_deployment.return_value = mock_deployment_list
            
            k8s_client = KubernetesClient()
            result = k8s_client.list_deployments('default')
            
            assert len(result) == 2
            assert result[0]['name'] == 'deployment-1'
            assert result[0]['replicas'] == 3
            assert result[0]['ready_replicas'] == 3

    def test_create_deployment(self):
        """Test creating a deployment"""
        with patch('kubernetes.client.AppsV1Api') as mock_api:
            mock_apps_v1 = Mock()
            mock_api.return_value = mock_apps_v1
            
            mock_deployment = Mock()
            mock_deployment.metadata.name = 'test-deployment'
            mock_apps_v1.create_namespaced_deployment.return_value = mock_deployment
            
            k8s_client = KubernetesClient()
            deployment_spec = {
                'apiVersion': 'apps/v1',
                'kind': 'Deployment',
                'metadata': {'name': 'test-deployment'},
                'spec': {
                    'replicas': 3,
                    'selector': {'matchLabels': {'app': 'test'}},
                    'template': {
                        'metadata': {'labels': {'app': 'test'}},
                        'spec': {
                            'containers': [{
                                'name': 'test-container',
                                'image': 'nginx:1.20'
                            }]
                        }
                    }
                }
            }
            result = k8s_client.create_deployment('default', deployment_spec)
            
            assert result['name'] == 'test-deployment'

    def test_scale_deployment(self):
        """Test scaling a deployment"""
        with patch('kubernetes.client.AppsV1Api') as mock_api:
            mock_apps_v1 = Mock()
            mock_api.return_value = mock_apps_v1
            
            mock_deployment = Mock()
            mock_deployment.spec.replicas = 5
            mock_apps_v1.patch_namespaced_deployment_scale.return_value = mock_deployment
            
            k8s_client = KubernetesClient()
            result = k8s_client.scale_deployment('default', 'test-deployment', 5)
            
            assert result['replicas'] == 5


class TestKubernetesRBACOperations:
    """Test Kubernetes RBAC operations"""
    
    def test_list_cluster_roles(self):
        """Test listing cluster roles"""
        with patch('kubernetes.client.RbacAuthorizationV1Api') as mock_api:
            mock_rbac_v1 = Mock()
            mock_api.return_value = mock_rbac_v1
            
            mock_cluster_role_list = Mock()
            mock_cluster_role_list.items = [
                Mock(
                    metadata=Mock(name='cluster-admin'),
                    rules=[Mock(verbs=['*'], resources=['*'], api_groups=['*'])]
                ),
                Mock(
                    metadata=Mock(name='view'),
                    rules=[Mock(verbs=['get', 'list', 'watch'], resources=['*'], api_groups=[''])]
                )
            ]
            mock_rbac_v1.list_cluster_role.return_value = mock_cluster_role_list
            
            k8s_client = KubernetesClient()
            result = k8s_client.list_cluster_roles()
            
            assert len(result) == 2
            assert result[0]['name'] == 'cluster-admin'
            assert result[1]['name'] == 'view'

    def test_create_role_binding(self):
        """Test creating a role binding"""
        with patch('kubernetes.client.RbacAuthorizationV1Api') as mock_api:
            mock_rbac_v1 = Mock()
            mock_api.return_value = mock_rbac_v1
            
            mock_role_binding = Mock()
            mock_role_binding.metadata.name = 'test-binding'
            mock_rbac_v1.create_namespaced_role_binding.return_value = mock_role_binding
            
            k8s_client = KubernetesClient()
            role_binding_spec = {
                'apiVersion': 'rbac.authorization.k8s.io/v1',
                'kind': 'RoleBinding',
                'metadata': {'name': 'test-binding', 'namespace': 'default'},
                'subjects': [{
                    'kind': 'User',
                    'name': 'test-user',
                    'apiGroup': 'rbac.authorization.k8s.io'
                }],
                'roleRef': {
                    'kind': 'ClusterRole',
                    'name': 'edit',
                    'apiGroup': 'rbac.authorization.k8s.io'
                }
            }
            result = k8s_client.create_role_binding('default', role_binding_spec)
            
            assert result['name'] == 'test-binding'


class TestKubernetesNetworkPolicyOperations:
    """Test Kubernetes network policy operations"""
    
    def test_list_network_policies(self):
        """Test listing network policies in a namespace"""
        with patch('kubernetes.client.NetworkingV1Api') as mock_api:
            mock_networking_v1 = Mock()
            mock_api.return_value = mock_networking_v1
            
            mock_policy_list = Mock()
            mock_policy_list.items = [
                Mock(
                    metadata=Mock(name='deny-all', namespace='default'),
                    spec=Mock(
                        pod_selector=Mock(),
                        policy_types=['Ingress', 'Egress']
                    )
                ),
                Mock(
                    metadata=Mock(name='allow-frontend', namespace='default'),
                    spec=Mock(
                        pod_selector=Mock(match_labels={'app': 'frontend'}),
                        policy_types=['Ingress']
                    )
                )
            ]
            mock_networking_v1.list_namespaced_network_policy.return_value = mock_policy_list
            
            k8s_client = KubernetesClient()
            result = k8s_client.list_network_policies('default')
            
            assert len(result) == 2
            assert result[0]['name'] == 'deny-all'
            assert result[1]['name'] == 'allow-frontend'

    def test_create_network_policy(self):
        """Test creating a network policy"""
        with patch('kubernetes.client.NetworkingV1Api') as mock_api:
            mock_networking_v1 = Mock()
            mock_api.return_value = mock_networking_v1
            
            mock_policy = Mock()
            mock_policy.metadata.name = 'test-policy'
            mock_networking_v1.create_namespaced_network_policy.return_value = mock_policy
            
            k8s_client = KubernetesClient()
            policy_spec = {
                'apiVersion': 'networking.k8s.io/v1',
                'kind': 'NetworkPolicy',
                'metadata': {'name': 'test-policy', 'namespace': 'default'},
                'spec': {
                    'podSelector': {'matchLabels': {'app': 'test'}},
                    'policyTypes': ['Ingress'],
                    'ingress': [{
                        'from': [{'podSelector': {'matchLabels': {'role': 'frontend'}}}],
                        'ports': [{'protocol': 'TCP', 'port': 8080}]
                    }]
                }
            }
            result = k8s_client.create_network_policy('default', policy_spec)
            
            assert result['name'] == 'test-policy'


class TestKubernetesResourceQuotaOperations:
    """Test Kubernetes resource quota operations"""
    
    def test_list_resource_quotas(self):
        """Test listing resource quotas in a namespace"""
        with patch('kubernetes.client.CoreV1Api') as mock_api:
            mock_v1 = Mock()
            mock_api.return_value = mock_v1
            
            mock_quota_list = Mock()
            mock_quota_list.items = [
                Mock(
                    metadata=Mock(name='default-quota', namespace='default'),
                    spec=Mock(hard={'cpu': '4', 'memory': '8Gi', 'pods': '10'}),
                    status=Mock(used={'cpu': '2', 'memory': '4Gi', 'pods': '5'})
                )
            ]
            mock_v1.list_namespaced_resource_quota.return_value = mock_quota_list
            
            k8s_client = KubernetesClient()
            result = k8s_client.list_resource_quotas('default')
            
            assert len(result) == 1
            assert result[0]['name'] == 'default-quota'
            assert result[0]['hard']['cpu'] == '4'
            assert result[0]['used']['cpu'] == '2'

    def test_create_resource_quota(self):
        """Test creating a resource quota"""
        with patch('kubernetes.client.CoreV1Api') as mock_api:
            mock_v1 = Mock()
            mock_api.return_value = mock_v1
            
            mock_quota = Mock()
            mock_quota.metadata.name = 'test-quota'
            mock_v1.create_namespaced_resource_quota.return_value = mock_quota
            
            k8s_client = KubernetesClient()
            quota_spec = {
                'apiVersion': 'v1',
                'kind': 'ResourceQuota',
                'metadata': {'name': 'test-quota', 'namespace': 'default'},
                'spec': {
                    'hard': {
                        'cpu': '8',
                        'memory': '16Gi',
                        'pods': '20'
                    }
                }
            }
            result = k8s_client.create_resource_quota('default', quota_spec)
            
            assert result['name'] == 'test-quota'
