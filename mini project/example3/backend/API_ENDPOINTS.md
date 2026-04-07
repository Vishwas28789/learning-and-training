# API Endpoints Quick Reference

## Base URL
```
https://localhost:7000/api
```

## Members Endpoints

### List All Members
```
GET /members
Success: 200 OK
Error: 500 Internal Server Error
```

**Response Example:**
```json
{
  "success": true,
  "message": "Members retrieved successfully",
  "data": {
    "totalCount": 3,
    "members": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "fullName": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "9876543210",
        "address": "123 Main St",
        "membershipFee": 500,
        "status": "Active",
        "joinDate": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Member by ID
```
GET /members/{id}
Success: 200 OK
Error: 404 Not Found
```

### Create Member
```
POST /members
Content-Type: application/json
Success: 201 Created
Error: 400 Bad Request, 409 Conflict
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phoneNumber": "9876543211",
  "address": "456 Oak Ave",
  "membershipFee": 500
}
```

### Update Member
```
PUT /members/{id}
Content-Type: application/json
Success: 200 OK
Error: 404 Not Found, 400 Bad Request
```

### Delete Member
```
DELETE /members/{id}
Success: 200 OK
Error: 404 Not Found
```

### Get Active Member Count
```
GET /members/stats/active-count
Success: 200 OK
```

**Response Example:**
```json
{
  "success": true,
  "message": "Active member count retrieved",
  "data": 15,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Payments Endpoints

### List All Payments
```
GET /payments
Success: 200 OK
```

**Response Example:**
```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": {
    "totalCount": 10,
    "totalAmount": 5000.00,
    "payments": [
      {
        "id": 1,
        "memberId": 1,
        "memberName": "John Doe",
        "amount": 500.00,
        "paymentType": "MembershipFee",
        "status": "Completed",
        "description": "Monthly payment",
        "paymentDate": "2024-01-15T10:30:00Z",
        "createdDate": "2024-01-15T10:30:00Z",
        "transactionReference": "TXN20240115abcd1234"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Payment by ID
```
GET /payments/{id}
Success: 200 OK
Error: 404 Not Found
```

### Create Payment
```
POST /payments
Content-Type: application/json
Success: 201 Created
Error: 400 Bad Request, 404 Not Found
```

**Request Body:**
```json
{
  "memberId": 1,
  "amount": 500.00,
  "paymentType": "MembershipFee",
  "description": "Monthly payment",
  "paymentDate": "2024-01-15T10:30:00Z",
  "transactionReference": "TXN20240115abcd1234"
}
```

### Update Payment
```
PUT /payments/{id}
Success: 200 OK
Error: 404 Not Found, 400 Bad Request
```

### Delete Payment
```
DELETE /payments/{id}
Success: 200 OK
Error: 404 Not Found
```

### Get Payments by Member
```
GET /payments/member/{memberId}
Success: 200 OK
Error: 404 Not Found
```

### Get Payments by Date Range
```
GET /payments/by-date?startDate=2024-01-01&endDate=2024-01-31
Success: 200 OK
Error: 400 Bad Request
```

---

## Expenses Endpoints

### List All Expenses
```
GET /expenses
Success: 200 OK
```

**Response Example:**
```json
{
  "success": true,
  "message": "Expenses retrieved successfully",
  "data": {
    "totalCount": 5,
    "totalAmount": 8500.00,
    "byCategory": {
      "Maintenance": 2000.00,
      "Utilities": 1500.00,
      "Insurance": 5000.00
    },
    "expenses": [
      {
        "id": 1,
        "description": "Building maintenance",
        "amount": 2000.00,
        "category": "Maintenance",
        "expenseDate": "2024-01-10T10:30:00Z",
        "createdDate": "2024-01-15T10:30:00Z",
        "notes": "Painting and repairs",
        "approvedBy": "Admin",
        "status": "Paid"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Expense by ID
```
GET /expenses/{id}
Success: 200 OK
Error: 404 Not Found
```

### Create Expense
```
POST /expenses
Content-Type: application/json
Success: 201 Created
Error: 400 Bad Request
```

**Request Body:**
```json
{
  "description": "Building maintenance",
  "amount": 2000.00,
  "category": "Maintenance",
  "expenseDate": "2024-01-10T10:30:00Z",
  "notes": "Painting and repairs",
  "approvedBy": "Admin"
}
```

### Update Expense
```
PUT /expenses/{id}
Success: 200 OK
Error: 404 Not Found, 400 Bad Request
```

### Delete Expense
```
DELETE /expenses/{id}
Success: 200 OK
Error: 404 Not Found
```

### Get Expenses by Date Range
```
GET /expenses/by-date?startDate=2024-01-01&endDate=2024-01-31
Success: 200 OK
Error: 400 Bad Request
```

### Get Expenses by Category
```
GET /expenses/by-category/{category}
Success: 200 OK
Error: 500 Internal Server Error
```

**Valid Categories:** Administration, Maintenance, Utilities, Insurance, Events, Legal, Miscellaneous

---

## Reports Endpoints

### Get Financial Summary
```
GET /reports/summary?fromDate=2024-01-01&toDate=2024-01-31
Success: 200 OK
Error: 400 Bad Request
```

**Response Example:**
```json
{
  "success": true,
  "message": "Financial summary generated successfully",
  "data": {
    "reportId": 1,
    "generatedDate": "2024-01-15T10:30:00Z",
    "reportType": "MonthlyFinancial",
    "totalIncome": 5000.00,
    "totalExpenses": 3500.00,
    "netBalance": 1500.00,
    "averagePaymentPerMember": 333.33,
    "totalMembers": 15,
    "activeMembers": 12,
    "membershipCoverage": 80.00,
    "fromDate": "2024-01-01T00:00:00Z",
    "toDate": "2024-01-31T23:59:59Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Latest Report
```
GET /reports/latest
Success: 200 OK
Error: 404 Not Found
```

### Get Monthly Reports for Year
```
GET /reports/monthly/{year}
Success: 200 OK
Error: 400 Bad Request
```

**Response Example:**
```json
{
  "success": true,
  "message": "Monthly reports retrieved successfully",
  "data": [
    {
      "year": 2024,
      "month": 1,
      "income": 5000.00,
      "expenses": 3500.00,
      "balance": 1500.00,
      "transactionCount": 15
    },
    {
      "year": 2024,
      "month": 2,
      "income": 4800.00,
      "expenses": 3200.00,
      "balance": 1600.00,
      "transactionCount": 14
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Member Payment Statistics
```
GET /reports/member-stats
Success: 200 OK
```

**Response Example:**
```json
{
  "success": true,
  "message": "Member payment statistics retrieved successfully",
  "data": [
    {
      "memberId": 1,
      "memberName": "John Doe",
      "totalPayments": 12,
      "totalPaid": 6000.00,
      "averagePayment": 500.00,
      "lastPaymentDate": "2024-01-15T10:30:00Z",
      "isUpToDate": true
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Anomaly Detection Endpoints

### Check for Anomalies
```
POST /anomaly/check
Content-Type: application/json
Success: 200 OK
Error: 400 Bad Request, 404 Not Found
```

**Request Body:**
```json
{
  "fromDate": "2024-01-01T00:00:00Z",
  "toDate": "2024-01-31T23:59:59Z",
  "memberId": null
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Anomalies checked successfully",
  "data": {
    "totalAnomalies": 3,
    "unresolvedCount": 2,
    "criticalCount": 1,
    "anomalies": [
      {
        "id": 1,
        "memberId": 1,
        "memberName": "John Doe",
        "anomalyType": "UnusuallyHighPayment",
        "description": "Payment amount is 5x higher than average",
        "anomalousValue": 2500.00,
        "detectedDate": "2024-01-15T10:30:00Z",
        "severity": "High",
        "isResolved": false,
        "resolution": null
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Unresolved Anomalies
```
GET /anomaly/unresolved
Success: 200 OK
```

### Resolve Anomaly
```
POST /anomaly/resolve/{id}
Content-Type: application/json
Success: 200 OK
Error: 404 Not Found, 400 Bad Request
```

**Request Body:**
```json
"Manual verification completed - payment confirmed as legitimate"
```

---

## HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input or validation error
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource exists
- **500 Internal Server Error**: Server error occurred

## Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    "Email is required",
    "First name is required",
    "Member with email test@example.com already exists"
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Authentication

Currently, no authentication is required. For production, add JWT bearer token:
```
Authorization: Bearer <token>
```

## Rate Limiting

Not implemented. Can be added for production.

## CORS

Currently allows all origins. Update for production.

---

**Version**: 1.0.0
**Last Updated**: 2024-01-15
