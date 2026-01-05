# Items (Inventory) Module - Complete Implementation Guide

## 🎯 Overview

The Items (Inventory) module is the first core feature module of the PreAccounting System, providing comprehensive inventory management for products and services. This module serves as the foundation for future expansions like stock tracking, warehouse management, and barcode functionality.

---

## ✅ Implementation Summary

### What Was Built

1. **Backend Infrastructure** (Java Spring Boot)
   - Entity layer with JPA annotations
   - DTO layer for request/response handling
   - Repository layer with custom queries
   - Service layer with business logic
   - Controller layer with REST API endpoints

2. **Frontend Application** (React + Vite)
   - Items list page with advanced filtering
   - Create/Edit dialog forms
   - Delete confirmation dialogs
   - Status toggle functionality
   - Responsive design

3. **Security & Validation**
   - Company-based data isolation
   - JWT authentication required
   - Input validation with Bean Validation
   - Business rule enforcement

---

## 📁 Files Created/Modified

### Backend Files Created

#### 1. Entity Layer
- **File:** `/src/main/java/preaccountingsystem/entity/Item.java`
  - Main entity representing inventory items
  - Fields: id, name, description, type, category, stock, salePrice, purchasePrice, status, company, timestamps
  - Relationships: ManyToOne with Customer (company)
  - Indexes on: company_id, type, status

- **File:** `/src/main/java/preaccountingsystem/entity/ItemType.java`
  - Enum: PRODUCT, SERVICE
  - Determines whether stock tracking applies

- **File:** `/src/main/java/preaccountingsystem/entity/ItemStatus.java`
  - Enum: ACTIVE, PASSIVE
  - Controls item availability

#### 2. DTO Layer
- **File:** `/src/main/java/preaccountingsystem/dto/ItemDto.java`
  - Response DTO with all item fields
  - Includes company information
  - Includes timestamps

- **File:** `/src/main/java/preaccountingsystem/dto/CreateItemRequest.java`
  - Request DTO for creating items
  - Validation annotations
  - Default status: ACTIVE

- **File:** `/src/main/java/preaccountingsystem/dto/UpdateItemRequest.java`
  - Request DTO for updating items
  - Validation annotations
  - Prevents company change

#### 3. Repository Layer
- **File:** `/src/main/java/preaccountingsystem/repository/ItemRepository.java`
  - Custom query methods for filtering
  - Search functionality
  - Company-based security queries
  - Category aggregation

#### 4. Service Layer
- **File:** `/src/main/java/preaccountingsystem/service/ItemService.java`
  - Business logic implementation
  - CRUD operations
  - Validation rules
  - Company security enforcement
  - Type-based stock handling

#### 5. Controller Layer
- **File:** `/src/main/java/preaccountingsystem/controller/ItemController.java`
  - REST API endpoints
  - Pagination support
  - Filtering & sorting
  - Authentication integration

### Frontend Files Created/Modified

#### 1. Pages
- **File:** `/pre-accounting-frontend/src/pages/ItemsPage.jsx`
  - Complete Items management UI
  - List view with table
  - Create/Edit dialogs
  - Delete confirmation
  - Filters and search
  - Sorting functionality

#### 2. Routing
- **File:** `/pre-accounting-frontend/src/App.jsx` (Modified)
  - Added ItemsPage import
  - Added /app/items route

- **File:** `/pre-accounting-frontend/src/layouts/DashboardLayout.jsx` (Modified)
  - Added Package icon import
  - Added Items link to customer navigation

---

## 🚀 API Endpoints

### Base URL: `/api/items`

All endpoints require authentication. CUSTOMER users can only access their company's items.

---

