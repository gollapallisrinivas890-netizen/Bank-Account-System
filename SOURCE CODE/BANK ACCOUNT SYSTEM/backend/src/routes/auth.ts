import { Router, Request, Response } from 'express';
import { BankingService } from '../services/bankingService';

export const createAuthRouter = (bankingService: BankingService) => {
  const router = Router();

  router.post('/login', (req: Request, res: Response) => {
    try {
      const { accountId, pin, bankCode } = req.body;
      if (!accountId || !pin) {
        return res.status(400).json({ success: false, message: 'Account ID and PIN are required.' });
      }

      const result = bankingService.login(Number(accountId), String(pin), bankCode);
      if (!result.success) {
        return res.status(401).json(result);
      }
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
  });

  router.post('/verify-pin', (req: Request, res: Response) => {
    try {
      const { accountId, pin } = req.body;
      if (!accountId || !pin) {
        return res.status(400).json({ success: false, message: 'Account ID and PIN required.' });
      }
      const valid = bankingService.verifyPin(Number(accountId), String(pin));
      return res.json({ success: valid, message: valid ? 'PIN verified.' : 'Incorrect PIN.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  router.post('/change-pin', (req: Request, res: Response) => {
    try {
      const { accountId, oldPin, newPin, confirmPin } = req.body;
      if (!accountId || !oldPin || !newPin || !confirmPin) {
        return res.status(400).json({ success: false, message: 'All PIN fields are required.' });
      }
      bankingService.changePin(Number(accountId), String(oldPin), String(newPin), String(confirmPin));
      return res.json({ success: true, message: 'PIN changed successfully.' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  });

  router.post('/unlock', (req: Request, res: Response) => {
    try {
      const { accountId } = req.body;
      if (!accountId) {
        return res.status(400).json({ success: false, message: 'Account ID required.' });
      }
      const updated = bankingService.unlockAccount(Number(accountId));
      return res.json({ success: true, message: 'Account unlocked successfully.', account: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  });

  return router;
};
