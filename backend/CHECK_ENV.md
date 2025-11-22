# Fix: JWT_SECRET Missing Error

## The Problem
Error: `JwtStrategy requires a secret or key`

This means the `JWT_SECRET` environment variable is not being read from your `.env` file.

## Solution

### Step 1: Check if .env file exists
```powershell
cd D:\StockMaster\stockflow-ims\backend
Test-Path .env
```

If it returns `False`, the file doesn't exist.

### Step 2: Create .env file
Copy from `.env.example`:
```powershell
Copy-Item .env.example .env
```

### Step 3: Verify JWT_SECRET is set
Open `.env` file and make sure it has:
```env
JWT_SECRET=stockmaster-super-secret-jwt-key-2024
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=stockmaster-super-secret-refresh-key-2024
JWT_REFRESH_EXPIRES_IN=7d
```

### Step 4: Restart the server
1. Stop the server (Ctrl+C)
2. Start again: `npm run start:dev`

## Quick Fix Command
```powershell
# If .env doesn't exist:
Copy-Item .env.example .env

# Then restart server
npm run start:dev
```

## What Should Be in .env
```env
# Database
DATABASE_URL=postgresql://stockmaster:stockmaster@localhost:5432/stockmaster
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=stockmaster
DB_PASSWORD=stockmaster
DB_DATABASE=stockmaster

# Application
PORT=3000
NODE_ENV=development

# JWT (REQUIRED!)
JWT_SECRET=stockmaster-super-secret-jwt-key-2024
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=stockmaster-super-secret-refresh-key-2024
JWT_REFRESH_EXPIRES_IN=7d
```

