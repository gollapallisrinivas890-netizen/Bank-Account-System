import { Router, Request, Response } from 'express';
import { BankingService } from '../services/bankingService';

export const createTransactionsRouter = (bankingService: BankingService) => {
  const router = Router();

  // List transactions
  router.get('/', (req: Request, res: Response) => {
    try {
      const accountId = req.query.accountId ? Number(req.query.accountId) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 100;
      const transactions = bankingService.getTransactions(accountId, limit);
      return res.json({ success: true, count: transactions.length, transactions });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get single transaction (Receipt)
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const transaction = bankingService.getTransactionById(id);
      if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });

      const account = bankingService.getAccount(transaction.accountId);
      let relatedAccount = null;
      if (transaction.relatedAccountId) {
        relatedAccount = bankingService.getAccount(transaction.relatedAccountId);
      }

      return res.json({
        success: true,
        transaction,
        account,
        relatedAccount
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Deposit money
  router.post('/deposit', (req: Request, res: Response) => {
    try {
      const { accountId, amount } = req.body;
      if (!accountId || !amount) {
        return res.status(400).json({ success: false, message: 'Account ID and positive amount required.' });
      }

      const result = bankingService.deposit(Number(accountId), Number(amount));
      return res.json({
        success: true,
        message: 'Deposit successful.',
        transaction: result.transaction,
        newBalanceRupees: result.newBalanceRupees
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  });

  // Withdraw money (ATM or Bank Counter)
  router.post('/withdraw', (req: Request, res: Response) => {
    try {
      const { accountId, amount, type, pin } = req.body;
      if (!accountId || !amount || !pin || !type) {
        return res.status(400).json({ success: false, message: 'Account ID, amount, withdrawal type, and 4-digit PIN required.' });
      }

      if (type !== 'ATM WITHDRAWAL' && type !== 'BANK WITHDRAWAL') {
        return res.status(400).json({ success: false, message: 'Invalid withdrawal type. Must be ATM WITHDRAWAL or BANK WITHDRAWAL.' });
      }

      const result = bankingService.withdraw({
        accountId: Number(accountId),
        amountRupees: Number(amount),
        type,
        pin: String(pin)
      });

      return res.json({
        success: true,
        message: 'Withdrawal successful. Please collect cash.',
        transaction: result.transaction,
        newBalanceRupees: result.newBalanceRupees
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  });

  // Account Transfer
  router.post('/transfer', (req: Request, res: Response) => {
    try {
      const { senderId, receiverId, receiverNameVerify, amount, pin } = req.body;
      if (!senderId || !receiverId || !receiverNameVerify || !amount || !pin) {
        return res.status(400).json({
          success: false,
          message: 'Sender ID, Receiver ID, Receiver Name Verification, amount, and PIN required.'
        });
      }

      const result = bankingService.transfer({
        senderId: Number(senderId),
        receiverId: Number(receiverId),
        receiverNameVerify: String(receiverNameVerify),
        amountRupees: Number(amount),
        pin: String(pin)
      });

      return res.json({
        success: true,
        message: 'Transfer successful.',
        transaction: result.transaction,
        newBalanceRupees: result.newBalanceRupees,
        receiverName: result.receiverName
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  });

  return router;
};
