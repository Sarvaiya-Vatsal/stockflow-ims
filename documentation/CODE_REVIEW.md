# StockFlow IMS - Code Review Report

## 1. Issues Found

### Critical Issues

#### 1.1 Missing Error Handling in Auth Controller
**File:** `backend/src/controllers/authController.js`
**Issue:** `register()` and `login()` functions lack try/catch blocks. If Prisma throws an error (e.g., database connection issue), the server will crash.

**Fix:**
```javascript
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    // ... existing code ...
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    // ... existing code ...
    res.json({ token, user: {...} });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to login" });
  }
}
```

#### 1.2 Missing Product Validation in Receipt/Delivery Controllers
**Files:** `backend/src/controllers/receiptController.js`, `backend/src/controllers/deliveryController.js`
**Issue:** Controllers validate warehouse exists but don't verify products exist before applying stock changes. This could lead to orphaned ledger entries.

**Fix for receiptController.js (line 44-52):**
```javascript
for (const line of lines) {
  const product = await prisma.product.findUnique({
    where: { id: line.productId },
  });
  
  if (!product) {
    await prisma.receipt.delete({ where: { id: receipt.id } });
    return res.status(400).json({ error: `Product ${line.productId} not found` });
  }
  
  await applyStockChange({
    productId: line.productId,
    warehouseId,
    quantityChange: line.quantity,
    type: "RECEIPT",
    reference: receipt.reference,
  });
}
```

**Same fix needed in deliveryController.js (line 44-60).**

#### 1.3 Receipt Controller Missing Rollback on Stock Failure
**File:** `backend/src/controllers/receiptController.js`
**Issue:** If `applyStockChange` fails for any line after the first, the receipt is already created but stock isn't updated. Delivery controller handles this correctly.

**Fix (line 44-52):**
```javascript
for (const line of lines) {
  try {
    await applyStockChange({
      productId: line.productId,
      warehouseId,
      quantityChange: line.quantity,
      type: "RECEIPT",
      reference: receipt.reference,
    });
  } catch (error) {
    await prisma.receipt.delete({ where: { id: receipt.id } });
    return res.status(400).json({ 
      error: error.message === "Insufficient stock" 
        ? "Insufficient stock" 
        : "Failed to update stock" 
    });
  }
}
```

### Minor Issues

#### 1.4 Missing JWT_SECRET Validation
**Files:** `backend/src/controllers/authController.js`, `backend/src/middleware/authMiddleware.js`
**Issue:** No check if `process.env.JWT_SECRET` exists. Will throw undefined error at runtime.

**Fix:** Add to `backend/src/index.js` or create a config validation:
```javascript
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set in environment variables");
  process.exit(1);
}
```

#### 1.5 Quantity Type Validation
**Files:** `backend/src/controllers/receiptController.js`, `backend/src/controllers/deliveryController.js`
**Issue:** Validation checks `quantity > 0` but doesn't ensure it's an integer. Could accept floats.

**Fix (line 20 in both files):**
```javascript
if (!line.quantity || !Number.isInteger(Number(line.quantity)) || line.quantity <= 0) {
  return res.status(400).json({ error: "Each line must have a positive integer quantity" });
}
```

## 2. Confirmed Correct Flows

### ✅ Authentication Flow
- Register → creates user with hashed password
- Login → validates credentials, returns JWT token
- Token stored in localStorage as "authToken"
- ProtectedRoute correctly checks token

### ✅ Product Management
- GET /api/products → returns all products with stock totals
- POST /api/products → validates required fields, checks SKU uniqueness
- PUT /api/products/:id → validates product exists before update

### ✅ Stock Operations
- Receipt → creates Receipt record, increases InventoryStock, creates LedgerEntry
- Delivery → creates Delivery record, decreases InventoryStock (with validation), creates LedgerEntry
- StockService correctly prevents negative stock
- Ledger entries properly linked to products and warehouses

### ✅ Dashboard
- Correctly counts products, warehouses, and low stock items
- Uses proper Prisma queries matching schema

### ✅ Frontend Integration
- LoginPage correctly posts to /api/auth/login
- Stores token in localStorage
- Navigates to /dashboard on success
- api.js correctly intercepts and adds Authorization header
- OperationsPage forms match backend API expectations
- Move History correctly fetches and displays ledger entries

