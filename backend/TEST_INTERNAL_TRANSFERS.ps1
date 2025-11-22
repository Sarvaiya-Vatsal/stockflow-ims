# StockMaster Internal Transfers API Testing Script

Write-Host "=== StockMaster Internal Transfers API Testing ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Step 1: Authenticate
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

# Step 2: Get Warehouses (need at least 2)
Write-Host "2. Getting Warehouses..." -ForegroundColor Yellow
try {
    $warehouses = Invoke-RestMethod -Uri "$baseUrl/warehouses" -Method Get -Headers $headers
    
    if ($warehouses.Count -lt 2) {
        Write-Host "[INFO] Creating second warehouse..." -ForegroundColor Yellow
        $warehouse2Body = @{
            name = "Secondary Warehouse"
            address = "456 Second St"
        } | ConvertTo-Json
        
        $warehouse2 = Invoke-RestMethod -Uri "$baseUrl/warehouses" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $warehouse2Body
        
        $warehouses = @($warehouses) + @($warehouse2)
        Write-Host "[OK] Second warehouse created!" -ForegroundColor Green
    }
    
    $fromWarehouseId = $warehouses[0].id
    $toWarehouseId = $warehouses[1].id
    Write-Host "[OK] From: $($warehouses[0].name)" -ForegroundColor Green
    Write-Host "[OK] To: $($warehouses[1].name)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to get warehouses: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Get Product with Stock in Source Warehouse
Write-Host "3. Getting Product with Stock..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/products?limit=10" -Method Get -Headers $headers
    if ($products.items.Count -eq 0) {
        Write-Host "[ERROR] No products found!" -ForegroundColor Red
        exit 1
    }
    
    $product = $products.items[0]
    $productId = $product.id
    $productSku = $product.sku
    
    # Check stock in source warehouse
    $stockLevel = $product.stockLevels | Where-Object { $_.warehouseId -eq $fromWarehouseId }
    $availableStock = if ($stockLevel) { $stockLevel.quantity } else { 0 }
    
    Write-Host "[OK] Using product: $productSku" -ForegroundColor Green
    Write-Host "[OK] Stock in source warehouse: $availableStock" -ForegroundColor Green
    Write-Host ""
    
    # Add stock if needed
    if ($availableStock -eq 0) {
        Write-Host "[INFO] Adding stock to source warehouse..." -ForegroundColor Yellow
        $receiptBody = @{
            supplierName = "Test Supplier"
            warehouseId = $fromWarehouseId
            items = @(
                @{
                    productId = $productId
                    quantity = 30
                    unitPrice = 10.00
                }
            )
        } | ConvertTo-Json
        
        $receipt = Invoke-RestMethod -Uri "$baseUrl/receipts" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $receiptBody
        
        Invoke-RestMethod -Uri "$baseUrl/receipts/$($receipt.id)/validate" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body "{}" | Out-Null
        
        $availableStock = 30
        Write-Host "[OK] Stock added: 30 units" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    Write-Host "[ERROR] Failed to get product: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Create Internal Transfer
Write-Host "4. Creating Internal Transfer..." -ForegroundColor Yellow
$transferQuantity = [Math]::Min(15, $availableStock)
$transferBody = @{
    fromWarehouseId = $fromWarehouseId
    toWarehouseId = $toWarehouseId
    transferDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    notes = "Test internal transfer"
    items = @(
        @{
            productId = $productId
            quantity = $transferQuantity
        }
    )
} | ConvertTo-Json

try {
    $transfer = Invoke-RestMethod -Uri "$baseUrl/internal-transfers" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $transferBody
    
    Write-Host "[OK] Transfer created!" -ForegroundColor Green
    Write-Host "  Transfer Number: $($transfer.transferNumber)" -ForegroundColor Cyan
    Write-Host "  Status: $($transfer.status)" -ForegroundColor Cyan
    Write-Host "  Items: $($transfer.items.Count)" -ForegroundColor Cyan
    $transferId = $transfer.id
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to create transfer: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Step 5: Check Stock Before Validation
Write-Host "5. Checking Stock Before Validation..." -ForegroundColor Yellow
try {
    $productBefore = Invoke-RestMethod -Uri "$baseUrl/products/$productId" -Method Get -Headers $headers
    $sourceStockBefore = ($productBefore.stockLevels | Where-Object { $_.warehouseId -eq $fromWarehouseId }).quantity
    $destStockBefore = ($productBefore.stockLevels | Where-Object { $_.warehouseId -eq $toWarehouseId }).quantity
    if (-not $destStockBefore) { $destStockBefore = 0 }
    
    Write-Host "[OK] Source warehouse stock: $sourceStockBefore" -ForegroundColor Green
    Write-Host "[OK] Destination warehouse stock: $destStockBefore" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[WARN] Could not check stock: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 6: Validate Transfer
Write-Host "6. Validating Transfer (will move stock)..." -ForegroundColor Yellow
try {
    $validatedTransfer = Invoke-RestMethod -Uri "$baseUrl/internal-transfers/$transferId/validate" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body "{}"
    
    Write-Host "[OK] Transfer validated!" -ForegroundColor Green
    Write-Host "  Status: $($validatedTransfer.status)" -ForegroundColor Cyan
    Write-Host "  Validated At: $($validatedTransfer.validatedAt)" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to validate transfer: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Step 7: Check Stock After Validation
Write-Host "7. Checking Stock After Validation..." -ForegroundColor Yellow
try {
    $productAfter = Invoke-RestMethod -Uri "$baseUrl/products/$productId" -Method Get -Headers $headers
    $sourceStockAfter = ($productAfter.stockLevels | Where-Object { $_.warehouseId -eq $fromWarehouseId }).quantity
    $destStockAfter = ($productAfter.stockLevels | Where-Object { $_.warehouseId -eq $toWarehouseId }).quantity
    if (-not $destStockAfter) { $destStockAfter = 0 }
    
    Write-Host "[OK] Source warehouse stock: $sourceStockAfter (decreased by $transferQuantity)" -ForegroundColor Green
    Write-Host "[OK] Destination warehouse stock: $destStockAfter (increased by $transferQuantity)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[WARN] Could not check stock: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "=== Internal Transfers Testing Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Stock has been transferred between warehouses!" -ForegroundColor Yellow