### 1. GET /api/items
**Purpose:** Get all items with pagination, filtering, and sorting

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| search | String | No | - | Search in name and description |
| type | Enum | No | - | Filter by PRODUCT or SERVICE |
| status | Enum | No | - | Filter by ACTIVE or PASSIVE |
| category | String | No | - | Filter by category name |
| page | Integer | No | 0 | Page number (0-indexed) |
| size | Integer | No | 10 | Items per page |
| sortBy | String | No | name | Sort field (name, stock, salePrice) |
| sortDirection | String | No | asc | Sort direction (asc, desc) |

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Laptop Dell XPS 15",
      "description": "High-performance laptop",
      "type": "PRODUCT",
      "category": "Electronics",
      "stock": 25.00,
      "salePrice": 1500.00,
      "purchasePrice": 1200.00,
      "status": "ACTIVE",
      "companyId": 16,
      "companyName": "Test Corporation Ltd",
      "createdAt": "2026-01-04T23:16:52.072272",
      "updatedAt": "2026-01-04T23:16:52.072282"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

---

### 2. GET /api/items/{id}
**Purpose:** Get a single item by ID

**Path Parameters:**
- `id` (Long): Item ID

**Response:**
```json
{
  "id": 1,
  "name": "Laptop Dell XPS 15",
  "description": "High-performance laptop",
  "type": "PRODUCT",
  "category": "Electronics",
  "stock": 25.00,
  "salePrice": 1500.00,
  "purchasePrice": 1200.00,
  "status": "ACTIVE",
  "companyId": 16,
  "companyName": "Test Corporation Ltd",
  "createdAt": "2026-01-04T23:16:52.072272",
  "updatedAt": "2026-01-04T23:16:52.072282"
}
```

**Error Cases:**
- 404: Item not found or doesn't belong to user's company

---

