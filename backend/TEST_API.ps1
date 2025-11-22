# StockMaster API Testing Script for PowerShell

Write-Host "=== StockMaster API Testing ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Test 1: Register User (or Login if exists)
Write-Host "1. Testing User Registration/Login..." -ForegroundColor Yellow
$registerBody = @{
    email = "manager@test.com"
    password = "password123"
    fullName = "Test Manager"
} | ConvertTo-Json

try {
    try {
        $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
            -Method Post `
            -ContentType "application/json" `
            -Body $registerBody
        
        Write-Host "✅ Registration successful!" -ForegroundColor Green
        $accessToken = $registerResponse.accessToken
        $refreshToken = $registerResponse.refreshToken
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "ℹ️  User already exists, testing login instead..." -ForegroundColor Yellow
            $loginBody = @{
                email = "manager@test.com"
                password = "password123"
            } | ConvertTo-Json
            
            $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
                -Method Post `
                -ContentType "application/json" `
                -Body $loginBody
            
            Write-Host "✅ Login successful!" -ForegroundColor Green
            $accessToken = $loginResponse.accessToken
            $refreshToken = $loginResponse.refreshToken
        } else {
            throw
        }
    }
    
    Write-Host "Access Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
    
    # Test 2: Get Profile (Protected Route)
    Write-Host "2. Testing Protected Route (Get Profile)..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Profile retrieved!" -ForegroundColor Green
    Write-Host "User: $($profileResponse.fullName) ($($profileResponse.email))" -ForegroundColor Gray
    Write-Host ""
    
    # Test 3: Login
    Write-Host "3. Testing Login..." -ForegroundColor Yellow
    $loginBody = @{
        email = "manager@test.com"
        password = "password123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host ""
    
    # Test 4: Health Check
    Write-Host "4. Testing Health Endpoint..." -ForegroundColor Yellow
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Health check passed!" -ForegroundColor Green
    Write-Host "Database: $($healthResponse.database)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "=== All Tests Passed! ===" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

