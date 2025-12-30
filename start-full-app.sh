#!/bin/bash

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Pre-Accounting System - Full Start Script      ${NC}"
echo -e "${BLUE}==================================================${NC}"

# 1. Backend'i Başlat
echo -e "${GREEN}🚀 Backend başlatılıyor (Port 8081)...${NC}"
# Arka planda çalıştır ve PID'yi kaydet
./start-backend.sh &
BACKEND_PID=$!

# Backend'in ayağa kalkması için biraz bekle
echo "⏳ Backend'in hazır olması bekleniyor (15 sn)..."
sleep 15

# 2. Frontend'i Başlat
echo -e "${GREEN}🚀 Frontend başlatılıyor...${NC}"
cd pre-accounting-frontend

# Node modülleri yoksa yükle
if [ ! -d "node_modules" ]; then
    echo "📦 Node modülleri yükleniyor..."
    npm install
fi

# Frontend'i başlat
npm run dev

# Script sonlandığında backend'i de kapat
trap "kill $BACKEND_PID" EXIT
