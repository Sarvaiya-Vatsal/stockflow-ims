# 🧪 StockMaster Testing Guide

## Prerequisites
- ✅ Backend running on `http://localhost:3000`
- ✅ Frontend running on `http://localhost:3001`
- ✅ PostgreSQL database connected
- ✅ User account created (register or use existing)

---

## Step-by-Step Testing Guide

### **Step 1: Login to the System**

1. Navigate to `http://localhost:3001`
2. You'll be redirected to the login page
3. Enter your credentials:
   - **Email:** `your-email@example.com`
   - **Password:** `YourPassword123!`
4. Click **"Sign In"**
5. You should be redirected to the Dashboard

---

### **Step 2: Create Warehouses** (Settings Page)

1. Click **"Settings"** in the left sidebar
2. Click **"+ Add Warehouse"** button
3. Fill in the form:
   ```
   Name: Main Warehouse
   Address: 123 Industrial Park, City, State 12345
   ```
4. Click **"Create Warehouse"**
5. Create a second warehouse:
   ```
   Name: Secondary Warehouse
   Address: 456 Distribution Center, City, State 67890
   ```
6. Click **"Create Warehouse"**

**Expected Result:** Both warehouses appear in the list

---

### **Step 3: Create Categories** (Products Page)

1. Click **"Products"** in the left sidebar
2. Click **"+ Add Product"** button
3. Before creating a product, we need categories. Let's create them via API or add a category field in the product form.

**Note:** Categories are optional. You can skip this step and create products without categories.

---

### **Step 4: Create Products**

1. On the **Products** page, click **"+ Add Product"**
2. Fill in the form with this example data:

   **Product 1:**
   ```
   SKU / Code: PROD-001
   Name: Widget A
   Description: High-quality widget for industrial use
   Category: (Leave empty or select if you created one)
   Unit of Measure: pcs
   Reorder Point: 50
   Initial Stock:
     - Warehouse: Main Warehouse
     - Quantity: 100
   ```
3. Click **"Create Product"**

   **Product 2:**
   ```
   SKU / Code: PROD-002
   Name: Steel Rods
   Description: 10mm diameter steel rods
   Category: (Leave empty)
   Unit of Measure: kg
   Reorder Point: 200
   Initial Stock:
     - Warehouse: Main Warehouse
     - Quantity: 500
   ```
4. Click **"Create Product"**

   **Product 3:**
   ```
   SKU / Code: PROD-003
   Name: Wood Tables
   Description: Best wood tables for better dining experience
   Category: (Leave empty)
   Unit of Measure: pcs
   Reorder Point: 7
   Initial Stock:
     - Warehouse: Main Warehouse
     - Quantity: 5
   ```
5. Click **"Create Product"**

**Expected Result:** All products appear in the products list with their stock levels

---

### **Step 5: View Dashboard**

1. Click **"Dashboard"** in the left sidebar
2. Check the KPI cards:
   - **Total Products:** Should show 3
   - **Low Stock Items:** Should show 1 (Wood Tables with 5 < 7 reorder point)
   - **Pending Receipts:** 0
   - **Pending Deliveries:** 0
   - **Scheduled Transfers:** 0
3. Scroll down to see **Recent Activity** - should show stock creation entries

**Expected Result:** Dashboard displays real data from your database

---

### **Step 6: Create a Receipt** (Incoming Stock)

1. Click **"Receipts"** in the left sidebar
2. Click **"+ New Receipt"** button
3. Fill in the form:
   ```
   Supplier Name: Azure Interior
   Warehouse: Main Warehouse
   Expected Date: (Select a future date, e.g., tomorrow)
   Items:
     - Product: Widget A (PROD-001)
       Quantity: 50
       Unit Price: 25.00
     - Product: Steel Rods (PROD-002)
       Quantity: 100
       Unit Price: 15.50
   ```
4. Click **"+ Add Item"** to add more items if needed
5. Click **"Create Receipt"**

**Expected Result:** Receipt appears in the list with status "Draft"

