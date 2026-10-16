/*
    BANK ACCOUNT MANAGEMENT SYSTEM 
    Educational C++ Console Project
    Compatible with C++03 / C++11 / VS Code / older Dev-C++.

    IMPORTANT:
    This is a banking SIMULATION. It does NOT connect to real banks,
    PhonePe, UPI, telecom operators, electricity boards or gas providers.

    Added features:
    - Multi-bank portal
    - Account creation and automatic Account ID
    - Login security with 3-attempt lock
    - Transaction PIN verification
    - Change PIN
    - ATM / bank cash withdrawal
    - Deposit
    - Account-to-account transfer
    - UPI / PhonePe-style payment simulation using mobile / UPI ID / account ID
    - Mobile recharge simulation
    - Electricity bill payment
    - Gas bill payment
    - Water bill payment
    - DTH bill payment
    - Other utility bill payment
    - Transaction history
    - Search account
    - Security settings
    - Transaction limits and confirmation checks
*/

#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <limits>
#include <ctime>
#include <sstream>
#include <cctype>
#include <algorithm>

using namespace std;

const double MAX_ATM_WITHDRAWAL = 20000.00;
const double MAX_BANK_WITHDRAWAL = 50000.00;
const double MAX_UPI_PAYMENT = 100000.00;
const double MAX_RECHARGE = 10000.00;
const double MAX_BILL_PAYMENT = 50000.00;
const double MAX_DAILY_OUTGOING = 100000.00;

struct Transaction {
    string dateTime;
    string dateOnly;
    string type;
    double amount;
    string description;
    double balanceAfter;
};

struct Account {
    unsigned long accountId;
    string customerName;
    string phone;
    string email;
    string accountType;
    string bankName;
    string bankCode;
    string pin;
    string upiId;
    double balance;
    bool locked;
    int failedLoginAttempts;
    vector<Transaction> transactions;
};

struct Bank {
    string name;
    string code;
};

vector<Bank> banks;
vector<Account> accounts;
unsigned long nextAccountId = 10000001UL;

void clearInput() {
    cin.clear();
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
}

void pauseScreen() {
    cout << "\nPress Enter to continue...";
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
}

string currentDateTime() {
    time_t now = time(0);
    tm *localTime = localtime(&now);
    if (localTime == NULL) return "Unknown";

    char buffer[30];
    strftime(buffer, sizeof(buffer), "%d-%m-%Y %H:%M:%S", localTime);
    return string(buffer);
}

string currentDate() {
    time_t now = time(0);
    tm *localTime = localtime(&now);
    if (localTime == NULL) return "Unknown";

    char buffer[15];
    strftime(buffer, sizeof(buffer), "%d-%m-%Y", localTime);
    return string(buffer);
}

int getChoice(const string &message, int minimum, int maximum) {
    int choice;
    while (true) {
        cout << message;
        if (cin >> choice && choice >= minimum && choice <= maximum) {
            clearInput();
            return choice;
        }
        cout << "Invalid choice. Enter a number from " << minimum << " to " << maximum << ".\n";
        clearInput();
    }
}

double getPositiveAmount(const string &message) {
    double amount;
    while (true) {
        cout << message;
        if (cin >> amount && amount > 0 && amount <= 1000000000.0) {
            clearInput();
            return amount;
        }
        cout << "Invalid amount. Enter a positive valid amount.\n";
        clearInput();
    }
}

string getRequiredText(const string &message) {
    string value;
    while (true) {
        cout << message;
        getline(cin, value);
        if (!value.empty()) return value;
        cout << "This field cannot be empty.\n";
    }
}

// Accept only alphabetic name words separated by single spaces.
// Numbers, symbols, punctuation, tabs, and empty names are rejected.
string getValidName(const string &message) {
    while (true) {
        string name;
        cout << message;
        getline(cin, name);

        bool valid = !name.empty();
        bool previousWasSpace = true; // rejects a leading space

        for (size_t i = 0; i < name.length(); ++i) {
            unsigned char c = static_cast<unsigned char>(name[i]);
            if (isalpha(c)) {
                previousWasSpace = false;
            } else if (c == ' ' && !previousWasSpace) {
                previousWasSpace = true;
            } else {
                valid = false;
                break;
            }
        }

        // Reject trailing spaces as well as blank/all-space input.
        if (previousWasSpace) valid = false;

        if (valid) return name;
        cout << "ERROR: Invalid customer name! Use letters only, with single spaces between names.\n";
    }
}

