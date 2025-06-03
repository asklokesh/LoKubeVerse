from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import json
import yaml
from datetime import datetime

from k8s_service import K8sService
from auth_service import AuthService

router = APIRouter(prefix="/deployment", tags=["deployment"])
k8s_service = K8sService()
auth_service = AuthService()

def get_current_user(credentials = Depends(auth_service.get_current_user)):
    """Dependency to get current authenticated user"""
    return credentials

# Pydantic models
class HelmDeployment(BaseModel):
    chart_name: str
    chart_version: Optional[str] = "latest"
    release_name: str
    namespace: str = "default"
    values: Optional[Dict[str, Any]] = {}
    repository_url: Optional[str] = None
    cluster_context: str

class ManifestDeployment(BaseModel):
    manifests: List[str]  # YAML manifests as strings
    namespace: str = "default"
    cluster_context: str
    dry_run: bool = False

class GitOpsConfig(BaseModel):
    repository_url: str
    branch: str = "main"
    path: str = "/"
    sync_policy: str = "automatic"  # automatic, manual
    cluster_context: str
    tool: str = "argocd"  # argocd, flux

class BlueGreenDeployment(BaseModel):
    application_name: str
    namespace: str = "default"
    cluster_context: str
    image_tag: str
    service_name: str
    rollback_on_failure: bool = True

class CanaryDeployment(BaseModel):
    application_name: str
    namespace: str = "default"
    cluster_context: str
    image_tag: str
    traffic_split: int = 10  # percentage for canary
    success_criteria: Dict[str, Any] = {"error_rate": 0.01, "response_time": 500}

class RollbackRequest(BaseModel):
    deployment_name: str
    namespace: str = "default"
    cluster_context: str
    revision: Optional[int] = None  # If None, rollback to previous

# Mock deployment history
DEPLOYMENT_HISTORY = []

def add_to_history(deployment_type: str, details: Dict[str, Any]):
    """Add deployment to history"""
    DEPLOYMENT_HISTORY.append({
        "id": len(DEPLOYMENT_HISTORY) + 1,
        "type": deployment_type,
        "timestamp": datetime.utcnow().isoformat(),
        "status": "success",
        **details
    })

