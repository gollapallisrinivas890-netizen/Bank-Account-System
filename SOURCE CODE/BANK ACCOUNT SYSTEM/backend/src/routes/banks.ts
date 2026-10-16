import { Router, Request, Response } from 'express';
import { AppDatabase } from '../db/database';

export const createBanksRouter = (db: AppDatabase) => {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    try {
      const banks = db.query(`
        SELECT b.code, b.name, b.ifsc_prefix as ifscPrefix, b.logo_color as logoColor,
               COUNT(a.account_id) as accountCount,
               COALESCE(SUM(a.balance_paise), 0) / 100.0 as totalBalanceRupees
        FROM banks b
        LEFT JOIN accounts a ON b.code = a.bank_code
        GROUP BY b.code
        ORDER BY b.name ASC
      `);
      return res.json({ success: true, banks });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  router.get('/:code', (req: Request, res: Response) => {
    try {
      const bank = db.queryOne(
        `SELECT b.code, b.name, b.ifsc_prefix as ifscPrefix, b.logo_color as logoColor,
                COUNT(a.account_id) as accountCount,
                COALESCE(SUM(a.balance_paise), 0) / 100.0 as totalBalanceRupees
         FROM banks b
         LEFT JOIN accounts a ON b.code = a.bank_code
         WHERE b.code = ?
         GROUP BY b.code`,
        [String(req.params.code).toUpperCase()]
      );
      if (!bank) return res.status(404).json({ success: false, message: 'Bank not found.' });
      return res.json({ success: true, bank });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
};
