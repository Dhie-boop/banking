# Banking System - Postman API Testing Guide

## 🚀 **Quick Start Guide**

### Prerequisites
1. **Application Running**: Make sure your Spring Boot app is running on `http://localhost:8080`
2. **Postman Installed**: Download from https://www.postman.com/downloads/
3. **Database Connected**: Ensure PostgreSQL is running (or H2 for testing)

---

## 📋 **Step-by-Step Postman Setup**

### Step 1: Create New Collection
1. Open Postman
2. Click **"New"** → **"Collection"**
3. Name it **"Banking System API"**
4. Add Description: **"Complete banking system with authentication, accounts, and transactions"**

### Step 2: Set Collection Variables
In your collection settings, add these variables:
- `baseUrl`: `http://localhost:8080`
- `jwt_token`: (leave empty - will be set automatically)

---

## 🔐 **Authentication Flow Testing**

### 1. User Registration
**POST** `{{baseUrl}}/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
}
```

**Expected Response:**
```json
{
    "message": "User registered successfully!"
}
```

### 2. User Login
**POST** `{{baseUrl}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
    "username": "john_doe",
    "password": "password123"
}
```

**Expected Response:**
```json
{
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer",
    "username": "john_doe",
    "email": "john@example.com",
    "roles": ["CUSTOMER"]
}
```

**Post-Response Script (Add this to automatically capture JWT):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("jwt_token", response.token);
    console.log("JWT Token captured:", response.token);
}
```

---

## 💳 **Account Management Testing**

### 3. Create Account
**POST** `{{baseUrl}}/api/accounts/create`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (JSON):**
```json
{
    "accountType": "SAVINGS"
}
```

**Expected Response:**
```json
{
    "id": 1,
    "accountNumber": "ACC1730131200001",
    "accountType": "SAVINGS",
    "balance": 0.00,
    "createdAt": "2025-10-28T18:00:00"
}
```

### 4. Get Account Details
**GET** `{{baseUrl}}/api/accounts/1`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 5. Get User's Accounts
**GET** `{{baseUrl}}/api/accounts/user/1`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

---

## 💰 **Transaction Testing**

### 6. Deposit Money
**POST** `{{baseUrl}}/api/transactions/deposit`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (JSON):**
```json
{
    "accountId": 1,
    "amount": 1000.00,
    "description": "Initial deposit"
}
```

### 7. Withdraw Money
**POST** `{{baseUrl}}/api/transactions/withdraw`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (JSON):**
```json
{
    "accountId": 1,
    "amount": 100.00,
    "description": "ATM withdrawal"
}
```

### 8. Transfer Money (Requires 2 accounts)
**POST** `{{baseUrl}}/api/transactions/transfer`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (JSON):**
```json
{
    "sourceAccountId": 1,
    "targetAccountId": 2,
    "amount": 200.00,
    "description": "Transfer to savings"
}
```

### 9. Get Account Transactions
**GET** `{{baseUrl}}/api/transactions/account/1`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

---

## 👨‍💼 **Admin Testing (Login as Admin First)**

### 10. Admin Login
**POST** `{{baseUrl}}/api/auth/login`

**Body (JSON):**
```json
{
    "username": "admin",
    "password": "admin123"
}
```

### 11. Get All Users (Admin Only)
**GET** `{{baseUrl}}/api/admin/users`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 12. Get All Transactions (Admin Only)
**GET** `{{baseUrl}}/api/admin/transactions`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

---

## 🧪 **Testing Scenarios**

### Error Testing Scenarios:

1. **Invalid Authentication:**
   - Try accessing protected endpoints without JWT token
   - Use expired or invalid tokens

2. **Validation Errors:**
   - Register with existing username/email
   - Use invalid email format
   - Try negative amounts in transactions

3. **Business Logic Errors:**
   - Withdraw more than account balance
   - Transfer to the same account
   - Access other user's accounts

4. **Admin Authorization:**
   - Try admin endpoints with regular user token
   - Test user status management

---

## 📊 **Postman Collection Structure**

```
Banking System API/
├── 🔐 Authentication/
│   ├── Register User
│   ├── Login User
│   └── Login Admin
├── 💳 Account Management/
│   ├── Create Account
│   ├── Get Account Details
│   └── Get User Accounts
├── 💰 Transactions/
│   ├── Deposit Money
│   ├── Withdraw Money
│   ├── Transfer Money
│   └── Get Transaction History
├── 👨‍💼 Admin Operations/
│   ├── Get All Users
│   ├── Get All Transactions
│   └── Manage User Status
└── 🚨 Error Testing/
    ├── Invalid Authentication
    ├── Validation Errors
    └── Authorization Errors
```

---

## 🔄 **Automated Testing with Collection Runner**

1. **Create Test Data Setup:**
   - Register multiple users
   - Create accounts for each user
   - Perform various transactions

2. **Run Collection:**
   - Use Postman Collection Runner
   - Set up environment variables
   - Run all tests in sequence

3. **Assertions to Add:**
```javascript
// Status code checks
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Response structure validation
pm.test("Response has required fields", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('id');
    pm.expect(response).to.have.property('accountNumber');
});

// Business logic validation
pm.test("Balance is updated correctly", function () {
    const response = pm.response.json();
    pm.expect(response.balance).to.be.above(0);
});
```

---

## 🎯 **Next Steps**

1. **Import this collection** into Postman
2. **Start with Authentication** flow
3. **Test each module** sequentially
4. **Verify error scenarios**
5. **Run automated collection tests**

**Happy Testing! 🚀**