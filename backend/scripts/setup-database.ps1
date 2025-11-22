# PowerShell script to setup PostgreSQL database
# Make sure PostgreSQL is installed and psql is in PATH

Write-Host "Setting up StockMaster database..." -ForegroundColor Green

# Check if psql is available
try {
    $psqlVersion = psql --version
    Write-Host "PostgreSQL found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: psql not found. Please install PostgreSQL or add it to PATH." -ForegroundColor Red
    Write-Host "PostgreSQL is usually at: C:\Program Files\PostgreSQL\14\bin" -ForegroundColor Yellow
    exit 1
}

# Prompt for postgres password
$postgresPassword = Read-Host "Enter PostgreSQL 'postgres' user password (set during installation)"

# Create user and database
Write-Host "Creating user and database..." -ForegroundColor Yellow

$env:PGPASSWORD = $postgresPassword
psql -U postgres -c "CREATE USER stockmaster WITH PASSWORD 'stockmaster';" 2>$null
psql -U postgres -c "CREATE DATABASE stockmaster OWNER stockmaster;" 2>$null
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE stockmaster TO stockmaster;"

Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host "You can now start the backend server with: npm run start:dev" -ForegroundColor Cyan

