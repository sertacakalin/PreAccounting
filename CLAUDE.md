# PreAccounting System - AI Assistant Guide

## Project Overview

PreAccounting is a full-stack billing and accounting system designed for managing customers, invoices, and financial reports. The system supports two user roles: **ADMIN** (system administrators) and **CUSTOMER** (end users), each with distinct capabilities and access levels.

**Technology Stack:**
- **Backend**: Spring Boot 3.2.4 (Java 17)
- **Frontend**: React 18.2 + TypeScript 5.2
- **Database**: MySQL 8.0
- **Authentication**: JWT (JJWT 0.12.3)
- **Build Tools**: Maven (backend), Vite (frontend)
- **Styling**: Tailwind CSS 3.4

---

## Repository Structure

```
PreAccounting/
├── src/main/java/preaccountingsystem/     # Backend (Spring Boot)
│   ├── PreAccountingSystemApplication.java # Entry point with CommandLineRunner
│   ├── config/                             # Security & JWT configuration
│   ├── controller/                         # REST endpoints
│   ├── service/                            # Business logic layer
│   ├── entity/                             # JPA domain models
│   ├── dto/                                # Data transfer objects
│   ├── repository/                         # Data access layer
│   ├── exception/                          # Custom exceptions
│   └── handler/                            # Global exception handling
│
├── src/main/resources/
│   └── application.yml                     # Backend configuration
│
├── pre-accounting-frontend/               # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── main.tsx                       # React entry point
│   │   ├── App.tsx                        # Router configuration
│   │   ├── context/AuthContext.tsx        # Auth state management
│   │   ├── types/index.ts                 # TypeScript interfaces
│   │   ├── services/                      # API integration layer
│   │   └── components/                    # React components
│   │       ├── Auth/                      # Login & authentication
│   │       ├── Layout/                    # MainLayout, Header, Sidebar
│   │       ├── Admin/                     # Admin-only components
│   │       ├── Customer/                  # Customer-only components
│   │       └── Common/                    # Shared components
│   │
│   ├── vite.config.ts                     # Vite config with proxy
│   ├── tailwind.config.js                 # Tailwind customization
│   └── package.json                       # Frontend dependencies
│
├── pom.xml                                # Maven configuration
└── mvnw / mvnw.cmd                        # Maven wrapper
```

---

## Backend Architecture

### Core Technologies & Dependencies

**Key Dependencies (pom.xml:24-93):**
- `spring-boot-starter-web` - REST API framework
- `spring-boot-starter-data-jpa` - Database ORM
- `spring-boot-starter-security` - Authentication & authorization
- `spring-boot-starter-validation` - Input validation
- `mysql-connector-j:8.0.33` - MySQL driver
- `lombok` - Reduces boilerplate code
- `jjwt-api:0.12.3` - JWT token management

### Domain Models

**User Entity** (`entity/User.java`):
- Implements Spring Security's `UserDetails` interface
- Fields: `id`, `username` (unique), `password`, `role` (ADMIN/CUSTOMER)
- OneToOne relationship with Customer
- Authorities: "ROLE_" + role name (e.g., "ROLE_ADMIN")

**Customer Entity** (`entity/Customer.java`):
- Fields: `id`, `name`, `email` (unique), `phone`, `taxNo`, `address`
- OneToOne with User (bidirectional)
- OneToMany with Invoice (lazy loaded)

**Invoice Entity** (`entity/Invoice.java`):
- Fields: `id`, `customer` (FK), `type` (enum: INCOME/EXPENSE), `date`, `amount` (BigDecimal), `description`, `createdAt`
- ManyToOne with Customer
- Auto-populates `createdAt` via `@PrePersist`

### Security Implementation

**JWT Authentication Flow** (`config/SecurityConfig.java`, `config/JwtAuthFilter.java`):
1. User logs in via `/auth/login` with username/password
2. Backend validates credentials and returns JWT token
3. Frontend stores token in localStorage
4. All subsequent requests include `Authorization: Bearer <token>` header
5. `JwtAuthFilter` validates token and sets Spring Security context

