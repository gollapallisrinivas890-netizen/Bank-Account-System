import { Router, Request, Response } from 'express';
import { BankingService } from '../services/bankingService';
import { AppDatabase } from '../db/database';

export const createAnalyticsRouter = (bankingService: BankingService, db: AppDatabase) => {
  const router = Router();

  // Dashboard stats endpoint
  router.get('/dashboard', (req: Request, res: Response) => {
    try {
      const bankCode = typeof req.query.bankCode === 'string' ? req.query.bankCode : undefined;
      const stats = bankingService.getDashboardStats(bankCode);
      return res.json({ success: true, stats });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Security audit logs
  router.get('/security-logs', (req: Request, res: Response) => {
    try {
      const accountId = req.query.accountId ? Number(req.query.accountId) : undefined;
      const logs = bankingService.getSecurityLogs(accountId);
      return res.json({ success: true, count: logs.length, logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // CSV Export endpoint (Satisfies Module 10 CSV Storage requirement from academic report)
  router.get('/export-csv', (req: Request, res: Response) => {
    try {
      const type = req.query.type === 'transactions' ? 'transactions' : 'accounts';

      if (type === 'accounts') {
        const accounts = bankingService.getAllAccounts();
        const headers = 'AccountID,CustomerName,Phone,Email,AccountType,BankCode,BankName,UPI_ID,BalanceRupees,Status,CreatedAt\n';
        const rows = accounts
          .map(
            (a) =>
              `${a.accountId},"${a.customerName}",${a.phone},${a.email},"${a.accountType}",${a.bankCode},"${a.bankName}",${a.upiId},${a.balanceRupees.toFixed(2)},${a.locked ? 'LOCKED' : 'ACTIVE'},"${a.createdAt}"`
          )
          .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="bank_accounts.csv"');
        return res.send(headers + rows);
      } else {
        const txns = bankingService.getTransactions(undefined, 500);
        const headers = 'TransactionID,AccountID,DateTime,Type,AmountRupees,Description,BalanceAfterRupees,ReferenceID\n';
        const rows = txns
          .map(
            (t) =>
              `${t.id},${t.accountId},"${t.dateTime}","${t.type}",${t.amountRupees.toFixed(2)},"${t.description.replace(/"/g, '""')}",${t.balanceAfterRupees.toFixed(2)},${t.referenceId}`
          )
          .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="bank_transactions.csv"');
        return res.send(headers + rows);
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
};
