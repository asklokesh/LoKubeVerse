#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Base URL
BASE_URL="http://localhost:8000"

# Test registration
echo "Testing registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123", "name": "Test User"}')
echo $REGISTER_RESPONSE

# Test login
echo -e "\nTesting login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}')
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

# Test cluster creation
echo -e "\nTesting cluster creation..."
CLUSTER_RESPONSE=$(curl -s -X POST "$BASE_URL/clusters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-cluster",
    "provider": "aws",
    "region": "us-west-2",
    "version": "1.24"
  }')
echo $CLUSTER_RESPONSE

# Test deployment creation
echo -e "\nTesting deployment creation..."
DEPLOYMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/deployments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-app",
    "cluster": "test-cluster",
    "namespace": "default",
    "image": "nginx:latest",
    "replicas": 3
  }')
echo $DEPLOYMENT_RESPONSE

# Test user management
echo -e "\nTesting user management..."
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN")
echo $USERS_RESPONSE

echo -e "\n${GREEN}API Tests Completed${NC}" 