**SecurityConfig** (`config/SecurityConfig.java`):
- CSRF disabled (stateless JWT authentication)
- CORS enabled for `localhost:3000`, `localhost:3001`, `127.0.0.1:3000/3001`
- Session management: STATELESS
- Role-based access control:
  - `/api/admin/**` requires `ROLE_ADMIN`
  - `/api/customer/**` requires `ROLE_CUSTOMER`
  - `/auth/**` permits all

**JwtService** (`config/JwtService.java`):
- Algorithm: HS256
- Token expiration: 24 hours (86400000ms)
- Secret: Base64-encoded value in `application.yml`
- Methods: `generateToken()`, `validateToken()`, `extractUsername()`

### API Endpoints

**Authentication** (`controller/AuthController.java`):
```
POST /auth/login
  Request: { username, password }
  Response: { token, userId, username, role, customerId? }
```

**Admin Endpoints** (`controller/AdminController.java`):
```
POST /api/admin/customers
  Request: { name, email, phone?, taxNo?, address? }
  Response: { customerId, userId, username, password (generated), ... }

POST /api/admin/reset-admin-password
  Response: "Admin password reset to: admin123"

GET /api/admin/customers
  Response: List<CustomerDto>

GET /api/admin/invoices?customerId=<id>
  Response: List<InvoiceDto>

GET /api/admin/reports/summary?from=<YYYY-MM-DD>&to=<YYYY-MM-DD>
  Response: { totalIncome, totalExpense, netProfit, invoiceCount, ... }
```

**Customer Endpoints** (`controller/CustomerController.java`):
```
POST /api/customer/invoices
  Request: { type: "INCOME"|"EXPENSE", date, amount, description? }
  Response: InvoiceDto

GET /api/customer/invoices
  Response: List<InvoiceDto>

GET /api/customer/invoices/by-type?type=<INCOME|EXPENSE>
  Response: List<InvoiceDto>

GET /api/customer/report/summary?from=<YYYY-MM-DD>&to=<YYYY-MM-DD>
  Response: { fromDate, toDate, totalIncome, totalExpense, netProfit, invoiceCount }
```

### Service Layer Patterns

**Common Pattern** (`service/`):
```java
@Service
@RequiredArgsConstructor
public class CustomerService {
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;

    public InvoiceDto createInvoice(InvoiceCreateRequest request) {
        // 1. Get authenticated user from SecurityContext
        User user = (User) SecurityContextHolder.getContext()
            .getAuthentication().getPrincipal();

        // 2. Find customer entity
        Customer customer = customerRepository.findById(user.getCustomer().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // 3. Create and save entity
        Invoice invoice = Invoice.builder()
            .customer(customer)
            .type(request.getType())
            .date(request.getDate())
            .amount(request.getAmount())
            .description(request.getDescription())
            .build();

        Invoice saved = invoiceRepository.save(invoice);

        // 4. Convert to DTO and return
        return convertToDto(saved);
    }
}
```

### Exception Handling

**Custom Exceptions** (`exception/`):
- `BusinessException` - Business logic violations
- `ResourceNotFoundException` - Entity not found (404)
- `UnauthorizedException` - Access denied (403)

**GlobalExceptionHandler** (`handler/GlobalExceptionHandler.java`):
- `@RestControllerAdvice` for centralized error handling
- Returns `ErrorResponse` DTO with timestamp, message, and details
- Handles validation errors, custom exceptions, and generic exceptions

### Repository Layer

**Custom Queries** (`repository/InvoiceRepository.java`):
```java
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCustomerId(Long customerId);

    @Query("SELECT i FROM Invoice i WHERE i.customer.id = :customerId AND i.type = :type")
    List<Invoice> findByCustomerIdAndType(Long customerId, InvoiceType type);

    @Query("SELECT i FROM Invoice i WHERE i.customer.id = :customerId " +
           "AND i.date BETWEEN :from AND :to")
    List<Invoice> findByCustomerIdAndDateRange(Long customerId, LocalDate from, LocalDate to);
}
```

---

## Frontend Architecture

### Core Technologies & Dependencies

