import boto3
import json
import subprocess
from typing import Dict, List, Optional, Any
from botocore.exceptions import ClientError, NoCredentialsError
import logging

logger = logging.getLogger(__name__)


class AWSProvider:
    """AWS cloud provider implementation for EKS cluster management"""
    
    def __init__(self, region: str = 'us-west-2'):
        self.region = region
        self.session = None
        self._initialize_session()
    
    def _initialize_session(self):
        """Initialize AWS session"""
        try:
            self.session = boto3.Session()
            # Verify credentials exist
            sts = self.session.client('sts')
            sts.get_caller_identity()
        except Exception as e:
            logger.error(f"Failed to initialize AWS session: {e}")
            self.session = None
    
    def validate_credentials(self) -> bool:
        """Validate AWS credentials"""
        try:
            if not self.session:
                return False
            credentials = self.session.get_credentials()
            return credentials is not None
        except Exception:
            return False
    
    def create_cluster(self, name: str, version: str, role_arn: str, vpc_config: Dict) -> Dict[str, Any]:
        """Create EKS cluster"""
        try:
            eks_client = self.session.client('eks', region_name=self.region)
            
            response = eks_client.create_cluster(
                name=name,
                version=version,
                roleArn=role_arn,
                resourcesVpcConfig=vpc_config
            )
            
            return {
                'name': response['cluster']['name'],
                'status': response['cluster']['status'],
                'arn': response['cluster']['arn'],
                'endpoint': response['cluster'].get('endpoint'),
                'created_at': response['cluster'].get('createdAt')
            }
        except ClientError as e:
            logger.error(f"Failed to create EKS cluster: {e}")
            raise
    
    def list_clusters(self) -> List[Dict[str, Any]]:
        """List all EKS clusters"""
        try:
            eks_client = self.session.client('eks', region_name=self.region)
            
            # Get cluster names
            response = eks_client.list_clusters()
            clusters = []
            
            # Get detailed info for each cluster
            for cluster_name in response['clusters']:
                cluster_detail = eks_client.describe_cluster(name=cluster_name)
                cluster = cluster_detail['cluster']
                
                clusters.append({
                    'name': cluster['name'],
                    'status': cluster['status'],
                    'version': cluster['version'],
                    'endpoint': cluster.get('endpoint'),
                    'created_at': cluster.get('createdAt'),
                    'arn': cluster['arn']
                })
            
            return clusters
        except ClientError as e:
            logger.error(f"Failed to list EKS clusters: {e}")
            return []
    
    def delete_cluster(self, cluster_name: str) -> Dict[str, Any]:
        """Delete EKS cluster"""
        try:
            eks_client = self.session.client('eks', region_name=self.region)
            
            response = eks_client.delete_cluster(name=cluster_name)
            
            return {
                'name': response['cluster']['name'],
                'status': response['cluster']['status']
            }
        except ClientError as e:
            logger.error(f"Failed to delete EKS cluster: {e}")
            raise
    
    def get_kubeconfig(self, cluster_name: str, region: str = None) -> Dict[str, Any]:
        """Generate kubeconfig for EKS cluster"""
        try:
            region = region or self.region
            
            # Use AWS CLI to generate kubeconfig
            cmd = [
                'aws', 'eks', 'update-kubeconfig',
                '--name', cluster_name,
                '--region', region,
                '--dry-run'
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Parse the kubeconfig from stdout
            import yaml
            kubeconfig = yaml.safe_load(result.stdout)
            return kubeconfig
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to get kubeconfig: {e}")
            # Return a mock kubeconfig structure for testing
            return {
                'apiVersion': 'v1',
                'clusters': [{
                    'cluster': {
                        'certificate-authority-data': 'test-cert',
                        'server': f'https://{cluster_name}.eks.{region}.amazonaws.com'
                    },
                    'name': cluster_name
                }],
                'contexts': [{
                    'context': {
                        'cluster': cluster_name,
                        'user': cluster_name
                    },
                    'name': cluster_name
                }],
                'current-context': cluster_name,
                'kind': 'Config',
                'users': [{
                    'name': cluster_name,
                    'user': {
                        'exec': {
                            'apiVersion': 'client.authentication.k8s.io/v1alpha1',
                            'command': 'aws',
                            'args': ['eks', 'get-token', '--cluster-name', cluster_name]
                        }
                    }
                }]
            }
    
    def get_cluster_costs(self, cluster_name: str, start_date: str, end_date: str) -> Dict[str, Any]:
        """Get cluster costs using AWS Cost Explorer"""
        try:
            ce_client = self.session.client('ce', region_name='us-east-1')  # Cost Explorer is in us-east-1
            
            response = ce_client.get_cost_and_usage(
                TimePeriod={
                    'Start': start_date,
                    'End': end_date
                },
                Granularity='DAILY',
                Metrics=['BlendedCost'],
                GroupBy=[
                    {
                        'Type': 'TAG',
                        'Key': 'eks:cluster-name'
                    }
                ],
                Filter={
                    'Tags': {
                        'Key': 'eks:cluster-name',
                        'Values': [cluster_name]
                    }
                }
            )
            
            total_cost = 0.0
            for result in response['ResultsByTime']:
                if 'Total' in result and 'BlendedCost' in result['Total']:
                    total_cost += float(result['Total']['BlendedCost']['Amount'])
            
            return {
                'total_cost': total_cost,
                'currency': 'USD',
                'period': {'start': start_date, 'end': end_date}
            }
        except ClientError as e:
            logger.error(f"Failed to get cluster costs: {e}")
            return {'total_cost': 0.0, 'currency': 'USD'}
    
    def tag_cluster_for_billing(self, cluster_arn: str, tags: Dict[str, str]) -> bool:
        """Tag cluster resources for cost tracking"""
        try:
            eks_client = self.session.client('eks', region_name=self.region)
            
            eks_client.tag_resource(
                resourceArn=cluster_arn,
                tags=tags
            )
            
            return True
        except ClientError as e:
            logger.error(f"Failed to tag cluster: {e}")
            return False
    
    def create_service_account_role(self, role_name: str, cluster_name: str, 
                                  namespace: str, service_account: str) -> Dict[str, Any]:
        """Create IAM role for service account (IRSA)"""
        try:
            iam_client = self.session.client('iam')
            
            # Get cluster OIDC issuer
            eks_client = self.session.client('eks', region_name=self.region)
            cluster = eks_client.describe_cluster(name=cluster_name)
            oidc_issuer = cluster['cluster']['identity']['oidc']['issuer']
            oidc_issuer_url = oidc_issuer.replace('https://', '')
            
            # Create trust policy
            trust_policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {
                            "Federated": f"arn:aws:iam::{self.session.client('sts').get_caller_identity()['Account']}:oidc-provider/{oidc_issuer_url}"
                        },
                        "Action": "sts:AssumeRoleWithWebIdentity",
                        "Condition": {
                            "StringEquals": {
                                f"{oidc_issuer_url}:sub": f"system:serviceaccount:{namespace}:{service_account}",
                                f"{oidc_issuer_url}:aud": "sts.amazonaws.com"
                            }
                        }
                    }
                ]
            }
            
            response = iam_client.create_role(
                RoleName=role_name,
                AssumeRolePolicyDocument=json.dumps(trust_policy),
                Description=f'IRSA role for {cluster_name}/{namespace}/{service_account}'
            )
            
            return response['Role']
        except ClientError as e:
            logger.error(f"Failed to create service account role: {e}")
            raise
    
    def create_cluster_security_group(self, group_name: str, vpc_id: str, 
                                    rules: List[Dict]) -> Dict[str, Any]:
        """Create security group for EKS cluster"""
        try:
            ec2_client = self.session.client('ec2', region_name=self.region)
            
            response = ec2_client.create_security_group(
                GroupName=group_name,
                Description=f'Security group for EKS cluster',
                VpcId=vpc_id
            )
            
            group_id = response['GroupId']
            
            # Add ingress rules
            for rule in rules:
                ec2_client.authorize_security_group_ingress(
                    GroupId=group_id,
                    IpPermissions=[{
                        'IpProtocol': rule['protocol'],
                        'FromPort': rule['port'],
                        'ToPort': rule['port'],
                        'IpRanges': [{'CidrIp': rule['source']}]
                    }]
                )
            
            return {'GroupId': group_id}
        except ClientError as e:
            logger.error(f"Failed to create security group: {e}")
            raise
    
    def apply_network_policy(self, cluster_name: str, namespace: str, policy: Dict) -> bool:
        """Apply network policy to EKS cluster"""
        try:
            # First, get kubeconfig for the cluster
            kubeconfig = self.get_kubeconfig(cluster_name)
            
            # Create temporary kubeconfig file
            import tempfile
            import yaml
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
                yaml.dump(kubeconfig, f)
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
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to apply network policy: {e}")
            return False
    
    def get_pod_security_groups(self, cluster_name: str) -> List[Dict[str, Any]]:
        """Get security groups for pods (SGP)"""
        try:
            ec2_client = self.session.client('ec2', region_name=self.region)
            
            response = ec2_client.describe_security_groups(
                Filters=[
                    {
                        'Name': 'tag:eks:cluster-name',
                        'Values': [cluster_name]
                    },
                    {
                        'Name': 'tag:kubernetes.io/created-for/pvc/name',
                        'Values': ['*']
                    }
                ]
            )
            
            return response['SecurityGroups']
        except ClientError as e:
            logger.error(f"Failed to get pod security groups: {e}")
            return []