6. Click the **Eye icon** to view the receipt details
7. Click **"Print"** button to test print functionality
8. If status is "Ready", click the **Checkmark icon** to validate
   - This will update stock levels automatically

**Expected Result:** After validation, stock increases by the receipt quantities

---

### **Step 7: Create a Delivery Order** (Outgoing Stock)

1. Click **"Delivery Orders"** in the left sidebar
2. Click **"+ New Delivery Order"** button
3. Fill in the form:
   ```
   Customer Name: ABC Manufacturing
   Warehouse: Main Warehouse
   Delivery Date: (Select a future date)
   Items:
     - Product: Widget A (PROD-001)
       Quantity: 10
     - Product: Wood Tables (PROD-003)
       Quantity: 2
   ```
4. Click **"Create Delivery Order"**

**Expected Result:** Delivery order appears in the list with status "Draft"

5. Click the **Package icon** to mark items as "Picked"
6. Click the **Truck icon** to mark items as "Packed"
7. Click the **Checkmark icon** to validate
   - This will deduct stock and release reservations

**Expected Result:** After validation, stock decreases by the order quantities

---

### **Step 8: Create an Internal Transfer**

1. Click **"Internal Transfers"** in the left sidebar
2. Click **"+ New Transfer"** button
3. Fill in the form:
   ```
   From Warehouse: Main Warehouse
   To Warehouse: Secondary Warehouse
   Transfer Date: (Select a future date)
   Items:
     - Product: Widget A (PROD-001)
       Quantity: 20
     - Product: Steel Rods (PROD-002)
       Quantity: 50
   ```
4. Click **"Create Transfer"**

**Expected Result:** Transfer appears in the list with status "Draft"

5. Click the **Checkmark icon** to validate
   - This will move stock from Main Warehouse to Secondary Warehouse

**Expected Result:** 
- Main Warehouse stock decreases
- Secondary Warehouse stock increases
- Both changes are logged in the audit ledger

---

### **Step 9: Create a Stock Adjustment**

1. Click **"Stock Adjustments"** in the left sidebar
2. Click **"+ New Adjustment"** button
3. Fill in the form:
   ```
   Warehouse: Main Warehouse
   Reason: Cycle Count (or select: Damage, Loss, Found, Other)
   Notes: Physical count revealed discrepancy
   Items:
     - Product: Widget A (PROD-001)
       Adjusted Quantity: 95
       (This sets the stock to exactly 95, regardless of current quantity)
   ```
4. Click **"Create Adjustment"**

**Expected Result:** Adjustment appears in the list with status "Draft"

5. Click the **Checkmark icon** to validate
   - This will correct the stock to the adjusted quantity

**Expected Result:** Stock is updated to the exact quantity you specified

---

### **Step 10: View Move History**

1. Click **"Move History"** in the left sidebar
2. Click **"Show Filters"** button
3. Test filters:
   - **Transaction Type:** Select "receipt" or "delivery"
   - **Warehouse:** Select a specific warehouse
   - **Date From/To:** Select date range
4. Click **"Clear Filters"** to reset
5. Review the movement history entries

**Expected Result:** All stock movements are displayed with details

---

### **Step 11: Test Kanban Views**

1. Go to **"Receipts"** page
2. Click the **Grid icon** (Kanban view) in the top right
3. You should see receipts organized by status columns:
   - Draft
   - Waiting
   - Ready
   - Done
   - Canceled
4. Drag receipts between columns (if implemented) or use action buttons
5. Repeat for **"Delivery Orders"** page

**Expected Result:** Visual Kanban board showing status-based organization

---

### **Step 12: Test Search and Filters**

1. On **"Products"** page:
   - Type "Widget" in the search box
   - Should filter to show only Widget A
   - Click **"Low Stock Only"** button
   - Should show only products below reorder point

2. On **"Receipts"** page:
   - Type "Azure" in the search box
   - Select "Ready" from status filter
   - Should show only matching receipts

3. On **"Delivery Orders"** page:
   - Search by customer name or reference
   - Filter by status

