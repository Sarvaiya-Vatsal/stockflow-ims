# StockMaster - Create Product with Stock Script

Write-Host "=== Creating Product with Stock ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Step 1: Get authentication token
Write-Host "1. Authenticating..." -ForegroundColor Yellow
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
    Write-Host "[ERROR] Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get or Create Category
Write-Host "2. Getting/Creating Category..." -ForegroundColor Yellow
$categoryName = "Electronics"
$categoryId = $null

try {
    # Try to get existing categories
    $categories = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Get -Headers $headers
    $existingCategory = $categories | Where-Object { $_.name -eq $categoryName }
    
    if ($existingCategory) {
        $categoryId = $existingCategory.id
        Write-Host "[OK] Using existing category: $categoryName (ID: $categoryId)" -ForegroundColor Green
    } else {
        # Create new category
        $catBody = @{ name = $categoryName } | ConvertTo-Json
        $newCategory = Invoke-RestMethod -Uri "$baseUrl/categories" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $catBody
        $categoryId = $newCategory.id
        Write-Host "[OK] Created category: $categoryName (ID: $categoryId)" -ForegroundColor Green
    }
    Write-Host ""
} catch {
    Write-Host "[ERROR] Category error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Step 3: Get Warehouse ID
Write-Host "3. Getting Warehouse..." -ForegroundColor Yellow
$warehouseId = $null

# Try to get from saved file first
if (Test-Path ".warehouse-id.txt") {
    $savedId = (Get-Content ".warehouse-id.txt").Trim()
    if ($savedId -match '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
        $warehouseId = $savedId
        Write-Host "[OK] Using saved warehouse ID: $warehouseId" -ForegroundColor Green
    }
}

# If no valid saved ID, get from API
if (-not $warehouseId) {
    try {
        $warehouses = Invoke-RestMethod -Uri "$baseUrl/warehouses" -Method Get -Headers $headers
        if ($warehouses.Count -gt 0) {
            $warehouseId = $warehouses[0].id
            Write-Host "[OK] Using warehouse: $($warehouses[0].name) (ID: $warehouseId)" -ForegroundColor Green
            # Save it for next time
            $warehouseId | Out-File -FilePath ".warehouse-id.txt" -Encoding utf8 -NoNewline
        } else {
            Write-Host "[ERROR] No warehouses found. Please create a warehouse first!" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "[ERROR] Failed to get warehouses: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Step 4: Create Product
Write-Host "4. Creating Product..." -ForegroundColor Yellow

# Generate unique SKU
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$sku = "PROD-$timestamp"

$productBody = @{
    sku = $sku
    name = "Widget A"
    description = "A test widget product"
    categoryId = $categoryId
    unitOfMeasure = "pcs"
    reorderPoint = 50
    metadata = @{
        brand = "TestBrand"
        supplier = "Supplier ABC"
    }
    initialStock = @{
        warehouseId = $warehouseId
        quantity = 100
    }
} | ConvertTo-Json

Write-Host "Using SKU: $sku" -ForegroundColor Gray

try {
    $product = Invoke-RestMethod -Uri "$baseUrl/products" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $productBody
    
    Write-Host "[OK] Product created successfully!" -ForegroundColor Green
    Write-Host "  SKU: $($product.sku)" -ForegroundColor Cyan
    Write-Host "  Name: $($product.name)" -ForegroundColor Cyan
    Write-Host "  ID: $($product.id)" -ForegroundColor Cyan
    Write-Host ""
    
    # Show stock levels
    if ($product.stockLevels -and $product.stockLevels.Count -gt 0) {
        Write-Host "Stock Levels:" -ForegroundColor Yellow
        foreach ($stock in $product.stockLevels) {
            Write-Host "  - $($stock.warehouse.name): $($stock.quantity) $($product.unitOfMeasure)" -ForegroundColor Cyan
        }
    }
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to create product: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Request body was:" -ForegroundColor Yellow
    Write-Host $productBody -ForegroundColor Gray
    exit 1
}

Write-Host "=== Product Creation Complete! ===" -ForegroundColor Green

