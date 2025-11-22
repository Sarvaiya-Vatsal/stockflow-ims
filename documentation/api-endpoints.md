# StockFlow IMS API Endpoints

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

**POST /api/auth/login**

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

## Products

**GET /api/products**

Retrieve all products with total stock count.

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

## Stock Operations

**POST /api/stock/receipts**

Create a receipt for incoming stock.

**Request Body:**
```json
{
  "supplier": "Supplier Name",
  "warehouseId": "warehouse-id",
  "lines": [
    {
      "productId": "product-id",
      "quantity": 100
    }
  ]
}
```

**POST /api/stock/deliveries**

Create a delivery for outgoing stock.

**Request Body:**
```json
{
  "customer": "Customer Name",
  "warehouseId": "warehouse-id",
  "lines": [
    {
      "productId": "product-id",
      "quantity": 50
    }
  ]
}
```

**GET /api/stock/ledger**

Retrieve recent stock movement history.