string getDigits(const string &message, int minimum, int maximum) {
    string value;
    while (true) {
        cout << message;
        getline(cin, value);

        bool valid = !value.empty();
        for (size_t i = 0; i < value.length(); ++i) {
            if (!isdigit(static_cast<unsigned char>(value[i]))) {
                valid = false;
                break;
            }
        }

        if (valid && (int)value.length() >= minimum && (int)value.length() <= maximum)
            return value;

        cout << "Invalid input. Enter digits only (" << minimum << "-" << maximum << " digits).\n";
    }
}

string getPIN(const string &message) {
    while (true) {
        string pin;
        cout << message;
        getline(cin, pin);

        bool valid = (pin.length() == 4);
        for (size_t i = 0; i < pin.length(); ++i) {
            if (!isdigit(static_cast<unsigned char>(pin[i]))) {
                valid = false;
                break;
            }
        }

        if (valid) return pin;
        cout << "PIN must contain exactly 4 digits.\n";
    }
}

bool validEmail(const string &email) {
    size_t at = email.find('@');
    size_t dot = email.rfind('.');
    return at != string::npos && dot != string::npos && at > 0 && dot > at + 1 && dot + 1 < email.length();
}

string getEmail() {
    while (true) {
        string email;
        cout << "Enter email address: ";
        getline(cin, email);
        if (validEmail(email)) return email;
        cout << "Invalid email format. Example: user@gmail.com\n";
    }
}

string normalizeName(const string &name) {
    string result;
    bool previousSpace = true;

    for (size_t i = 0; i < name.length(); ++i) {
        unsigned char c = static_cast<unsigned char>(name[i]);

        if (isspace(c)) {
            if (!previousSpace && !result.empty()) {
                result += ' ';
                previousSpace = true;
            }
        } else {
            result += static_cast<char>(tolower(c));
            previousSpace = false;
        }
    }

    if (!result.empty() && result[result.length() - 1] == ' ')
        result.erase(result.length() - 1);

    return result;
}

string makeUPIId(const string &name, unsigned long accountId, const string &bankCode) {
    string clean;
    for (size_t i = 0; i < name.length(); ++i) {
        unsigned char c = static_cast<unsigned char>(name[i]);
        if (isalnum(c)) clean += static_cast<char>(tolower(c));
    }
    if (clean.empty()) clean = "user";

    stringstream ss;
    ss << clean << accountId << "@" << bankCode;
    return ss.str();
}

int findBank(const string &code) {
    for (size_t i = 0; i < banks.size(); ++i)
        if (banks[i].code == code) return (int)i;
    return -1;
}

Account* findAccount(unsigned long accountId) {
    for (size_t i = 0; i < accounts.size(); ++i)
        if (accounts[i].accountId == accountId) return &accounts[i];
    return NULL;
}

Account* findByPhone(const string &phone) {
    for (size_t i = 0; i < accounts.size(); ++i)
        if (accounts[i].phone == phone) return &accounts[i];
    return NULL;
}

Account* findByUPI(const string &upi) {
    for (size_t i = 0; i < accounts.size(); ++i)
        if (accounts[i].upiId == upi) return &accounts[i];
    return NULL;
}

void addTransaction(Account &account, const string &type, double amount, const string &description) {
    Transaction t;
    t.dateTime = currentDateTime();
    t.dateOnly = currentDate();
    t.type = type;
    t.amount = amount;
    t.description = description;
    t.balanceAfter = account.balance;
    account.transactions.push_back(t);
}

double todayOutgoing(const Account &account) {
    double total = 0.0;
    string today = currentDate();

    for (size_t i = 0; i < account.transactions.size(); ++i) {
        const Transaction &t = account.transactions[i];
        if (t.dateOnly != today) continue;

        if (t.type == "ATM WITHDRAWAL" || t.type == "BANK WITHDRAWAL" ||
            t.type == "UPI PAYMENT" || t.type == "TRANSFER SENT" ||
            t.type == "MOBILE RECHARGE" || t.type == "ELECTRICITY BILL" ||
            t.type == "GAS BILL" || t.type == "WATER BILL" ||
            t.type == "DTH BILL" || t.type == "OTHER BILL") {
            total += t.amount;
        }
    }
    return total;
}

bool checkDailyLimit(const Account &account, double amount) {
    if (todayOutgoing(account) + amount > MAX_DAILY_OUTGOING) {
        cout << "Security limit reached. Daily outgoing limit is Rs. "
             << fixed << setprecision(2) << MAX_DAILY_OUTGOING << ".\n";
        cout << "Today's outgoing amount: Rs. " << todayOutgoing(account) << "\n";
        return false;
    }
    return true;
}

bool confirmTransaction() {
    char choice;
    cout << "Confirm transaction? (Y/N): ";
    cin >> choice;
    clearInput();
    return choice == 'Y' || choice == 'y';
}

