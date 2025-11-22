# Restart Server to Load New Routes

## The Issue
The 404 error means the server hasn't loaded the new Delivery Orders routes yet.

## Solution: Restart the Server

### Step 1: Stop the Current Server
In the terminal where `npm run start:dev` is running:
- Press `Ctrl+C` to stop the server

### Step 2: Start the Server Again
```powershell
npm run start:dev
```

### Step 3: Wait for Compilation
Wait until you see:
```
🚀 StockMaster Backend running on http://localhost:3000
📚 API available at http://localhost:3000/api
```

### Step 4: Test Again
Run the test script:
```powershell
.\TEST_DELIVERY_ORDERS.ps1
```

## Why This Happens
When you add a new module, NestJS needs to:
1. Compile the new code
2. Register the new routes
3. Initialize the module

The watch mode should do this automatically, but sometimes it needs a manual restart.

## Quick Check
After restarting, you can verify the route exists:
```powershell
# This should return 401 (unauthorized) not 404 (not found)
Invoke-WebRequest -Uri "http://localhost:3000/api/delivery-orders" -Method Get
```

If you get 401, the route exists! If you get 404, the server didn't restart properly.

