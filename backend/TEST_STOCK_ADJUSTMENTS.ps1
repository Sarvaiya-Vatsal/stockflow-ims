# StockMaster Stock Adjustments API Testing Script

Write-Host "=== StockMaster Stock Adjustments API Testing ===" -ForegroundColor Cyan
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

# Step 2: Get Warehouse and Product with Stock
Write-Host "2. Getting Warehouse and Product with Stock..." -ForegroundColor Yellow
try {
    $warehouses = Invoke-RestMethod -Uri "$baseUrl/warehouses" -Method Get -Headers $headers
    $warehouseId = $warehouses[0].id
    Write-Host "[OK] Using warehouse: $($warehouses[0].name)" -ForegroundColor Green
    
    $products = Invoke-RestMethod -Uri "$baseUrl/products?limit=10" -Method Get -Headers $headers
    if ($products.items.Count -eq 0) {
        Write-Host "[ERROR] No products found!" -ForegroundColor Red
        exit 1
    }
    
    $product = $products.items[0]
    $productId = $product.id
    $productSku = $product.sku
    
    # Check current stock
    $stockLevel = $product.stockLevels | Where-Object { $_.warehouseId -eq $warehouseId }
    $currentStock = if ($stockLevel) { $stockLevel.quantity } else { 0 }
    
    Write-Host "[OK] Using product: $productSku" -ForegroundColor Green
    Write-Host "[OK] Current stock: $currentStock" -ForegroundColor Green
    Write-Host ""
    
    # Add stock if needed
    if ($currentStock -eq 0) {
        Write-Host "[INFO] Adding stock first..." -ForegroundColor Yellow
        $receiptBody = @{
            supplierName = "Test Supplier"
            warehouseId = $warehouseId
            items = @(
                @{
                    productId = $productId
                    quantity = 25
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
        
        $currentStock = 25
        Write-Host "[OK] Stock added: 25 units" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    Write-Host "[ERROR] Failed to get warehouse/product: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Create Stock Adjustment
Write-Host "3. Creating Stock Adjustment..." -ForegroundColor Yellow
$adjustedQuantity = $currentStock - 3  # Adjust down by 3 (simulating loss/damage)
$adjustmentBody = @{
    warehouseId = $warehouseId
    reason = "cycle_count"
    adjustmentDate = (Get-Date).ToString("yyyy-MM-dd")
    notes = "Cycle count adjustment - found discrepancy"
    items = @(
        @{
            productId = $productId
            adjustedQuantity = $adjustedQuantity
        }
    )
} | ConvertTo-Json

try {
    $adjustment = Invoke-RestMethod -Uri "$baseUrl/stock-adjustments" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $adjustmentBody
    
    Write-Host "[OK] Adjustment created!" -ForegroundColor Green
    Write-Host "  Adjustment Number: $($adjustment.adjustmentNumber)" -ForegroundColor Cyan
    Write-Host "  Status: $($adjustment.status)" -ForegroundColor Cyan
    Write-Host "  Reason: $($adjustment.reason)" -ForegroundColor Cyan
    Write-Host "  Current Quantity: $($adjustment.items[0].currentQuantity)" -ForegroundColor Cyan
    Write-Host "  Adjusted Quantity: $($adjustment.items[0].adjustedQuantity)" -ForegroundColor Cyan
    Write-Host "  Difference: $($adjustment.items[0].difference)" -ForegroundColor Cyan
    $adjustmentId = $adjustment.id
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to create adjustment: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Step 4: Check Stock Before Validation
Write-Host "4. Checking Stock Before Validation..." -ForegroundColor Yellow
try {
    $productBefore = Invoke-RestMethod -Uri "$baseUrl/products/$productId" -Method Get -Headers $headers
    $stockBefore = ($productBefore.stockLevels | Where-Object { $_.warehouseId -eq $warehouseId }).quantity
    Write-Host "[OK] Current stock: $stockBefore" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[WARN] Could not check stock: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 5: Validate Adjustment
Write-Host "5. Validating Adjustment (will correct stock)..." -ForegroundColor Yellow
try {
    $validatedAdjustment = Invoke-RestMethod -Uri "$baseUrl/stock-adjustments/$adjustmentId/validate" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body "{}"
    
    Write-Host "[OK] Adjustment validated!" -ForegroundColor Green
    Write-Host "  Status: $($validatedAdjustment.status)" -ForegroundColor Cyan
    Write-Host "  Validated At: $($validatedAdjustment.validatedAt)" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to validate adjustment: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Step 6: Check Stock After Validation
Write-Host "6. Checking Stock After Validation..." -ForegroundColor Yellow
try {
    $productAfter = Invoke-RestMethod -Uri "$baseUrl/products/$productId" -Method Get -Headers $headers
    $stockAfter = ($productAfter.stockLevels | Where-Object { $_.warehouseId -eq $warehouseId }).quantity
    Write-Host "[OK] Adjusted stock: $stockAfter" -ForegroundColor Green
    Write-Host "  Stock changed by: $($stockAfter - $stockBefore)" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "[WARN] Could not check stock: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "=== Stock Adjustments Testing Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Stock has been adjusted and audit trail created!" -ForegroundColor Yellow