### 3. GET /api/items/active
**Purpose:** Get all active items (for dropdown selections)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Laptop Dell XPS 15",
    "type": "PRODUCT",
    "salePrice": 1500.00,
    ...
  }
]
```

---

### 4. GET /api/items/categories
**Purpose:** Get all unique categories for the user's company

**Response:**
```json
[
  "Electronics",
  "Office Supplies",
  "Services",
  "Software"
]
```

---

### 5. POST /api/items
**Purpose:** Create a new item

**Request Body:**
```json
{
  "name": "Laptop Dell XPS 15",
  "description": "High-performance laptop",
  "type": "PRODUCT",
  "category": "Electronics",
  "stock": 25,
  "salePrice": 1500.00,
  "purchasePrice": 1200.00
}
```

**Validation Rules:**
- name: Required, 2-200 characters
- description: Optional, max 500 characters
- type: Required (PRODUCT or SERVICE)
- category: Required, max 100 characters
- stock: Min 0, only for PRODUCT
- salePrice: Required, min 0
- purchasePrice: Required, min 0
- status: Optional, defaults to ACTIVE

**Business Rules:**
1. If type is SERVICE, stock must be null
2. If type is PRODUCT and stock is null, defaults to 0
3. Item is automatically linked to authenticated user's company

**Response:** 201 Created with ItemDto

**Error Cases:**
- 400: Validation error or business rule violation
- 400: SERVICE items cannot have stock
- 400: User not linked to company

---

### 6. PUT /api/items/{id}
**Purpose:** Update an existing item

**Path Parameters:**
- `id` (Long): Item ID

**Request Body:**
```json
{
  "name": "Laptop Dell XPS 15 Updated",
  "description": "Updated description",
  "type": "PRODUCT",
  "category": "Electronics",
  "stock": 30,
  "salePrice": 1600.00,
  "purchasePrice": 1300.00,
  "status": "ACTIVE"
}
```

**Business Rules:**
1. CompanyId cannot be changed
2. If changing from PRODUCT to SERVICE, stock is automatically set to null
3. If changing from SERVICE to PRODUCT, stock defaults to 0 if not provided

**Response:** 200 OK with updated ItemDto

**Error Cases:**
- 404: Item not found or doesn't belong to user's company
- 400: Validation error or business rule violation

---

### 7. DELETE /api/items/{id}
**Purpose:** Permanently delete an item

**Path Parameters:**
- `id` (Long): Item ID

**Response:** 204 No Content

**Error Cases:**
- 404: Item not found or doesn't belong to user's company

**Note:** This is a hard delete. Consider using deactivate instead for preserving data.

---

### 8. PATCH /api/items/{id}/deactivate
**Purpose:** Set item status to PASSIVE

**Path Parameters:**
- `id` (Long): Item ID

**Response:** 200 OK with updated ItemDto

**Use Case:** Makes item inactive but keeps it visible in the list. Passive items should not be selectable in new transactions.

---

### 9. PATCH /api/items/{id}/activate
**Purpose:** Set item status to ACTIVE

**Path Parameters:**
- `id` (Long): Item ID

**Response:** 200 OK with updated ItemDto

---

## 🎨 Frontend Features

### Items List Screen

#### Displayed Columns
1. **Item Name**
   - Main name displayed prominently
   - Description shown below in smaller text

2. **Category**
   - Displayed as colored badge
   - Color coding for different categories

3. **Stock**
   - Numeric value for PRODUCT items
   - "N/A" for SERVICE items
   - Right-aligned with font-mono

4. **Sale Price**
   - Formatted as currency ($X.XX)
   - Right-aligned

5. **Purchase Price**
   - Formatted as currency
   - Right-aligned

6. **Status**
   - Badge showing ACTIVE (default) or PASSIVE (secondary)

7. **Actions**
   - Toggle status (Power icon)
   - Edit (Edit icon)
   - Delete (Trash icon)

#### Functionality

**Search:**
- Real-time search in name and description
- Debounced for performance
- Search icon visual indicator

**Filters:**
- Type: All / PRODUCT / SERVICE
- Status: All / ACTIVE / PASSIVE
- Category: All / Dynamic list from API
- Filters update results immediately

**Sorting:**
- Clickable column headers
- Sort by: Name, Stock, Sale Price
- Toggle ascending/descending
- Visual indicator (↑ ↓) on sorted column

**Visual Behavior:**
- Passive items appear faded (opacity-50)
- Hover effects on rows
- Responsive design for mobile

---

### Create Item Dialog

**Form Fields:**
1. Name (required, text input)
2. Description (optional, text input)
3. Type (required, select: PRODUCT/SERVICE)
4. Category (required, text input)
5. Stock (conditional):
   - Enabled for PRODUCT
   - Disabled showing "N/A" for SERVICE
   - Auto-switches when type changes
6. Sale Price (required, number input)
7. Purchase Price (required, number input)

**Validation:**
- Real-time validation using react-hook-form + zod
- Error messages shown below fields
- Submit button disabled during creation

**Behavior:**
- Type change automatically enables/disables stock field
- Form resets on cancel or successful creation
- Success toast notification
- Automatic list refresh

---

### Edit Item Dialog

**Features:**
- Pre-populated with existing item data
- Same fields as Create dialog
- Type change handling:
  - PRODUCT → SERVICE: Stock field disabled
  - SERVICE → PRODUCT: Stock field enabled with default 0
- Status field included (ACTIVE/PASSIVE)
- Update confirmation with toast

---

### Delete Confirmation

**Features:**
- AlertDialog with item name confirmation
- Warning message about permanent deletion
- Cancel and Delete buttons
- Red colored Delete button for emphasis
- Success toast on deletion

---

## 🔒 Security Features

### Company-Based Isolation

**Enforcement Points:**
1. **Controller Level:**
   - `getCompanyIdFromUser()` extracts company from authenticated user
   - Blocks ADMIN users (they don't have companies)
   - Ensures CUSTOMER user has company link

2. **Service Level:**
   - All queries include companyId filter
   - `findByIdAndCompanyId()` for single item access
   - Prevents cross-company data access

3. **Database Level:**
   - Indexed on company_id for performance
   - Foreign key constraint to Customer table

### Authentication Requirements

- All endpoints require JWT authentication
- User role must be CUSTOMER
- ADMIN users cannot access items module
- Company link is mandatory for CUSTOMER users

---

## 📋 Business Rules

### 1. Product vs Service Distinction

**PRODUCT:**
- CAN have stock tracking
- Stock field is enabled
- Stock defaults to 0 if not provided
- Stock can be any non-negative number

**SERVICE:**
- CANNOT have stock tracking
- Stock field is disabled in UI
- Stock is always null in database
- Attempting to set stock for SERVICE returns 400 error

### 2. Type Change Behavior

**PRODUCT → SERVICE:**
- Stock automatically set to null
- Previous stock value is lost
- UI shows "N/A" for stock

**SERVICE → PRODUCT:**
- Stock field becomes editable
- Stock defaults to 0 if not provided
- User can set initial stock value

### 3. Status Rules

**ACTIVE:**
- Item is available for selection
- Appears normally in list
- Can be used in transactions

**PASSIVE:**
- Item is disabled
- Remains visible in list (faded appearance)
- Should NOT be selectable in new transactions
  - This rule must be enforced in future integration

### 4. One Company = Many Items

- Each item belongs to exactly one company
- CompanyId cannot be changed after creation
- Users can only see items from their own company

### 5. Deletion

- Hard delete is allowed
- No cascade restrictions (yet)
- Future: Check for usage in transactions before deletion

---

## 🔧 Technical Implementation Details

### Backend Architecture

**Layered Architecture:**
```
Controller → Service → Repository → Database
```

**Data Flow:**
1. Request enters Controller
2. Authentication extracted by Spring Security
3. Controller validates company access
4. Service layer applies business logic
5. Repository performs database operations
6. Response flows back up the chain

### Frontend Architecture

**Component Structure:**
```
ItemsPage
├── Header (title + Create button)
├── Filters Card (search, type, status, category)
├── Items Table
│   ├── Table Header (sortable columns)
│   └── Table Body (item rows with actions)
├── Create Dialog
├── Edit Dialog
└── Delete Alert Dialog
```

**State Management:**
- React Query for server state
- react-hook-form for form state
- Local state for UI controls

**Validation:**
- Zod schemas for type-safe validation
- Bean Validation on backend
- Real-time validation feedback

---

## 🧪 Testing Guide

### Backend API Testing

**Using cURL:**

```bash
# 1. Login as customer
CUST_TOKEN=$(curl -s -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestUser2024!"}' \
  | jq -r '.token')

# 2. Create a PRODUCT
curl -X POST http://localhost:8081/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUST_TOKEN" \
  -d '{
    "name": "Laptop Dell XPS 15",
    "description": "High-performance laptop",
    "type": "PRODUCT",
    "category": "Electronics",
    "stock": 25,
    "salePrice": 1500.00,
    "purchasePrice": 1200.00
  }'

