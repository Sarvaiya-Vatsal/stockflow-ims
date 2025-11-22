# Fix: Dashboard 404 Error

## Problem

After signup/login, you're getting:
```json
{
  "message": "Cannot GET /dashboard",
  "error": "Not Found",
  "statusCode": 404
}
```

This error format is from **NestJS backend**, which means the request is going to the wrong server.

## Solution

### ✅ Make sure you're accessing the FRONTEND URL:

- **Frontend (Next.js)**: http://localhost:3001/dashboard
- **Backend (NestJS)**: http://localhost:3000/api

### Common Mistakes:

❌ **Wrong**: http://localhost:3000/dashboard (hits backend)
✅ **Correct**: http://localhost:3001/dashboard (hits frontend)

## What I Fixed

1. Changed navigation from `router.push()` to `window.location.href` for more reliable redirects
2. This ensures the browser navigates to the frontend URL properly

## Steps to Verify

1. **Check frontend is running on port 3001:**
   ```powershell
   # In frontend terminal, you should see:
   - Local: http://localhost:3001
   ```

2. **Check backend is running on port 3000:**
   ```powershell
   # In backend terminal, you should see:
   🚀 StockMaster Backend running on http://localhost:3000
   ```

3. **Access the correct URL:**
   - Open browser to: **http://localhost:3001**
   - Register/Login
   - Should redirect to: **http://localhost:3001/dashboard**

## If Still Getting 404

1. **Restart frontend server:**
   ```powershell
   # Stop (Ctrl+C) and restart
   cd D:\StockMaster\stockflow-ims\frontend
   npm run dev
   ```

2. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete`
   - Clear cached images and files
   - Or use Incognito/Private mode

3. **Check browser console (F12):**
   - Look for any JavaScript errors
   - Check Network tab to see where requests are going

4. **Verify dashboard page exists:**
   - File should exist: `frontend/app/dashboard/page.tsx`
   - Should have `export default function DashboardPage()`

## Port Configuration Summary

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3001 | http://localhost:3001 |
| Backend API | 3000 | http://localhost:3000/api |

**Always use port 3001 for the frontend!**