bool verifyTransactionPIN(Account &account) {
    string pin;
    cout << "Enter 4-digit transaction PIN: ";
    getline(cin, pin);

    if (pin == account.pin) return true;

    cout << "Incorrect transaction PIN. Transaction cancelled.\n";
    return false;
}

bool securityCheck(Account &account, double amount, double perTransactionLimit) {
    if (account.locked) {
        cout << "Account is locked. Please contact the bank/security administrator.\n";
        return false;
    }
    if (amount > perTransactionLimit) {
        cout << fixed << setprecision(2);
        cout << "Transaction limit exceeded. Maximum allowed: Rs. " << perTransactionLimit << "\n";
        return false;
    }
    if (!checkDailyLimit(account, amount)) return false;
    if (amount > account.balance) {
        cout << "Insufficient balance. Available balance: Rs. " << account.balance << "\n";
        return false;
    }
    if (!verifyTransactionPIN(account)) return false;
    return true;
}

void initializeBanks() {
    Bank b;
    b.name = "State Bank of India"; b.code = "SBI"; banks.push_back(b);
    b.name = "HDFC Bank"; b.code = "HDFC"; banks.push_back(b);
    b.name = "ICICI Bank"; b.code = "ICICI"; banks.push_back(b);
    b.name = "Axis Bank"; b.code = "AXIS"; banks.push_back(b);
    b.name = "Canara Bank"; b.code = "CANARA"; banks.push_back(b);
    b.name = "Bank of Baroda"; b.code = "BOB"; banks.push_back(b);
    b.name = "Punjab National Bank"; b.code = "PNB"; banks.push_back(b);
    b.name = "Union Bank of India"; b.code = "UBI"; banks.push_back(b);
}

void showBanks() {
    cout << "\n====================================================\n";
    cout << "                 SUPPORTED BANKS\n";
    cout << "====================================================\n";
    for (size_t i = 0; i < banks.size(); ++i)
        cout << (i + 1) << ". " << banks[i].name << " [" << banks[i].code << "]\n";
    cout << "====================================================\n";
}

string selectBank() {
    showBanks();
    int choice = getChoice("Select bank: ", 1, (int)banks.size());
    return banks[choice - 1].code;
}

void createAccountForBank(const string &bankCode) {
    int bankIndex = findBank(bankCode);
    if (bankIndex == -1) { cout << "Invalid bank.\n"; return; }

    Account account;
    account.accountId = nextAccountId++;
    account.bankCode = banks[bankIndex].code;
    account.bankName = banks[bankIndex].name;
    account.locked = false;
    account.failedLoginAttempts = 0;

    cout << "\n====================================================\n";
    cout << "                CREATE NEW ACCOUNT\n";
    cout << "====================================================\n";
    cout << "Selected Bank : " << account.bankName << "\n";
    cout << "Generated ID  : " << account.accountId << "\n\n";

    account.customerName = getValidName("Enter customer name: ");
    account.phone = getDigits("Enter mobile number (10 digits): ", 10, 10);
    account.email = getEmail();

    cout << "\n1. Savings Account\n2. Current Account\n";
    int type = getChoice("Select account type: ", 1, 2);
    account.accountType = (type == 1) ? "Savings Account" : "Current Account";

    account.pin = getPIN("Create 4-digit transaction/login PIN: ");
    account.upiId = makeUPIId(account.customerName, account.accountId, account.bankCode);
    account.balance = getPositiveAmount("Enter initial deposit: Rs. ");

    addTransaction(account, "ACCOUNT OPEN", account.balance, "Initial deposit");
    accounts.push_back(account);

    cout << "\n====================================================\n";
    cout << "             ACCOUNT CREATED SUCCESSFULLY\n";
    cout << "====================================================\n";
    cout << "Bank       : " << account.bankName << "\n";
    cout << "Account ID : " << account.accountId << "\n";
    cout << "Name       : " << account.customerName << "\n";
    cout << "UPI ID     : " << account.upiId << "\n";
    cout << fixed << setprecision(2);
    cout << "Balance    : Rs. " << account.balance << "\n";
    cout << "====================================================\n";
    cout << "Keep your PIN secret. Do not share it with anyone.\n";
}