**Key Dependencies** (`pre-accounting-frontend/package.json:12-19`):
- `react:^18.2.0` - UI library
- `react-router-dom:^6.23.1` - Client-side routing
- `axios:^1.7.2` - HTTP client
- `date-fns:^3.6.0` - Date utilities
- `recharts:^2.12.7` - Charts (installed but minimal usage)
- `react-icons:^5.2.1` - Icon library
- `tailwindcss:^3.4.3` - Utility-first CSS

### State Management

**AuthContext** (`context/AuthContext.tsx`):
- Uses React Context API (no Redux)
- Provides: `auth` (AuthResponse | null), `isLoading`, `login()`, `logout()`
- Persists to localStorage with key `auth`
- Automatically loads auth state on app initialization
- Usage: `const { auth, login, logout } = useAuth();`

### Routing Structure

**App.tsx** - Route configuration:
```
/login                          → LoginPage (public)
/                              → MainLayout (protected via PrivateRoute)
  /admin/dashboard             → AdminDashboard (role: ADMIN)
  /admin/customers             → CustomerList
  /admin/reports               → AdminSummaryReport
  /customer/dashboard          → CustomerDashboard (role: CUSTOMER)
  /customer/invoices           → CustomerInvoiceList
  /customer/reports            → PersonalReport
```

**PrivateRoute Component** (`components/Auth/PrivateRoute.tsx`):
- Checks authentication status from AuthContext
- Validates user role matches required role
- Redirects to `/login` if unauthenticated
- Shows "Unauthorized" if wrong role

### API Integration Layer

**Axios Instance** (`services/api.ts`):
```typescript
const api = axios.create({
  baseURL: '/',  // Proxied to http://localhost:8080 via Vite
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: Add JWT token
api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Response interceptor: Handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Service Layer Pattern** (`services/`):
```typescript
// customerService.ts
export const createInvoice = async (request: CreateInvoiceRequest): Promise<Invoice> => {
  const response = await api.post('/api/customer/invoices', request);
  return response.data;
};

export const getMyInvoices = async (): Promise<Invoice[]> => {
  const response = await api.get('/api/customer/invoices');
  return response.data;
};
```

### TypeScript Type Definitions

**Core Types** (`types/index.ts`):
```typescript
export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  role: 'ADMIN' | 'CUSTOMER';
  customerId?: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  taxNo: string;
  address: string;
  username: string;
}

export interface Invoice {
  id: number;
  customerId: number;
  customerName: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;  // YYYY-MM-DD format
  amount: number;
  description: string;
  createdAt: string;
}

export interface CreateInvoiceRequest {
  type: 'INCOME' | 'EXPENSE';
  date: string;
  amount: number;
  description?: string;
}

