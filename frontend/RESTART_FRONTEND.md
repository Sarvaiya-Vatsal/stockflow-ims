# How to Restart Frontend on Port 3001

## Problem
Frontend is still running on port 3000 (conflicts with backend).

## Solution

### Step 1: Stop Current Frontend Server
In the terminal where `npm run dev` is running:
- Press `Ctrl+C` to stop the server

### Step 2: Verify Port 3000 is Free
```powershell
netstat -ano | findstr :3000
```
Should show only backend connections (if backend is running).

### Step 3: Restart Frontend
```powershell
npm run dev
```

You should now see:
```
▲ Next.js 14.2.33
- Local:        http://localhost:3001  ← Should be 3001!
```

### Step 4: Verify Both Servers
- **Backend**: http://localhost:3000/api/health
- **Frontend**: http://localhost:3001

## If Port 3001 is Already in Use

If you see an error about port 3001 being in use:

1. Find what's using it:
   ```powershell
   netstat -ano | findstr :3001
   ```

2. Kill the process (replace PID with the number):
   ```powershell
   taskkill /PID <PID> /F
   ```

3. Restart frontend:
   ```powershell
   npm run dev
   ```

## Quick Check

After restarting, verify:
- Frontend terminal shows: `Local: http://localhost:3001`
- Backend terminal shows: `🚀 StockMaster Backend running on http://localhost:3000`
- Access frontend at: **http://localhost:3001**
- Access backend API at: **http://localhost:3000/api**

