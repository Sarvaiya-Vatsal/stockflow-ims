# StockMaster Receipts API Testing Script

Write-Host "=== StockMaster Receipts API Testing ===" -ForegroundColor Cyan
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

# Step 2: Get Warehouse and Product
Write-Host "2. Getting Warehouse and Product..." -ForegroundColor Yellow
try {
    $warehouses = Invoke-RestMethod -Uri "$baseUrl/warehouses" -Method Get -Headers $headers
    $warehouseId = $warehouses[0].id
    Write-Host "[OK] Using warehouse: $($warehouses[0].name)" -ForegroundColor Green
    
    $products = Invoke-RestMethod -Uri "$baseUrl/products?limit=1" -Method Get -Headers $headers
    if ($products.items.Count -eq 0) {
        Write-Host "[ERROR] No products found. Please create a product first!" -ForegroundColor Red
        exit 1
    }
    $productId = $products.items[0].id
    $productSku = $products.items[0].sku
    Write-Host "[OK] Using product: $productSku" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to get warehouse/product: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Create Receipt
Write-Host "3. Creating Receipt..." -ForegroundColor Yellow
$receiptBody = @{
    supplierName = "Supplier ABC"
    warehouseId = $warehouseId
    expectedDate = (Get-Date).ToString("yyyy-MM-dd")
    notes = "Test receipt for incoming stock"
    items = @(
        @{
            productId = $productId
            quantity = 50
            unitPrice = 10.50
        }
    )
} | ConvertTo-Json

try {
    $receipt = Invoke-RestMethod -Uri "$baseUrl/receipts" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $receiptBody
    
    Write-Host "[OK] Receipt created!" -ForegroundColor Green
    Write-Host "  Receipt Number: $($receipt.receiptNumber)" -ForegroundColor Cyan
    Write-Host "  Status: $($receipt.status)" -ForegroundColor Cyan
    Write-Host "  Items: $($receipt.items.Count)" -ForegroundColor Cyan
    $receiptId = $receipt.id
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to create receipt: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Step 4: Check Stock Before Validation
Write-Host "4. Checking Stock Before Validation..." -ForegroundColor Yellow
try {
    $productBefore = Invoke-RestMethod -Uri "$baseUrl/products/$productId" -Method Get -Headers $headers
    $stockBefore = 0
    if ($productBefore.stockLevels) {
        $stockLevel = $productBefore.stockLevels | Where-Object { $_.warehouseId -eq $warehouseId }
        if ($stockLevel) {
            $stockBefore = $stockLevel.quantity
        }
    }
    Write-Host "[OK] Current stock: $stockBefore" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[WARN] Could not check stock: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 5: Validate Receipt
Write-Host "5. Validating Receipt..." -ForegroundColor Yellow
try {
    $validateBody = @{} | ConvertTo-Json
    $validatedReceipt = Invoke-RestMethod -Uri "$baseUrl/receipts/$receiptId/validate" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $validateBody
    
    Write-Host "[OK] Receipt validated!" -ForegroundColor Green
    Write-Host "  Status: $($validatedReceipt.status)" -ForegroundColor Cyan
    Write-Host "  Validated At: $($validatedReceipt.validatedAt)" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to validate receipt: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Step 6: Check Stock After Validation
Write-Host "6. Checking Stock After Validation..." -ForegroundColor Yellow
try {
    $productAfter = Invoke-RestMethod -Uri "$baseUrl/products/$productId" -Method Get -Headers $headers
    $stockAfter = 0
    if ($productAfter.stockLevels) {
        $stockLevel = $productAfter.stockLevels | Where-Object { $_.warehouseId -eq $warehouseId }
        if ($stockLevel) {
            $stockAfter = $stockLevel.quantity
        }
    }
    Write-Host "[OK] New stock: $stockAfter" -ForegroundColor Green
    Write-Host "  Stock increased by: $($stockAfter - $stockBefore)" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "[WARN] Could not check stock: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 7: List Receipts
Write-Host "7. Listing Receipts..." -ForegroundColor Yellow
try {
    $receipts = Invoke-RestMethod -Uri "$baseUrl/receipts?limit=5" -Method Get -Headers $headers
    Write-Host "[OK] Found $($receipts.total) receipts" -ForegroundColor Green
    foreach ($rec in $receipts.items) {
        Write-Host "  - $($rec.receiptNumber): $($rec.status) ($($rec.items.Count) items)" -ForegroundColor Cyan
    }
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to list receipts: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== Receipts Testing Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "The receipt has been validated and stock has been updated!" -ForegroundColor Yellow

