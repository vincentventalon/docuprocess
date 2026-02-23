#!/bin/bash

# Configuration
API_KEY="sk_a982f0fc0c624472aff9984ce942d24d202d4fd2b3194f4fb85c715882555b47"
TEMPLATE_ID="HMQywVpZxqAM"
BASE_URL="http://localhost:8000"

echo "========================================="
echo "Testing Template API"
echo "========================================="
echo ""

# Test 1: Render to HTML
echo "Test 1: Rendering template to HTML..."
curl -X POST "${BASE_URL}/api/template/render" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -d @test_request.json \
  --output rendered.html \
  -w "\nHTTP Status: %{http_code}\n" \
  -v

echo ""
echo "Check rendered.html for output"
echo ""

# Test 2: Render to PDF
echo "Test 2: Rendering template to PDF..."
curl -X POST "${BASE_URL}/api/template/render-to-pdf" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -d @test_request.json \
  --output output.pdf \
  -w "\nHTTP Status: %{http_code}\n" \
  -v

echo ""
echo "Check output.pdf for output"
echo ""

# Test 3: Invalid API key (should fail with 401)
echo "Test 3: Testing with invalid API key (should fail)..."
curl -X POST "${BASE_URL}/api/template/render" \
  -H "Content-Type: application/json" \
  -H "x-api-key: invalid_key" \
  -d @test_request.json \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "========================================="
echo "Tests Complete"
echo "========================================="
