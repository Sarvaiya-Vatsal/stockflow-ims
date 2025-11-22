# Quick Fix for WinError 10013

This error usually means:
1. **Database doesn't exist yet** (most likely)
2. **User doesn't exist**
3. **Wrong password in .env**

## Solution: Create the Database

### Option 1: Using pgAdmin 4 (Easiest - GUI)

1. **Open pgAdmin 4** from Start Menu
2. **Connect to server** (enter your postgres password when prompted)
3. **Create User:**
   - Right-click "Login/Group Roles" → Create → Login/Group Role
   - Name: `stockmaster`
   - Password: `stockmaster`
   - Go to "Privileges" tab → Check "Can login?"
   - Click "Save"

4. **Create Database:**
   - Right-click "Databases" → Create → Database
   - Name: `stockmaster`
   - Owner: Select `stockmaster` from dropdown
   - Click "Save"

### Option 2: Using SQL Shell (psql)

1. **Open "SQL Shell (psql)"** from Start Menu
2. Press Enter 4 times (accept defaults: server=localhost, database=postgres, port=5432)
3. **Enter your postgres password** (the one you set during installation)
4. **Run these commands:**

```sql
CREATE USER stockmaster WITH PASSWORD 'stockmaster';
CREATE DATABASE stockmaster OWNER stockmaster;
GRANT ALL PRIVILEGES ON DATABASE stockmaster TO stockmaster;
\q
```

### Option 3: Check if .env file exists

Make sure `.env` file exists in `stockflow-ims/backend/` folder with:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=stockmaster
DB_PASSWORD=stockmaster
DB_DATABASE=stockmaster
NODE_ENV=development
PORT=3000
```

If it doesn't exist, create it from `.env.example`:
```powershell
Copy-Item .env.example .env
```

## After Creating Database

1. **Restart the backend server:**
   ```powershell
   npm run start:dev
   ```

2. **Check health endpoint:**
   - Open: http://localhost:3000/api/health
   - Should show: `"database": "connected"`

## Still Getting Error?

If you still get the error after creating the database:

1. **Check PostgreSQL is running:**
   - Open Services (Win+R → `services.msc`)
   - Find "postgresql-x64-14" (or similar)
   - Make sure it's "Running"

2. **Verify password:**
   - The password in `.env` must match what you set during PostgreSQL installation
   - Default user is `postgres`, but we're using `stockmaster` user

3. **Try connecting manually:**
   ```powershell
   psql -U stockmaster -d stockmaster
   ```
   (If this works, the database is set up correctly)

