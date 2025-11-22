# Manual API Testing - PowerShell Commands

## PowerShell-Compatible Commands

PowerShell's `curl` is an alias for `Invoke-WebRequest`, which has different syntax. Use these commands instead:

### 1. Register a User

```powershell
$body = @{
    email = "manager@test.com"
    password = "password123"
    fullName = "Test Manager"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### 2. Login

```powershell
$body = @{
    email = "manager@test.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# Save the token
$token = $response.accessToken
Write-Host "Token: $token"
```

### 3. Get Profile (Protected Route)

```powershell
# Use the token from login
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/profile" `
    -Method Get `
    -Headers $headers
```

### 4. Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
```

### 5. Forgot Password

```powershell
$body = @{
    email = "manager@test.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/forgot-password" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

**Note:** In development mode, check the server console for the OTP code!

### 6. Reset Password

```powershell
$body = @{
    email = "manager@test.com"
    otp = "123456"  # Get this from server console in dev mode
    newPassword = "newpassword123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/reset-password" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

## Quick Test Script

Or use the automated test script:

```powershell
.\TEST_API.ps1
```

## Using Postman or Thunder Client

If you prefer a GUI:
- **Postman**: Import the collection (we'll create it later)
- **Thunder Client** (VS Code extension): Great for testing APIs
- **REST Client** (VS Code extension): Another good option

## Expected Responses

### Register/Login Success:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "manager@test.com",
    "fullName": "Test Manager",
    "role": {
      "id": "uuid",
      "name": "inventory_manager",
      "permissions": {...}
    }
  }
}
```

### Profile (Protected):
```json
{
  "id": "uuid",
  "email": "manager@test.com",
  "fullName": "Test Manager",
  "role": {...}
}
```

