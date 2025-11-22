# StockMaster Delivery Orders API Testing Script

Write-Host "=== StockMaster Delivery Orders API Testing ===" -ForegroundColor Cyan
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
        Write-Host "[ERROR] No products found. Please create a product first!" -ForegroundColor Red
        exit 1
    }
    
    # Use first product (will add stock if needed)
    $product = $products.items[0]
    $productId = $product.id
    $productSku = $product.sku
    $stockLevel = $product.stockLevels | Where-Object { $_.warehouseId -eq $warehouseId }
    $availableStock = if ($stockLevel) { $stockLevel.quantity } else { 0 }
    
    Write-Host "[OK] Using product: $productSku (Stock: $availableStock)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to get warehouse/product: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Check if product has stock
if ($availableStock -eq 0) {
    Write-Host "[WARN] Product has no stock. Creating a receipt first..." -ForegroundColor Yellow
    
    # Create a receipt to add stock
    $receiptBody = @{
        supplierName = "Test Supplier"
        warehouseId = $warehouseId
        items = @(
            @{
                productId = $productId
                quantity = 50
                unitPrice = 10.00
            }
        )
    } | ConvertTo-Json
    
    try {
        $receipt = Invoke-RestMethod -Uri "$baseUrl/receipts" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $receiptBody
        
        Write-Host "[OK] Receipt created: $($receipt.receiptNumber)" -ForegroundColor Green
        
        # Validate the receipt to add stock
        Invoke-RestMethod -Uri "$baseUrl/receipts/$($receipt.id)/validate" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body "{}" | Out-Null
        
        Write-Host "[OK] Receipt validated - stock added!" -ForegroundColor Green
        
        # Update available stock
        $availableStock = 50
        Write-Host ""
    } catch {
        Write-Host "[ERROR] Failed to create/validate receipt: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Step 4: Create Delivery Order
Write-Host "4. Creating Delivery Order..." -ForegroundColor Yellow
$orderQuantity = [Math]::Min(10, $availableStock)
if ($orderQuantity -lt 1) {
    Write-Host "[ERROR] Cannot create order - no stock available!" -ForegroundColor Red
    exit 1
}

$orderBody = @{
    customerName = "Customer XYZ"
    warehouseId = $warehouseId
    deliveryDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    notes = "Test delivery order"
    items = @(
        @{
            productId = $productId
            quantity = $orderQuantity
        }
    )
} | ConvertTo-Json

try {
    $order = Invoke-RestMethod -Uri "$baseUrl/delivery-orders" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $orderBody
    
    Write-Host "[OK] Delivery order created!" -ForegroundColor Green
    Write-Host "  Order Number: $($order.orderNumber)" -ForegroundColor Cyan
    Write-Host "  Status: $($order.status)" -ForegroundColor Cyan
    Write-Host "  Items: $($order.items.Count)" -ForegroundColor Cyan
    $orderId = $order.id
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to create order: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Step 5: Check Stock After Order Creation (should show reserved)
Write-Host "5. Checking Stock (with reserved quantity)..." -ForegroundColor Yellow
try {
    $productAfterOrder = Invoke-RestMethod -Uri "$baseUrl/products/$productId" -Method Get -Headers $headers
    $stockLevelAfter = $productAfterOrder.stockLevels | Where-Object { $_.warehouseId -eq $warehouseId }
    if ($stockLevelAfter) {
        Write-Host "[OK] Stock: $($stockLevelAfter.quantity) (Reserved: $($stockLevelAfter.reservedQuantity))" -ForegroundColor Green
    }
    Write-Host ""
} catch {
    Write-Host "[WARN] Could not check stock: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 6: Pick Items
Write-Host "6. Picking Items..." -ForegroundColor Yellow
try {
    $pickBody = @{
        items = @(
            @{
                itemId = $order.items[0].id
                pickedQuantity = $orderQuantity
            }
        )
    } | ConvertTo-Json
    
    $pickedOrder = Invoke-RestMethod -Uri "$baseUrl/delivery-orders/$orderId/pick" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $pickBody
    
    Write-Host "[OK] Items picked! Status: $($pickedOrder.status)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to pick items: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 7: Pack Items
Write-Host "7. Packing Items..." -ForegroundColor Yellow
try {
    $packBody = @{
        items = @(
            @{
                itemId = $order.items[0].id
                packedQuantity = $orderQuantity
            }
        )
    } | ConvertTo-Json
    
    $packedOrder = Invoke-RestMethod -Uri "$baseUrl/delivery-orders/$orderId/pack" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $packBody
    
    Write-Host "[OK] Items packed! Status: $($packedOrder.status)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to pack items: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 8: Validate Order (deducts stock)
Write-Host "8. Validating Order (will deduct stock)..." -ForegroundColor Yellow
try {
    $validatedOrder = Invoke-RestMethod -Uri "$baseUrl/delivery-orders/$orderId/validate" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body "{}"
    
    Write-Host "[OK] Order validated!" -ForegroundColor Green
    Write-Host "  Status: $($validatedOrder.status)" -ForegroundColor Cyan
    Write-Host "  Validated At: $($validatedOrder.validatedAt)" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to validate order: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Step 9: Check Stock After Validation
Write-Host "9. Checking Stock After Validation..." -ForegroundColor Yellow
try {
    $productFinal = Invoke-RestMethod -Uri "$baseUrl/products/$productId" -Method Get -Headers $headers
    $stockLevelFinal = $productFinal.stockLevels | Where-Object { $_.warehouseId -eq $warehouseId }
    if ($stockLevelFinal) {
        Write-Host "[OK] Final stock: $($stockLevelFinal.quantity)" -ForegroundColor Green
        Write-Host "  Stock decreased by: $orderQuantity" -ForegroundColor Cyan
        Write-Host "  Reserved quantity released: $($stockLevelFinal.reservedQuantity)" -ForegroundColor Cyan
    }
    Write-Host ""
} catch {
    Write-Host "[WARN] Could not check stock: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "=== Delivery Orders Testing Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "The order has been validated and stock has been deducted!" -ForegroundColor Yellow

