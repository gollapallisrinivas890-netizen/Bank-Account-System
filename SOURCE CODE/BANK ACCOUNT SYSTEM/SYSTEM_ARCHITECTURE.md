# System Architecture & Technical Specifications
## Bank Account Management System Using C++

### 1. Architectural Overview

The application is structured into a clean three-tier architecture:
1. **Presentation Tier (Client):** React 18 SPA built with TypeScript, Tailwind CSS, Lucide React, and Recharts.
2. **Business & Application Tier (API):** Node.js Express service with strict business rule controllers, input validators, transaction limit checkers, and cryptographic security.
3. **Data Tier (Persistence):** SQLite persistent database using acid-compliant transactions and exact integer paise arithmetic.

```
+----------------------------------------------------------------------------+
|                        PRESENTATION TIER (REACT SPA)                       |
|   - 20 Dedicated Application Views                                         |
|   - Reusable Modals (PIN Verification, Confirmation Prompt, Receipts)       |
|   - Recharts Visual Data Analytics & Interactive Dashboards                |
|   - Responsive Layout (Navy/Cyan Color Theme, Mobile Drawer, Top Navbar)   |
+----------------------------------------------------------------------------+
                                     │  HTTP REST (JSON)
                                     ▼
+----------------------------------------------------------------------------+
|                   APPLICATION & BUSINESS SERVICE TIER                      |
|   - Routing Layer (auth, banks, accounts, transactions, payments, logs)    |
|   - BankingService (ATM/Counter limits, Daily outgoing cap, Balance checks)|
|   - SecurityService (PBKDF2 / SHA-256 with Salt, 3-Attempt Lockout)        |
+----------------------------------------------------------------------------+
                                     │  Parameterized Queries & Transactions
                                     ▼
+----------------------------------------------------------------------------+
|                          PERSISTENCE DATA TIER                             |
|   - SQLite Database (bank_system.sqlite)                                   |
|   - Integer Paise Precision (balance_paise >= 0)                           |
|   - Relational Tables: banks, accounts, transactions, security_logs        |
|   - CSV File Serialization                                                 |
+----------------------------------------------------------------------------+
```

---

### 2. Mapping C++ OOP Concepts to the Prototype

The academic report emphasizes the practical implementation of Object-Oriented Programming (OOP) concepts in C++. Here is how each concept maps directly between the original C++ code and this prototype:

| C++ Concept in Original Source | C++ Implementation (`.cpp`) | Web Prototype Equivalent |
| :--- | :--- | :--- |
| **Classes & Structs** | `struct Account`, `struct Transaction`, `struct Bank` | Strongly-typed TypeScript interfaces + domain service classes (`BankingService`, `SecurityService`, `AppDatabase`). |
| **Objects** | `Account account;` instantiated per customer | Individual account records persisted in SQLite database and instantiated in client session states. |
| **Data Members** | `accountId`, `balance`, `pin`, `locked`, `transactions` | Relational columns: `account_id`, `balance_paise`, `pin_hash`, `locked`, foreign-keyed transactions table. |
| **Member Functions** | `deposit()`, `withdrawCommon()`, `transferMoney()`, `balanceEnquiry()` | Service methods: `deposit()`, `withdraw()`, `transfer()`, `getAccount()`. |
| **Encapsulation & Security** | Private PIN checks in console, internal limit constants | Passwords/PINs are salted and hashed with PBKDF2/SHA-256; plain-text PINs are never saved to disk or returned in API responses. |
| **Atomic Transactions** | Sequential vector pushes in memory | SQLite `BEGIN TRANSACTION ... COMMIT` blocks ensuring two-account transfers execute atomically or roll back completely. |

---

### 3. Exact Transaction Limit Enforcement

The system adheres strictly to the limits programmed in the original C++ project:

```typescript
export const LIMITS = {
  MAX_ATM_WITHDRAWAL_PAISE: 20000 * 100,      // ₹20,000.00
  MAX_BANK_WITHDRAWAL_PAISE: 50000 * 100,     // ₹50,000.00
  MAX_UPI_PAYMENT_PAISE: 100000 * 100,        // ₹1,00,000.00
  MAX_RECHARGE_PAISE: 10000 * 100,            // ₹10,000.00
  MAX_BILL_PAYMENT_PAISE: 50000 * 100,        // ₹50,000.00
  MAX_DAILY_OUTGOING_PAISE: 100000 * 100      // ₹1,00,000.00
};
```

#### Daily Limit Calculation Algorithm:
Every outgoing debit operation (ATM withdrawal, counter withdrawal, transfer sent, UPI payment, mobile recharge, or utility bill) is evaluated against the user's total debits on the current calendar date (`date_only = 'YYYY-MM-DD'`). If `current_today_outgoing + requested_amount > 10000000` paise, the operation is blocked with a security limit alert.
Deposits do not count as outgoing transactions.