Account* login(const string &bankCode) {
    cout << "\n====================================================\n";
    cout << "                   ACCOUNT LOGIN\n";
    cout << "====================================================\n";

    string idText = getDigits("Enter Account ID: ", 1, 18);
    unsigned long id = 0;
    stringstream ss(idText);
    char extra;
    ss >> id;
    if (ss.fail() || (ss >> extra) || id <= 0) {
        cout << "Invalid Account ID.\n";
        return NULL;
    }

    Account *account = findAccount(id);
    if (account == NULL) {
        cout << "Invalid Account ID. Account not found.\n";
        return NULL;
    }
    if (account->bankCode != bankCode) {
        cout << "Invalid bank/account combination.\n";
        return NULL;
    }
    if (account->locked) {
        cout << "This account is locked after repeated failed login attempts.\n";
        return NULL;
    }

    for (int attempt = 1; attempt <= 3; ++attempt) {
        string pin = getPIN("Enter 4-digit PIN: ");
        if (pin == account->pin) {
            account->failedLoginAttempts = 0;
            cout << "\nLogin successful. Welcome, " << account->customerName << "!\n";
            return account;
        }

        account->failedLoginAttempts++;
        cout << "Invalid PIN. Attempts remaining: " << (3 - attempt) << "\n";
    }

    account->locked = true;
    cout << "\nSECURITY ALERT: Account locked after 3 failed login attempts.\n";
    return NULL;
}

// Allows an existing customer to log in with their name and secret 4-digit PIN.
// The Account ID login remains available as before.
Account* loginByName(const string &bankCode) {
    cout << "\n====================================================\n";
    cout << "          LOGIN USING NAME + SECRET PIN\n";
    cout << "====================================================\n";

    string name = getValidName("Enter customer name: ");
    Account *account = NULL;
    int matches = 0;

    for (size_t i = 0; i < accounts.size(); ++i) {
        if (accounts[i].bankCode == bankCode &&
            normalizeName(accounts[i].customerName) == normalizeName(name)) {
            account = &accounts[i];
            ++matches;
        }
    }

    if (matches == 0) {
        cout << "ERROR: No account found for this name in the selected bank.\n";
        return NULL;
    }
    if (matches > 1) {
        cout << "More than one account uses this name. Please use Account ID login.\n";
        return NULL;
    }
    if (account->locked) {
        cout << "This account is locked after repeated failed login attempts.\n";
        return NULL;
    }

    for (int attempt = 1; attempt <= 3; ++attempt) {
        string pin = getPIN("Enter secret 4-digit PIN: ");
        if (pin == account->pin) {
            account->failedLoginAttempts = 0;
            cout << "\nLogin successful. Welcome, " << account->customerName << "!\n";
            return account;
        }
        ++account->failedLoginAttempts;
        cout << "ERROR: Incorrect secret PIN. Attempts remaining: "
             << (3 - attempt) << "\n";
    }

    account->locked = true;
    cout << "\nSECURITY ALERT: Account locked after 3 failed login attempts.\n";
    return NULL;
}

void balanceEnquiry(const Account &account) {
    cout << "\n====================================================\n";
    cout << "                  BALANCE ENQUIRY\n";
    cout << "====================================================\n";
    cout << "Bank       : " << account.bankName << "\n";
    cout << "Account ID : " << account.accountId << "\n";
    cout << "Name       : " << account.customerName << "\n";
    cout << fixed << setprecision(2);
    cout << "Balance    : Rs. " << account.balance << "\n";
}

void deposit(Account &account) {
    cout << "\n====================================================\n";
    cout << "                    DEPOSIT MONEY\n";
    cout << "====================================================\n";
    double amount = getPositiveAmount("Enter deposit amount: Rs. ");

    account.balance += amount;
    addTransaction(account, "DEPOSIT", amount, "Money deposited");

    cout << fixed << setprecision(2);
    cout << "Deposit successful. New balance: Rs. " << account.balance << "\n";
}

void withdrawCommon(Account &account, const string &type, double limit, const string &title) {
    cout << "\n====================================================\n";
    cout << "                  " << title << "\n";
    cout << "====================================================\n";
    cout << fixed << setprecision(2);
    cout << "Available Balance: Rs. " << account.balance << "\n";
    cout << "Transaction Limit: Rs. " << limit << "\n";

    double amount = getPositiveAmount("Enter withdrawal amount: Rs. ");
    if (!securityCheck(account, amount, limit)) return;

    cout << "\nWithdrawal Summary\n";
    cout << "Amount: Rs. " << amount << "\n";
    cout << "Remaining Balance: Rs. " << account.balance - amount << "\n";
    if (!confirmTransaction()) {
        cout << "Withdrawal cancelled.\n";
        return;
    }

    account.balance -= amount;
    addTransaction(account, type, amount, title);
    cout << "Withdrawal successful.\n";
    cout << "Please collect cash.\n";
    cout << "Remaining Balance: Rs. " << account.balance << "\n";
}

void atmWithdrawal(Account &account) {
    withdrawCommon(account, "ATM WITHDRAWAL", MAX_ATM_WITHDRAWAL, "ATM CASH WITHDRAWAL");
}

