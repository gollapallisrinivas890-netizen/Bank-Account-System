import { AppDatabase } from '../db/database';
import { SecurityService } from './securityService';
import {
  Account,
  Transaction,
  DashboardStats,
  AccountType,
  TransactionType
} from '../types';

export const LIMITS = {
  MAX_ATM_WITHDRAWAL_PAISE: 20000 * 100,      // ₹20,000
  MAX_BANK_WITHDRAWAL_PAISE: 50000 * 100,     // ₹50,000
  MAX_UPI_PAYMENT_PAISE: 100000 * 100,        // ₹1,00,000
  MAX_RECHARGE_PAISE: 10000 * 100,            // ₹10,000
  MAX_BILL_PAYMENT_PAISE: 50000 * 100,        // ₹50,000
  MAX_DAILY_OUTGOING_PAISE: 100000 * 100      // ₹1,00,000
};

export const OUTGOING_TYPES: TransactionType[] = [
  'ATM WITHDRAWAL',
  'BANK WITHDRAWAL',
  'UPI PAYMENT',
  'TRANSFER SENT',
  'MOBILE RECHARGE',
  'ELECTRICITY BILL',
  'GAS BILL',
  'WATER BILL',
  'DTH BILL',
  'OTHER BILL'
];

export class BankingService {
  constructor(private db: AppDatabase) {}

  private getFormattedDates() {
    const now = new Date();
    const dateOnly = now.toISOString().split('T')[0];
    const dateTime =
      now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB');
    return { dateTime, dateOnly };
  }