# 3. Create a SERVICE
curl -X POST http://localhost:8081/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUST_TOKEN" \
  -d '{
    "name": "IT Consulting",
    "description": "Professional IT services",
    "type": "SERVICE",
    "category": "Services",
    "salePrice": 150.00,
    "purchasePrice": 100.00
  }'

# 4. List all items
curl -X GET "http://localhost:8081/api/items?page=0&size=10" \
  -H "Authorization: Bearer $CUST_TOKEN"

# 5. Search items
curl -X GET "http://localhost:8081/api/items?search=laptop" \
  -H "Authorization: Bearer $CUST_TOKEN"

# 6. Filter by type
curl -X GET "http://localhost:8081/api/items?type=PRODUCT" \
  -H "Authorization: Bearer $CUST_TOKEN"

# 7. Get single item
curl -X GET "http://localhost:8081/api/items/1" \
  -H "Authorization: Bearer $CUST_TOKEN"

# 8. Update item
curl -X PUT "http://localhost:8081/api/items/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUST_TOKEN" \
  -d '{
    "name": "Laptop Dell XPS 15 Updated",
    "description": "Updated description",
    "type": "PRODUCT",
    "category": "Electronics",
    "stock": 30,
    "salePrice": 1600.00,
    "purchasePrice": 1300.00,
    "status": "ACTIVE"
  }'

