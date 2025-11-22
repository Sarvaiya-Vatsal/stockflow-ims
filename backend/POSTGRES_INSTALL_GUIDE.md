# PostgreSQL Installation Guide for Windows

## Quick Install Steps

### Step 1: Download PostgreSQL
1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer" 
3. Or direct link: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
4. Download **PostgreSQL 14** or **PostgreSQL 15** (latest stable)

### Step 2: Run the Installer
1. Run the downloaded `.exe` file
2. Click "Next" through the setup wizard
3. **Important Settings:**
   - Installation Directory: Keep default (usually `C:\Program Files\PostgreSQL\14`)
   - Components: Select all (PostgreSQL Server, pgAdmin 4, Command Line Tools, Stack Builder)
   - Data Directory: Keep default
   - **Password**: Set password to `stockmaster` (or remember what you set)
   - Port: Keep default `5432`
   - Advanced Options: Keep defaults
   - Pre Installation Summary: Click Next
   - Ready to Install: Click Next
   - Wait for installation to complete

### Step 3: Verify Installation
Open PowerShell and test:
```powershell
psql --version
```

If you see a version number, PostgreSQL is installed!

### Step 4: Create Database and User
Open PowerShell and run:
```powershell
# Connect to PostgreSQL (use the password you set during installation)
psql -U postgres

# Then run these SQL commands:
CREATE USER stockmaster WITH PASSWORD 'stockmaster';
CREATE DATABASE stockmaster OWNER stockmaster;
GRANT ALL PRIVILEGES ON DATABASE stockmaster TO stockmaster;
\q
```

**Note:** If `psql` command is not found, you need to add PostgreSQL to your PATH:
- PostgreSQL is usually installed at: `C:\Program Files\PostgreSQL\14\bin`
- Add this to your Windows PATH environment variable

### Step 5: Update .env File
Make sure your `.env` file has the correct password:
```env
DB_PASSWORD=stockmaster
```
(Or whatever password you set during installation)

---

## Alternative: Use pgAdmin 4 (GUI Tool)

If you installed pgAdmin 4:
1. Open pgAdmin 4 from Start Menu
2. Connect to local server (password you set during install)
3. Right-click "Databases" → Create → Database
   - Name: `stockmaster`
4. Right-click "Login/Group Roles" → Create → Login/Group Role
   - Name: `stockmaster`
   - Password: `stockmaster`
   - Privileges: Check "Can login?"

---

## Troubleshooting

**"psql is not recognized"**
- Add PostgreSQL bin folder to PATH:
  1. Search "Environment Variables" in Windows
  2. Edit "Path" under System variables
  3. Add: `C:\Program Files\PostgreSQL\14\bin`
  4. Restart PowerShell

**"Password authentication failed"**
- Use the password you set during PostgreSQL installation
- Default user is `postgres`

**"Connection refused"**
- Make sure PostgreSQL service is running:
  - Open Services (services.msc)
  - Find "postgresql-x64-14" (or similar)
  - Right-click → Start (if stopped)

