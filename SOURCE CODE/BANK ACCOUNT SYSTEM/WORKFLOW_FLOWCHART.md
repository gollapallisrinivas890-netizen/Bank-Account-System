# Workflow & Data Flow Diagrams (DFD)
## Bank Account Management System Using C++

### 1. Data Flow Diagram (DFD) — Level 0 (Context Diagram)

```mermaid
graph TD
    User["Customer / User"]
    Admin["Bank Admin / Faculty Guide"]
    System(("Bank Account Management System (Batch 13 Engine)"))
    Storage[("SQLite Database & CSV Store")]

    User -->|"Credentials & PIN"| System
    User -->|"Deposit / Withdraw / Transfer Requests"| System
    User -->|"Recharge & Bill Payment Data"| System

    System -->|"Receipts, Passbook & Balances"| User
    System -->|"Security Alerts & Lockout Warnings"| User

    Admin -->|"Account Audits & Unlock Requests"| System
    System -->|"Dashboard Analytics & Audit Logs"| Admin

    System <-->|"Read / Write Persistent Records"| Storage
```

---

### 2. Data Flow Diagram (DFD) — Level 1 (Modular Functional Decomposition)

```mermaid
graph TD
    User["Customer / Operator"]
    
    subgraph Core Modules
        P1["1.0 Authentication & PIN Check"]
        P2["2.0 Account Creation"]
        P3["3.0 Deposit Engine"]
        P4["4.0 Withdrawal Engine (ATM & Counter)"]
        P5["5.0 Transfer & UPI Engine"]
        P6["6.0 Recharge & Utility Bill Desk"]
        P7["7.0 Account Search & Update"]
        P8["8.0 Analytics & CSV Reporting"]
    end

    DB[("SQLite Database (bank_system.sqlite)")]

    User -->|"Enter Account ID & PIN"| P1
    P1 -->|"Query Credentials & Lockout Status"| DB
    P1 -->|"Auth Token & Profile"| User

    User -->|"New Customer Data"| P2
    P2 -->|"Insert Account & Opening Txn"| DB

    User -->|"Deposit Cash"| P3
    P3 -->|"Credit Balance & Log Deposit"| DB

    User -->|"Withdraw Cash + PIN"| P4
    P4 -->|"Verify Daily & Per-Op Cap"| DB
    P4 -->|"Debit Balance & Log Withdrawal"| DB

    User -->|"Transfer/UPI + PIN + Recipient Name"| P5
    P5 -->|"Atomic Debit Sender & Credit Receiver"| DB

    User -->|"Service Number + PIN"| P6
    P6 -->|"Debit Account & Record Utility Txn"| DB

    User -->|"Search by ID or Name"| P7
    P7 -->|"Query & Update Records"| DB

    P8 -->|"Aggregate Balance & Cash Flows"| DB
    P8 -->|"Dashboard Stats & CSV Downloads"| User
```

---

### 3. Master Banking Transaction Flowchart

The algorithm below corresponds to the exact flowchart in Chapter 1.4 of the college project report:

```mermaid
flowchart TD
    Start([START]) --> Login["Display Login Interface"]
    Login --> EnterPin["Accept Account ID & 4-Digit PIN"]
    EnterPin --> CheckAttempts{"PIN Correct?"}
    
    CheckAttempts -- No --> IncrementFail["Failed Attempts = Failed Attempts + 1"]
    IncrementFail --> LockCheck{"Attempts >= 3?"}
    LockCheck -- Yes --> LockAccount["LOCK ACCOUNT (Security Alert)"] --> End([END])
    LockCheck -- No --> ShowAttempts["Show Remaining Attempts"] --> Login

    CheckAttempts -- Yes --> ResetFail["Reset Failed Attempts = 0"]
    ResetFail --> MainMenu["Display Main Menu / Dashboard"]

    MainMenu --> SelectOp{"Select Operation"}

    SelectOp -- "Create Account" --> CreateAcc["Accept Customer Details, Bank & Deposit"] --> InsertAcc["Save to Database"] --> MainMenu
    
    SelectOp -- "Deposit" --> DepInput["Enter Deposit Amount"] --> CreditBal["Add Amount to Balance"] --> LogDep["Record Transaction"] --> MainMenu

    SelectOp -- "Withdrawal" --> WithInput["Enter Amount & Channel (ATM/Counter)"]
    WithInput --> CheckLimit{"Amount <= Channel Limit?"}
    CheckLimit -- No --> LimitErr["Display Limit Exceeded Error"] --> MainMenu
    CheckLimit -- Yes --> CheckDaily{"Today Outgoing + Amount <= ₹1,00,000?"}
    CheckDaily -- No --> DailyErr["Display Daily Cap Error"] --> MainMenu
    CheckDaily -- Yes --> CheckBal{"Available Balance >= Amount?"}
    CheckBal -- No --> BalErr["Display Insufficient Balance"] --> MainMenu
    CheckBal -- Yes --> VerifyPIN{"Verify 4-Digit PIN?"}
    VerifyPIN -- No --> PINErr["Incorrect PIN. Cancelled."] --> MainMenu
    VerifyPIN -- Yes --> ConfirmPrompt{"Confirm Transaction (Y/N)?"}
    ConfirmPrompt -- No --> Cancelled["Transaction Cancelled by User"] --> MainMenu
    ConfirmPrompt -- Yes --> DebitBal["Debit Balance & Record Ledger"] --> PrintReceipt["Issue Receipt"] --> MainMenu

    SelectOp -- "Transfer" --> TrfInput["Enter Receiver ID & Verify Receiver Name"]
    TrfInput --> CheckSelf{"Sender == Receiver?"}
    CheckSelf -- Yes --> SelfErr["Cannot Transfer to Self"] --> MainMenu
    CheckSelf -- No --> CheckRecName{"Entered Name == Stored Recipient Name?"}
    CheckRecName -- No --> RecErr["Recipient Verification Failed"] --> MainMenu
    CheckRecName -- Yes --> AtomicTrf["Verify PIN -> Debit Sender & Credit Receiver Atomically"] --> MainMenu

    SelectOp -- "Balance Enquiry" --> ShowPassbook["Display Current Balance & Daily Limit Gauge"] --> MainMenu
    SelectOp -- "Search & Update" --> SearchAcc["Query by ID / Name -> Modify Details"] --> MainMenu
    SelectOp -- "CSV Export" --> ExportFiles["Generate CSV Records"] --> MainMenu
    SelectOp -- "Exit" --> Done([LOGOUT & EXIT])
```
