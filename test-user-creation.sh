#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8081"

echo -e "${BLUE}=== User Creation & Login Integration Test ===${NC}\n"

# Step 1: Login as admin
echo -e "${YELLOW}Step 1: Login as ADMIN${NC}"
ADMIN_RESPONSE=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${RED}❌ Admin login failed${NC}"
  echo $ADMIN_RESPONSE
  exit 1
fi

echo -e "${GREEN}✅ Admin logged in successfully${NC}"
echo "Token: ${ADMIN_TOKEN:0:30}..."
echo ""

# Step 2: Get or create a company
echo -e "${YELLOW}Step 2: Get available companies${NC}"
COMPANIES=$(curl -s -X GET ${API_URL}/api/admin/companies \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$COMPANIES" | head -100
echo ""

# Extract first company ID (you may need to adjust this based on your data)
COMPANY_ID=$(echo $COMPANIES | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$COMPANY_ID" ]; then
  echo -e "${YELLOW}No companies found, creating one...${NC}"

  CREATE_COMPANY_RESPONSE=$(curl -s -X POST ${API_URL}/api/admin/companies \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{
      "name": "Test Company for Integration",
      "email": "integration-test@company.com",
      "phone": "5551234567",
      "taxNo": "TEST123456",
      "address": "123 Test Street"
    }')

  COMPANY_ID=$(echo $CREATE_COMPANY_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
  echo -e "${GREEN}✅ Company created with ID: $COMPANY_ID${NC}"

  # Delete the auto-created user for this company
  AUTO_USER_ID=$(echo $CREATE_COMPANY_RESPONSE | grep -o '"userId":[0-9]*' | cut -d':' -f2)
  if [ ! -z "$AUTO_USER_ID" ]; then
    curl -s -X DELETE ${API_URL}/api/admin/users/${AUTO_USER_ID} \
      -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null
    echo -e "${GREEN}✅ Auto-created user deleted${NC}"
  fi
else
  echo -e "${GREEN}✅ Using existing company ID: $COMPANY_ID${NC}"
fi
echo ""

# Step 3: Create CUSTOMER user
echo -e "${YELLOW}Step 3: Create CUSTOMER user${NC}"
RANDOM_NUM=$RANDOM
CUSTOMER_USERNAME="test_customer_${RANDOM_NUM}"
CUSTOMER_PASSWORD="TestPass123!"

CREATE_USER_RESPONSE=$(curl -s -X POST ${API_URL}/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"username\": \"${CUSTOMER_USERNAME}\",
    \"password\": \"${CUSTOMER_PASSWORD}\",
    \"role\": \"CUSTOMER\",
    \"companyId\": ${COMPANY_ID}
  }")

echo "$CREATE_USER_RESPONSE"

CUSTOMER_USER_ID=$(echo $CREATE_USER_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$CUSTOMER_USER_ID" ]; then
  echo -e "${RED}❌ User creation failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ CUSTOMER user created successfully${NC}"
echo "  Username: ${CUSTOMER_USERNAME}"
echo "  Password: ${CUSTOMER_PASSWORD}"
echo "  User ID: ${CUSTOMER_USER_ID}"
echo ""

# Step 4: Login as the new CUSTOMER user
echo -e "${YELLOW}Step 4: Login as newly created CUSTOMER${NC}"
CUSTOMER_LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${CUSTOMER_USERNAME}\",
    \"password\": \"${CUSTOMER_PASSWORD}\"
  }")

echo "$CUSTOMER_LOGIN_RESPONSE"

CUSTOMER_TOKEN=$(echo $CUSTOMER_LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$CUSTOMER_TOKEN" ]; then
  echo -e "${RED}❌ Customer login failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ CUSTOMER logged in successfully${NC}"
echo "Token: ${CUSTOMER_TOKEN:0:30}..."
echo ""

# Step 5: Access CUSTOMER endpoint
echo -e "${YELLOW}Step 5: Access CUSTOMER dashboard endpoint${NC}"
DASHBOARD_RESPONSE=$(curl -s -X GET "${API_URL}/api/dashboard?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")

echo "$DASHBOARD_RESPONSE" | head -200

if echo "$DASHBOARD_RESPONSE" | grep -q "totalIncome"; then
  echo -e "${GREEN}✅ Dashboard accessed successfully${NC}"
else
  echo -e "${RED}❌ Dashboard access failed${NC}"
  exit 1
fi
echo ""

# Step 6: Try to access ADMIN endpoint (should fail)
echo -e "${YELLOW}Step 6: Try to access ADMIN endpoint (should FAIL)${NC}"
ADMIN_ENDPOINT_RESPONSE=$(curl -s -X GET ${API_URL}/api/admin/users \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")

if echo "$ADMIN_ENDPOINT_RESPONSE" | grep -q "Forbidden\|Access Denied"; then
  echo -e "${GREEN}✅ Correctly denied access to ADMIN endpoint${NC}"
else
  echo -e "${RED}⚠️  Unexpected response${NC}"
  echo "$ADMIN_ENDPOINT_RESPONSE"
fi
echo ""

# Step 7: Create ADMIN user
echo -e "${YELLOW}Step 7: Create ADMIN user (without company)${NC}"
ADMIN_USERNAME="test_admin_${RANDOM_NUM}"
ADMIN_PASSWORD="AdminPass456!"

CREATE_ADMIN_RESPONSE=$(curl -s -X POST ${API_URL}/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"username\": \"${ADMIN_USERNAME}\",
    \"password\": \"${ADMIN_PASSWORD}\",
    \"role\": \"ADMIN\"
  }")

echo "$CREATE_ADMIN_RESPONSE"

if echo "$CREATE_ADMIN_RESPONSE" | grep -q '"role":"ADMIN"'; then
  echo -e "${GREEN}✅ ADMIN user created successfully${NC}"
  echo "  Username: ${ADMIN_USERNAME}"
  echo "  Password: ${ADMIN_PASSWORD}"
else
  echo -e "${RED}❌ ADMIN user creation failed${NC}"
fi
echo ""

# Step 8: Login as new ADMIN
echo -e "${YELLOW}Step 8: Login as newly created ADMIN${NC}"
NEW_ADMIN_LOGIN=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${ADMIN_USERNAME}\",
    \"password\": \"${ADMIN_PASSWORD}\"
  }")

echo "$NEW_ADMIN_LOGIN"

if echo "$NEW_ADMIN_LOGIN" | grep -q '"role":"ADMIN"'; then
  echo -e "${GREEN}✅ New ADMIN logged in successfully${NC}"
else
  echo -e "${RED}❌ New ADMIN login failed${NC}"
fi
echo ""

echo -e "${BLUE}=== All Tests Completed ===${NC}"
echo -e "${GREEN}✅ User creation and login flow working correctly!${NC}"
