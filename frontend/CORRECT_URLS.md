# ✅ Correct URLs to Use

## Port Configuration

- **Frontend (Next.js)**: Port **3001** → http://localhost:3001
- **Backend (NestJS)**: Port **3000** → http://localhost:3000/api

## ✅ What to Do Now

### 1. Access the Frontend
Open your browser and go to:
```
http://localhost:3001
```

**NOT** http://localhost:3000 (that's the backend!)

### 2. Start Backend (if not running)
In a separate terminal:
```powershell
cd D:\StockMaster\stockflow-ims\backend
npm run start:dev
```

Wait for: `🚀 StockMaster Backend running on http://localhost:3000`

### 3. Test Registration/Login
1. Go to: **http://localhost:3001/register**
2. Fill in the form
3. After signup, you'll be redirected to: **http://localhost:3001/dashboard**

## Quick Verification

✅ **Frontend running?**
- Check terminal: Should show `Local: http://localhost:3001`
- Or visit: http://localhost:3001

✅ **Backend running?**
- Check terminal: Should show `🚀 StockMaster Backend running on http://localhost:3000`
- Or visit: http://localhost:3000/api/health

## Common Mistakes

❌ **Wrong**: http://localhost:3000/dashboard
- This hits the backend API, which doesn't have a `/dashboard` route
- You'll get: `{"message": "Cannot GET /dashboard", "error": "Not Found"}`

✅ **Correct**: http://localhost:3001/dashboard
- This hits the Next.js frontend, which has the dashboard page
- Should show the dashboard with KPIs

## Summary

| What | URL |
|------|-----|
| **Frontend App** | http://localhost:3001 |
| **Login Page** | http://localhost:3001/login |
| **Register Page** | http://localhost:3001/register |
| **Dashboard** | http://localhost:3001/dashboard |
| **Backend API** | http://localhost:3000/api |
| **Backend Health** | http://localhost:3000/api/health |

**Always use port 3001 for the frontend!**