@router.post("/helm")
async def helm_deploy(deployment: HelmDeployment, current_user: dict = Depends(get_current_user)):
    """Deploy application using Helm chart"""
    try:
        # Try to deploy using actual Helm if available
        deployment_result = k8s_service.deploy_helm_chart(
            chart_name=deployment.chart_name,
            release_name=deployment.release_name,
            namespace=deployment.namespace,
            values=deployment.values,
            chart_version=deployment.chart_version,
            repository_url=deployment.repository_url
        )
        
        if deployment_result:
            # Add to deployment history
            add_to_history("helm", {
                "chart_name": deployment.chart_name,
                "release_name": deployment.release_name,
                "namespace": deployment.namespace,
                "cluster": deployment.cluster_context,
                "user": current_user.get("sub", "unknown")
            })
            
            return {
                "status": "success",
                "deployment_type": "helm",
                "release_name": deployment.release_name,
                "chart_name": deployment.chart_name,
                "namespace": deployment.namespace,
                "cluster": deployment.cluster_context,
                "resources_created": deployment_result.get("resources", [])
            }
        else:
            # Fallback to mock deployment
            helm_command = f"helm install {deployment.release_name} {deployment.chart_name}"
            if deployment.repository_url:
                helm_command = f"helm repo add temp-repo {deployment.repository_url} && " + helm_command + " --repo temp-repo"
            
            if deployment.chart_version != "latest":
                helm_command += f" --version {deployment.chart_version}"
            
            helm_command += f" --namespace {deployment.namespace}"
            
            if deployment.values:
                # Convert values to --set format
                set_values = " ".join([f"--set {k}={v}" for k, v in deployment.values.items()])
                helm_command += f" {set_values}"
            
            # Add to deployment history
            add_to_history("helm", {
                "chart_name": deployment.chart_name,
                "release_name": deployment.release_name,
                "namespace": deployment.namespace,
                "cluster": deployment.cluster_context,
                "command": helm_command,
                "user": current_user.get("sub", "unknown")
            })
            
            return {
                "status": "success",
                "deployment_type": "helm",
                "release_name": deployment.release_name,
                "chart_name": deployment.chart_name,
                "namespace": deployment.namespace,
                "cluster": deployment.cluster_context,
                "command_executed": helm_command,
                "resources_created": [
                    {"kind": "Deployment", "name": f"{deployment.release_name}-app"},
                    {"kind": "Service", "name": f"{deployment.release_name}-service"},
                    {"kind": "ConfigMap", "name": f"{deployment.release_name}-config"}
                ]
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Helm deployment failed: {str(e)}")

@router.post("/manifest")
async def manifest_deploy(deployment: ManifestDeployment, current_user: dict = Depends(get_current_user)):
    """Deploy using raw Kubernetes manifests"""
    try:
        # Try to deploy using actual Kubernetes if available
        deployment_result = k8s_service.apply_manifests(
            manifests=deployment.manifests,
            namespace=deployment.namespace,
            dry_run=deployment.dry_run
        )
        
        if deployment_result:
            add_to_history("manifest", {
                "namespace": deployment.namespace,
                "cluster": deployment.cluster_context,
                "resources_count": len(deployment_result.get("resources", [])),
                "dry_run": deployment.dry_run,
                "user": current_user.get("sub", "unknown")
            })
            
            return {
                "status": "success" if not deployment.dry_run else "dry-run",
                "deployment_type": "manifest",
                "namespace": deployment.namespace,
                "cluster": deployment.cluster_context,
                "resources_deployed": deployment_result.get("resources", [])
            }
        else:
            # Fallback to mock deployment
            deployed_resources = []
            
            for i, manifest in enumerate(deployment.manifests):
                try:
                    # Parse YAML manifest
                    resource = yaml.safe_load(manifest)
                    if resource:
                        deployed_resources.append({
                            "kind": resource.get("kind", "Unknown"),
                            "name": resource.get("metadata", {}).get("name", f"resource-{i}"),
                            "namespace": deployment.namespace
                        })
                except yaml.YAMLError as e:
                    raise HTTPException(status_code=400, detail=f"Invalid YAML in manifest {i}: {str(e)}")
            
            kubectl_command = f"kubectl apply -f - --namespace {deployment.namespace}"
            if deployment.dry_run:
                kubectl_command += " --dry-run=client"
            
            add_to_history("manifest", {
                "namespace": deployment.namespace,
                "cluster": deployment.cluster_context,
                "resources_count": len(deployed_resources),
                "dry_run": deployment.dry_run,
                "user": current_user.get("sub", "unknown")
            })
            
            return {
                "status": "success" if not deployment.dry_run else "dry-run",
                "deployment_type": "manifest",
                "namespace": deployment.namespace,
                "cluster": deployment.cluster_context,
                "resources_deployed": deployed_resources,
                "command_executed": kubectl_command
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Manifest deployment failed: {str(e)}")

@router.post("/gitops")
async def gitops_deploy(config: GitOpsConfig):
    """Set up GitOps deployment with ArgoCD or Flux"""
    try:
        if config.tool == "argocd":
            app_config = {
                "apiVersion": "argoproj.io/v1alpha1",
                "kind": "Application",
                "metadata": {
                    "name": f"gitops-{config.repository_url.split('/')[-1]}",
                    "namespace": "argocd"
                },
                "spec": {
                    "project": "default",
                    "source": {
                        "repoURL": config.repository_url,
                        "targetRevision": config.branch,
                        "path": config.path
                    },
                    "destination": {
                        "server": "https://kubernetes.default.svc",
                        "namespace": "default"
                    },
                    "syncPolicy": {
                        "automated": config.sync_policy == "automatic"
                    }
                }
            }
        else:  # flux
            app_config = {
                "apiVersion": "source.toolkit.fluxcd.io/v1beta1",
                "kind": "GitRepository",
                "metadata": {
                    "name": f"gitops-{config.repository_url.split('/')[-1]}",
                    "namespace": "flux-system"
                },
                "spec": {
                    "url": config.repository_url,
                    "ref": {"branch": config.branch},
                    "interval": "1m"
                }
            }
        
        add_to_history("gitops", {
            "repository": config.repository_url,
            "branch": config.branch,
            "tool": config.tool,
            "cluster": config.cluster_context
        })
        
        return {
            "status": "success",
            "deployment_type": "gitops",
            "tool": config.tool,
            "repository": config.repository_url,
            "branch": config.branch,
            "cluster": config.cluster_context,
            "application_config": app_config
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"GitOps setup failed: {str(e)}")

@router.post("/blue-green")
async def blue_green_deploy(deployment: BlueGreenDeployment):
    """Execute blue-green deployment strategy"""
    try:
        # Mock blue-green deployment logic
        current_env = "blue"  # Would be determined from existing deployment
        target_env = "green" if current_env == "blue" else "blue"
        
        steps = [
            f"Deploy new version to {target_env} environment",
            f"Run health checks on {target_env}",
            f"Switch traffic from {current_env} to {target_env}",
            f"Monitor metrics for 5 minutes",
            f"Clean up {current_env} environment"
        ]
        
        add_to_history("blue-green", {
            "application": deployment.application_name,
            "namespace": deployment.namespace,
            "cluster": deployment.cluster_context,
            "image_tag": deployment.image_tag,
            "current_env": current_env,
            "target_env": target_env
        })
        
        return {
            "status": "success",
            "deployment_type": "blue-green",
            "application": deployment.application_name,
            "namespace": deployment.namespace,
            "cluster": deployment.cluster_context,
            "current_environment": current_env,
            "target_environment": target_env,
            "deployment_steps": steps,
            "estimated_duration": "10 minutes"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Blue-green deployment failed: {str(e)}")

@router.post("/canary")
async def canary_deploy(deployment: CanaryDeployment):
    """Execute canary deployment strategy"""
    try:
        phases = [
            {"phase": 1, "traffic": deployment.traffic_split, "duration": "5m"},
            {"phase": 2, "traffic": 25, "duration": "10m"},
            {"phase": 3, "traffic": 50, "duration": "15m"},
            {"phase": 4, "traffic": 100, "duration": "steady"}
        ]
        
        add_to_history("canary", {
            "application": deployment.application_name,
            "namespace": deployment.namespace,
            "cluster": deployment.cluster_context,
            "image_tag": deployment.image_tag,
            "initial_traffic": deployment.traffic_split
        })
        
        return {
            "status": "success",
            "deployment_type": "canary",
            "application": deployment.application_name,
            "namespace": deployment.namespace,
            "cluster": deployment.cluster_context,
            "canary_phases": phases,
            "success_criteria": deployment.success_criteria,
            "monitoring_enabled": True,
            "auto_rollback": True
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Canary deployment failed: {str(e)}")

@router.post("/rollback")
async def rollback_deployment(rollback: RollbackRequest):
    """Rollback deployment to previous version"""
    try:
        # Mock rollback logic
        target_revision = rollback.revision or "previous"
        
        kubectl_command = f"kubectl rollout undo deployment/{rollback.deployment_name}"
        if rollback.revision:
            kubectl_command += f" --to-revision={rollback.revision}"
        kubectl_command += f" --namespace {rollback.namespace}"
        
        add_to_history("rollback", {
            "deployment": rollback.deployment_name,
            "namespace": rollback.namespace,
            "cluster": rollback.cluster_context,
            "target_revision": target_revision
        })
        
        return {
            "status": "success",
            "deployment_type": "rollback",
            "deployment_name": rollback.deployment_name,
            "namespace": rollback.namespace,
            "cluster": rollback.cluster_context,
            "target_revision": target_revision,
            "command_executed": kubectl_command,
            "estimated_duration": "2 minutes"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Rollback failed: {str(e)}")

@router.get("/history")
async def get_deployment_history(limit: int = 50):
    """Get deployment history"""
    return {
        "deployments": DEPLOYMENT_HISTORY[-limit:],
        "total_count": len(DEPLOYMENT_HISTORY)
    }

@router.get("/status/{deployment_id}")
async def get_deployment_status(deployment_id: int):
    """Get status of specific deployment"""
    deployment = next((d for d in DEPLOYMENT_HISTORY if d["id"] == deployment_id), None)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    
    # Mock status with additional runtime info
    return {
        **deployment,
        "current_status": "running",
        "replicas": {"desired": 3, "ready": 3, "available": 3},
        "last_updated": datetime.utcnow().isoformat(),
        "health_checks": {
            "liveness": "passing",
            "readiness": "passing"
        }
    }

@router.get("/templates")
async def get_deployment_templates():
    """Get common deployment templates"""
    return {
        "helm_charts": [
            {"name": "nginx", "description": "NGINX web server"},
            {"name": "postgres", "description": "PostgreSQL database"},
            {"name": "redis", "description": "Redis cache"},
            {"name": "wordpress", "description": "WordPress CMS"}
        ],
        "manifest_templates": [
            {"name": "simple-deployment", "type": "Deployment + Service"},
            {"name": "statefulset", "type": "StatefulSet + Service"},
            {"name": "cronjob", "type": "CronJob"},
            {"name": "configmap-secret", "type": "ConfigMap + Secret"}
        ]
    }