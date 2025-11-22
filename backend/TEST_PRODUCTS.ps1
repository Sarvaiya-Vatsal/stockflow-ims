# StockMaster Products API Testing Script

Write-Host "=== StockMaster Products API Testing ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# First, get auth token
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
    Write-Host "✅ Authenticated!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Authentication failed. Please register/login first." -ForegroundColor Red
    exit 1
}

# Test 2: Create Category
Write-Host "2. Creating Category..." -ForegroundColor Yellow
$categoryBody = @{
    name = "Electronics"
} | ConvertTo-Json

try {
    $category = Invoke-RestMethod -Uri "$baseUrl/categories" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $categoryBody
    
    Write-Host "✅ Category created: $($category.name) (ID: $($category.id))" -ForegroundColor Green
    $categoryId = $category.id
    Write-Host ""
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "ℹ️  Category may already exist, continuing..." -ForegroundColor Yellow
        # Try to get existing category
        $categories = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Get -Headers $headers
        if ($categories.Count -gt 0) {
            $categoryId = $categories[0].id
            Write-Host "Using existing category: $categoryId" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 3: Create Product
Write-Host "3. Creating Product..." -ForegroundColor Yellow
$productBody = @{
    sku = "PROD-001"
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
        warehouseId = "00000000-0000-0000-0000-000000000000"  # You'll need a real warehouse ID
        quantity = 100
    }
} | ConvertTo-Json

try {
    $product = Invoke-RestMethod -Uri "$baseUrl/products" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $productBody
    
    Write-Host "✅ Product created: $($product.name) (SKU: $($product.sku))" -ForegroundColor Green
    $productId = $product.id
    Write-Host ""
} catch {
    Write-Host "❌ Error creating product: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 4: List Products
Write-Host "4. Listing Products..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/products?limit=10" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Found $($products.total) products" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Search Products
Write-Host "5. Searching Products..." -ForegroundColor Yellow
try {
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/products?search=Widget" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Search found $($searchResults.total) results" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== Products Testing Complete! ===" -ForegroundColor Green

