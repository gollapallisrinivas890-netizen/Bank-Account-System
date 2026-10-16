import { Router, Request, Response } from 'express';
import { BankingService, LIMITS } from '../services/bankingService';

export const createAccountsRouter = (bankingService: BankingService) => {
  const router = Router();

  // List or search accounts
  router.get('/', (req: Request, res: Response) => {
    try {
      const { q, bankCode } = req.query;
      let accounts;
      if (q && typeof q === 'string') {
        accounts = bankingService.searchAccounts(q);
        if (bankCode && typeof bankCode === 'string') {
          accounts = accounts.filter((a) => a.bankCode === bankCode);
        }
      } else {
        accounts = bankingService.getAllAccounts(typeof bankCode === 'string' ? bankCode : undefined);
      }
      return res.json({ success: true, count: accounts.length, accounts });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Create new account
  router.post('/', (req: Request, res: Response) => {
    try {
      const { customerName, phone, email, accountType, bankCode, pin, initialDeposit } = req.body;
      const result = bankingService.createAccount({
        customerName,
        phone,
        email,
        accountType: accountType || 'Savings Account',
        bankCode,
        pin: String(pin),
        initialDepositRupees: Number(initialDeposit)
      });
      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        account: result.account,
        referenceId: result.referenceId
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  });

  // Get specific account details
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const accountId = Number(req.params.id);
      const account = bankingService.getAccount(accountId);
      if (!account) return res.status(404).json({ success: false, message: 'Account not found.' });
      return res.json({ success: true, account });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Balance enquiry
  router.get('/:id/balance', (req: Request, res: Response) => {
    try {
      const accountId = Number(req.params.id);
      const account = bankingService.getAccount(accountId);
      if (!account) return res.status(404).json({ success: false, message: 'Account not found.' });

      return res.json({
        success: true,
        accountId: account.accountId,
        customerName: account.customerName,
        bankName: account.bankName,
        accountType: account.accountType,
        balanceRupees: account.balanceRupees,
        balancePaise: account.balancePaise,
        locked: account.locked
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Today outgoing & limits
  router.get('/:id/today-outgoing', (req: Request, res: Response) => {
    try {
      const accountId = Number(req.params.id);
      const outgoingPaise = bankingService.getTodayOutgoing(accountId);
      const maxDailyPaise = LIMITS.MAX_DAILY_OUTGOING_PAISE;
      const remainingPaise = Math.max(0, maxDailyPaise - outgoingPaise);

      return res.json({
        success: true,
        accountId,
        todayOutgoingRupees: outgoingPaise / 100,
        maxDailyLimitRupees: maxDailyPaise / 100,
        remainingDailyLimitRupees: remainingPaise / 100,
        limits: {
          atmWithdrawalMax: LIMITS.MAX_ATM_WITHDRAWAL_PAISE / 100,
          bankWithdrawalMax: LIMITS.MAX_BANK_WITHDRAWAL_PAISE / 100,
          upiPaymentMax: LIMITS.MAX_UPI_PAYMENT_PAISE / 100,
          rechargeMax: LIMITS.MAX_RECHARGE_PAISE / 100,
          billPaymentMax: LIMITS.MAX_BILL_PAYMENT_PAISE / 100,
          dailyOutgoingMax: LIMITS.MAX_DAILY_OUTGOING_PAISE / 100
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Update account details (Module 8 from Report/PPT)
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const accountId = Number(req.params.id);
      const { customerName, phone, email } = req.body;
      const updated = bankingService.updateAccount(accountId, { customerName, phone, email });
      return res.json({
        success: true,
        message: 'Account details updated successfully.',
        account: updated
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  });

  return router;
};