# 9. Deactivate item
curl -X PATCH "http://localhost:8081/api/items/1/deactivate" \
  -H "Authorization: Bearer $CUST_TOKEN"

# 10. Activate item
curl -X PATCH "http://localhost:8081/api/items/1/activate" \
  -H "Authorization: Bearer $CUST_TOKEN"

# 11. Delete item
curl -X DELETE "http://localhost:8081/api/items/1" \
  -H "Authorization: Bearer $CUST_TOKEN"
```

---

### Frontend Testing

**Manual Testing Steps:**

1. **Login:**
   - Navigate to http://localhost:5173
   - Login as a customer user
   - Verify redirect to dashboard

2. **Navigate to Items:**
   - Click "Items" in sidebar
   - Verify you see the Items page
   - Check page title and header

3. **Create Product:**
   - Click "New Item" button
   - Fill in: Name, Type (PRODUCT), Category, Stock, Prices
   - Verify stock field is enabled
   - Click "Create Item"
   - Verify success toast
   - Verify item appears in list

4. **Create Service:**
   - Click "New Item" button
   - Fill in: Name, Type (SERVICE), Category, Prices
   - Verify stock field shows "N/A" and is disabled
   - Click "Create Item"
   - Verify success toast
   - Verify item appears in list with "N/A" stock

5. **Search:**
   - Type in search box
   - Verify results update in real-time
   - Clear search, verify all items show

6. **Filter by Type:**
   - Select "Products" filter
   - Verify only PRODUCT items show
   - Select "Services" filter
   - Verify only SERVICE items show

7. **Filter by Status:**
   - Select "Active" filter
   - Verify only ACTIVE items show

8. **Sort:**
   - Click "Item Name" column header
   - Verify sort direction changes
   - Click "Sale Price" column header
   - Verify items sorted by price

9. **Edit Item:**
   - Click Edit icon on an item
   - Verify form pre-populated
   - Change Type from PRODUCT to SERVICE
   - Verify stock field becomes disabled
   - Change back to PRODUCT
   - Verify stock field re-enabled
   - Update and save
   - Verify changes reflected in list

10. **Toggle Status:**
    - Click Power icon on active item
    - Verify item becomes passive (faded)
    - Verify badge shows "PASSIVE"
    - Click Power icon again
    - Verify item becomes active

11. **Delete Item:**
    - Click Trash icon
    - Verify confirmation dialog appears
    - Click Cancel
    - Verify item still exists
    - Click Trash icon again
    - Click Delete
    - Verify item removed from list

---

## 📊 Database Schema

```sql
CREATE TABLE items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    type VARCHAR(20) NOT NULL,  -- PRODUCT or SERVICE
    category VARCHAR(100),
    stock DECIMAL(10,2),         -- NULL for SERVICE
    sale_price DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL, -- ACTIVE or PASSIVE
    company_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    FOREIGN KEY (company_id) REFERENCES customer(id),

    INDEX idx_item_company (company_id),
    INDEX idx_item_type (type),
    INDEX idx_item_status (status)
);
```

**Indexes:**
- `company_id`: For company-based filtering (most common query)
- `type`: For filtering by PRODUCT/SERVICE
- `status`: For filtering by ACTIVE/PASSIVE

---

## 🚀 Future Enhancements

The Items module is designed to be extensible. Future planned features:

### 1. Stock Management (Not Implemented)
- Stock movements (in/out)
- Stock adjustments
- Low stock alerts
- Reorder points

### 2. Warehouse Management (Not Implemented)
- Multiple warehouse support
- Stock per warehouse
- Warehouse transfers
- Location tracking

### 3. Barcode Support (Not Implemented)
- Barcode generation
- Barcode scanning
- SKU management
- UPC/EAN support

### 4. Advanced Features (Not Implemented)
- Item variants (size, color)
- Unit of measure
- Multi-currency pricing
- Bulk operations
- Import/export
- Item images
- Related items
- Sales history analytics

**Note:** These features are NOT part of the current implementation but the architecture supports them.

---

## ⚠️ Known Limitations

1. **No transaction checks:**
   - Items can be deleted even if used in transactions
   - Future: Add foreign key checks before deletion

2. **No stock movement tracking:**
   - Stock is just a number
   - No history of changes
   - Future: Add stock movement table

3. **Simple category system:**
   - Categories are just strings
   - No category hierarchy
   - Future: Create Category entity

4. **No multi-currency:**
   - Prices in single currency only
   - Future: Add currency field

5. **No image support:**
   - Items have no photos
   - Future: Add image upload

---

## 🎓 Code Examples

### Creating an Item via Service

```java
CreateItemRequest request = CreateItemRequest.builder()
    .name("Laptop")
    .type(ItemType.PRODUCT)
    .category("Electronics")
    .stock(BigDecimal.valueOf(10))
    .salePrice(BigDecimal.valueOf(1500))
    .purchasePrice(BigDecimal.valueOf(1200))
    .build();