**Expected Result:** Search and filters work correctly

---

### **Step 13: Test Print Functionality**

1. Go to **"Receipts"** page
2. Find a receipt and click the **Printer icon**
3. A print preview window should open
4. Review the formatted receipt
5. Repeat for **"Delivery Orders"**

**Expected Result:** Print preview shows formatted document with all details

---

### **Step 14: Verify Dashboard Updates**

1. After performing several operations (receipts, deliveries, transfers, adjustments)
2. Go back to **"Dashboard"**
3. Check that KPIs have updated:
   - **Total Products:** Should still be 3
   - **Low Stock Items:** May have changed based on operations
   - **Pending Receipts/Deliveries/Transfers:** Should reflect current counts
4. Check **Recent Activity** section
   - Should show all recent stock movements
5. Click **"Show Filters"** in Move History section
   - Test filtering by transaction type, warehouse, dates

**Expected Result:** Dashboard reflects all real-time changes

---

### **Step 15: Test Forgot Password**

1. Click **"Logout"** in the sidebar
2. On the login page, click **"Forgot Password?"**
3. Enter your email address
4. Click **"Send Reset Instructions"**
5. Check your email for OTP code (if email service is configured)
6. Use the OTP to reset your password

**Expected Result:** Password reset flow works (requires email service setup)

---

## 📊 Expected Final State

After completing all steps, you should have:

- ✅ **2 Warehouses:** Main Warehouse, Secondary Warehouse
- ✅ **3 Products:** Widget A, Steel Rods, Wood Tables
- ✅ **Stock Levels:** Updated based on receipts, deliveries, transfers, and adjustments
- ✅ **Receipts:** At least 1 receipt (validated or pending)
- ✅ **Delivery Orders:** At least 1 delivery order (validated or pending)
- ✅ **Internal Transfers:** At least 1 transfer between warehouses
- ✅ **Stock Adjustments:** At least 1 adjustment
- ✅ **Audit Trail:** Complete history of all movements in Move History

---

## 🐛 Troubleshooting

### If products can't be created:
- ✅ Make sure at least one warehouse exists
- ✅ Check that SKU is unique
- ✅ Verify categoryId is a valid UUID or empty

### If receipts/delivery orders fail:
- ✅ Ensure products exist and have stock (for deliveries)
- ✅ Check that warehouse is selected
- ✅ Verify date format is correct (YYYY-MM-DD)

### If transfers fail:
- ✅ Make sure From and To warehouses are different
- ✅ Verify source warehouse has enough stock
- ✅ Check that products exist in both warehouses

### If adjustments fail:
- ✅ Ensure warehouse is selected
- ✅ Verify adjustedQuantity is a valid number
- ✅ Check that product exists in the selected warehouse

---

## 🎯 Quick Test Checklist

- [ ] Login works
- [ ] Dashboard shows real data
- [ ] Can create warehouse
- [ ] Can create product with initial stock
- [ ] Can create receipt
- [ ] Can validate receipt (stock increases)
- [ ] Can create delivery order
- [ ] Can pick/pack/validate delivery order (stock decreases)
- [ ] Can create internal transfer
- [ ] Can validate transfer (stock moves between warehouses)
- [ ] Can create stock adjustment
- [ ] Can validate adjustment (stock corrects)
- [ ] Can view receipt details
- [ ] Can print receipt
- [ ] Can view delivery order details
- [ ] Can print delivery order
- [ ] Kanban view works for receipts
- [ ] Kanban view works for delivery orders
- [ ] Search and filters work
- [ ] Move history shows all transactions
- [ ] Dashboard updates after operations

---

## 📝 Notes

- All dates should be in **YYYY-MM-DD** format
- Stock quantities must be **positive numbers**
- SKUs must be **unique**
- Category IDs must be **valid UUIDs** or **empty**
- Warehouse selection is **required** for all operations
- Products must exist before adding to receipts/orders/transfers/adjustments

Happy Testing! 🚀