void bankWithdrawal(Account &account) {
    withdrawCommon(account, "BANK WITHDRAWAL", MAX_BANK_WITHDRAWAL, "BANK COUNTER WITHDRAWAL");
}

void transferMoney(Account &sender) {
    cout << "\n====================================================\n";
    cout << "               ACCOUNT / BANK TRANSFER\n";
    cout << "====================================================\n";

    string idText = getDigits("Enter receiver Account ID: ", 1, 18);
    unsigned long receiverId = 0;
    stringstream ss(idText);
    char extra;
    ss >> receiverId;
    if (ss.fail() || (ss >> extra) || receiverId <= 0) {
        cout << "Invalid receiver Account ID.\n";
        return;
    }
    if (receiverId == sender.accountId) {
        cout << "You cannot transfer money to your own account.\n";
        return;
    }

    Account *receiver = findAccount(receiverId);
    if (receiver == NULL) {
        cout << "Receiver account not found.\n";
        return;
    }

    cout << "Receiver Name : " << receiver->customerName << "\n";
    cout << "Receiver Bank : " << receiver->bankName << "\n";
    string receiverName = getValidName("Re-enter receiver name for verification: ");
    if (normalizeName(receiverName) != normalizeName(receiver->customerName)) {
        cout << "ERROR: Invalid receiver name. Transfer cancelled.\n";
        cout << "Please check the receiver name and try again.\n";
        return;
    }

    double amount = getPositiveAmount("Enter transfer amount: Rs. ");
    if (!securityCheck(sender, amount, MAX_UPI_PAYMENT)) return;

    cout << fixed << setprecision(2);
    cout << "\nTransfer Amount: Rs. " << amount << "\n";
    cout << "From: " << sender.customerName << " - " << sender.bankName << "\n";
    cout << "To  : " << receiver->customerName << " - " << receiver->bankName << "\n";

    if (!confirmTransaction()) {
        cout << "Transfer cancelled.\n";
        return;
    }

    sender.balance -= amount;
    receiver->balance += amount;
    addTransaction(sender, "TRANSFER SENT", amount, "Transfer to " + receiver->customerName);
    addTransaction(*receiver, "TRANSFER RECEIVED", amount, "Transfer from " + sender.customerName);

    cout << "TRANSFER SUCCESSFUL.\n";
    cout << "New Balance: Rs. " << sender.balance << "\n";
}

void upiPayment(Account &payer) {
    cout << "\n====================================================\n";
    cout << "               UPI / PHONE PAYMENT\n";
    cout << "====================================================\n";
    cout << "Simulation of UPI/PhonePe-style payment.\n";
    cout << "No real PhonePe or UPI network is connected.\n\n";

    cout << "1. Pay using Receiver Account ID\n";
    cout << "2. Pay using Mobile Number\n";
    cout << "3. Pay using UPI ID\n";
    int method = getChoice("Select payment method: ", 1, 3);

    Account *receiver = NULL;
    string receiverInfo;

    if (method == 1) {
        string idText = getDigits("Enter receiver Account ID: ", 1, 18);
        unsigned long id = 0;
        stringstream ss(idText);
        char extra;
        ss >> id;
        if (ss.fail() || (ss >> extra) || id <= 0) {
            cout << "Invalid Account ID.\n";
            return;
        }
        receiver = findAccount(id);
        receiverInfo = idText;
    } else if (method == 2) {
        string phone = getDigits("Enter receiver mobile number: ", 10, 10);
        receiver = findByPhone(phone);
        receiverInfo = phone;
    } else {
        receiverInfo = getRequiredText("Enter receiver UPI ID: ");
        receiver = findByUPI(receiverInfo);
    }

    if (receiver == NULL) {
        cout << "Receiver not found. Payment cancelled.\n";
        return;
    }
    if (receiver->accountId == payer.accountId) {
        cout << "You cannot pay yourself.\n";
        return;
    }

    cout << "\nReceiver : " << receiver->customerName << "\n";
    cout << "Bank     : " << receiver->bankName << "\n";
    cout << "UPI ID   : " << receiver->upiId << "\n";

    double amount = getPositiveAmount("Enter payment amount: Rs. ");
    if (!securityCheck(payer, amount, MAX_UPI_PAYMENT)) return;

    string note;
    cout << "Enter payment note/description: ";
    getline(cin, note);
    if (note.empty()) note = "UPI payment";

    cout << "\nPayment Summary\n";
    cout << "To       : " << receiver->customerName << "\n";
    cout << "Receiver : " << receiverInfo << "\n";
    cout << "Amount   : Rs. " << fixed << setprecision(2) << amount << "\n";
    cout << "Note     : " << note << "\n";

    if (!confirmTransaction()) {
        cout << "Payment cancelled.\n";
        return;
    }

    payer.balance -= amount;
    receiver->balance += amount;
    addTransaction(payer, "UPI PAYMENT", amount, note + " -> " + receiver->customerName);
    addTransaction(*receiver, "UPI RECEIVED", amount, "UPI payment from " + payer.customerName);

    cout << "\nUPI PAYMENT SUCCESSFUL.\n";
    cout << "Transaction completed in simulation.\n";
    cout << "Remaining Balance: Rs. " << payer.balance << "\n";
}