export interface SummaryReport {
  fromDate: string;
  toDate: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  invoiceCount: number;
}
```

### Component Patterns

**Functional Component with Hooks**:
```typescript
const InvoiceList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { auth } = useAuth();

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const data = await getMyInvoices();
        setInvoices(data);
      } catch (err) {
        setError('Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      {/* Render invoices */}
    </div>
  );
};
```

**Form Component Pattern**:
```typescript
const InvoiceForm = () => {
  const [formData, setFormData] = useState<CreateInvoiceRequest>({
    type: 'INCOME',
    date: '',
    amount: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInvoice(formData);
    // Handle success
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Styling with Tailwind CSS

**Custom Color Palette** (`tailwind.config.js`):
```javascript
colors: {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  danger: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  light: '#f5f5f5',
  dark: '#333'
}
```

**Common Utility Classes**:
- Backgrounds: `bg-gray-100`, `bg-white`, `bg-primary`
- Spacing: `p-6`, `px-4 py-3`, `mb-4`
- Text: `text-white`, `text-gray-700`, `font-bold`
- Borders: `rounded-lg`, `border border-gray-300`
- Flex/Grid: `flex items-center justify-between`, `grid grid-cols-3 gap-4`
- Responsive: `md:grid-cols-2`, `lg:px-8`

---

## Development Workflows

### Prerequisites

**Required Software**:
- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and npm
- MySQL 8.0

### Database Setup

**Automatic Configuration**:
1. Start MySQL server on `localhost:3306`
2. Database `pre_accounting_db` is created automatically via `createDatabaseIfNotExist=true`
3. Tables are created/updated automatically via Hibernate `ddl-auto: update`

**Default Connection** (`application.yml:3-6`):
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/pre_accounting_db?createDatabaseIfNotExist=true
    username: root
    password: pokok123
```

**Initial Data**:
- Admin user is created on application startup via `CommandLineRunner` in `PreAccountingSystemApplication.java`
- Default credentials: `admin` / `admin123`

### Building the Project

**Backend**:
```bash
cd /home/user/PreAccounting
mvn clean install
# Creates: target/PreAccountingSystem-1.0.0.jar
```

**Frontend**:
```bash
cd /home/user/PreAccounting/pre-accounting-frontend
npm install
npm run build
# Creates: dist/ folder with production build
```

### Running in Development

**Terminal 1 - Backend**:
```bash
cd /home/user/PreAccounting
mvn spring-boot:run
# Runs on http://localhost:8080
```

**Terminal 2 - Frontend**:
```bash
cd /home/user/PreAccounting/pre-accounting-frontend
npm run dev
# Runs on http://localhost:3000
# Proxies /api and /auth requests to backend
```

**Access Application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Login: `admin` / `admin123`

### Testing

**Backend** (tests not implemented yet):
```bash
mvn test
```

**Frontend Linting**:
```bash
cd pre-accounting-frontend
npm run lint
```

### Production Build

**Backend JAR**:
```bash
mvn clean package -DskipTests
java -jar target/PreAccountingSystem-1.0.0.jar
```

**Frontend Static Files**:
```bash
npm run build
# Serve dist/ folder with any static file server
```

---

## Code Conventions & Best Practices

### Backend Naming Conventions

**Classes**:
- Entities: Singular, CamelCase (`User`, `Customer`, `Invoice`)
- DTOs: Suffixed with `Dto`, `Request`, or `Response` (`CustomerDto`, `CreateCustomerRequest`)
- Services: Suffixed with `Service` (`AuthService`, `CustomerService`)
- Controllers: Suffixed with `Controller` (`AuthController`)
- Repositories: Suffixed with `Repository` (`UserRepository`)
- Exceptions: Suffixed with `Exception` (`BusinessException`)

**Methods**:
- Service methods: Action + entity pattern (`createCustomer`, `listMyInvoices`, `getMyReport`)
- Repository methods: JPA conventions (`findByCustomerId`, `findByCustomerIdAndType`)
- Controllers: HTTP verb implied (`@PostMapping` → `createInvoice`, `@GetMapping` → `listInvoices`)

**Packages**:
- Organized by layer: `controller`, `service`, `repository`, `entity`, `dto`, `config`, `exception`, `handler`
- NOT by feature/domain (avoid `admin/`, `customer/` packages)

### Frontend Naming Conventions

**Files & Components**:
- Components: PascalCase matching component name (`LoginPage.tsx`, `InvoiceForm.tsx`)
- Services: camelCase with `Service` suffix (`authService.ts`, `customerService.ts`)
- Types: `index.ts` in `types/` folder
- Hooks: Prefix with `use` (`useAuth`, `useCallback`)

**Variables & Functions**:
- State variables: Descriptive camelCase (`invoices`, `isLoading`, `formData`)
- Event handlers: Prefix with `handle` (`handleSubmit`, `handleChange`, `handleDelete`)
- API functions: Action + entity (`getMyInvoices`, `createInvoice`)

### Lombok Usage

**Common Annotations**:
- `@Data` - Generates getters, setters, equals, hashCode, toString
- `@Builder` - Builder pattern for object construction
- `@RequiredArgsConstructor` - Constructor for final fields (DI)
- `@NoArgsConstructor` - Default constructor (required by JPA)
- `@AllArgsConstructor` - Constructor with all fields

**Example**:
```java
@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
}
```

### Error Handling Patterns

**Backend**:
```java
// Service layer throws custom exceptions
if (customer == null) {
    throw new ResourceNotFoundException("Customer not found with id: " + id);
}

// GlobalExceptionHandler catches and formats
@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorResponse(LocalDateTime.now(), ex.getMessage(), null));
}
```

**Frontend**:
```typescript
// Component level
try {
  const data = await createInvoice(formData);
  setSuccess('Invoice created successfully');
} catch (error: any) {
  setError(error.response?.data?.message || 'Failed to create invoice');
}

