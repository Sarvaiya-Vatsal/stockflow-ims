# Quick Start Guide

## ✅ Installation Complete!

All npm packages have been successfully installed. The npm cache has been moved to D: drive to avoid disk space issues.

## Next Steps

### 1. Create Environment File

Create `.env.local` in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. Start Development Server

```powershell
npm run dev
```

The app will be available at: **http://localhost:3001**

### 3. Start Backend (if not running)

Make sure your backend is running on port 3000:

```powershell
cd ..\backend
npm run start:dev
```

## What's Ready

✅ **Authentication**
- Login page at `/login`
- Register page at `/register`

✅ **Dashboard**
- KPI cards showing inventory metrics
- Recent activity feed
- Available at `/dashboard`

✅ **Products**
- Product listing with search
- Available at `/products`

✅ **Navigation**
- Sidebar with all menu items
- User profile display
- Logout functionality

## Testing the App

1. **Start backend**: `cd ..\backend && npm run start:dev`
2. **Start frontend**: `npm run dev`
3. **Open browser**: http://localhost:3001
4. **Register/Login**: Create an account or login
5. **Explore**: Navigate through Dashboard and Products

## Troubleshooting

### Port Already in Use
If port 3001 is taken, Next.js will use the next available port (3002, 3003, etc.)

### API Connection Errors
- Ensure backend is running on `http://localhost:3000`
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Verify CORS is enabled in backend

### Module Errors
If you see module not found errors, try:
```powershell
npm install
```

## Disk Space Fix Applied

The npm cache has been moved to `D:\npm-cache` to avoid C: drive space issues. This is now your default npm cache location.