bool genericServicePayment(Account &account, const string &serviceName, const string &transactionType,
                           double limit, const string &customerField) {
    cout << "\n====================================================\n";
    cout << "                 " << serviceName << "\n";
    cout << "====================================================\n";

    string consumer = getRequiredText("Enter " + customerField + ": ");
    double amount = getPositiveAmount("Enter amount: Rs. ");

    if (!securityCheck(account, amount, limit)) return false;

    cout << "\nService       : " << serviceName << "\n";
    cout << customerField << " : " << consumer << "\n";
    cout << "Amount        : Rs. " << fixed << setprecision(2) << amount << "\n";

    if (!confirmTransaction()) {
        cout << "Payment cancelled.\n";
        return false;
    }

    account.balance -= amount;
    addTransaction(account, transactionType, amount, serviceName + " - " + consumer);

    cout << "Payment successful.\n";
    cout << "Remaining Balance: Rs. " << account.balance << "\n";
    return true;
}

void mobileRecharge(Account &account) {
    cout << "\n====================================================\n";
    cout << "                    MOBILE RECHARGE\n";
    cout << "====================================================\n";

    string mobile = getDigits("Enter mobile number: ", 10, 10);
    cout << "1. Prepaid Recharge\n2. Postpaid Bill\n";
    int type = getChoice("Select type: ", 1, 2);
    string plan = getRequiredText("Enter recharge plan/description: ");
    double amount = getPositiveAmount("Enter recharge amount: Rs. ");

    if (!securityCheck(account, amount, MAX_RECHARGE)) return;

    cout << "\nMobile Number : " << mobile << "\n";
    cout << "Type          : " << (type == 1 ? "Prepaid Recharge" : "Postpaid Bill") << "\n";
    cout << "Plan          : " << plan << "\n";
    cout << "Amount        : Rs. " << fixed << setprecision(2) << amount << "\n";

    if (!confirmTransaction()) {
        cout << "Recharge cancelled.\n";
        return;
    }

    account.balance -= amount;
    addTransaction(account, "MOBILE RECHARGE", amount, "Mobile " + mobile + " - " + plan);
    cout << "Mobile recharge successful (simulation).\n";
    cout << "Remaining Balance: Rs. " << account.balance << "\n";
}

void billPayments(Account &account) {
    while (true) {
        cout << "\n====================================================\n";
        cout << "                    BILL PAYMENTS\n";
        cout << "====================================================\n";
        cout << "1. Electricity Bill\n";
        cout << "2. Gas Bill\n";
        cout << "3. Water Bill\n";
        cout << "4. DTH / TV Bill\n";
        cout << "5. Other Utility Bill\n";
        cout << "6. Back\n";

        int choice = getChoice("Enter choice: ", 1, 6);
        if (choice == 6) return;

        if (choice == 1)
            genericServicePayment(account, "ELECTRICITY BILL", "ELECTRICITY BILL", MAX_BILL_PAYMENT, "consumer number");
        else if (choice == 2)
            genericServicePayment(account, "GAS BILL", "GAS BILL", MAX_BILL_PAYMENT, "gas customer number");
        else if (choice == 3)
            genericServicePayment(account, "WATER BILL", "WATER BILL", MAX_BILL_PAYMENT, "water consumer number");
        else if (choice == 4)
            genericServicePayment(account, "DTH BILL", "DTH BILL", MAX_BILL_PAYMENT, "subscriber number");
        else
            genericServicePayment(account, "OTHER UTILITY BILL", "OTHER BILL", MAX_BILL_PAYMENT, "consumer/reference number");

        pauseScreen();
    }
}

void changePIN(Account &account) {
    cout << "\n====================================================\n";
    cout << "                     CHANGE PIN\n";
    cout << "====================================================\n";

    string oldPin = getPIN("Enter current 4-digit PIN: ");
    if (oldPin != account.pin) {
        cout << "Current PIN is incorrect. PIN not changed.\n";
        return;
    }

    string newPin = getPIN("Enter new 4-digit PIN: ");
    string confirmPin = getPIN("Confirm new 4-digit PIN: ");

    if (newPin != confirmPin) {
        cout << "New PIN and confirmation do not match.\n";
        return;
    }
    if (newPin == oldPin) {
        cout << "New PIN must be different from old PIN.\n";
        return;
    }

    account.pin = newPin;
    addTransaction(account, "SECURITY", 0.0, "Transaction/login PIN changed");
    cout << "PIN changed successfully.\n";
}

