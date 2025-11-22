# StockMaster Warehouses API Testing Script

Write-Host "=== StockMaster Warehouses API Testing ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Get auth token
Write-Host "1. Getting authentication token..." -ForegroundColor Yellow
$loginBody = @{
    email = "manager@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    
    $token = $loginResponse.accessToken
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    Write-Host "[OK] Authenticated!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Authentication failed. Please register/login first." -ForegroundColor Red
    exit 1
}

# Create Warehouse
Write-Host "2. Creating Warehouse..." -ForegroundColor Yellow
$warehouseBody = @{
    name = "Main Warehouse"
    address = "123 Main Street, City, Country"
    isActive = $true
} | ConvertTo-Json

try {
    $warehouse = Invoke-RestMethod -Uri "$baseUrl/warehouses" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $warehouseBody
    
    Write-Host "[OK] Warehouse created: $($warehouse.name) (ID: $($warehouse.id))" -ForegroundColor Green
    $warehouseId = $warehouse.id
    Write-Host ""
    
    # Save warehouse ID for later use
    $warehouseId | Out-File -FilePath ".warehouse-id.txt" -Encoding utf8
    Write-Host "Warehouse ID saved to .warehouse-id.txt" -ForegroundColor Gray
    Write-Host ""
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "[INFO] Warehouse may already exist, fetching existing..." -ForegroundColor Yellow
        $warehouses = Invoke-RestMethod -Uri "$baseUrl/warehouses" -Method Get -Headers $headers
        if ($warehouses.Count -gt 0) {
            $warehouseId = $warehouses[0].id
            Write-Host "Using existing warehouse: $warehouseId" -ForegroundColor Gray
            $warehouseId | Out-File -FilePath ".warehouse-id.txt" -Encoding utf8
        }
    } else {
        Write-Host "[ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# List Warehouses
Write-Host "3. Listing Warehouses..." -ForegroundColor Yellow
try {
    $warehouses = Invoke-RestMethod -Uri "$baseUrl/warehouses" `
        -Method Get `
        -Headers $headers
    
    Write-Host "[OK] Found $($warehouses.Count) warehouses:" -ForegroundColor Green
    foreach ($wh in $warehouses) {
        Write-Host "  - $($wh.name) ($($wh.id))" -ForegroundColor Cyan
    }
    Write-Host ""
} catch {
    Write-Host "[ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== Warehouses Testing Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "You can now use the warehouse ID to create products with stock!" -ForegroundColor Yellow
if (Test-Path ".warehouse-id.txt") {
    $savedId = Get-Content ".warehouse-id.txt"
    Write-Host "Saved Warehouse ID: $savedId" -ForegroundColor Cyan
}
