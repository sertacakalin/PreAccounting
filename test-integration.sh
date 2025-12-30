#!/bin/bash

# Integration Test Script
# Tests backend-frontend integration points

API_URL="http://localhost:8081"

echo "🧪 Pre-Accounting Integration Test Suite"
echo "=========================================="
echo ""

# Test 1: Backend Health
echo "1️⃣  Testing backend connectivity..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/auth/login -X POST)
if [ "$RESPONSE" -eq 400 ] || [ "$RESPONSE" -eq 200 ] || [ "$RESPONSE" -eq 401 ]; then
  echo "   ✅ Backend is running on port 8081 (HTTP $RESPONSE)"
else
  echo "   ❌ Backend is not responding (HTTP $RESPONSE)"
  exit 1
fi
echo ""

# Test 2: Admin Login
echo "2️⃣  Testing admin login..."
ADMIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$ADMIN_TOKEN" ]; then
  echo "   ✅ Admin login successful"
  echo "   Token: ${ADMIN_TOKEN:0:50}..."
else
  echo "   ❌ Admin login failed"
  echo "   Response: $ADMIN_RESPONSE"
fi
echo ""

# Test 3: Customer Login
echo "3️⃣  Testing customer login..."
CUST_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testcustomer","password":"password123"}')

CUST_TOKEN=$(echo $CUST_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$CUST_TOKEN" ]; then
  echo "   ✅ Customer login successful"
  echo "   Token: ${CUST_TOKEN:0:50}..."
else
  echo "   ❌ Customer login failed"
  echo "   Response: $CUST_RESPONSE"
fi
echo ""

# Test 4: Protected Endpoint (Admin)
if [ ! -z "$ADMIN_TOKEN" ]; then
  echo "4️⃣  Testing protected endpoint (Admin)..."
  ADMIN_API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X GET "$API_URL/api/admin/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

  if [ "$ADMIN_API_RESPONSE" -eq 200 ]; then
    echo "   ✅ Admin API access successful (HTTP $ADMIN_API_RESPONSE)"
  else
    echo "   ⚠️  Admin API returned HTTP $ADMIN_API_RESPONSE"
  fi
  echo ""
fi

# Test 5: Protected Endpoint (Customer)
if [ ! -z "$CUST_TOKEN" ]; then
  echo "5️⃣  Testing protected endpoint (Customer)..."
  CUST_API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X GET "$API_URL/api/dashboard?startDate=2025-01-01&endDate=2025-12-31" \
    -H "Authorization: Bearer $CUST_TOKEN")

  if [ "$CUST_API_RESPONSE" -eq 200 ]; then
    echo "   ✅ Customer API access successful (HTTP $CUST_API_RESPONSE)"
  else
    echo "   ⚠️  Customer API returned HTTP $CUST_API_RESPONSE"
  fi
  echo ""
fi

# Test 6: CORS Headers
echo "6️⃣  Testing CORS configuration..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS $API_URL/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" | grep -i "access-control-allow")

if [ ! -z "$CORS_RESPONSE" ]; then
  echo "   ✅ CORS headers present"
  echo "$CORS_RESPONSE" | sed 's/^/   /'
else
  echo "   ⚠️  No CORS headers found (may need to check SecurityConfig)"
fi
echo ""

echo "=========================================="
echo "✨ Integration test complete!"
echo ""
echo "To test from frontend:"
echo "  1. cd pre-accounting-frontend"
echo "  2. npm run dev"
echo "  3. Open http://localhost:3000"
echo "  4. Login with admin/admin123 or testcustomer/password123"
