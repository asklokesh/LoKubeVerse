#!/usr/bin/env python
"""Comprehensive API Test Suite based on OpenAPI Specification"""

import requests
import json
import time
from datetime import datetime
from uuid import uuid4

BASE_URL = "http://localhost:8000"

class ComprehensiveAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.access_token = None
        self.test_results = []
        self.session = requests.Session()
        
    def log_test(self, name, method, endpoint, status_code, success, response=None, error=None):
        """Log test results"""
        self.test_results.append({
            "name": name,
            "method": method,
            "endpoint": endpoint,
            "status_code": status_code,
            "success": success,
            "response": response,
            "error": error,
            "timestamp": datetime.now().isoformat()
        })
        
    def make_request(self, method, endpoint, data=None, headers=None, auth_required=False):
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        request_headers = headers or {}
        
        if auth_required and self.access_token:
            request_headers["Authorization"] = f"Bearer {self.access_token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers, timeout=10)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers, timeout=10)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=request_headers, timeout=10)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers, timeout=10)
            else:
                return None, f"Unsupported method: {method}"
                
            return response, None
        except Exception as e:
            return None, str(e)
    
    def test_basic_endpoints(self):
        """Test basic endpoints (/, /health)"""
        print("🔍 Testing Basic Endpoints...")
        
        # Root endpoint
        response, error = self.make_request("GET", "/")
        if response:
            self.log_test("Root Endpoint", "GET", "/", response.status_code, 
                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        else:
            self.log_test("Root Endpoint", "GET", "/", 0, False, error=error)
            
        # Health endpoint
        response, error = self.make_request("GET", "/health")
        if response:
            self.log_test("Health Check", "GET", "/health", response.status_code,
                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        else:
            self.log_test("Health Check", "GET", "/health", 0, False, error=error)
    
    def test_user_management(self):
        """Test user management endpoints"""
        print("🔍 Testing User Management...")
        
        # Create user
        user_data = {
            "email": f"test{uuid4().hex[:8]}@example.com",
            "password": "testpassword123"
        }
        
        response, error = self.make_request("POST", "/api/users/", user_data)
        if response:
            self.log_test("Create User", "POST", "/api/users/", response.status_code,
                         response.status_code in [200, 201], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
            if response.status_code in [200, 201]:
                try:
                    user_resp = response.json()
                    user_id = user_resp.get("id")
                    if user_id:
                        # Get user by ID
                        response, error = self.make_request("GET", f"/api/users/{user_id}")
                        if response:
                            self.log_test("Get User", "GET", f"/api/users/{user_id}", response.status_code,
                                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
                except:
                    pass
        else:
            self.log_test("Create User", "POST", "/api/users/", 0, False, error=error)
    
    def test_tenant_management(self):
        """Test tenant management endpoints"""
        print("🔍 Testing Tenant Management...")
        
        # Create tenant
        tenant_data = {"name": f"test-tenant-{uuid4().hex[:8]}"}
        
        response, error = self.make_request("POST", "/api/tenants/", tenant_data)
        if response:
            self.log_test("Create Tenant", "POST", "/api/tenants/", response.status_code,
                         response.status_code in [200, 201], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
            if response.status_code in [200, 201]:
                try:
                    tenant_resp = response.json()
                    tenant_id = tenant_resp.get("id")
                    if tenant_id:
                        # Get tenant by ID
                        response, error = self.make_request("GET", f"/api/tenants/{tenant_id}")
                        if response:
                            self.log_test("Get Tenant", "GET", f"/api/tenants/{tenant_id}", response.status_code,
                                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
                except:
                    pass
        else:
            self.log_test("Create Tenant", "POST", "/api/tenants/", 0, False, error=error)
    
    def test_authentication_endpoints(self):
        """Test authentication endpoints"""
        print("🔍 Testing Authentication...")
        
        # Register user
        register_data = {
            "username": f"testuser{uuid4().hex[:8]}",
            "email": f"auth{uuid4().hex[:8]}@example.com",
            "password": "testpassword123"
        }
        
        response, error = self.make_request("POST", "/api/auth/register", register_data)
        if response:
            self.log_test("Register User", "POST", "/api/auth/register", response.status_code,
                         response.status_code in [200, 201], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        else:
            self.log_test("Register User", "POST", "/api/auth/register", 0, False, error=error)
        
        # Login (form data)
        login_data = {
            "username": register_data["username"],
            "password": register_data["password"]
        }
        
        # Test form-encoded login
        try:
            response = self.session.post(f"{self.base_url}/api/auth/login", 
                                       data=login_data, 
                                       headers={"Content-Type": "application/x-www-form-urlencoded"},
                                       timeout=10)
            self.log_test("Login User", "POST", "/api/auth/login", response.status_code,
                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
            
            if response.status_code == 200:
                try:
                    token_resp = response.json()
                    self.access_token = token_resp.get("access_token")
                except:
                    pass
        except Exception as e:
            self.log_test("Login User", "POST", "/api/auth/login", 0, False, error=str(e))
        
        # Test auth endpoints that require token
        if self.access_token:
            # Get me
            response, error = self.make_request("GET", "/api/auth/me", auth_required=True)
            if response:
                self.log_test("Get Current User", "GET", "/api/auth/me", response.status_code,
                             response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
            
            # Verify token
            response, error = self.make_request("GET", "/api/auth/verify", auth_required=True)
            if response:
                self.log_test("Verify Token", "GET", "/api/auth/verify", response.status_code,
                             response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Logout
        response, error = self.make_request("POST", "/api/auth/logout")
        if response:
            self.log_test("Logout User", "POST", "/api/auth/logout", response.status_code,
                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
    
    def test_cluster_endpoints(self):
        """Test cluster management endpoints"""
        print("🔍 Testing Cluster Management...")
        
        # List clusters (main endpoint)
        response, error = self.make_request("GET", "/api/clusters/")
        if response:
            self.log_test("List Clusters (Main)", "GET", "/api/clusters/", response.status_code,
                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # List clusters (router endpoint)
        response, error = self.make_request("GET", "/api/clusters/cluster/", auth_required=True)
        if response:
            self.log_test("List Clusters (Router)", "GET", "/api/clusters/cluster/", response.status_code,
                         response.status_code in [200, 401], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Create cluster
        cluster_data = {
            "name": f"test-cluster-{uuid4().hex[:8]}",
            "provider": "aws",
            "region": "us-east-1",
            "kubeconfig": "fake-kubeconfig-content"
        }
        
        response, error = self.make_request("POST", "/api/clusters/cluster/", cluster_data, auth_required=True)
        if response:
            self.log_test("Create Cluster", "POST", "/api/clusters/cluster/", response.status_code,
                         response.status_code in [200, 201, 401], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Test cluster metrics
        test_cluster_id = "test-cluster-123"
        response, error = self.make_request("GET", f"/api/clusters/{test_cluster_id}/metrics")
        if response:
            self.log_test("Get Cluster Metrics", "GET", f"/api/clusters/{test_cluster_id}/metrics", response.status_code,
                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Test cluster operations
        response, error = self.make_request("GET", f"/api/clusters/cluster/{test_cluster_id}")
        if response:
            self.log_test("Get Cluster Details", "GET", f"/api/clusters/cluster/{test_cluster_id}", response.status_code,
                         response.status_code in [200, 404], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Test cluster scaling
        scale_data = {"min_nodes": 1, "max_nodes": 5, "desired_nodes": 3}
        response, error = self.make_request("POST", f"/api/clusters/cluster/{test_cluster_id}/scale", scale_data)
        if response:
            self.log_test("Scale Cluster", "POST", f"/api/clusters/cluster/{test_cluster_id}/scale", response.status_code,
                         response.status_code in [200, 404], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Test namespaces
        response, error = self.make_request("GET", f"/api/clusters/cluster/{test_cluster_id}/namespaces", auth_required=True)
        if response:
            self.log_test("List Cluster Namespaces", "GET", f"/api/clusters/cluster/{test_cluster_id}/namespaces", response.status_code,
                         response.status_code in [200, 401, 404], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Test workloads
        response, error = self.make_request("GET", f"/api/clusters/cluster/{test_cluster_id}/workloads", auth_required=True)
        if response:
            self.log_test("List Cluster Workloads", "GET", f"/api/clusters/cluster/{test_cluster_id}/workloads", response.status_code,
                         response.status_code in [200, 401, 404], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Test RBAC
        response, error = self.make_request("GET", f"/api/clusters/cluster/{test_cluster_id}/rbac")
        if response:
            self.log_test("Get Cluster RBAC", "GET", f"/api/clusters/cluster/{test_cluster_id}/rbac", response.status_code,
                         response.status_code in [200, 404], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Test quotas
        response, error = self.make_request("GET", f"/api/clusters/cluster/{test_cluster_id}/quotas")
        if response:
            self.log_test("Get Cluster Quotas", "GET", f"/api/clusters/cluster/{test_cluster_id}/quotas", response.status_code,
                         response.status_code in [200, 404], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Test cost
        response, error = self.make_request("GET", f"/api/clusters/cluster/{test_cluster_id}/cost")
        if response:
            self.log_test("Get Cluster Cost", "GET", f"/api/clusters/cluster/{test_cluster_id}/cost", response.status_code,
                         response.status_code in [200, 404], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
    
    def test_monitoring_endpoints(self):
        """Test monitoring endpoints"""
        print("🔍 Testing Monitoring...")
        
        test_cluster_id = "test-cluster-123"
        
        endpoints = [
            ("GET", f"/api/monitoring/monitoring/health/{test_cluster_id}", "Cluster Health"),
            ("GET", f"/api/monitoring/monitoring/metrics/{test_cluster_id}", "Cluster Metrics"),
            ("GET", f"/api/monitoring/monitoring/logs/{test_cluster_id}", "Cluster Logs"),
            ("GET", f"/api/monitoring/monitoring/alerts/{test_cluster_id}", "Cluster Alerts"),
            ("GET", f"/api/monitoring/monitoring/cost/{test_cluster_id}", "Cluster Cost Tracking"),
            ("GET", f"/api/monitoring/monitoring/dashboard/{test_cluster_id}", "Cluster Dashboard"),
            ("GET", f"/api/monitoring/monitoring/nodes/{test_cluster_id}", "Cluster Nodes"),
            ("GET", f"/api/monitoring/monitoring/events/{test_cluster_id}", "Cluster Events"),
        ]
        
        for method, endpoint, name in endpoints:
            response, error = self.make_request(method, endpoint, auth_required=True)
            if response:
                self.log_test(name, method, endpoint, response.status_code,
                             response.status_code in [200, 401, 404], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
            else:
                self.log_test(name, method, endpoint, 0, False, error=error)
    
    def test_deployment_endpoints(self):
        """Test deployment endpoints"""
        print("🔍 Testing Deployments...")
        
        # Helm deployment
        helm_data = {
            "chart_name": "nginx",
            "release_name": "test-nginx",
            "cluster_context": "test-cluster"
        }
        
        response, error = self.make_request("POST", "/api/deployments/deployment/helm", helm_data, auth_required=True)
        if response:
            self.log_test("Helm Deploy", "POST", "/api/deployments/deployment/helm", response.status_code,
                         response.status_code in [200, 401], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Manifest deployment
        manifest_data = {
            "manifests": ["apiVersion: v1\nkind: Pod\nmetadata:\n  name: test-pod"],
            "cluster_context": "test-cluster"
        }
        
        response, error = self.make_request("POST", "/api/deployments/deployment/manifest", manifest_data, auth_required=True)
        if response:
            self.log_test("Manifest Deploy", "POST", "/api/deployments/deployment/manifest", response.status_code,
                         response.status_code in [200, 401], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # GitOps deployment
        gitops_data = {
            "repository_url": "https://github.com/example/k8s-manifests",
            "cluster_context": "test-cluster"
        }
        
        response, error = self.make_request("POST", "/api/deployments/deployment/gitops", gitops_data)
        if response:
            self.log_test("GitOps Deploy", "POST", "/api/deployments/deployment/gitops", response.status_code,
                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Deployment history
        response, error = self.make_request("GET", "/api/deployments/deployment/history")
        if response:
            self.log_test("Deployment History", "GET", "/api/deployments/deployment/history", response.status_code,
                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Deployment templates
        response, error = self.make_request("GET", "/api/deployments/deployment/templates")
        if response:
            self.log_test("Deployment Templates", "GET", "/api/deployments/deployment/templates", response.status_code,
                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
    
    def test_gateway_endpoints(self):
        """Test gateway endpoints"""
        print("🔍 Testing Gateway...")
        
        gateway_endpoints = [
            ("GET", "/api/gateway/gateway/route", "Gateway Route"),
            ("GET", "/api/gateway/gateway/rate-limit", "Gateway Rate Limit"),
            ("GET", "/api/gateway/gateway/health", "Gateway Health"),
            ("GET", "/api/gateway/gateway/metrics", "Gateway Metrics"),
        ]
        
        for method, endpoint, name in gateway_endpoints:
            response, error = self.make_request(method, endpoint)
            if response:
                self.log_test(name, method, endpoint, response.status_code,
                             response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
            else:
                self.log_test(name, method, endpoint, 0, False, error=error)
    
    def test_namespace_endpoints(self):
        """Test namespace endpoints"""
        print("🔍 Testing Namespaces...")
        
        # List namespaces
        response, error = self.make_request("GET", "/api/namespaces/")
        if response:
            self.log_test("List Namespaces", "GET", "/api/namespaces/", response.status_code,
                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Create namespace
        ns_data = {
            "name": f"test-namespace-{uuid4().hex[:8]}",
            "cluster_id": str(uuid4())
        }
        
        response, error = self.make_request("POST", "/api/namespaces/", ns_data)
        if response:
            self.log_test("Create Namespace", "POST", "/api/namespaces/", response.status_code,
                         response.status_code in [200, 201], response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
    
    def test_cost_and_audit_endpoints(self):
        """Test cost and audit endpoints"""
        print("🔍 Testing Cost & Audit...")
        
        # Cost summary
        response, error = self.make_request("GET", "/api/cost-summary")
        if response:
            self.log_test("Cost Summary", "GET", "/api/cost-summary", response.status_code,
                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
        
        # Audit logs
        response, error = self.make_request("GET", "/api/audit-logs")
        if response:
            self.log_test("Audit Logs", "GET", "/api/audit-logs", response.status_code,
                         response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text)
    
    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 COMPREHENSIVE API TEST SUITE")
        print("=" * 80)
        print(f"Testing against: {self.base_url}")
        print(f"Test started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        
        # Wait for service
        print("⏳ Waiting for service to be ready...")
        for i in range(10):
            try:
                response, _ = self.make_request("GET", "/health")
                if response and response.status_code == 200:
                    print("✅ Service is ready!")
                    break
            except:
                pass
            time.sleep(1)
        
        # Run test suites
        self.test_basic_endpoints()
        self.test_user_management()
        self.test_tenant_management()
        self.test_authentication_endpoints()
        self.test_cluster_endpoints()
        self.test_monitoring_endpoints()
        self.test_deployment_endpoints()
        self.test_gateway_endpoints()
        self.test_namespace_endpoints()
        self.test_cost_and_audit_endpoints()
        
        # Generate report
        self.generate_report()
    
    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE API TEST REPORT")
        print("=" * 80)
        
        passed = sum(1 for test in self.test_results if test["success"])
        failed = sum(1 for test in self.test_results if not test["success"])
        total = len(self.test_results)
        
        print(f"📈 SUMMARY:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Total: {total}")
        print(f"📈 Success Rate: {(passed/total)*100:.1f}%")
        
        print(f"\n🔍 DETAILED RESULTS:")
        print("-" * 80)
        
        # Group by category
        categories = {}
        for test in self.test_results:
            category = test["endpoint"].split("/")[1] if "/" in test["endpoint"] else "root"
            if category not in categories:
                categories[category] = []
            categories[category].append(test)
        
        for category, tests in categories.items():
            cat_passed = sum(1 for test in tests if test["success"])
            cat_total = len(tests)
            print(f"\n📁 {category.upper()} ({cat_passed}/{cat_total} passed)")
            
            for test in tests:
                status_icon = "✅" if test["success"] else "❌"
                print(f"  {status_icon} {test['name']} - {test['method']} {test['endpoint']} ({test['status_code']})")
                
                if not test["success"]:
                    if test.get("error"):
                        print(f"      Error: {test['error']}")
                    elif test.get("response"):
                        resp_str = str(test["response"])[:100]
                        print(f"      Response: {resp_str}...")
        
        print("\n" + "=" * 80)
        print("🔧 ISSUES FOUND & RECOMMENDATIONS:")
        print("=" * 80)
        
        # Analyze common issues
        auth_failures = [t for t in self.test_results if not t["success"] and t["status_code"] == 401]
        not_found_errors = [t for t in self.test_results if not t["success"] and t["status_code"] == 404]
        server_errors = [t for t in self.test_results if not t["success"] and t["status_code"] >= 500]
        
        if auth_failures:
            print(f"🔐 Authentication Issues: {len(auth_failures)} endpoints require authentication")
            print("   Recommendation: Implement proper token-based auth flow")
        
        if not_found_errors:
            print(f"🔍 Not Found Issues: {len(not_found_errors)} endpoints not implemented")
            print("   Recommendation: Implement missing endpoints or update routing")
        
        if server_errors:
            print(f"🚨 Server Errors: {len(server_errors)} endpoints have internal errors")
            print("   Recommendation: Check server logs and fix implementation bugs")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! API is fully functional.")
        else:
            print(f"\n⚠️  {failed} test(s) need attention. See details above.")
        
        print("=" * 80)

if __name__ == "__main__":
    tester = ComprehensiveAPITester()
    tester.run_all_tests() 