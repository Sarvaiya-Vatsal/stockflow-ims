# StockMaster Dashboard API Testing Script

Write-Host "=== StockMaster Dashboard API Testing ===" -ForegroundColor Cyan
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

# Step 2: Get KPIs
Write-Host "2. Getting Dashboard KPIs..." -ForegroundColor Yellow
try {
    $kpis = Invoke-RestMethod -Uri "$baseUrl/dashboard/kpis" `
        -Method Get `
        -Headers $headers
    
    Write-Host "[OK] Dashboard KPIs:" -ForegroundColor Green
    Write-Host "  Total Products: $($kpis.totalProducts)" -ForegroundColor Cyan
    Write-Host "  Low Stock Count: $($kpis.lowStockCount)" -ForegroundColor Cyan
    Write-Host "  Pending Receipts: $($kpis.pendingReceipts)" -ForegroundColor Cyan
    Write-Host "  Pending Deliveries: $($kpis.pendingDeliveries)" -ForegroundColor Cyan
    Write-Host "  Scheduled Transfers: $($kpis.scheduledTransfers)" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to get KPIs: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Get Recent Activity
Write-Host "3. Getting Recent Activity..." -ForegroundColor Yellow
try {
    $activity = Invoke-RestMethod -Uri "$baseUrl/dashboard/recent-activity?limit=10" `
        -Method Get `
        -Headers $headers
    
    Write-Host "[OK] Recent Activity (showing $($activity.Count) items):" -ForegroundColor Green
    foreach ($act in $activity | Select-Object -First 5) {
        $change = if ($act.quantityChange -gt 0) { "+$($act.quantityChange)" } else { "$($act.quantityChange)" }
        Write-Host "  - $($act.transactionType): $($act.product.sku) $change at $($act.warehouse.name)" -ForegroundColor Cyan
    }
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to get recent activity: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Step 4: Get Move History
Write-Host "4. Getting Move History..." -ForegroundColor Yellow
try {
    $history = Invoke-RestMethod -Uri "$baseUrl/dashboard/move-history?limit=10" `
        -Method Get `
        -Headers $headers
    
    Write-Host "[OK] Move History (Total: $($history.total) items):" -ForegroundColor Green
    foreach ($item in $history.items | Select-Object -First 5) {
        $change = if ($item.quantityChange -gt 0) { "+$($item.quantityChange)" } else { "$($item.quantityChange)" }
        Write-Host "  - $($item.transactionType): $($item.product.sku) $change ($($item.quantityBefore) -> $($item.quantityAfter))" -ForegroundColor Cyan
    }
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to get move history: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== Dashboard Testing Complete! ===" -ForegroundColor Green

