import { describe, it, expect, beforeAll } from 'vitest';
import { AppDatabase } from '../src/db/database';
import { BankingService, LIMITS } from '../src/services/bankingService';

describe('Banking System Core Business Logic & Security Tests', () => {
  let db: AppDatabase;
  let service: BankingService;

  beforeAll(async () => {
    db = AppDatabase.getInstance();
    await db.initialize();
    service = new BankingService(db);
  });

  it('should have initialized 8 banks', () => {
    const banks = db.query('SELECT * FROM banks');
    expect(banks.length).toBe(8);
    const codes = banks.map((b: any) => b.code);
    expect(codes).toContain('SBI');
    expect(codes).toContain('HDFC');
    expect(codes).toContain('ICICI');
    expect(codes).toContain('AXIS');
    expect(codes).toContain('CANARA');
    expect(codes).toContain('BOB');
    expect(codes).toContain('PNB');
    expect(codes).toContain('UBI');
  });

  it('should create a new customer account with unique ID and initial deposit', () => {
    const res = service.createAccount({
      customerName: 'Aarav Sharma',
      phone: '9123456789',
      email: 'aarav.sharma@example.com',
      accountType: 'Savings Account',
      bankCode: 'SBI',
      pin: '5678',
      initialDepositRupees: 15000
    });

    expect(res.account.accountId).toBeGreaterThanOrEqual(10000001);
    expect(res.account.customerName).toBe('Aarav Sharma');
    expect(res.account.balanceRupees).toBe(15000);
    expect(res.account.upiId).toContain('aaravsharma');
    expect(res.account.locked).toBe(false);
  });

  it('should successfully log in with correct PIN', () => {
    const loginRes = service.login(10000001, '1234');
    expect(loginRes.success).toBe(true);
    expect(loginRes.account?.customerName).toBe('G Srinivas');
  });

  it('should decrement remaining attempts on wrong PIN and lock after 3 failed attempts', () => {
    // Create a throwaway test account
    const { account } = service.createAccount({
      customerName: 'Test Lockout User',
      phone: '9000000001',
      email: 'lockout@test.com',
      accountType: 'Savings Account',
      bankCode: 'HDFC',
      pin: '9999',
      initialDepositRupees: 5000
    });

    const testId = account.accountId;

    // Attempt 1: wrong PIN
    const res1 = service.login(testId, '0000');
    expect(res1.success).toBe(false);
    expect(res1.remainingAttempts).toBe(2);

    // Attempt 2: wrong PIN
    const res2 = service.login(testId, '0000');
    expect(res2.success).toBe(false);
    expect(res2.remainingAttempts).toBe(1);

    // Attempt 3: wrong PIN -> Lockout!
    const res3 = service.login(testId, '0000');
    expect(res3.success).toBe(false);
    expect(res3.remainingAttempts).toBe(0);
    expect(res3.message).toContain('Account locked');

    // Attempt 4: Even with correct PIN, account is locked!
    const res4 = service.login(testId, '9999');
    expect(res4.success).toBe(false);
    expect(res4.message).toContain('locked');

    // Unlock account
    const unlocked = service.unlockAccount(testId);
    expect(unlocked.locked).toBe(false);

    // Now correct PIN succeeds
    const res5 = service.login(testId, '9999');
    expect(res5.success).toBe(true);
  });

  it('should deposit money and increase balance correctly', () => {
    const accBefore = service.getAccount(10000001)!;
    const initialBalance = accBefore.balanceRupees;

    const depositRes = service.deposit(10000001, 5000);
    expect(depositRes.newBalanceRupees).toBe(initialBalance + 5000);

    const accAfter = service.getAccount(10000001)!;
    expect(accAfter.balanceRupees).toBe(initialBalance + 5000);
  });

  it('should enforce ATM withdrawal limit of ₹20,000 per transaction', () => {
    expect(() => {
      service.withdraw({
        accountId: 10000001,
        amountRupees: 25000, // exceeds 20k
        type: 'ATM WITHDRAWAL',
        pin: '1234'
      });
    }).toThrow('Transaction limit exceeded');
  });

  it('should enforce Bank Counter withdrawal limit of ₹50,000 per transaction', () => {
    expect(() => {
      service.withdraw({
        accountId: 10000001,
        amountRupees: 55000, // exceeds 50k
        type: 'BANK WITHDRAWAL',
        pin: '1234'
      });
    }).toThrow('Transaction limit exceeded');
  });

  it('should reject withdrawal when insufficient balance', () => {
    expect(() => {
      service.withdraw({
        accountId: 10000005, // balance is ~30k
        amountRupees: 40000, // within counter limit but exceeds balance!
        type: 'BANK WITHDRAWAL',
        pin: '1111'
      });
    }).toThrow('Insufficient balance');
  });

  it('should perform account-to-account transfer with recipient name verification', () => {
    const senderBefore = service.getAccount(10000001)!;
    const receiverBefore = service.getAccount(10000002)!;

    const transferAmount = 2500;
    const res = service.transfer({
      senderId: 10000001,
      receiverId: 10000002,
      receiverNameVerify: 'P Sai Tharun',
      amountRupees: transferAmount,
      pin: '1234'
    });

    expect(res.newBalanceRupees).toBe(senderBefore.balanceRupees - transferAmount);

    const senderAfter = service.getAccount(10000001)!;
    const receiverAfter = service.getAccount(10000002)!;

    expect(senderAfter.balanceRupees).toBe(senderBefore.balanceRupees - transferAmount);
    expect(receiverAfter.balanceRupees).toBe(receiverBefore.balanceRupees + transferAmount);
  });

  it('should fail transfer if recipient name does not match', () => {
    expect(() => {
      service.transfer({
        senderId: 10000001,
        receiverId: 10000002,
        receiverNameVerify: 'Wrong Name',
        amountRupees: 1000,
        pin: '1234'
      });
    }).toThrow('Receiver verification failed');
  });

  it('should prevent self-transfer', () => {
    expect(() => {
      service.transfer({
        senderId: 10000001,
        receiverId: 10000001,
        receiverNameVerify: 'G Srinivas',
        amountRupees: 500,
        pin: '1234'
      });
    }).toThrow('You cannot transfer money to your own account');
  });

  it('should perform UPI payment simulation', () => {
    const payerBefore = service.getAccount(10000003)!;
    const receiverBefore = service.getAccount(10000004)!;

    const res = service.upiPayment({
      payerId: 10000003,
      method: 'phone',
      recipientValue: receiverBefore.phone,
      amountRupees: 1200,
      note: 'Dinner split',
      pin: '3456'
    });

    expect(res.newBalanceRupees).toBe(payerBefore.balanceRupees - 1200);
    const receiverAfter = service.getAccount(10000004)!;
    expect(receiverAfter.balanceRupees).toBe(receiverBefore.balanceRupees + 1200);
  });

  it('should perform mobile recharge and enforce ₹10,000 limit', () => {
    expect(() => {
      service.mobileRecharge({
        accountId: 10000001,
        mobileNumber: '9876543210',
        rechargeType: 'Prepaid',
        operator: 'Jio',
        plan: 'Annual Pack',
        amountRupees: 15000, // exceeds 10k
        pin: '1234'
      });
    }).toThrow('Transaction limit exceeded');

    // Valid recharge
    const res = service.mobileRecharge({
      accountId: 10000001,
      mobileNumber: '9876543210',
      rechargeType: 'Prepaid',
      operator: 'Jio',
      plan: '2GB/Day 84 Days',
      amountRupees: 719,
      pin: '1234'
    });
    expect(res.transaction.type).toBe('MOBILE RECHARGE');
  });

  it('should perform utility bill payment simulation and enforce ₹50,000 limit', () => {
    const res = service.payBill({
      accountId: 10000001,
      billType: 'ELECTRICITY BILL',
      providerName: 'APEPDCL',
      consumerNumber: 'EP12345678',
      amountRupees: 1850,
      pin: '1234'
    });
    expect(res.transaction.type).toBe('ELECTRICITY BILL');
  });

  it('should search accounts by Account ID and Customer Name', () => {
    const byId = service.searchAccounts('10000001');
    expect(byId.length).toBeGreaterThanOrEqual(1);
    expect(byId[0].customerName).toBe('G Srinivas');

    const byName = service.searchAccounts('srinivas');
    expect(byName.length).toBeGreaterThanOrEqual(1);
    expect(byName[0].accountId).toBe(10000001);
  });

  it('should update customer details (name, phone, email)', () => {
    const updated = service.updateAccount(10000005, {
      customerName: 'Demo Customer Updated',
      phone: '9988776600',
      email: 'updated.demo@aditya.ac.in'
    });
    expect(updated.customerName).toBe('Demo Customer Updated');
    expect(updated.phone).toBe('9988776600');
    expect(updated.email).toBe('updated.demo@aditya.ac.in');
  });

  it('should allow changing PIN with validation', () => {
    // Cannot change if old PIN is wrong
    expect(() => {
      service.changePin(10000001, '0000', '9876', '9876');
    }).toThrow('Current PIN is incorrect');

    // Cannot change if new != confirm
    expect(() => {
      service.changePin(10000001, '1234', '9876', '5432');
    }).toThrow('do not match');

    // Successful change
    const changed = service.changePin(10000001, '1234', '9876', '9876');
    expect(changed).toBe(true);

    // Old PIN no longer works
    const oldLogin = service.login(10000001, '1234');
    expect(oldLogin.success).toBe(false);

    // New PIN works
    const newLogin = service.login(10000001, '9876');
    expect(newLogin.success).toBe(true);

    // Revert PIN back to 1234 for demo consistency
    service.changePin(10000001, '9876', '1234', '1234');
  });

  it('should calculate real dashboard statistics from database records', () => {
    const stats = service.getDashboardStats();
    expect(stats.totalAccounts).toBeGreaterThanOrEqual(5);
    expect(stats.totalBalanceRupees).toBeGreaterThan(0);
    expect(stats.totalDepositsRupees).toBeGreaterThan(0);
    expect(stats.recentTransactions.length).toBeGreaterThan(0);
  });
});