void securityInformation(const Account &account) {
    cout << "\n====================================================\n";
    cout << "                  SECURITY CENTER\n";
    cout << "====================================================\n";
    cout << "1. Login requires Account ID + 4-digit PIN\n";
    cout << "2. Three incorrect login attempts lock the account\n";
    cout << "3. Financial transactions require transaction PIN\n";
    cout << "4. Receiver verification is required for transfers\n";
    cout << "5. Transaction confirmation is required before debit\n";
    cout << "6. Per-transaction limits are enforced\n";
    cout << "7. Simulated daily outgoing limit: Rs. " << fixed << setprecision(2) << MAX_DAILY_OUTGOING << "\n";
    cout << "8. PIN is never displayed in account details/history\n";
    cout << "9. Transaction history records date, type, amount and balance\n";
    cout << "10. UPI/payment features are simulation-only in this project\n";
    cout << "\nUPI ID: " << account.upiId << "\n";
    cout << "====================================================\n";
}

void accountDetails(const Account &account) {
    cout << "\n====================================================\n";
    cout << "                  ACCOUNT DETAILS\n";
    cout << "====================================================\n";
    cout << "Bank Name      : " << account.bankName << "\n";
    cout << "Bank Code      : " << account.bankCode << "\n";
    cout << "Account ID     : " << account.accountId << "\n";
    cout << "Customer Name  : " << account.customerName << "\n";
    cout << "Mobile Number  : " << account.phone << "\n";
    cout << "Email          : " << account.email << "\n";
    cout << "Account Type   : " << account.accountType << "\n";
    cout << "UPI ID         : " << account.upiId << "\n";
    cout << "Account Status : " << (account.locked ? "LOCKED" : "ACTIVE") << "\n";
    cout << fixed << setprecision(2);
    cout << "Current Balance: Rs. " << account.balance << "\n";
    cout << "====================================================\n";
}

void transactionHistory(const Account &account) {
    cout << "\n====================================================\n";
    cout << "                TRANSACTION HISTORY\n";
    cout << "====================================================\n";

    if (account.transactions.empty()) {
        cout << "No transactions available.\n";
        return;
    }

    cout << fixed << setprecision(2);
    for (size_t i = 0; i < account.transactions.size(); ++i) {
        const Transaction &t = account.transactions[i];
        cout << "\nTransaction #" << (i + 1) << "\n";
        cout << "Date/Time : " << t.dateTime << "\n";
        cout << "Type      : " << t.type << "\n";
        cout << "Amount    : Rs. " << t.amount << "\n";
        cout << "Details   : " << t.description << "\n";
        cout << "Balance   : Rs. " << t.balanceAfter << "\n";
        cout << "---------------------------------------------\n";
    }
}

void accountMenu(Account &account) {
    while (true) {
        cout << "\n====================================================\n";
        cout << "             " << account.bankName << "\n";
        cout << "               ACCOUNT MENU\n";
        cout << "====================================================\n";
        cout << "Customer : " << account.customerName << "\n";
        cout << "Account  : " << account.accountId << "\n";
        cout << fixed << setprecision(2);
        cout << "Balance  : Rs. " << account.balance << "\n\n";

        cout << " 1. Balance Enquiry\n";
        cout << " 2. Deposit Money\n";
        cout << " 3. ATM Cash Withdrawal\n";
        cout << " 4. Bank Counter Withdrawal\n";
        cout << " 5. Account / Bank Transfer\n";
        cout << " 6. UPI / Phone Payment\n";
        cout << " 7. Mobile Recharge\n";
        cout << " 8. Electricity / Gas / Water / DTH Bills\n";
        cout << " 9. Account Details\n";
        cout << "10. Transaction History\n";
        cout << "11. Change PIN\n";
        cout << "12. Security Center\n";
        cout << "13. Logout\n";

        int choice = getChoice("Enter choice: ", 1, 13);

        switch (choice) {
            case 1: balanceEnquiry(account); pauseScreen(); break;
            case 2: deposit(account); pauseScreen(); break;
            case 3: atmWithdrawal(account); pauseScreen(); break;
            case 4: bankWithdrawal(account); pauseScreen(); break;
            case 5: transferMoney(account); pauseScreen(); break;
            case 6: upiPayment(account); pauseScreen(); break;
            case 7: mobileRecharge(account); pauseScreen(); break;
            case 8: billPayments(account); break;
            case 9: accountDetails(account); pauseScreen(); break;
            case 10: transactionHistory(account); pauseScreen(); break;
            case 11: changePIN(account); pauseScreen(); break;
            case 12: securityInformation(account); pauseScreen(); break;
            case 13:
                cout << "\nLogged out successfully.\n";
                return;
        }
    }
}

