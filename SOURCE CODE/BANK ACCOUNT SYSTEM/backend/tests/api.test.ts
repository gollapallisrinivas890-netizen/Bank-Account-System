import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { getDb } from '../src/db/database';
import { BankingService } from '../src/services/bankingService';
import { createAuthRouter } from '../src/routes/auth';
import { createBanksRouter } from '../src/routes/banks';
import { createAccountsRouter } from '../src/routes/accounts';
import { createTransactionsRouter } from '../src/routes/transactions';
import { createPaymentsRouter } from '../src/routes/payments';
import { createAnalyticsRouter } from '../src/routes/analytics';

describe('Bank System HTTP API Endpoints Test Suite', () => {
  let app: express.Application;

  beforeAll(async () => {
    app = express();
    app.use(cors());
    app.use(express.json());

    const db = await getDb();
    const bankingService = new BankingService(db);

    app.get('/api/health', (_req, res) => {
      res.json({ status: 'OK', project: 'Bank Account Management System Using C++' });
    });

    app.use('/api/auth', createAuthRouter(bankingService));
    app.use('/api/banks', createBanksRouter(db));
    app.use('/api/accounts', createAccountsRouter(bankingService));
    app.use('/api/transactions', createTransactionsRouter(bankingService));
    app.use('/api/payments', createPaymentsRouter(bankingService));
    app.use('/api/analytics', createAnalyticsRouter(bankingService, db));
  });

  it('GET /api/health should return system status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('GET /api/banks should return all 8 banks', async () => {
    const res = await request(app).get('/api/banks');
    expect(res.status).toBe(200);
    expect(res.body.banks.length).toBe(8);
  });

  it('GET /api/accounts should return seeded accounts', async () => {
    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(200);
    expect(res.body.accounts.length).toBeGreaterThanOrEqual(5);
  });

  it('POST /api/auth/login should authenticate demo account', async () => {
    const res = await request(app).post('/api/auth/login').send({
      accountId: 10000001,
      pin: '1234'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.account.customerName).toBe('G Srinivas');
  });

  it('POST /api/transactions/deposit should increase balance', async () => {
    const res = await request(app).post('/api/transactions/deposit').send({
      accountId: 10000001,
      amount: 1000
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transaction.type).toBe('DEPOSIT');
  });

  it('POST /api/transactions/withdraw should handle ATM withdrawal', async () => {
    const res = await request(app).post('/api/transactions/withdraw').send({
      accountId: 10000001,
      amount: 2000,
      type: 'ATM WITHDRAWAL',
      pin: '1234'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transaction.type).toBe('ATM WITHDRAWAL');
  });

  it('POST /api/transactions/transfer should transfer funds between accounts', async () => {
    const res = await request(app).post('/api/transactions/transfer').send({
      senderId: 10000001,
      receiverId: 10000002,
      receiverNameVerify: 'P Sai Tharun',
      amount: 500,
      pin: '1234'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transaction.type).toBe('TRANSFER SENT');
  });

  it('POST /api/payments/upi should process simulated UPI payment', async () => {
    const res = await request(app).post('/api/payments/upi').send({
      payerId: 10000001,
      method: 'accountId',
      recipientValue: '10000003',
      amount: 300,
      note: 'Project contribution',
      pin: '1234'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/analytics/dashboard should return real metrics', async () => {
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.stats.totalAccounts).toBeGreaterThanOrEqual(5);
    expect(res.body.stats.totalBalanceRupees).toBeGreaterThan(0);
  });

  it('GET /api/analytics/export-csv should export CSV files', async () => {
    const res = await request(app).get('/api/analytics/export-csv?type=accounts');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/csv');
    expect(res.text).toContain('AccountID,CustomerName,Phone');
  });
});