  private mapAccount(row: any): Account {
    return {
      accountId: Number(row.account_id),
      customerName: row.customer_name,
      phone: row.phone,
      email: row.email,
      accountType: row.account_type as AccountType,
      bankCode: row.bank_code,
      bankName: row.bank_name,
      upiId: row.upi_id,
      balancePaise: Number(row.balance_paise),
      balanceRupees: Number(row.balance_paise) / 100,
      locked: Boolean(row.locked),
      failedLoginAttempts: Number(row.failed_login_attempts),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapTransaction(row: any): Transaction {
    return {
      id: Number(row.id),
      accountId: Number(row.account_id),
      dateTime: row.date_time,
      dateOnly: row.date_only,
      type: row.type as TransactionType,
      amountPaise: Number(row.amount_paise),
      amountRupees: Number(row.amount_paise) / 100,
      description: row.description,
      balanceAfterPaise: Number(row.balance_after_paise),
      balanceAfterRupees: Number(row.balance_after_paise) / 100,
      relatedAccountId: row.related_account_id ? Number(row.related_account_id) : null,
      referenceId: row.reference_id
    };
  }

  public getTodayOutgoing(accountId: number): number {
    const { dateOnly } = this.getFormattedDates();
    const placeholders = OUTGOING_TYPES.map(() => '?').join(',');
    const sql = `
      SELECT COALESCE(SUM(amount_paise), 0) as total
      FROM transactions
      WHERE account_id = ? AND date_only = ? AND type IN (${placeholders})
    `;
    const res = this.db.queryOne<{ total: number }>(sql, [accountId, dateOnly, ...OUTGOING_TYPES]);
    return res ? Number(res.total) : 0;
  }

  public checkDailyLimit(accountId: number, amountPaise: number): { allowed: boolean; todayOutgoing: number } {
    const todayOutgoing = this.getTodayOutgoing(accountId);
    const allowed = todayOutgoing + amountPaise <= LIMITS.MAX_DAILY_OUTGOING_PAISE;
    return { allowed, todayOutgoing };
  }

  public getAccount(accountId: number): Account | null {
    const row = this.db.queryOne('SELECT * FROM accounts WHERE account_id = ?', [accountId]);
    return row ? this.mapAccount(row) : null;
  }

  public getAccountByPhone(phone: string): Account | null {
    const row = this.db.queryOne('SELECT * FROM accounts WHERE phone = ?', [phone]);
    return row ? this.mapAccount(row) : null;
  }

  public getAccountByUpi(upiId: string): Account | null {
    const row = this.db.queryOne('SELECT * FROM accounts WHERE LOWER(upi_id) = LOWER(?)', [upiId]);
    return row ? this.mapAccount(row) : null;
  }

  public getAllAccounts(bankCode?: string): Account[] {
    let sql = 'SELECT * FROM accounts';
    const params: any[] = [];
    if (bankCode) {
      sql += ' WHERE bank_code = ?';
      params.push(bankCode);
    }
    sql += ' ORDER BY account_id ASC';
    const rows = this.db.query(sql, params);
    return rows.map((r) => this.mapAccount(r));
  }

  public searchAccounts(queryText: string): Account[] {
    const trimmed = queryText.trim();
    if (!trimmed) return this.getAllAccounts();

    const sql = `
      SELECT * FROM accounts
      WHERE CAST(account_id AS TEXT) LIKE ?
         OR LOWER(customer_name) LIKE ?
         OR phone LIKE ?
         OR LOWER(upi_id) LIKE ?
      ORDER BY account_id ASC
    `;
    const pattern = `%${trimmed.toLowerCase()}%`;
    const rows = this.db.query(sql, [pattern, pattern, pattern, pattern]);
    return rows.map((r) => this.mapAccount(r));
  }

  public createAccount(data: {
    customerName: string;
    phone: string;
    email: string;
    accountType: AccountType;
    bankCode: string;
    pin: string;
    initialDepositRupees: number;
  }): { account: Account; referenceId: string } {
    // Validations
    if (!data.customerName || data.customerName.trim().length < 2) {
      throw new Error('Customer name must be at least 2 characters.');
    }
    if (!/^\d{10}$/.test(data.phone)) {
      throw new Error('Mobile number must be exactly 10 digits.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('Invalid email address format.');
    }
    if (!/^\d{4}$/.test(data.pin)) {
      throw new Error('PIN must contain exactly 4 digits.');
    }
    if (data.initialDepositRupees <= 0) {
      throw new Error('Initial deposit must be a positive amount.');
    }

    const bank = this.db.queryOne<{ code: string; name: string }>(
      'SELECT code, name FROM banks WHERE code = ?',
      [data.bankCode]
    );
    if (!bank) {
      throw new Error(`Bank code "${data.bankCode}" is not supported.`);
    }

    // Determine next account ID (starts at 10000001)
    const maxRow = this.db.queryOne<{ maxId: number }>(
      'SELECT MAX(account_id) as maxId FROM accounts'
    );
    const nextId = maxRow?.maxId ? Number(maxRow.maxId) + 1 : 10000001;

    const initialPaise = Math.round(data.initialDepositRupees * 100);
    const pinHash = SecurityService.hashPin(data.pin);
    const upiId = SecurityService.generateUpiId(data.customerName, nextId, bank.code);
    const { dateTime, dateOnly } = this.getFormattedDates();
    const refId = SecurityService.generateRefId('OPEN');

    return this.db.transaction(() => {
      this.db.run(
        `INSERT INTO accounts (
          account_id, customer_name, phone, email, account_type, bank_code, bank_name,
          pin_hash, upi_id, balance_paise, locked, failed_login_attempts, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
        [
          nextId,
          data.customerName.trim(),
          data.phone,
          data.email.trim(),
          data.accountType,
          bank.code,
          bank.name,
          pinHash,
          upiId,
          initialPaise,
          dateTime,
          dateTime
        ]
      );

      this.db.run(
        `INSERT INTO transactions (
          account_id, date_time, date_only, type, amount_paise, description,
          balance_after_paise, related_account_id, reference_id
        ) VALUES (?, ?, ?, 'ACCOUNT OPEN', ?, 'Initial deposit', ?, NULL, ?)`,
        [nextId, dateTime, dateOnly, initialPaise, initialPaise, refId]
      );

      this.db.run(
        `INSERT INTO security_logs (account_id, action, timestamp, details) VALUES (?, 'ACCOUNT_CREATED', ?, ?)`,
        [nextId, dateTime, `Account created in ${bank.name} for ${data.customerName}`]
      );

      const created = this.getAccount(nextId);
      if (!created) throw new Error('Failed to retrieve newly created account.');
      return { account: created, referenceId: refId };
    });
  }

  public login(accountId: number, pin: string, bankCode?: string): { success: boolean; account?: Account; message: string; remainingAttempts?: number } {
    const row = this.db.queryOne('SELECT * FROM accounts WHERE account_id = ?', [accountId]);
    if (!row) {
      return { success: false, message: 'Invalid Account ID. Account not found.' };
    }

    if (bankCode && row.bank_code !== bankCode) {
      return { success: false, message: `Account does not belong to ${bankCode} bank.` };
    }

    if (Boolean(row.locked)) {
      return {
        success: false,
        message: 'This account is locked after repeated failed login attempts. Please contact bank support or administrator to unlock.'
      };
    }

    const pinValid = SecurityService.verifyPin(pin, row.pin_hash);
    const { dateTime } = this.getFormattedDates();

    if (pinValid) {
      this.db.run('UPDATE accounts SET failed_login_attempts = 0, updated_at = ? WHERE account_id = ?', [
        dateTime,
        accountId
      ]);
      this.db.run(
        'INSERT INTO security_logs (account_id, action, timestamp, details) VALUES (?, ?, ?, ?)',
        [accountId, 'LOGIN_SUCCESS', dateTime, 'Successful account login']
      );
      const acc = this.getAccount(accountId)!;
      return { success: true, account: acc, message: 'Login successful.' };
    }

    // Invalid PIN handling
    const newAttempts = Number(row.failed_login_attempts) + 1;
    if (newAttempts >= 3) {
      this.db.run(
        'UPDATE accounts SET failed_login_attempts = ?, locked = 1, updated_at = ? WHERE account_id = ?',
        [newAttempts, dateTime, accountId]
      );
      this.db.run(
        'INSERT INTO security_logs (account_id, action, timestamp, details) VALUES (?, ?, ?, ?)',
        [accountId, 'ACCOUNT_LOCKED', dateTime, 'SECURITY ALERT: Account locked after 3 failed login attempts']
      );
      return {
        success: false,
        remainingAttempts: 0,
        message: 'SECURITY ALERT: Account locked after 3 failed login attempts.'
      };
    } else {
      this.db.run(
        'UPDATE accounts SET failed_login_attempts = ?, updated_at = ? WHERE account_id = ?',
        [newAttempts, dateTime, accountId]
      );
      this.db.run(
        'INSERT INTO security_logs (account_id, action, timestamp, details) VALUES (?, ?, ?, ?)',
        [accountId, 'LOGIN_FAILED', dateTime, `Failed login attempt ${newAttempts}/3`]
      );
      return {
        success: false,
        remainingAttempts: 3 - newAttempts,
        message: `Invalid PIN. Attempts remaining: ${3 - newAttempts}.`
      };
    }
  }

  public verifyPin(accountId: number, pin: string): boolean {
    const row = this.db.queryOne<{ pin_hash: string; locked: number }>(
      'SELECT pin_hash, locked FROM accounts WHERE account_id = ?',
      [accountId]
    );
    if (!row || Boolean(row.locked)) return false;
    return SecurityService.verifyPin(pin, row.pin_hash);
  }

  public deposit(accountId: number, amountRupees: number): { transaction: Transaction; newBalanceRupees: number } {
    if (amountRupees <= 0) {
      throw new Error('Deposit amount must be greater than zero.');
    }
    const amountPaise = Math.round(amountRupees * 100);
    const { dateTime, dateOnly } = this.getFormattedDates();
    const refId = SecurityService.generateRefId('DEP');

    return this.db.transaction(() => {
      const acc = this.db.queryOne<{ balance_paise: number }>(
        'SELECT balance_paise FROM accounts WHERE account_id = ?',
        [accountId]
      );
      if (!acc) throw new Error('Account not found.');

      const newBalance = Number(acc.balance_paise) + amountPaise;

      this.db.run('UPDATE accounts SET balance_paise = ?, updated_at = ? WHERE account_id = ?', [
        newBalance,
        dateTime,
        accountId
      ]);

      const tRes = this.db.run(
        `INSERT INTO transactions (
          account_id, date_time, date_only, type, amount_paise, description,
          balance_after_paise, related_account_id, reference_id
        ) VALUES (?, ?, ?, 'DEPOSIT', ?, 'Money deposited to account', ?, NULL, ?)`,
        [accountId, dateTime, dateOnly, amountPaise, newBalance, refId]
      );

      const txnRow = this.db.queryOne('SELECT * FROM transactions WHERE id = ?', [tRes.lastInsertRowid]);
      return {
        transaction: this.mapTransaction(txnRow),
        newBalanceRupees: newBalance / 100
      };
    });
  }

  public withdraw(data: {
    accountId: number;
    amountRupees: number;
    type: 'ATM WITHDRAWAL' | 'BANK WITHDRAWAL';
    pin: string;
  }): { transaction: Transaction; newBalanceRupees: number } {
    const { accountId, amountRupees, type, pin } = data;
    if (amountRupees <= 0) {
      throw new Error('Withdrawal amount must be greater than zero.');
    }
    const amountPaise = Math.round(amountRupees * 100);

    const limitPaise =
      type === 'ATM WITHDRAWAL'
        ? LIMITS.MAX_ATM_WITHDRAWAL_PAISE
        : LIMITS.MAX_BANK_WITHDRAWAL_PAISE;

    if (amountPaise > limitPaise) {
      throw new Error(
        `Transaction limit exceeded. Maximum allowed for ${type} is ₹${(limitPaise / 100).toLocaleString('en-IN')}.`
      );
    }

    const accRow = this.db.queryOne('SELECT * FROM accounts WHERE account_id = ?', [accountId]);
    if (!accRow) throw new Error('Account not found.');
    if (Boolean(accRow.locked)) {
      throw new Error('Account is locked. Please contact the bank/security administrator.');
    }

    if (!SecurityService.verifyPin(pin, accRow.pin_hash)) {
      throw new Error('Incorrect transaction PIN. Transaction cancelled.');
    }

    const { allowed, todayOutgoing } = this.checkDailyLimit(accountId, amountPaise);
    if (!allowed) {
      throw new Error(
        `Security limit reached. Daily outgoing limit is ₹1,00,000. Today's outgoing: ₹${(todayOutgoing / 100).toLocaleString('en-IN')}.`
      );
    }

    const currentBalance = Number(accRow.balance_paise);
    if (amountPaise > currentBalance) {
      throw new Error(
        `Insufficient balance. Available balance: ₹${(currentBalance / 100).toLocaleString('en-IN')}.`
      );
    }

    const newBalance = currentBalance - amountPaise;
    const { dateTime, dateOnly } = this.getFormattedDates();
    const refId = SecurityService.generateRefId(type === 'ATM WITHDRAWAL' ? 'ATM' : 'BNK');
    const desc = type === 'ATM WITHDRAWAL' ? 'ATM cash withdrawal' : 'Bank counter cash withdrawal';

    return this.db.transaction(() => {
      this.db.run('UPDATE accounts SET balance_paise = ?, updated_at = ? WHERE account_id = ?', [
        newBalance,
        dateTime,
        accountId
      ]);

      const tRes = this.db.run(
        `INSERT INTO transactions (
          account_id, date_time, date_only, type, amount_paise, description,
          balance_after_paise, related_account_id, reference_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
        [accountId, dateTime, dateOnly, type, amountPaise, desc, newBalance, refId]
      );

      const txnRow = this.db.queryOne('SELECT * FROM transactions WHERE id = ?', [tRes.lastInsertRowid]);
      return {
        transaction: this.mapTransaction(txnRow),
        newBalanceRupees: newBalance / 100
      };
    });
  }

  public transfer(data: {
    senderId: number;
    receiverId: number;
    receiverNameVerify: string;
    amountRupees: number;
    pin: string;
  }): { transaction: Transaction; newBalanceRupees: number; receiverName: string } {
    const { senderId, receiverId, receiverNameVerify, amountRupees, pin } = data;
    if (senderId === receiverId) {
      throw new Error('You cannot transfer money to your own account.');
    }
    if (amountRupees <= 0) {
      throw new Error('Transfer amount must be greater than zero.');
    }
    const amountPaise = Math.round(amountRupees * 100);

    if (amountPaise > LIMITS.MAX_UPI_PAYMENT_PAISE) {
      throw new Error('Transaction limit exceeded. Maximum allowed: ₹1,00,000.');
    }

    const sender = this.db.queryOne('SELECT * FROM accounts WHERE account_id = ?', [senderId]);
    if (!sender) throw new Error('Sender account not found.');
    if (Boolean(sender.locked)) {
      throw new Error('Account is locked. Please contact administrator.');
    }

    const receiver = this.db.queryOne('SELECT * FROM accounts WHERE account_id = ?', [receiverId]);
    if (!receiver) {
      throw new Error('Receiver account not found.');
    }

    // Name verification check (case insensitive check)
    if (receiver.customer_name.trim().toLowerCase() !== receiverNameVerify.trim().toLowerCase()) {
      throw new Error('Receiver verification failed. Name does not match account records.');
    }

    if (!SecurityService.verifyPin(pin, sender.pin_hash)) {
      throw new Error('Incorrect transaction PIN. Transfer cancelled.');
    }

    const { allowed, todayOutgoing } = this.checkDailyLimit(senderId, amountPaise);
    if (!allowed) {
      throw new Error(
        `Security limit reached. Daily outgoing limit is ₹1,00,000. Today's outgoing: ₹${(todayOutgoing / 100).toLocaleString('en-IN')}.`
      );
    }

    const senderBal = Number(sender.balance_paise);
    if (amountPaise > senderBal) {
      throw new Error(`Insufficient balance. Available balance: ₹${(senderBal / 100).toLocaleString('en-IN')}.`);
    }

    const newSenderBal = senderBal - amountPaise;
    const newReceiverBal = Number(receiver.balance_paise) + amountPaise;
    const { dateTime, dateOnly } = this.getFormattedDates();
    const refId = SecurityService.generateRefId('TRF');

    return this.db.transaction(() => {
      this.db.run('UPDATE accounts SET balance_paise = ?, updated_at = ? WHERE account_id = ?', [
        newSenderBal,
        dateTime,
        senderId
      ]);
      this.db.run('UPDATE accounts SET balance_paise = ?, updated_at = ? WHERE account_id = ?', [
        newReceiverBal,
        dateTime,
        receiverId
      ]);

      const tRes = this.db.run(
        `INSERT INTO transactions (
          account_id, date_time, date_only, type, amount_paise, description,
          balance_after_paise, related_account_id, reference_id
        ) VALUES (?, ?, ?, 'TRANSFER SENT', ?, ?, ?, ?, ?)`,
        [
          senderId,
          dateTime,
          dateOnly,
          amountPaise,
          `Transfer to ${receiver.customer_name} (${receiver.bank_name})`,
          newSenderBal,
          receiverId,
          refId
        ]
      );

      this.db.run(
        `INSERT INTO transactions (
          account_id, date_time, date_only, type, amount_paise, description,
          balance_after_paise, related_account_id, reference_id
        ) VALUES (?, ?, ?, 'TRANSFER RECEIVED', ?, ?, ?, ?, ?)`,
        [
          receiverId,
          dateTime,
          dateOnly,
          amountPaise,
          `Transfer from ${sender.customer_name} (${sender.bank_name})`,
          newReceiverBal,
          senderId,
          refId
        ]
      );

      const txnRow = this.db.queryOne('SELECT * FROM transactions WHERE id = ?', [tRes.lastInsertRowid]);
      return {
        transaction: this.mapTransaction(txnRow),
        newBalanceRupees: newSenderBal / 100,
        receiverName: receiver.customer_name
      };
    });
  }

  public upiPayment(data: {
    payerId: number;
    method: 'accountId' | 'phone' | 'upiId';
    recipientValue: string;
    amountRupees: number;
    note?: string;
    pin: string;
  }): { transaction: Transaction; newBalanceRupees: number; recipientName: string } {
    const { payerId, method, recipientValue, amountRupees, note, pin } = data;
    if (amountRupees <= 0) throw new Error('Payment amount must be greater than zero.');
    const amountPaise = Math.round(amountRupees * 100);

    if (amountPaise > LIMITS.MAX_UPI_PAYMENT_PAISE) {
      throw new Error('Transaction limit exceeded. Maximum allowed: ₹1,00,000.');
    }

    let receiverRow: any = null;
    if (method === 'accountId') {
      const recId = Number(recipientValue);
      if (isNaN(recId)) throw new Error('Invalid Account ID format.');
      receiverRow = this.db.queryOne('SELECT * FROM accounts WHERE account_id = ?', [recId]);
    } else if (method === 'phone') {
      receiverRow = this.db.queryOne('SELECT * FROM accounts WHERE phone = ?', [recipientValue]);
    } else {
      receiverRow = this.db.queryOne('SELECT * FROM accounts WHERE LOWER(upi_id) = LOWER(?)', [recipientValue]);
    }

    if (!receiverRow) {
      throw new Error('Receiver not found for specified ' + method + '.');
    }

    if (Number(receiverRow.account_id) === payerId) {
      throw new Error('You cannot pay yourself.');
    }

    const payer = this.db.queryOne('SELECT * FROM accounts WHERE account_id = ?', [payerId]);
    if (!payer) throw new Error('Payer account not found.');
    if (Boolean(payer.locked)) throw new Error('Account is locked.');

    if (!SecurityService.verifyPin(pin, payer.pin_hash)) {
      throw new Error('Incorrect transaction PIN. Payment cancelled.');
    }

    const { allowed, todayOutgoing } = this.checkDailyLimit(payerId, amountPaise);
    if (!allowed) {
      throw new Error(
        `Security limit reached. Daily outgoing limit is ₹1,00,000. Today's outgoing: ₹${(todayOutgoing / 100).toLocaleString('en-IN')}.`
      );
    }

    const payerBal = Number(payer.balance_paise);
    if (amountPaise > payerBal) {
      throw new Error(`Insufficient balance. Available: ₹${(payerBal / 100).toLocaleString('en-IN')}.`);
    }

    const newPayerBal = payerBal - amountPaise;
    const newReceiverBal = Number(receiverRow.balance_paise) + amountPaise;
    const { dateTime, dateOnly } = this.getFormattedDates();
    const refId = SecurityService.generateRefId('UPI');
    const paymentNote = note && note.trim().length > 0 ? note.trim() : 'UPI payment';

    return this.db.transaction(() => {
      this.db.run('UPDATE accounts SET balance_paise = ?, updated_at = ? WHERE account_id = ?', [
        newPayerBal,
        dateTime,
        payerId
      ]);
      this.db.run('UPDATE accounts SET balance_paise = ?, updated_at = ? WHERE account_id = ?', [
        newReceiverBal,
        dateTime,
        receiverRow.account_id
      ]);

      const tRes = this.db.run(
        `INSERT INTO transactions (
          account_id, date_time, date_only, type, amount_paise, description,
          balance_after_paise, related_account_id, reference_id
        ) VALUES (?, ?, ?, 'UPI PAYMENT', ?, ?, ?, ?, ?)`,
        [
          payerId,
          dateTime,
          dateOnly,
          amountPaise,
          `${paymentNote} -> ${receiverRow.customer_name}`,
          newPayerBal,
          receiverRow.account_id,
          refId
        ]
      );

      this.db.run(
        `INSERT INTO transactions (
          account_id, date_time, date_only, type, amount_paise, description,
          balance_after_paise, related_account_id, reference_id
        ) VALUES (?, ?, ?, 'UPI RECEIVED', ?, ?, ?, ?, ?)`,
        [
          receiverRow.account_id,
          dateTime,
          dateOnly,
          amountPaise,
          `UPI payment from ${payer.customer_name} (${paymentNote})`,
          newReceiverBal,
          payerId,
          refId
        ]
      );

      const txnRow = this.db.queryOne('SELECT * FROM transactions WHERE id = ?', [tRes.lastInsertRowid]);
      return {
        transaction: this.mapTransaction(txnRow),
        newBalanceRupees: newPayerBal / 100,
        recipientName: receiverRow.customer_name
      };
    });
  }

  public mobileRecharge(data: {
    accountId: number;
    mobileNumber: string;
    rechargeType: 'Prepaid' | 'Postpaid';
    operator: string;
    plan: string;
    amountRupees: number;
    pin: string;
  }): { transaction: Transaction; newBalanceRupees: number } {
    const { accountId, mobileNumber, rechargeType, operator, plan, amountRupees, pin } = data;
    if (!/^\d{10}$/.test(mobileNumber)) {
      throw new Error('Mobile number must be exactly 10 digits.');
    }
    if (amountRupees <= 0) throw new Error('Recharge amount must be positive.');
    const amountPaise = Math.round(amountRupees * 100);

    if (amountPaise > LIMITS.MAX_RECHARGE_PAISE) {
      throw new Error('Transaction limit exceeded. Maximum allowed for recharge: ₹10,000.');
    }

    const acc = this.db.queryOne('SELECT * FROM accounts WHERE account_id = ?', [accountId]);
    if (!acc) throw new Error('Account not found.');
    if (Boolean(acc.locked)) throw new Error('Account is locked.');

    if (!SecurityService.verifyPin(pin, acc.pin_hash)) {
      throw new Error('Incorrect transaction PIN. Recharge cancelled.');
    }

    const { allowed, todayOutgoing } = this.checkDailyLimit(accountId, amountPaise);
    if (!allowed) {
      throw new Error(
        `Security limit reached. Daily outgoing limit is ₹1,00,000. Today's outgoing: ₹${(todayOutgoing / 100).toLocaleString('en-IN')}.`
      );
    }

    const currentBal = Number(acc.balance_paise);
    if (amountPaise > currentBal) {
      throw new Error(`Insufficient balance. Available: ₹${(currentBal / 100).toLocaleString('en-IN')}.`);
    }

    const newBal = currentBal - amountPaise;
    const { dateTime, dateOnly } = this.getFormattedDates();
    const refId = SecurityService.generateRefId('RCH');
    const desc = `${rechargeType} Recharge (${operator}) - ${mobileNumber} [${plan}]`;

    return this.db.transaction(() => {
      this.db.run('UPDATE accounts SET balance_paise = ?, updated_at = ? WHERE account_id = ?', [
        newBal,
        dateTime,
        accountId
      ]);

      const tRes = this.db.run(
        `INSERT INTO transactions (
          account_id, date_time, date_only, type, amount_paise, description,
          balance_after_paise, related_account_id, reference_id
        ) VALUES (?, ?, ?, 'MOBILE RECHARGE', ?, ?, ?, NULL, ?)`,
        [accountId, dateTime, dateOnly, amountPaise, desc, newBal, refId]
      );

      const txnRow = this.db.queryOne('SELECT * FROM transactions WHERE id = ?', [tRes.lastInsertRowid]);
      return {
        transaction: this.mapTransaction(txnRow),
        newBalanceRupees: newBal / 100
      };
    });
  }

  public payBill(data: {
    accountId: number;
    billType: 'ELECTRICITY BILL' | 'GAS BILL' | 'WATER BILL' | 'DTH BILL' | 'OTHER BILL';
    providerName: string;
    consumerNumber: string;
    amountRupees: number;
    pin: string;
  }): { transaction: Transaction; newBalanceRupees: number } {
    const { accountId, billType, providerName, consumerNumber, amountRupees, pin } = data;
    if (!consumerNumber || consumerNumber.trim().length === 0) {
      throw new Error('Consumer/Reference number is required.');
    }
    if (amountRupees <= 0) throw new Error('Bill payment amount must be positive.');
    const amountPaise = Math.round(amountRupees * 100);

    if (amountPaise > LIMITS.MAX_BILL_PAYMENT_PAISE) {
      throw new Error('Transaction limit exceeded. Maximum allowed for bill payment: ₹50,000.');
    }

    const acc = this.db.queryOne('SELECT * FROM accounts WHERE account_id = ?', [accountId]);
    if (!acc) throw new Error('Account not found.');
    if (Boolean(acc.locked)) throw new Error('Account is locked.');

    if (!SecurityService.verifyPin(pin, acc.pin_hash)) {
      throw new Error('Incorrect transaction PIN. Payment cancelled.');
    }

    const { allowed, todayOutgoing } = this.checkDailyLimit(accountId, amountPaise);
    if (!allowed) {
      throw new Error(
        `Security limit reached. Daily outgoing limit is ₹1,00,000. Today's outgoing: ₹${(todayOutgoing / 100).toLocaleString('en-IN')}.`
      );
    }

    const currentBal = Number(acc.balance_paise);
    if (amountPaise > currentBal) {
      throw new Error(`Insufficient balance. Available: ₹${(currentBal / 100).toLocaleString('en-IN')}.`);
    }

    const newBal = currentBal - amountPaise;
    const { dateTime, dateOnly } = this.getFormattedDates();
    const refId = SecurityService.generateRefId('BIL');
    const desc = `${billType} (${providerName}) - Ref: ${consumerNumber}`;

    return this.db.transaction(() => {
      this.db.run('UPDATE accounts SET balance_paise = ?, updated_at = ? WHERE account_id = ?', [
        newBal,
        dateTime,
        accountId
      ]);

      const tRes = this.db.run(
        `INSERT INTO transactions (
          account_id, date_time, date_only, type, amount_paise, description,
          balance_after_paise, related_account_id, reference_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
        [accountId, dateTime, dateOnly, billType, amountPaise, desc, newBal, refId]
      );

      const txnRow = this.db.queryOne('SELECT * FROM transactions WHERE id = ?', [tRes.lastInsertRowid]);
      return {
        transaction: this.mapTransaction(txnRow),
        newBalanceRupees: newBal / 100
      };
    });
  }

  public changePin(accountId: number, oldPin: string, newPin: string, confirmPin: string): boolean {
    if (newPin !== confirmPin) {
      throw new Error('New PIN and confirmation PIN do not match.');
    }
    if (!/^\d{4}$/.test(newPin)) {
      throw new Error('New PIN must contain exactly 4 digits.');
    }
    if (newPin === oldPin) {
      throw new Error('New PIN must be different from old PIN.');
    }

    const acc = this.db.queryOne('SELECT * FROM accounts WHERE account_id = ?', [accountId]);
    if (!acc) throw new Error('Account not found.');

    if (!SecurityService.verifyPin(oldPin, acc.pin_hash)) {
      throw new Error('Current PIN is incorrect. PIN not changed.');
    }

    const newHash = SecurityService.hashPin(newPin);
    const { dateTime, dateOnly } = this.getFormattedDates();

    return this.db.transaction(() => {
      this.db.run('UPDATE accounts SET pin_hash = ?, updated_at = ? WHERE account_id = ?', [
        newHash,
        dateTime,
        accountId
      ]);

      this.db.run(
        `INSERT INTO transactions (
          account_id, date_time, date_only, type, amount_paise, description,
          balance_after_paise, related_account_id, reference_id
        ) VALUES (?, ?, ?, 'SECURITY', 0, 'Transaction/login PIN changed', ?, NULL, ?)`,
        [accountId, dateTime, dateOnly, acc.balance_paise, SecurityService.generateRefId('SEC')]
      );

      this.db.run(
        'INSERT INTO security_logs (account_id, action, timestamp, details) VALUES (?, ?, ?, ?)',
        [accountId, 'PIN_CHANGED', dateTime, 'User successfully changed 4-digit PIN']
      );

      return true;
    });
  }

  public updateAccount(accountId: number, updates: { customerName?: string; phone?: string; email?: string }): Account {
    const acc = this.db.queryOne('SELECT * FROM accounts WHERE account_id = ?', [accountId]);
    if (!acc) throw new Error('Account not found.');

    const name = updates.customerName !== undefined ? updates.customerName.trim() : acc.customer_name;
    const phone = updates.phone !== undefined ? updates.phone.trim() : acc.phone;
    const email = updates.email !== undefined ? updates.email.trim() : acc.email;

    if (name.length < 2) throw new Error('Customer name must be at least 2 characters.');
    if (!/^\d{10}$/.test(phone)) throw new Error('Phone must be 10 digits.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email format.');

    const { dateTime } = this.getFormattedDates();

    this.db.run(
      'UPDATE accounts SET customer_name = ?, phone = ?, email = ?, updated_at = ? WHERE account_id = ?',
      [name, phone, email, dateTime, accountId]
    );

    this.db.run(
      'INSERT INTO security_logs (account_id, action, timestamp, details) VALUES (?, ?, ?, ?)',
      [accountId, 'ACCOUNT_UPDATED', dateTime, `Updated profile details for account ${accountId}`]
    );

    return this.getAccount(accountId)!;
  }

  public unlockAccount(accountId: number): Account {
    const acc = this.db.queryOne('SELECT * FROM accounts WHERE account_id = ?', [accountId]);
    if (!acc) throw new Error('Account not found.');

    const { dateTime } = this.getFormattedDates();
    this.db.run(
      'UPDATE accounts SET locked = 0, failed_login_attempts = 0, updated_at = ? WHERE account_id = ?',
      [dateTime, accountId]
    );

    this.db.run(
      'INSERT INTO security_logs (account_id, action, timestamp, details) VALUES (?, ?, ?, ?)',
      [accountId, 'ACCOUNT_UNLOCKED', dateTime, 'Account unlocked by administrator/demo reset']
    );

    return this.getAccount(accountId)!;
  }

  public getTransactions(accountId?: number, limit: number = 100): Transaction[] {
    let sql = 'SELECT * FROM transactions';
    const params: any[] = [];
    if (accountId) {
      sql += ' WHERE account_id = ?';
      params.push(accountId);
    }
    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(limit);

    const rows = this.db.query(sql, params);
    return rows.map((r) => this.mapTransaction(r));
  }

  public getTransactionById(id: number): Transaction | null {
    const row = this.db.queryOne('SELECT * FROM transactions WHERE id = ?', [id]);
    return row ? this.mapTransaction(row) : null;
  }

  public getDashboardStats(bankCode?: string): DashboardStats {
    let accSql = 'SELECT * FROM accounts';
    const accParams: any[] = [];
    if (bankCode) {
      accSql += ' WHERE bank_code = ?';
      accParams.push(bankCode);
    }
    const accounts = this.db.query(accSql, accParams);

    const totalAccounts = accounts.length;
    let totalBalancePaise = 0;
    let activeAccountsCount = 0;
    let lockedAccountsCount = 0;

    for (const a of accounts) {
      totalBalancePaise += Number(a.balance_paise);
      if (Boolean(a.locked)) lockedAccountsCount++;
      else activeAccountsCount++;
    }

    // Transactions stats
    let txnSql = 'SELECT * FROM transactions';
    const txnParams: any[] = [];
    if (bankCode) {
      txnSql += ' WHERE account_id IN (SELECT account_id FROM accounts WHERE bank_code = ?)';
      txnParams.push(bankCode);
    }
    txnSql += ' ORDER BY id DESC';
    const txns = this.db.query(txnSql, txnParams);

    let totalDepositsPaise = 0;
    let totalWithdrawalsPaise = 0;
    const typeMap = new Map<string, { count: number; totalPaise: number }>();

    for (const t of txns) {
      const type = t.type;
      const amt = Number(t.amount_paise);
      if (type === 'DEPOSIT' || type === 'ACCOUNT OPEN') {
        totalDepositsPaise += amt;
      } else if (
        type === 'ATM WITHDRAWAL' ||
        type === 'BANK WITHDRAWAL' ||
        type === 'TRANSFER SENT' ||
        type === 'UPI PAYMENT' ||
        type === 'MOBILE RECHARGE' ||
        type.includes('BILL')
      ) {
        totalWithdrawalsPaise += amt;
      }

      const existing = typeMap.get(type) || { count: 0, totalPaise: 0 };
      existing.count++;
      existing.totalPaise += amt;
      typeMap.set(type, existing);
    }

    const typeDistribution = Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      totalAmount: data.totalPaise / 100
    }));

    // Recent 10 transactions
    const recentTransactions = txns.slice(0, 10).map((r) => this.mapTransaction(r));

    // Daily activity (grouped by date)
    const dailyMap = new Map<string, { deposits: number; withdrawals: number; others: number }>();
    for (const t of txns) {
      const d = t.date_only;
      const amt = Number(t.amount_paise) / 100;
      const existing = dailyMap.get(d) || { deposits: 0, withdrawals: 0, others: 0 };
      if (t.type === 'DEPOSIT' || t.type === 'ACCOUNT OPEN') {
        existing.deposits += amt;
      } else if (t.type === 'ATM WITHDRAWAL' || t.type === 'BANK WITHDRAWAL') {
        existing.withdrawals += amt;
      } else {
        existing.others += amt;
      }
      dailyMap.set(d, existing);
    }

    const dailyActivity = Array.from(dailyMap.entries())
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Last 7 days

    return {
      totalAccounts,
      totalBalanceRupees: totalBalancePaise / 100,
      totalDepositsRupees: totalDepositsPaise / 100,
      totalWithdrawalsRupees: totalWithdrawalsPaise / 100,
      totalTransactionsCount: txns.length,
      todayOutgoingRupees: 0,
      activeAccountsCount,
      lockedAccountsCount,
      recentTransactions,
      typeDistribution,
      dailyActivity
    };
  }

  public getSecurityLogs(accountId?: number): any[] {
    let sql = 'SELECT * FROM security_logs';
    const params: any[] = [];
    if (accountId) {
      sql += ' WHERE account_id = ?';
      params.push(accountId);
    }
    sql += ' ORDER BY id DESC LIMIT 50';
    return this.db.query(sql, params);
  }
}
