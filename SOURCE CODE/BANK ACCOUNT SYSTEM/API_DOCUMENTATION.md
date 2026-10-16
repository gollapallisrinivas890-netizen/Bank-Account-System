# REST API Documentation
## Bank Account Management System Using C++

Base API URL: `http://localhost:5000/api`

---

### 1. Authentication & Security Endpoints (`/api/auth`)

#### `POST /auth/login`
Authenticates a customer account with Account ID and 4-digit PIN. Locks the account after 3 consecutive failures.
- **Request Body:**
  ```json
  {
    "accountId": 10000001,
    "pin": "1234",
    "bankCode": "SBI"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "account": {
      "accountId": 10000001,
      "customerName": "G Srinivas",
      "phone": "9876543210",
      "email": "srinivas.batch13@aditya.ac.in",
      "accountType": "Savings Account",
      "bankCode": "SBI",
      "bankName": "State Bank of India",
      "upiId": "gsrinivas10000001@sbi",
      "balanceRupees": 75000,
      "locked": false
    }
  }
  ```
- **Error Response (401 Unauthorized / Locked):**
  ```json
  {
    "success": false,
    "remainingAttempts": 2,
    "message": "Invalid PIN. Attempts remaining: 2."
  }
  ```

#### `POST /auth/change-pin`
Updates customer PIN after validating the current PIN.
- **Request Body:**
  ```json
  {
    "accountId": 10000001,
    "oldPin": "1234",
    "newPin": "9876",
    "confirmPin": "9876"
  }
  ```
- **Response:** `{ "success": true, "message": "PIN changed successfully." }`

#### `POST /auth/unlock`
Administrative/Demo reset to unlock a locked customer account.
- **Request Body:** `{ "accountId": 10000001 }`

---

### 2. Banks Catalog (`/api/banks`)

#### `GET /banks`
Retrieves all 8 supported banks with live account counts and aggregate simulated balances.
- **Response:**
  ```json
  {
    "success": true,
    "banks": [
      {
        "code": "SBI",
        "name": "State Bank of India",
        "ifscPrefix": "SBIN0001",
        "logoColor": "#1a365d",
        "accountCount": 2,
        "totalBalanceRupees": 105000
      }
    ]
  }
  ```

---

### 3. Accounts Management (`/api/accounts`)

#### `GET /accounts?q={searchQuery}&bankCode={code}`
Lists accounts, with optional multi-criteria search (by account ID, customer name, phone, or UPI ID) and bank filtering.

#### `POST /accounts`
Creates a new customer account.
- **Request Body:**
  ```json
  {
    "customerName": "Aarav Sharma",
    "phone": "9123456789",
    "email": "aarav@example.com",
    "accountType": "Savings Account",
    "bankCode": "SBI",
    "pin": "4321",
    "initialDeposit": 10000
  }
  ```
- **Response (201 Created):** Returns created account and initial opening transaction reference ID.

#### `GET /accounts/:id/balance`
Retrieves current balance and account status for balance enquiry.

#### `GET /accounts/:id/today-outgoing`
Returns today's outgoing expenditures and remaining allowance under the ₹1,00,000 daily limit.

#### `PUT /accounts/:id`
Updates customer contact information (Name, Phone, Email) per Module 8.

---

### 4. Transactions Endpoints (`/api/transactions`)

#### `POST /transactions/deposit`
Adds money to an account.
- **Request Body:** `{ "accountId": 10000001, "amount": 5000 }`

#### `POST /transactions/withdraw`
Processes ATM (max ₹20,000) or Bank Counter (max ₹50,000) withdrawal with 4-digit PIN verification.
- **Request Body:**
  ```json
  {
    "accountId": 10000001,
    "amount": 5000,
    "type": "ATM WITHDRAWAL",
    "pin": "1234"
  }
  ```

#### `POST /transactions/transfer`
Executes an atomic transfer between two accounts with receiver name verification.
- **Request Body:**
  ```json
  {
    "senderId": 10000001,
    "receiverId": 10000002,
    "receiverNameVerify": "P Sai Tharun",
    "amount": 2500,
    "pin": "1234"
  }
  ```

---

### 5. Payments Simulation (`/api/payments`)

#### `POST /payments/upi`
- **Request Body:**
  ```json
  {
    "payerId": 10000001,
    "method": "phone",
    "recipientValue": "9876543211",
    "amount": 1000,
    "note": "Project fee",
    "pin": "1234"
  }
  ```

#### `POST /payments/recharge`
- **Request Body:**
  ```json
  {
    "accountId": 10000001,
    "mobileNumber": "9876543210",
    "rechargeType": "Prepaid",
    "operator": "Jio",
    "plan": "2GB/Day 84 Days",
    "amount": 719,
    "pin": "1234"
  }
  ```

#### `POST /payments/bill`
- **Request Body:**
  ```json
  {
    "accountId": 10000001,
    "billType": "ELECTRICITY BILL",
    "providerName": "APEPDCL",
    "consumerNumber": "EP1008892",
    "amount": 1450,
    "pin": "1234"
  }
  ```

---

### 6. Analytics & CSV Export (`/api/analytics`)

#### `GET /analytics/dashboard?bankCode={optional}`
Returns live metrics, category distribution, and daily flow calculated directly from database records.

#### `GET /analytics/export-csv?type=accounts|transactions`
Downloads CSV files for data preservation (Module 10).