// Global axios interceptor handles 401 (logout)
```

### Security Best Practices

**Backend**:
- Never log JWT tokens or passwords
- Use `@PreAuthorize` for method-level security if needed
- Always hash passwords with BCryptPasswordEncoder
- Validate user ownership before data access (check `SecurityContext`)

**Frontend**:
- Store JWT in localStorage (consider httpOnly cookies for production)
- Clear auth state on logout
- Validate role before rendering admin/customer components
- Use PrivateRoute for all protected routes

### Data Conversion

**Entity to DTO**:
```java
private CustomerDto convertToDto(Customer customer) {
    return CustomerDto.builder()
        .id(customer.getId())
        .name(customer.getName())
        .email(customer.getEmail())
        .phone(customer.getPhone())
        .taxNo(customer.getTaxNo())
        .address(customer.getAddress())
        .username(customer.getUser().getUsername())
        .build();
}
```

**DTO to Entity**:
```java
Customer customer = Customer.builder()
    .name(request.getName())
    .email(request.getEmail())
    .phone(request.getPhone())
    .taxNo(request.getTaxNo())
    .address(request.getAddress())
    .build();
```

---

## Common Development Tasks

### Adding a New Entity

1. Create entity class in `entity/` with JPA annotations
2. Create repository in `repository/` extending `JpaRepository`
3. Create DTOs in `dto/` for requests/responses
4. Create service in `service/` with business logic
5. Create controller in `controller/` with REST endpoints
6. Add TypeScript types in `types/index.ts`
7. Create service functions in `services/`
8. Create React components for UI

### Adding a New API Endpoint

**Backend**:
```java
@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;

    @GetMapping("/invoices/total")
    public ResponseEntity<BigDecimal> getTotalAmount() {
        BigDecimal total = customerService.calculateTotalAmount();
        return ResponseEntity.ok(total);
    }
}
```

**Frontend**:
```typescript
// services/customerService.ts
export const getTotalAmount = async (): Promise<number> => {
  const response = await api.get('/api/customer/invoices/total');
  return response.data;
};

// Component usage
const { data: total } = await getTotalAmount();
```

### Adding a New Page/Route

1. Create component in appropriate folder (`components/Admin/` or `components/Customer/`)
2. Add route in `App.tsx`:
```typescript
<Route
  path="/customer/new-page"
  element={<PrivateRoute role="CUSTOMER"><NewPage /></PrivateRoute>}
/>
```
3. Add navigation link in `Sidebar.tsx`

### Modifying Authentication Flow

**Backend**:
- JWT configuration: `config/JwtService.java`
- Security rules: `config/SecurityConfig.java`
- Auth logic: `service/AuthService.java`

**Frontend**:
- Auth context: `context/AuthContext.tsx`
- Login UI: `components/Auth/LoginPage.tsx`
- API interceptor: `services/api.ts`

---

## Troubleshooting

### Common Issues

**Backend won't start**:
- Check MySQL is running on port 3306
- Verify database credentials in `application.yml`
- Ensure Java 17 is installed: `java -version`
- Check port 8080 is available

**Frontend build errors**:
- Delete `node_modules` and run `npm install` again
- Check Node.js version: `node -v` (should be 18+)
- Verify TypeScript types match backend DTOs

**401 Unauthorized errors**:
- Check JWT token is present in localStorage
- Verify token hasn't expired (24 hour limit)
- Ensure backend SecurityConfig allows the endpoint
- Check user has correct role (ADMIN vs CUSTOMER)

**CORS errors**:
- Verify backend `SecurityConfig` includes frontend URL
- Check Vite proxy configuration in `vite.config.ts`
- Ensure requests use relative URLs (not full `http://localhost:8080`)

