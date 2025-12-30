# Pre-Accounting System - Integration Guide

## ✅ Backend-Frontend Integration Status: WORKING

###  Root Cause Diagnosis

The backend startup failures were caused by:
1. **Port 8081 already in use** - Previous Java processes not properly killed
2. **No automated cleanup** - Manual intervention required each time

### 🔧 Fixes Applied

#### 1. CORS Configuration Updated
**File:** `src/main/java/preaccountingsystem/config/SecurityConfig.java`

Added Vite's default port (5173) to allowed origins:
```java
configuration.setAllowedOrigins(List.of(
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",  // ← Added
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173"    // ← Added
));
```

#### 2. Startup Script Created
**File:** `start-backend.sh`

Automatically handles port conflicts:
- Checks if port 8081 is in use
- Kills conflicting process if found
- Starts Spring Boot cleanly

#### 3. Integration Test Script Created
**File:** `test-integration.sh`

Tests full integration stack:
- Backend connectivity
- Admin login
- Customer login
- Protected endpoints (Admin & Customer)
- CORS headers

---

## 🚀 How to Run the Full Stack

### Backend (Terminal 1)
```bash
# Navigate to backend directory
cd /Users/sertacakalin/Desktop/PreAccountingg

# Option 1: Use the startup script (recommended)
./start-backend.sh

# Option 2: Manual cleanup + start
kill -9 $(lsof -ti:8081) 2>/dev/null || true
./mvnw spring-boot:run
```

**Backend will run on:** `http://localhost:8081`

### Frontend (Terminal 2)
```bash
# Navigate to frontend directory
cd /Users/sertacakalin/Desktop/PreAccountingg/pre-accounting-frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Frontend will run on:** `http://localhost:3000`

---

## 🧪 Verify Integration

### Automated Test
```bash
./test-integration.sh
```

### Manual Test (curl)

**1. Test Admin Login:**
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUz...",
  "userId": 1,
  "username": "admin",
  "role": "ADMIN",
  "customerId": null
}
```

**2. Test Customer Login:**
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testcustomer","password":"password123"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUz...",
  "userId": 2,
  "username": "testcustomer",
  "role": "CUSTOMER",
  "customerId": 1
}
```

**3. Test Protected Endpoint (with token):**
```bash
# Save token from login
TOKEN="<your-token-here>"

# Test admin endpoint
curl -X GET "http://localhost:8081/api/admin/users" \
  -H "Authorization: Bearer $TOKEN"

# Test customer endpoint
curl -X GET "http://localhost:8081/api/dashboard?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

### Web Browser Test

1. Open `http://localhost:3000` in your browser
2. You should see the login page
3. Try logging in with:
   - **Admin:** `admin` / `admin123`
   - **Customer:** `testcustomer` / `password123`
4. Upon successful login, you'll be redirected to the appropriate dashboard

---

## 📋 Configuration Summary

### Backend
- **Port:** 8081
- **Database:** MySQL (localhost:3306)
- **DB Name:** pre_accounting_db
- **Context Path:** `/`
- **Auth Endpoint:** `POST /auth/login`
- **Protected Endpoints:** `/api/*` (requires Bearer token)

### Frontend
- **Port:** 3000 (configured in `vite.config.js`)
- **API Base URL:** `http://localhost:8081` (from `.env`)
- **Token Storage:** localStorage
- **Auth Header:** `Authorization: Bearer <token>`

### Demo Credentials
| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| admin | admin123 | ADMIN | Admin panel access |
| testcustomer | password123 | CUSTOMER | Customer dashboard access |

---

## 🐛 Troubleshooting

### Backend won't start
**Problem:** Port 8081 already in use

**Solution:**
```bash
# Find and kill process on port 8081
lsof -i :8081
kill -9 <PID>

# Or use the startup script
./start-backend.sh
```

### Frontend can't connect to backend
**Problem:** CORS errors in browser console

**Solution:**
1. Ensure backend is running: `lsof -i :8081`
2. Check frontend is on port 3000: `lsof -i :3000`
3. Restart backend to apply CORS changes

### Login fails
**Problem:** 401 Unauthorized or connection refused

**Checklist:**
- ✅ Backend is running on port 8081
- ✅ Frontend `.env` has `VITE_API_URL=http://localhost:8081`
- ✅ No network errors in browser console
- ✅ Credentials are correct (admin/admin123 or testcustomer/password123)

---

## 📁 Files Changed

1. `src/main/java/preaccountingsystem/config/SecurityConfig.java`
   - Added ports 5173 to CORS allowed origins

2. `start-backend.sh` (new)
   - Automated backend startup with port conflict handling

3. `test-integration.sh` (new)
   - Integration test suite for backend-frontend communication

---

## ✨ Integration Points Working

✅ **Authentication**
- Login endpoint: `POST /auth/login`
- Response format matches frontend expectations
- JWT token returned in response

✅ **Authorization**
- Token stored in localStorage
- Axios interceptor adds Bearer token to all requests
- Protected routes require authentication

✅ **CORS**
- Frontend origins (ports 3000, 5173) allowed
- All HTTP methods permitted
- Credentials allowed for cookie-based auth

✅ **Role-Based Access**
- ADMIN role → `/admin/*` routes
- CUSTOMER role → `/app/*` routes
- Automatic redirect based on role

---

## 🎯 Next Steps

The foundation is complete and working. To build out full features:

1. **Implement CRUD Operations** - Use TanStack Query for data fetching
2. **Add Forms** - Use React Hook Form + Zod for validation
3. **Create Data Tables** - Add search, sort, pagination
4. **Build Charts** - Use Recharts for dashboard visualizations
5. **Error Handling** - Add toast notifications for user feedback

---

**Last Updated:** 2025-12-30
**Status:** ✅ Fully Integrated & Working
