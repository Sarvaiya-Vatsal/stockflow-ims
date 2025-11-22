# StockFlow IMS API Endpoints

## Health Check

**GET /api/health**

Returns server status and current timestamp.

**Response:**
```json
{
  "status": "ok",
  "time": "2024-01-01T00:00:00.000Z"
}
```

## Authentication

**POST /api/auth/register**

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** 201 Created
```json
{
  "message": "User registered successfully"
}
```

**POST /api/auth/login**

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** 200 OK
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

## Products

**GET /api/products**

Retrieve all products with total stock count.

**Response:** 200 OK
```json
[
  {
    "id": "clxxx",
    "name": "Steel Rod",
    "sku": "STEEL-001",
    "category": "Raw Material",
    "unit": "kg",
    "reorderLevel": 50,
    "totalStock": 150,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**POST /api/products**

Create a new product.

**Request Body:**
```json
{
  "name": "Steel Rod",
  "sku": "STEEL-001",
  "category": "Raw Material",
  "unit": "kg",
  "reorderLevel": 50
}
```

**Response:** 201 Created
```json
{
  "id": "clxxx",
  "name": "Steel Rod",
  "sku": "STEEL-001",
  "category": "Raw Material",
  "unit": "kg",
  "reorderLevel": 50,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**PUT /api/products/:id**

Update an existing product.

**Request Body:**
```json
{
  "name": "Steel Rod Updated",
  "category": "Materials",
  "unit": "kg",
  "reorderLevel": 75
}
```

**Response:** 200 OK
```json
{
  "id": "clxxx",
  "name": "Steel Rod Updated",
  "sku": "STEEL-001",
  "category": "Materials",
  "unit": "kg",
  "reorderLevel": 75,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

