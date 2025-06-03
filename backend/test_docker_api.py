#!/usr/bin/env python
"""Comprehensive API test using curl commands"""

import subprocess
import json
import time
import sys

class APITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.access_token = None
        self.test_results = []
        
    def curl_request(self, endpoint, method="GET", data=None, headers=None):
        """Execute curl request and return response"""
        cmd = ["curl", "-s", "-X", method]
        
        if headers:
            for key, value in headers.items():
                cmd.extend(["-H", f"{key}: {value}"])
        
        if data:
            cmd.extend(["-H", "Content-Type: application/json"])
            cmd.extend(["-d", json.dumps(data)])
        
        cmd.append(f"{self.base_url}{endpoint}")
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            return {
                "status_code": 200 if result.returncode == 0 else 500,
                "response": result.stdout,
                "error": result.stderr
            }
        except subprocess.TimeoutExpired:
            return {
                "status_code": 408,
                "response": "",
                "error": "Request timeout"
            }
    
    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("🔍 Testing Health Endpoints...")
        
        # Test root endpoint
        result = self.curl_request("/")
        self.test_results.append({
            "test": "Root Endpoint",
            "endpoint": "/",
            "method": "GET",
            "status": "✅ PASS" if "Welcome to K8s-Dash API" in result["response"] else "❌ FAIL",
            "response": result["response"]
        })
        
        # Test health endpoint
        result = self.curl_request("/health")
        self.test_results.append({
            "test": "Health Check",
            "endpoint": "/health",
            "method": "GET", 
            "status": "✅ PASS" if "healthy" in result["response"] else "❌ FAIL",
            "response": result["response"]
        })
    
    def test_user_management(self):
        """Test user creation and management"""
        print("🔍 Testing User Management...")
        
        # Create a test user
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        
        result = self.curl_request("/api/users/", "POST", user_data)
        self.test_results.append({
            "test": "Create User",
            "endpoint": "/api/users/",
            "method": "POST",
            "status": "✅ PASS" if '"id"' in result["response"] else "❌ FAIL",
            "response": result["response"]
        })
        
        # Try to create duplicate user
        result = self.curl_request("/api/users/", "POST", user_data)
        self.test_results.append({
            "test": "Duplicate User Check",
            "endpoint": "/api/users/",
            "method": "POST",
            "status": "✅ PASS" if "already registered" in result["response"] else "❌ FAIL",
            "response": result["response"]
        })
    
    def test_tenant_management(self):
        """Test tenant operations"""
        print("🔍 Testing Tenant Management...")
        
        # Create a tenant
        tenant_data = {"name": "test-tenant"}
        result = self.curl_request("/api/tenants/", "POST", tenant_data)
        tenant_id = None
        
        try:
            response_data = json.loads(result["response"])
            tenant_id = response_data.get("id")
        except:
            pass
        
        self.test_results.append({
            "test": "Create Tenant",
            "endpoint": "/api/tenants/",
            "method": "POST",
            "status": "✅ PASS" if tenant_id else "❌ FAIL",
            "response": result["response"]
        })
        
        # Get tenant by ID
        if tenant_id:
            result = self.curl_request(f"/api/tenants/{tenant_id}")
            self.test_results.append({
                "test": "Get Tenant",
                "endpoint": f"/api/tenants/{tenant_id}",
                "method": "GET",
                "status": "✅ PASS" if "test-tenant" in result["response"] else "❌ FAIL",
                "response": result["response"]
            })
        
        # Test invalid tenant ID
        result = self.curl_request("/api/tenants/invalid-uuid")
        self.test_results.append({
            "test": "Invalid Tenant ID",
            "endpoint": "/api/tenants/invalid-uuid",
            "method": "GET",
            "status": "✅ PASS" if "Invalid UUID" in result["response"] else "❌ FAIL",
            "response": result["response"]
        })
    
    def test_cluster_operations(self):
        """Test cluster management"""
        print("🔍 Testing Cluster Operations...")
        
        # List clusters
        result = self.curl_request("/api/clusters/")
        self.test_results.append({
            "test": "List Clusters",
            "endpoint": "/api/clusters/",
            "method": "GET",
            "status": "✅ PASS" if '"success"' in result["response"] else "❌ FAIL",
            "response": result["response"]
        })
        
        # Get cluster metrics
        result = self.curl_request("/api/clusters/test-cluster/metrics")
        self.test_results.append({
            "test": "Cluster Metrics",
            "endpoint": "/api/clusters/test-cluster/metrics",
            "method": "GET",
            "status": "✅ PASS" if '"success"' in result["response"] else "❌ FAIL",
            "response": result["response"]
        })
    
    def test_monitoring_endpoints(self):
        """Test monitoring and reporting"""
        print("🔍 Testing Monitoring Endpoints...")
        
        # Cost summary
        result = self.curl_request("/api/cost-summary")
        self.test_results.append({
            "test": "Cost Summary",
            "endpoint": "/api/cost-summary",
            "method": "GET",
            "status": "✅ PASS" if '"monthly_total"' in result["response"] else "❌ FAIL",
            "response": result["response"]
        })
        
        # Audit logs
        result = self.curl_request("/api/audit-logs")
        self.test_results.append({
            "test": "Audit Logs",
            "endpoint": "/api/audit-logs",
            "method": "GET",
            "status": "✅ PASS" if '"success"' in result["response"] else "❌ FAIL",
            "response": result["response"]
        })
    
    def test_error_handling(self):
        """Test error handling"""
        print("🔍 Testing Error Handling...")
        
        # Test non-existent endpoint
        result = self.curl_request("/api/nonexistent")
        self.test_results.append({
            "test": "404 Error Handling",
            "endpoint": "/api/nonexistent",
            "method": "GET",
            "status": "✅ PASS" if "404" in result["response"] or "Not Found" in result["response"] else "❌ FAIL",
            "response": result["response"]
        })
        
        # Test malformed JSON
        cmd = ["curl", "-s", "-X", "POST", "-H", "Content-Type: application/json", 
               "-d", "{invalid json}", f"{self.base_url}/api/users/"]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            self.test_results.append({
                "test": "Malformed JSON Handling",
                "endpoint": "/api/users/",
                "method": "POST",
                "status": "✅ PASS" if "422" in result.stdout or "400" in result.stdout else "❌ FAIL",
                "response": result.stdout
            })
        except:
            self.test_results.append({
                "test": "Malformed JSON Handling",
                "endpoint": "/api/users/",
                "method": "POST",
                "status": "❌ FAIL",
                "response": "Test failed to execute"
            })
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Comprehensive Backend API Tests")
        print("=" * 60)
        
        # Wait for service to be ready
        print("⏳ Waiting for backend service...")
        for i in range(30):
            try:
                result = self.curl_request("/health")
                if "healthy" in result["response"]:
                    print("✅ Backend service is ready!")
                    break
            except:
                pass
            time.sleep(2)
        else:
            print("❌ Backend service not ready after 60 seconds")
            return
        
        # Run test suites
        self.test_health_endpoints()
        self.test_user_management()
        self.test_tenant_management()
        self.test_cluster_operations()
        self.test_monitoring_endpoints()
        self.test_error_handling()
        
        # Print results
        self.print_test_report()
    
    def print_test_report(self):
        """Print comprehensive test report"""
        print("\n" + "=" * 60)
        print("📊 COMPREHENSIVE BACKEND API TEST REPORT")
        print("=" * 60)
        
        passed = 0
        failed = 0
        
        for result in self.test_results:
            status_icon = "✅" if "PASS" in result["status"] else "❌"
            print(f"\n{status_icon} {result['test']}")
            print(f"   Endpoint: {result['method']} {result['endpoint']}")
            print(f"   Status: {result['status']}")
            
            # Show response preview
            if result["response"]:
                try:
                    # Try to parse as JSON for better formatting
                    parsed = json.loads(result["response"])
                    response_preview = json.dumps(parsed, indent=2)[:200]
                    if len(response_preview) >= 200:
                        response_preview += "..."
                except:
                    response_preview = result["response"][:200]
                    if len(result["response"]) > 200:
                        response_preview += "..."
                
                print(f"   Response: {response_preview}")
            
            if "PASS" in result["status"]:
                passed += 1
            else:
                failed += 1
        
        print("\n" + "=" * 60)
        print("📈 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Total: {passed + failed}")
        print(f"📈 Success Rate: {(passed / (passed + failed)) * 100:.1f}%")
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! Backend is fully functional.")
        else:
            print(f"\n⚠️  {failed} test(s) failed. Please review the issues above.")
        
        print("=" * 60)

if __name__ == "__main__":
    tester = APITester()
    tester.run_all_tests() 