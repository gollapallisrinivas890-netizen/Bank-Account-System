import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { SecurityService } from '../services/securityService';

export class AppDatabase {
  private static instance: AppDatabase;
  private db: Database | null = null;
  private dbPath: string;

  private constructor() {
    const isVercel = Boolean(
      process.env.VERCEL || 
      process.env.NOW_REGION || 
      process.env.AWS_LAMBDA_FUNCTION_NAME
    );
    const dataDir = isVercel
      ? path.join(os.tmpdir(), 'bank_system_data')
      : path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.warn('Could not create directory for database:', err);
      }
    }
    this.dbPath = path.join(dataDir, 'bank_system.sqlite');
  }

  public static getInstance(): AppDatabase {
    if (!AppDatabase.instance) {
      AppDatabase.instance = new AppDatabase();
    }
    return AppDatabase.instance;
  }

  public async initialize(): Promise<void> {
    if (this.db) return;

    let SQL: any;
    try {
      SQL = await initSqlJs();
    } catch (err) {
      const candidatePaths = [
        path.resolve(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm'),
        path.resolve(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm'),
        path.resolve(process.cwd(), 'backend/node_modules/sql.js/dist/sql-wasm.wasm'),
        '/var/task/node_modules/sql.js/dist/sql-wasm.wasm'
      ];
      const found = candidatePaths.find(p => fs.existsSync(p));
      if (found) {
        SQL = await initSqlJs({
          locateFile: () => found
        });
      } else {
        throw err;
      }
    }

    if (fs.existsSync(this.dbPath)) {
      try {
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(fileBuffer);
      } catch (err) {
        console.warn('Existing database file could not be read. Initializing fresh DB.', err);
        this.db = new SQL.Database();
      }
    } else {
      this.db = new SQL.Database();
    }

    this.createTables();
    this.seedInitialData();
    this.persist();
  }

  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    this.db.run(`
      CREATE TABLE IF NOT EXISTS banks (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        ifsc_prefix TEXT NOT NULL,
        logo_color TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS accounts (
        account_id INTEGER PRIMARY KEY,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        account_type TEXT NOT NULL,
        bank_code TEXT NOT NULL,
        bank_name TEXT NOT NULL,
        pin_hash TEXT NOT NULL,
        upi_id TEXT NOT NULL UNIQUE,
        balance_paise INTEGER NOT NULL DEFAULT 0 CHECK(balance_paise >= 0),
        locked INTEGER NOT NULL DEFAULT 0,
        failed_login_attempts INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (bank_code) REFERENCES banks(code)
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        date_time TEXT NOT NULL,
        date_only TEXT NOT NULL,
        type TEXT NOT NULL,
        amount_paise INTEGER NOT NULL,
        description TEXT NOT NULL,
        balance_after_paise INTEGER NOT NULL,
        related_account_id INTEGER,
        reference_id TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(account_id)
      );

      CREATE TABLE IF NOT EXISTS security_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER,
        action TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        details TEXT NOT NULL,
        ip_address TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date_only);
      CREATE INDEX IF NOT EXISTS idx_accounts_phone ON accounts(phone);
      CREATE INDEX IF NOT EXISTS idx_accounts_upi ON accounts(upi_id);
    `);
  }

  private seedInitialData(): void {
    if (!this.db) return;

    // Check if banks exist
    const banksResult = this.query<{ count: number }>('SELECT count(*) as count FROM banks');
    if (banksResult[0]?.count === 0) {
      const initialBanks = [
        { code: 'SBI', name: 'State Bank of India', ifsc: 'SBIN0001', color: '#1a365d' },
        { code: 'HDFC', name: 'HDFC Bank', ifsc: 'HDFC0001', color: '#004c8f' },
        { code: 'ICICI', name: 'ICICI Bank', ifsc: 'ICIC0001', color: '#b91c1c' },
        { code: 'AXIS', name: 'Axis Bank', ifsc: 'UTIB0001', color: '#831843' },
        { code: 'CANARA', name: 'Canara Bank', ifsc: 'CNRB0001', color: '#0284c7' },
        { code: 'BOB', name: 'Bank of Baroda', ifsc: 'BARB0001', color: '#ea580c' },
        { code: 'PNB', name: 'Punjab National Bank', ifsc: 'PUNB0001', color: '#b45309' },
        { code: 'UBI', name: 'Union Bank of India', ifsc: 'UBIN0001', color: '#047857' }
      ];

      for (const b of initialBanks) {
        this.run(
          'INSERT INTO banks (code, name, ifsc_prefix, logo_color) VALUES (?, ?, ?, ?)',
          [b.code, b.name, b.ifsc, b.color]
        );
      }
    }

    // Check if demo accounts exist
    const accountsResult = this.query<{ count: number }>('SELECT count(*) as count FROM accounts');
    if (accountsResult[0]?.count === 0) {
      const demoAccounts = [
        {
          id: 10000001,
          name: 'G Srinivas',
          phone: '9876543210',
          email: 'srinivas.batch13@aditya.ac.in',
          type: 'Savings Account',
          bankCode: 'SBI',
          bankName: 'State Bank of India',
          pin: '1234',
          balancePaise: 7500000 // Rs. 75,000.00
        },
        {
          id: 10000002,
          name: 'P Sai Tharun',
          phone: '9876543211',
          email: 'saitharun.batch13@aditya.ac.in',
          type: 'Savings Account',
          bankCode: 'HDFC',
          bankName: 'HDFC Bank',
          pin: '2345',
          balancePaise: 5000000 // Rs. 50,000.00
        },
        {
          id: 10000003,
          name: 'B Venkatesh',
          phone: '9876543212',
          email: 'venkatesh.batch13@aditya.ac.in',
          type: 'Current Account',
          bankCode: 'ICICI',
          bankName: 'ICICI Bank',
          pin: '3456',
          balancePaise: 12000000 // Rs. 1,20,000.00
        },
        {
          id: 10000004,
          name: 'T Harika',
          phone: '9876543213',
          email: 'harika.batch13@aditya.ac.in',
          type: 'Savings Account',
          bankCode: 'CANARA',
          bankName: 'Canara Bank',
          pin: '4567',
          balancePaise: 6500000 // Rs. 65,000.00
        },
        {
          id: 10000005,
          name: 'Demo Customer',
          phone: '9988776655',
          email: 'demo.customer@aditya.ac.in',
          type: 'Savings Account',
          bankCode: 'AXIS',
          bankName: 'Axis Bank',
          pin: '1111',
          balancePaise: 3000000 // Rs. 30,000.00
        }
      ];

      const now = new Date();
      const dateOnly = now.toISOString().split('T')[0];
      const dateTime = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB');

      for (const acc of demoAccounts) {
        const pinHash = SecurityService.hashPin(acc.pin);
        const upiId = SecurityService.generateUpiId(acc.name, acc.id, acc.bankCode);

        this.run(
          `INSERT INTO accounts (
            account_id, customer_name, phone, email, account_type, bank_code, bank_name,
            pin_hash, upi_id, balance_paise, locked, failed_login_attempts, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
          [
            acc.id,
            acc.name,
            acc.phone,
            acc.email,
            acc.type,
            acc.bankCode,
            acc.bankName,
            pinHash,
            upiId,
            acc.balancePaise,
            dateTime,
            dateTime
          ]
        );

        // Record initial deposit transaction
        this.run(
          `INSERT INTO transactions (
            account_id, date_time, date_only, type, amount_paise, description,
            balance_after_paise, related_account_id, reference_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
          [
            acc.id,
            dateTime,
            dateOnly,
            'ACCOUNT OPEN',
            acc.balancePaise,
            'Initial account opening deposit',
            acc.balancePaise,
            SecurityService.generateRefId('OPEN')
          ]
        );

        this.run(
          `INSERT INTO security_logs (account_id, action, timestamp, details) VALUES (?, ?, ?, ?)`,
          [acc.id, 'ACCOUNT_CREATED', dateTime, `Initial demo account created for ${acc.name}`]
        );
      }
    }
  }

  public query<T = any>(sql: string, params: any[] = []): T[] {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return results;
  }

  public queryOne<T = any>(sql: string, params: any[] = []): T | null {
    const list = this.query<T>(sql, params);
    return list.length > 0 ? list[0] : null;
  }

  public run(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
    if (!this.db) throw new Error('Database not initialized');
    this.db.run(sql, params);
    const changesRes = this.query<{ changes: number }>('SELECT changes() as changes');
    const rowIdRes = this.query<{ rowid: number }>('SELECT last_insert_rowid() as rowid');
    const changes = changesRes[0]?.changes ?? 0;
    const lastInsertRowid = rowIdRes[0]?.rowid ?? 0;
    this.persist();
    return { changes, lastInsertRowid };
  }

  private inTransaction = false;

  public transaction<T>(callback: () => T): T {
    if (!this.db) throw new Error('Database not initialized');
    this.inTransaction = true;
    this.db.run('BEGIN TRANSACTION;');
    try {
      const result = callback();
      this.db.run('COMMIT;');
      this.inTransaction = false;
      this.persist();
      return result;
    } catch (error) {
      try {
        this.db.run('ROLLBACK;');
      } catch (rbErr) {
        // ignore rollback error if already inactive
      }
      this.inTransaction = false;
      throw error;
    }
  }

  public persist(): void {
    if (!this.db || this.inTransaction) return;
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    } catch (err) {
      console.error('Failed to persist SQLite database to disk:', err);
    }
  }
}

export const getDb = async (): Promise<AppDatabase> => {
  const db = AppDatabase.getInstance();
  await db.initialize();
  return db;
};
