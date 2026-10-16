# Bank Account Management System Using C++
## Full-Stack Educational Prototype & Working Demonstration

> **Academic Project Reference:** Cornerstone Project Review – 2 (Academic Year 2026–2027)  
> **Institution:** Aditya University, Department of Artificial Intelligence & Machine Learning / Department of Computer Science & Engineering  
> **Project Guide:** T. Vijaya Lakshmi Madam (Assistant Professor)  
> **Team Batch 13:**  
> - **G. Srinivas** (`25B11AI349`) — Project Manager & System Analyst  
> - **P. Sai Tharun** (`25B11AIA53`) — Account Management Developer  
> - **B. Venkatesh** (`25B11AI136`) — Transaction Developer  
> - **T. Harika** (`25B11AI982`) — Database, Testing & Documentation  

---

### Important Academic & Project Clarification
The original implementation for this project is written in console-based **C++** ([`Batch_13_Bank_Account_Management_System.cpp`](file:///d:/MY%20FILES/BANK%20ACCOUNT%20SYSTEM/Batch_13_Bank_Account_Management_System.cpp)). The original source code is fully preserved and compiles with standard MinGW GCC (`g++`).

This interactive web application is a full-stack educational prototype designed to demonstrate the banking operations, transaction limits, validations, multi-bank architecture, and security rules of the C++ codebase to the college project guide through a modern, interactive web interface.

> [!IMPORTANT]
> **Educational Simulation Notice:** This system is an educational simulation for college presentation purposes. It does not connect to real banking networks, PhonePe, UPI, telecom providers, or electricity boards.

---

## 1. System Architecture & Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS (Navy/Cyan theme), Lucide React Icons, Recharts Visualizations
- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite with persistent disk storage (`database.sqlite`) using integer paise math to prevent floating-point calculation errors
- **Testing:** Vitest and Supertest (28 automated unit and API integration tests passing)
- **Original C++ Core:** Preserved untouched at [`Batch_13_Bank_Account_Management_System.cpp`](file:///d:/MY%20FILES/BANK%20ACCOUNT%20SYSTEM/Batch_13_Bank_Account_Management_System.cpp)

---

## 2. Implemented Features & Core Modules

### All 10 Academic Core Modules from Project Report & PPT:
1. **Login Module:** Secure entry using 8-digit Account ID and 4-digit PIN. Automatically locks account after 3 consecutive failed attempts.
2. **Account Creation Module:** Registers customers with unique 8-digit Account ID (starting at 10000001), 10-digit phone, email, bank selection, and initial deposit.
3. **Account Details Module:** Displays customer profile, bank name, IFSC, account type (Savings/Current), and active/locked status.
4. **Deposit Module:** Adds money to account balance with immediate ledger recording and resulting balance calculation.
5. **Withdrawal Module:** Dual-channel withdrawal (ATM Cash vs. Bank Counter) checking balance sufficiency before debiting.
6. **Balance Enquiry Module:** Digital passbook layout, current balance, and print passbook capability.
7. **Search Account Module:** Multi-criteria search by Account Number or Customer Name as specified in the report.
8. **Update Account Module:** In-place modification of customer name, phone number, and email address.
9. **Transaction Module:** Detailed chronological transaction logging with timestamps, reference IDs, and balance audits.
10. **File/Database Storage Module:** SQLite persistent storage with integer paise precision, plus CSV export for both Accounts and Transactions.

### Additional Features from C++ Source Code:
- **8 Supported Banks:** State Bank of India (SBI), HDFC Bank (HDFC), ICICI Bank (ICICI), Axis Bank (AXIS), Canara Bank (CANARA), Bank of Baroda (BOB), Punjab National Bank (PNB), and Union Bank of India (UBI).
- **Exact C++ Transaction Limits:**
  - ATM Cash Withdrawal: **₹20,000.00** max per transaction
  - Bank Counter Withdrawal: **₹50,000.00** max per transaction
  - UPI-Style Payment: **₹1,00,000.00** max per transaction
  - Mobile Recharge: **₹10,000.00** max per transaction
  - Utility Bill Payments: **₹50,000.00** max per transaction
  - Total Daily Outgoing Limit: **₹1,00,000.00** tracked across debit transactions on the same calendar day
- **Receiver Name Verification:** Inter-account transfers require confirming the recipient's name to match stored records before debiting.
- **Self-Transfer Prevention:** Prohibits transferring funds to the same account.
- **Transaction Confirmation (Y/N prompt):** Summary modal allowing users to cancel before committing.
- **Change PIN:** Validates existing PIN, enforces 4-digit length, checks matching confirmation, and prevents reusing the old PIN.
- **Digital Services Simulation:**
  - UPI / Phone payment via Account ID, Mobile number, or UPI ID (`name+accountId@bankCode`)
  - Mobile recharge (Prepaid / Postpaid, plan selection)
  - Utility bills: Electricity, Gas, Water, DTH/TV, and Other utility services

---

## 3. Demo Login Credentials

The prototype comes pre-seeded with Batch 13 demo customer accounts in SQLite:

| Account ID | Customer Name | Bank | Account Type | 4-Digit PIN | Initial Balance |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **`10000001`** | **G. Srinivas** | SBI | Savings Account | **`1234`** | ₹75,000.00 |
| **`10000002`** | **P. Sai Tharun** | HDFC | Savings Account | **`2345`** | ₹50,000.00 |
| **`10000003`** | **B. Venkatesh** | ICICI | Current Account | **`3456`** | ₹1,20,000.00 |
| **`10000004`** | **T. Harika** | CANARA | Savings Account | **`4567`** | ₹65,000.00 |
| **`10000005`** | **Demo Customer** | AXIS | Savings Account | **`1111`** | ₹30,000.00 |

*Tip: You can use the Quick-Switch user dropdown in the top navigation bar or the 1-click presets on the Login page.*

---

## 4. How to Run the Application

### Prerequisites
- Node.js (v18+ or v24 installed)
- MinGW GCC (`g++`) for compiling the original C++ console executable

### Starting Backend and Frontend
In two separate PowerShell terminal windows in `D:\MY FILES\BANK ACCOUNT SYSTEM`:

#### Terminal 1 — Backend API Server (Port 5000):
```powershell
cd "d:\MY FILES\BANK ACCOUNT SYSTEM\backend"
npm run dev
```
*Health Check URL:* [http://localhost:5000/api/health](http://localhost:5000/api/health)

#### Terminal 2 — Frontend Application (Port 5173):
```powershell
cd "d:\MY FILES\BANK ACCOUNT SYSTEM\frontend"
npm run dev
```
*Web Prototype URL:* [http://localhost:5173/](http://localhost:5173/)

---

## 5. Running Automated Tests

To run the complete automated test suite (28 tests covering all business rules, limits, security, and endpoints):
```powershell
cd "d:\MY FILES\BANK ACCOUNT SYSTEM\backend"
npm test
```

---

## 6. Compiling and Running Original C++ Code

To verify the original C++ console application:
```powershell
cd "d:\MY FILES\BANK ACCOUNT SYSTEM"
g++ -std=c++11 Batch_13_Bank_Account_Management_System.cpp -o original_cpp_system.exe
.\original_cpp_system.exe
```

---

## 7. Folder Structure

```
BANK ACCOUNT SYSTEM/
├── Batch_13_Bank_Account_Management_System.cpp  # Original C++ source code (preserved)
├── Batch_13_Bank_account_management_system(1).pdf# Original college project report
├── Batch_13_Bank_account_system.pptx           # Original project presentation
├── README.md                                   # Master setup and execution guide
├── SYSTEM_ARCHITECTURE.md                      # System architecture and OOP mapping
├── DATABASE_SCHEMA.md                          # Database schema, ER diagram & index design
├── API_DOCUMENTATION.md                        # Complete REST API reference
├── WORKFLOW_FLOWCHART.md                       # DFD & workflow flowcharts
├── package.json                                # Root workspace helper scripts
├── backend/
│   ├── src/
│   │   ├── index.ts                            # Express application setup
│   │   ├── db/
│   │   │   └── database.ts                     # SQLite database manager & seeds
│   │   ├── routes/
│   │   │   ├── auth.ts                         # Login, change-pin, unlock
│   │   │   ├── banks.ts                        # 8 banks catalog & metrics
│   │   │   ├── accounts.ts                     # CRUD, search, balance enquiry
│   │   │   ├── transactions.ts                 # Deposit, ATM/Counter withdraw, transfer
│   │   │   ├── payments.ts                     # UPI, recharge, bill payment
│   │   │   └── analytics.ts                    # Dashboard KPIs, logs, CSV export
│   │   ├── services/
│   │   │   ├── bankingService.ts               # Core banking business logic & limits
│   │   │   └── securityService.ts              # Salt+PBKDF2/SHA-256 PIN hashing
│   │   └── types/                              # Backend TypeScript interfaces
│   ├── data/                                   # SQLite database file (bank_system.sqlite)
│   ├── tests/
│   │   ├── banking.test.ts                     # Core banking rules & security tests
│   │   └── api.test.ts                         # Supertest REST API integration tests
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── EducationalBanner.tsx           # Academic project banner
    │   │   ├── TopNavbar.tsx                   # Top navigation with bank & user switch
    │   │   ├── Sidebar.tsx                     # 20-page sidebar navigation
    │   │   ├── PinModal.tsx                    # Interactive 4-digit PIN modal
    │   │   ├── ConfirmModal.tsx                # Transaction confirmation summary
    │   │   └── ReceiptModal.tsx                # Official printable receipt modal
    │   ├── context/
    │   │   └── BankContext.tsx                 # Global application state provider
    │   ├── pages/                              # All 20 application page views
    │   ├── services/
    │   │   └── api.ts                          # Client API service wrapper
    │   ├── types/                              # Frontend TypeScript types
    │   ├── App.tsx                             # Master routing and layout
    │   ├── main.tsx                            # React DOM entry
    │   └── index.css                           # Tailwind directives & print styles
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── index.html
```
