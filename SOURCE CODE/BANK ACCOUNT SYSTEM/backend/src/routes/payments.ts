import { Router, Request, Response } from 'express';
import { BankingService } from '../services/bankingService';

export const createPaymentsRouter = (bankingService: BankingService) => {
  const router = Router();

  // UPI payment simulation
  router.post('/upi', (req: Request, res: Response) => {
    try {
      const { payerId, method, recipientValue, amount, note, pin } = req.body;
      if (!payerId || !method || !recipientValue || !amount || !pin) {
        return res.status(400).json({
          success: false,
          message: 'Payer ID, payment method, recipient value, amount, and PIN required.'
        });
      }

      if (method !== 'accountId' && method !== 'phone' && method !== 'upiId') {
        return res.status(400).json({ success: false, message: 'Invalid payment method. Use accountId, phone, or upiId.' });
      }

      const result = bankingService.upiPayment({
        payerId: Number(payerId),
        method,
        recipientValue: String(recipientValue).trim(),
        amountRupees: Number(amount),
        note: note ? String(note) : undefined,
        pin: String(pin)
      });

      return res.json({
        success: true,
        message: 'UPI payment successful (Educational Simulation).',
        transaction: result.transaction,
        newBalanceRupees: result.newBalanceRupees,
        recipientName: result.recipientName
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  });

  // Mobile recharge simulation
  router.post('/recharge', (req: Request, res: Response) => {
    try {
      const { accountId, mobileNumber, rechargeType, operator, plan, amount, pin } = req.body;
      if (!accountId || !mobileNumber || !operator || !plan || !amount || !pin) {
        return res.status(400).json({ success: false, message: 'All recharge fields and PIN are required.' });
      }

      const result = bankingService.mobileRecharge({
        accountId: Number(accountId),
        mobileNumber: String(mobileNumber).trim(),
        rechargeType: rechargeType === 'Postpaid' ? 'Postpaid' : 'Prepaid',
        operator: String(operator),
        plan: String(plan),
        amountRupees: Number(amount),
        pin: String(pin)
      });

      return res.json({
        success: true,
        message: 'Mobile recharge successful (Educational Simulation).',
        transaction: result.transaction,
        newBalanceRupees: result.newBalanceRupees
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  });

  // Utility bill payments simulation
  router.post('/bill', (req: Request, res: Response) => {
    try {
      const { accountId, billType, providerName, consumerNumber, amount, pin } = req.body;
      if (!accountId || !billType || !providerName || !consumerNumber || !amount || !pin) {
        return res.status(400).json({ success: false, message: 'All bill payment fields and PIN are required.' });
      }

      const validTypes = ['ELECTRICITY BILL', 'GAS BILL', 'WATER BILL', 'DTH BILL', 'OTHER BILL'];
      if (!validTypes.includes(billType)) {
        return res.status(400).json({ success: false, message: 'Invalid bill type.' });
      }

      const result = bankingService.payBill({
        accountId: Number(accountId),
        billType,
        providerName: String(providerName),
        consumerNumber: String(consumerNumber).trim(),
        amountRupees: Number(amount),
        pin: String(pin)
      });

      return res.json({
        success: true,
        message: `${billType} payment successful (Educational Simulation).`,
        transaction: result.transaction,
        newBalanceRupees: result.newBalanceRupees
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  });

  return router;
};