## 3. Schema Consistency

✅ **All models match code usage:**
- User model matches authController usage
- Product model matches productController usage
- Warehouse model matches receipt/delivery controllers
- InventoryStock model matches stockService
- LedgerEntry model matches ledgerController
- Receipt/Delivery models match controllers
- DocumentStatus enum correctly used

✅ **Relations are consistent:**
- Product ↔ InventoryStock (one-to-many)
- Warehouse ↔ InventoryStock (one-to-many)
- Product ↔ LedgerEntry (one-to-many)
- Warehouse ↔ LedgerEntry (one-to-many)
- Warehouse ↔ Receipt/Delivery (one-to-many)

## 4. Route Registration

✅ **All routes correctly registered in app.js:**
- /api/auth → authRoutes ✓
- /api/products → productRoutes ✓
- /api/dashboard → dashboardRoutes ✓
- /api/stock/receipts → receiptRoutes ✓
- /api/stock/deliveries → deliveryRoutes ✓
- /api/stock/ledger → ledgerRoutes ✓

## 5. Missing Features / Assumptions

### Warehouse Management
- **Issue:** No API endpoint to create warehouses. Controllers assume warehouse IDs exist.
- **Impact:** Users must manually insert warehouses into database or create via Prisma Studio.
- **Recommendation:** Add POST /api/warehouses endpoint (optional for MVP).

### Product Validation in Frontend
- **Issue:** OperationsPage forms accept any string for productId/warehouseId.
- **Impact:** Poor UX - users don't know valid IDs.
- **Recommendation:** Add dropdowns or autocomplete (future enhancement).

## 6. Test Plan

### Postman API Tests

1. **Register User**
   ```
   POST http://localhost:5000/api/auth/register
   Body: { "name": "Test User", "email": "test@example.com", "password": "test123" }
   Expected: 201 Created
   ```

2. **Login**
   ```
   POST http://localhost:5000/api/auth/login
   Body: { "email": "test@example.com", "password": "test123" }
   Expected: 200 OK with token
   ```

3. **Create Product**
   ```
   POST http://localhost:5000/api/products
   Body: { "name": "Test Product", "sku": "TEST-001", "unit": "pcs", "reorderLevel": 10 }
   Expected: 201 Created
   Save product.id for next steps
   ```

4. **Create Receipt** (requires warehouse ID - create manually or via Prisma Studio first)
   ```
   POST http://localhost:5000/api/stock/receipts
   Headers: Authorization: Bearer <token>
   Body: {
     "warehouseId": "<warehouse-id>",
     "lines": [{ "productId": "<product-id>", "quantity": 100 }]
   }
   Expected: 201 Created
   ```

5. **Create Delivery**
   ```
   POST http://localhost:5000/api/stock/deliveries
   Headers: Authorization: Bearer <token>
   Body: {
     "warehouseId": "<warehouse-id>",
     "lines": [{ "productId": "<product-id>", "quantity": 50 }]
   }
   Expected: 201 Created
   ```

6. **Get Ledger**
   ```
   GET http://localhost:5000/api/stock/ledger
   Headers: Authorization: Bearer <token>
   Expected: 200 OK with array of ledger entries
   ```

### UI Flow Tests

1. **Login Flow**
   - Navigate to /login
   - Enter valid credentials
   - Should redirect to /dashboard
   - Token should be in localStorage

2. **Create Receipt Flow**
   - Navigate to /operations
   - Click "Receipts" tab
   - Fill form with valid warehouse/product IDs
   - Submit
   - Should show success message
   - Check Move History tab - should show new entry

3. **Move History Flow**
   - Navigate to /operations
   - Click "Move History" tab
   - Should display table with recent ledger entries
   - Verify columns: Date, Product, Warehouse, Change, Type, Reference

## 7. Summary

**Overall Assessment:** The codebase is well-structured and follows good practices. The main issues are missing error handling in auth controller and missing product validation in stock operations. The core flows are logically correct and should work once these fixes are applied.

**Priority Fixes:**
1. Add try/catch to authController (Critical)
2. Add product validation to receipt/delivery controllers (High)
3. Add rollback logic to receipt controller (High)
4. Add JWT_SECRET validation (Medium)
5. Improve quantity validation (Low)

**Code Quality:** Good - clean structure, minimal comments, proper separation of concerns.

