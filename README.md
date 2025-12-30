# Pre-Accounting System

Full-stack accounting application with Spring Boot backend and React frontend.

## 🚀 Quick Start

### Start Backend
```bash
./start-backend.sh
```
Backend runs on **http://localhost:8081**

### Start Frontend
```bash
cd pre-accounting-frontend
npm install  # first time only
npm run dev
```
Frontend runs on **http://localhost:3000**

### Test Integration
```bash
./test-integration.sh
```

## 🔐 Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| testcustomer | password123 | CUSTOMER |

## 📚 Documentation

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for complete setup and troubleshooting.

## 🛠️ Tech Stack

**Backend:**
- Spring Boot 3.2.4
- MySQL Database
- JWT Authentication
- JPA/Hibernate

**Frontend:**
- React 18 + Vite
- Tailwind CSS + shadcn/ui
- React Router
- TanStack Query
- Axios

## ✅ Status

- Backend: ✅ Running
- Frontend: ✅ Running
- Integration: ✅ Working
- Authentication: ✅ Working
- CORS: ✅ Configured
