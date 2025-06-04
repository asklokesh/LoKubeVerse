import pytest
from kubernetes import client, config
from backend.services.kubernetes_service import KubernetesService

class DummyNode:
    def __init__(self, name):
        self.metadata = type('m', (), {'name': name})

@pytest.fixture(autouse=True)
def mock_k8s(monkeypatch):
    # Mock loading kube config
    monkeypatch.patch('backend.services.kubernetes_service.config.load_kube_config')
    # Create dummy API instance with list_node
    class FakeAPI:
        def list_node(self):
            return type('R', (), {'items': [DummyNode('node1'), DummyNode('node2')]})

    monkeypatch.patch('backend.services.kubernetes_service.client.CoreV1Api', return_value=FakeAPI())
    return FakeAPI()


def test_list_nodes():
    service = KubernetesService()
    nodes = service.list_nodes()
    assert isinstance(nodes, list)
    assert len(nodes) == 2
    assert nodes[0].metadata.name == 'node1'
    assert nodes[1].metadata.name == 'node2' 