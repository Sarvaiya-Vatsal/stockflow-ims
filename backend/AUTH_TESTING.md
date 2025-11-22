# Testing Authentication - Quick Start

## Step 1: Start the Server (Creates Tables)

The server will automatically create database tables on first start:

```powershell
npm run start:dev
```

Wait until you see:
```
🚀 StockMaster Backend running on http://localhost:3000
📚 API available at http://localhost:3000/api
```

**Keep this running!** Open a new terminal for the next steps.

## Step 2: Create Default Roles

In a **new terminal window**, run:

```powershell
cd D:\StockMaster\stockflow-ims\backend
npm run seed
```

You should see:
```
✅ Created role: inventory_manager
✅ Created role: warehouse_staff
```

## Step 3: Test Registration

```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"manager@test.com\",\"password\":\"password123\",\"fullName\":\"Test Manager\"}'
```

## Step 4: Test Login

```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"manager@test.com\",\"password\":\"password123\"}'
```

Copy the `accessToken` from the response!

## Step 5: Test Protected Route

Replace `YOUR_TOKEN` with the access token from login:

```powershell
curl -X GET http://localhost:3000/api/auth/profile `
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Using Postman or Browser?

- **Postman**: Import the collection (we'll create it later)
- **Browser**: Use the browser console or a REST client extension
- **Thunder Client** (VS Code extension): Great for testing APIs

## Expected Responses

### Register Success:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "manager@test.com",
    "fullName": "Test Manager",
    "role": {...}
  }
}
```

### Login Success:
Same as register response.

### Profile (Protected):
```json
{
  "id": "uuid",
  "email": "manager@test.com",
  "fullName": "Test Manager",
  "role": {
    "id": "uuid",
    "name": "inventory_manager",
    "permissions": {...}
  }
}
```

## Troubleshooting

**"relation does not exist"**
- Make sure the server is running first (Step 1)
- Tables are created automatically when the app starts

**"Invalid credentials"**
- Check email and password are correct
- Make sure user was registered first

**"Unauthorized"**
- Check the token is valid
- Make sure you're using `Bearer YOUR_TOKEN` format
- Token expires in 15 minutes, login again to get a new one