void bankPortal() {
    string bankCode = selectBank();
    int bankIndex = findBank(bankCode);
    if (bankIndex == -1) return;

    while (true) {
        cout << "\n====================================================\n";
        cout << "               " << banks[bankIndex].name << "\n";
        cout << "                  BANK PORTAL\n";
        cout << "====================================================\n";
        cout << "1. Create New Account\n";
        cout << "2. Existing Account Login (Account ID + PIN)\n";
        cout << "3. Forgot Account ID? Login with Name + Secret PIN\n";
        cout << "4. Back\n";

        int choice = getChoice("Enter choice: ", 1, 4);
        if (choice == 1) {
            createAccountForBank(bankCode);
            pauseScreen();
        } else if (choice == 2) {
            Account *account = login(bankCode);
            if (account != NULL) accountMenu(*account);
            pauseScreen();
        } else if (choice == 3) {
            Account *account = loginByName(bankCode);
            if (account != NULL) accountMenu(*account);
            pauseScreen();
        } else return;
    }
}

void searchAccount() {
    cout << "\n====================================================\n";
    cout << "                    SEARCH ACCOUNT\n";
    cout << "====================================================\n";

    string idText = getDigits("Enter Account ID: ", 1, 18);
    unsigned long id = 0;
    stringstream ss(idText);
    char extra;
    ss >> id;
    if (ss.fail() || (ss >> extra) || id <= 0) {
        cout << "Invalid Account ID.\n";
        return;
    }

    Account *account = findAccount(id);
    if (account == NULL) {
        cout << "Account not found.\n";
        return;
    }
    accountDetails(*account);
}

void systemInformation() {
    double totalBalance = 0.0;
    for (size_t i = 0; i < accounts.size(); ++i) totalBalance += accounts[i].balance;

    cout << "\n====================================================\n";
    cout << "                  SYSTEM INFORMATION\n";
    cout << "====================================================\n";
    cout << "Supported Banks : " << banks.size() << "\n";
    cout << "Created Accounts: " << accounts.size() << "\n";
    cout << fixed << setprecision(2);
    cout << "Total Simulated Balance: Rs. " << totalBalance << "\n";
    cout << "ATM Withdrawal Limit   : Rs. " << MAX_ATM_WITHDRAWAL << "\n";
    cout << "Bank Withdrawal Limit  : Rs. " << MAX_BANK_WITHDRAWAL << "\n";
    cout << "UPI Payment Limit      : Rs. " << MAX_UPI_PAYMENT << "\n";
    cout << "Recharge Limit         : Rs. " << MAX_RECHARGE << "\n";
    cout << "Bill Payment Limit     : Rs. " << MAX_BILL_PAYMENT << "\n";
    cout << "Daily Outgoing Limit   : Rs. " << MAX_DAILY_OUTGOING << "\n";
    cout << "====================================================\n";
}

void mainMenu() {
    while (true) {
        cout << "\n\n====================================================\n";
        cout << "       BANK ACCOUNT MANAGEMENT SYSTEM\n";
        cout << "====================================================\n";
        cout << "      ONE APPLICATION - MANY BANK SERVICES\n";
        cout << "====================================================\n";
        cout << "1. View Supported Banks\n";
        cout << "2. Select Bank / Bank Portal\n";
        cout << "3. Search Account\n";
        cout << "4. System Information\n";
        cout << "5. Exit\n";

        int choice = getChoice("Enter choice: ", 1, 5);
        switch (choice) {
            case 1: showBanks(); pauseScreen(); break;
            case 2: bankPortal(); break;
            case 3: searchAccount(); pauseScreen(); break;
            case 4: systemInformation(); pauseScreen(); break;
            case 5:
                cout << "\nThank you for using the Bank Account System.\n";
                return;
        }
    }
}

int main() {
    initializeBanks();

    cout << "\n====================================================\n";
    cout << "     WELCOME TO THE BANK ACCOUNT MANAGEMENT SYSTEM \n";
    cout << "====================================================\n";
    cout << "Educational Banking + Digital Payment Simulation\n";
    cout << "Includes UPI/Phone payment, recharge and bills\n";
    cout << "====================================================\n";

    mainMenu();
    return 0;
}