**Database connection errors**:
- Verify MySQL service is running
- Check firewall allows port 3306
- Confirm database user has proper permissions
- Test connection: `mysql -u root -p`

---

## Git Workflow

**Current Branch**: `claude/claude-md-mivxfga4p1nzgd4p-01BPcHtet9F2UG7nkLHRMqhh`

**Committing Changes**:
```bash
git add .
git commit -m "feat: add new invoice filtering feature"
git push -u origin claude/claude-md-mivxfga4p1nzgd4p-01BPcHtet9F2UG7nkLHRMqhh
```

**Branch Naming Convention**:
- Feature branches: `claude/claude-md-<session-id>`
- CRITICAL: Branch must start with `claude/` and end with session ID for push authentication

**Ignored Files** (`.gitignore`):
- `target/` - Maven build output
- `.idea/`, `.vscode/` - IDE files
- `node_modules/` - Node dependencies
- `dist/` - Frontend build output

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `pom.xml` | Maven dependencies and build configuration |
| `src/main/resources/application.yml` | Backend configuration (DB, JWT, server) |
| `src/main/java/.../PreAccountingSystemApplication.java` | Backend entry point, initializes admin user |
| `src/main/java/.../config/SecurityConfig.java` | Security rules, CORS, JWT filter chain |
| `src/main/java/.../config/JwtService.java` | JWT token generation and validation |
| `pre-accounting-frontend/package.json` | Frontend dependencies and scripts |
| `pre-accounting-frontend/vite.config.ts` | Vite config with backend proxy |
| `pre-accounting-frontend/src/App.tsx` | Route configuration |
| `pre-accounting-frontend/src/context/AuthContext.tsx` | Global auth state management |
| `pre-accounting-frontend/src/services/api.ts` | Axios instance with JWT interceptors |
| `pre-accounting-frontend/src/types/index.ts` | TypeScript type definitions |
| `pre-accounting-frontend/tailwind.config.js` | Tailwind theme customization |

---

## AI Assistant Guidelines

When working on this codebase:

1. **Always read files before modifying** - Never propose changes to code you haven't read
2. **Respect the layered architecture** - Keep business logic in services, not controllers
3. **Maintain type safety** - Ensure TypeScript types match backend DTOs exactly
4. **Follow existing patterns** - Use established naming conventions and code structures
5. **Security first** - Validate user permissions, never expose sensitive data
6. **Test authentication** - Verify JWT flow works after auth-related changes
7. **Update both frontend and backend** - API changes require updates to both layers
8. **Preserve Lombok annotations** - Don't replace generated methods with manual code
9. **Keep CORS updated** - Add new frontend URLs to SecurityConfig if needed
10. **Document new endpoints** - Add clear comments and update this guide if adding major features

### When Adding Features

- Check if similar functionality exists (avoid duplication)
- Follow the service → repository → entity pattern
- Create DTOs for all API request/response objects
- Add proper error handling with custom exceptions
- Update TypeScript types to match new DTOs
- Create service functions in frontend for API calls
- Use existing UI components and Tailwind classes
- Test with both ADMIN and CUSTOMER roles

### When Fixing Bugs

- Reproduce the issue first
- Check backend logs for exceptions
- Verify frontend console for errors
- Check network tab for API failures
- Ensure JWT token is valid and not expired
- Verify database state matches expectations
- Test fix with multiple user roles

---

## Default Credentials

**Admin User** (created on first startup):
- Username: `admin`
- Password: `admin123`
- Role: `ADMIN`

**Reset Admin Password**:
```bash
POST http://localhost:8080/api/admin/reset-admin-password
Authorization: Bearer <admin-jwt-token>
```

---

## Additional Resources

**Spring Boot Documentation**: https://docs.spring.io/spring-boot/docs/3.2.4/reference/html/
**React Documentation**: https://react.dev/
**TypeScript Documentation**: https://www.typescriptlang.org/docs/
**Tailwind CSS**: https://tailwindcss.com/docs
**JJWT Documentation**: https://github.com/jwtk/jjwt

---

*Last Updated: 2025-12-07*
*Generated for AI assistants working on the PreAccounting system*
