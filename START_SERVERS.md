# How to Start Both Servers

## Quick Start

You need **two separate terminal windows** - one for backend, one for frontend.

### Terminal 1: Backend (Port 3000)
```powershell
cd D:\StockMaster\stockflow-ims\backend
npm run start:dev
```

Wait for: `🚀 StockMaster Backend running on http://localhost:3000`

### Terminal 2: Frontend (Port 3001)
```powershell
cd D:\StockMaster\stockflow-ims\frontend
npm run dev
```

Wait for: `✓ Ready in X.Xs` and `Local: http://localhost:3001`

## Access Points

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Backend Health**: http://localhost:3000/api/health

## Troubleshooting

### Port 3000 Already in Use

If you see `EADDRINUSE: address already in use :::3000`:

1. Find what's using port 3000:
   ```powershell
   netstat -ano | findstr :3000
   ```

2. Kill the process (replace PID with the number from step 1):
   ```powershell
   taskkill /PID <PID> /F
   ```

3. Try starting the backend again.

### Registration Failed Error

If you see "Registration failed. Please try again.":

1. **Check backend is running** - Make sure you see the backend logs
2. **Check API URL** - Verify `.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:3000/api`
3. **Check backend logs** - Look for error messages in the backend terminal
4. **Try login instead** - If you already have an account, try logging in

### Common Issues

- **404 errors**: Backend not running or wrong API URL
- **CORS errors**: Backend CORS is enabled, should work automatically
- **Connection refused**: Backend not started yet

## Verification

1. Backend health check: http://localhost:3000/api/health
   - Should return: `{"status":"ok","database":"connected"}`

2. Frontend loads: http://localhost:3001
   - Should redirect to `/login` or `/dashboard`

3. Registration works:
   - Go to http://localhost:3001/register
   - Fill in the form
   - Should redirect to dashboard on success

