#!/bin/bash

# Renkler
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:8081"
CONTENT_TYPE="Content-Type: application/json"

echo -e "${YELLOW}==============================================${NC}"
echo -e "${YELLOW}   Pre-Accounting System - Entegrasyon Testi   ${NC}"
echo -e "${YELLOW}==============================================${NC}"

# 1. Backend Ayakta mı?
echo -n "🔍 Backend kontrol ediliyor... "
if curl --output /dev/null --silent --head --fail "$BASE_URL/actuator/health"; then
    echo -e "${GREEN}BAŞARILI (Backend Çalışıyor)${NC}"
else
    # Actuator kapalı olabilir, swagger'ı deneyelim
    if curl --output /dev/null --silent --head --fail "$BASE_URL/swagger-ui/index.html"; then
        echo -e "${GREEN}BAŞARILI (Backend Çalışıyor)${NC}"
    else
        echo -e "${RED}BAŞARISIZ (Backend'e ulaşılamadı. Lütfen önce ./start-backend.sh ile başlatın)${NC}"
        exit 1
    fi
fi

# 2. CORS Testi (OPTIONS Request)
echo -n "🔍 CORS (Preflight) Testi... "
CORS_RESPONSE=$(curl -s -I -X OPTIONS "$BASE_URL/api/auth/login" \
    -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: POST")

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}BAŞARILI (CORS Headerları Geliyor)${NC}"
else
    echo -e "${RED}BAŞARISIZ (CORS Hatası - Headerlar eksik)${NC}"
    echo "$CORS_RESPONSE"
fi

# 3. Admin Login Testi
echo -n "🔑 Admin Girişi (/api/auth/login)... "
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "$CONTENT_TYPE" \
    -d '{"username":"admin", "password":"admin123"}')

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
    echo -e "${GREEN}BAŞARILI${NC}"
    echo -e "   ℹ️  Token alındı: ${ADMIN_TOKEN:0:15}..."
else
    echo -e "${RED}BAŞARISIZ${NC}"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

# 4. Yeni Şirket Oluşturma Testi
echo -n "🏢 Yeni Şirket Oluşturma (/api/admin/companies)... "
RANDOM_NUM=$((1000 + RANDOM % 9999))
COMPANY_EMAIL="test${RANDOM_NUM}@demo.com"

CREATE_COMPANY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/companies" \
    -H "$CONTENT_TYPE" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{
        \"name\": \"Test Sirket ${RANDOM_NUM}\",
        \"email\": \"${COMPANY_EMAIL}\",
        \"phone\": \"555${RANDOM_NUM}\",
        \"taxNo\": \"${RANDOM_NUM}${RANDOM_NUM}\",
        \"address\": \"Test Adresi\"
    }")

# Şifreyi parse et (Basit grep ile)
COMPANY_PASSWORD=$(echo $CREATE_COMPANY_RESPONSE | grep -o '"password":"[^"]*' | cut -d'"' -f4)

if [ -n "$COMPANY_PASSWORD" ]; then
    echo -e "${GREEN}BAŞARILI${NC}"
    echo -e "   ℹ️  Oluşturulan Şirket: $COMPANY_EMAIL"
    echo -e "   ℹ️  Şifre: $pokok123"
else
    echo -e "${RED}BAŞARISIZ${NC}"
    echo "   Response: $CREATE_COMPANY_RESPONSE"
    # Devam etmiyoruz çünkü şifre yok
    exit 1
fi

# 5. Müşteri (Customer) Login Testi
echo -n "👤 Müşteri Girişi (/api/auth/login)... "
CUSTOMER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "$CONTENT_TYPE" \
    -d "{\"username\":\"${COMPANY_EMAIL}\", \"password\":\"${COMPANY_PASSWORD}\"}")

CUSTOMER_TOKEN=$(echo $CUSTOMER_LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$CUSTOMER_TOKEN" ]; then
    echo -e "${GREEN}BAŞARILI${NC}"
else
    echo -e "${RED}BAŞARISIZ${NC}"
    echo "   Response: $CUSTOMER_LOGIN_RESPONSE"
    exit 1
fi

# 6. Müşteri Yetki Testi (Protected Endpoint)
echo -n "🛡️  Müşteri Yetki Testi (/api/income-expenses)... "
PROTECTED_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/income-expenses" \
    -H "Authorization: Bearer $CUSTOMER_TOKEN")

if [ "$PROTECTED_RESPONSE" == "200" ]; then
    echo -e "${GREEN}BAŞARILI (Erişim İzni Var)${NC}"
else
    echo -e "${RED}BAŞARISIZ (HTTP $PROTECTED_RESPONSE)${NC}"
fi

echo -e "${YELLOW}==============================================${NC}"
echo -e "${GREEN}✅ TÜM TESTLER TAMAMLANDI${NC}"
