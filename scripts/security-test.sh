#!/bin/bash

# Security Testing Script using OWASP ZAP
# This script runs security tests against the K8s Dashboard

TARGET_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8000"

echo "🔒 Starting Security Testing for K8s Dashboard"
echo "================================================"

# Check if ZAP is installed
if ! command -v zap-cli &> /dev/null; then
    echo "❌ OWASP ZAP CLI not found. Installing..."
    pip install zaproxy
fi

echo "🔍 Running Baseline Security Scan..."

# Start ZAP daemon
zap-cli start --start-options '-config api.disablekey=true'

# Wait for ZAP to start
sleep 10

# Run baseline scan on frontend
echo "📱 Scanning Frontend Application..."
zap-cli quick-scan --spider -s "$TARGET_URL" --scanners all

# Run baseline scan on backend API
echo "🔧 Scanning Backend API..."
zap-cli quick-scan --spider -s "$BACKEND_URL" --scanners all

# Generate security report
echo "📊 Generating Security Report..."
zap-cli report -o security-report.html -f html

# Additional security tests
echo "🔍 Running Additional Security Tests..."

# Test for common vulnerabilities
echo "Testing for SQL Injection..."
zap-cli active-scan --scanners 40018 "$BACKEND_URL"

echo "Testing for XSS..."
zap-cli active-scan --scanners 40012,40014,40016,40017 "$TARGET_URL"

echo "Testing for CSRF..."
zap-cli active-scan --scanners 20012 "$TARGET_URL"

echo "Testing for Authentication bypass..."
zap-cli active-scan --scanners 10101,10102 "$BACKEND_URL"

# Stop ZAP
zap-cli shutdown

echo "✅ Security Testing Complete!"
echo "📄 Report saved to: security-report.html"
echo ""
echo "Summary:"
echo "- Frontend URL tested: $TARGET_URL"
echo "- Backend URL tested: $BACKEND_URL"
echo "- Report: security-report.html"