ItemDto item = itemService.createItem(request, companyId);
```

### Querying Items with Filters

```java
Page<ItemDto> items = itemService.getItems(
    companyId,
    "laptop",              // search
    ItemType.PRODUCT,      // type filter
    ItemStatus.ACTIVE,     // status filter
    "Electronics",         // category filter
    0,                     // page
    10,                    // size
    "name",                // sortBy
    "asc"                  // sortDirection
);
```

---

## 📝 Best Practices

### When Creating Items

1. ✅ Always set meaningful names
2. ✅ Add descriptions for clarity
3. ✅ Choose correct type (PRODUCT vs SERVICE)
4. ✅ Use consistent category names
5. ✅ Set realistic prices
6. ✅ For PRODUCT, set initial stock

### When Updating Items

1. ✅ Verify type change implications
2. ✅ Update stock when necessary
3. ✅ Keep category consistent
4. ❌ Don't change type frequently

### When Deleting Items

1. ⚠️ Consider using PASSIVE status instead
2. ⚠️ Check for usage in transactions (future)
3. ✅ Confirm deletion is intentional

---

## 🎯 Success Metrics

The Items module implementation achieves:

✅ **Complete CRUD Operations:** Create, Read, Update, Delete
✅ **Advanced Filtering:** By type, status, category
✅ **Real-time Search:** In name and description
✅ **Flexible Sorting:** By multiple columns
✅ **Company Security:** Full data isolation
✅ **Type Safety:** Strict PRODUCT/SERVICE distinction
✅ **User-Friendly UI:** Intuitive and responsive
✅ **Extensible Design:** Ready for future features
✅ **Clean Code:** Well-documented and maintainable
✅ **Production Ready:** Validated and tested

---

## 📞 API Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/items | List items with filters |
| GET | /api/items/{id} | Get single item |
| GET | /api/items/active | Get active items |
| GET | /api/items/categories | Get categories |
| POST | /api/items | Create item |
| PUT | /api/items/{id} | Update item |
| DELETE | /api/items/{id} | Delete item |
| PATCH | /api/items/{id}/deactivate | Deactivate item |
| PATCH | /api/items/{id}/activate | Activate item |

---

## 🏁 Conclusion

The Items (Inventory) module provides a solid foundation for inventory management in the PreAccounting System. It implements all required features with clean architecture, proper security, and excellent user experience.

**The module is:**
- ✅ Fully functional
- ✅ Production-ready
- ✅ Well-documented
- ✅ Extensible
- ✅ Secure

**Next steps:**
1. Integrate with Income/Expense module
2. Use items in invoices
3. Add stock movement tracking (future enhancement)
4. Implement advanced features as needed

This is version 1.0 of the Items module - a stable and extensible foundation for inventory management! 🎉
