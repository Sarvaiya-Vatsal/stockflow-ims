# StockMaster Database Setup Script for PostgreSQL 15
Write-Host "=== StockMaster Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Find PostgreSQL installation
$pgPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
if (-not (Test-Path $pgPath)) {
    Write-Host "PostgreSQL 15 not found at default location." -ForegroundColor Yellow
    Write-Host "Please run this manually using pgAdmin 4 or SQL Shell (psql)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "See QUICK_FIX.md for detailed instructions" -ForegroundColor Cyan
    exit
}

Write-Host "Found PostgreSQL at: $pgPath" -ForegroundColor Green
Write-Host ""

# Prompt for postgres password
$postgresPassword = Read-Host "Enter PostgreSQL 'postgres' user password (set during installation)" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($postgresPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Creating user and database..." -ForegroundColor Yellow

# Set password for psql
$env:PGPASSWORD = $plainPassword

# Create user (ignore error if exists)
& $pgPath -U postgres -c "DO `$`$ BEGIN IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'stockmaster') THEN CREATE USER stockmaster WITH PASSWORD 'stockmaster'; END IF; END `$`$;" 2>&1 | Out-Null

# Create database (ignore error if exists)
& $pgPath -U postgres -c "SELECT 'CREATE DATABASE stockmaster OWNER stockmaster' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stockmaster')\gexec" 2>&1 | Out-Null

# Grant privileges
& $pgPath -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE stockmaster TO stockmaster;" 2>&1 | Out-Null

# Clear password
$env:PGPASSWORD = ""

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Database: stockmaster" -ForegroundColor Cyan
Write-Host "User: stockmaster" -ForegroundColor Cyan
Write-Host "Password: stockmaster" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now start the server with: npm run start:dev" -ForegroundColor Yellow

