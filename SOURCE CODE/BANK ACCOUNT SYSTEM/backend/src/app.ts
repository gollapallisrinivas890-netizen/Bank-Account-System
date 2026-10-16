import express, { Request, Response } from 'express';
import cors from 'cors';
import { getDb } from './db/database';
import { BankingService } from './services/bankingService';
import { createAuthRouter } from './routes/auth';
import { createBanksRouter } from './routes/banks';
import { createAccountsRouter } from './routes/accounts';
import { createTransactionsRouter } from './routes/transactions';
import { createPaymentsRouter } from './routes/payments';
import { createAnalyticsRouter } from './routes/analytics';

let cachedApp: express.Application | null = null;
let initPromise: Promise<express.Application> | null = null;

export async function createBankingApp(): Promise<express.Application> {
  if (cachedApp) return cachedApp;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const app = express();
    app.use(cors({ origin: true, credentials: true }));
    app.use(express.json());

    // Health check endpoint
    app.get('/api/health', (_req: Request, res: Response) => {
      res.json({
        status: 'OK',
        project: 'Bank Account Management System Using C++',
        prototype: 'Full-Stack Educational Prototype',
        batch: 'Batch 13 (Aditya University)',
        environment: process.env.VERCEL ? 'vercel-serverless' : 'node-local',
        timestamp: new Date().toISOString()
      });
    });

    const db = await getDb();
    const bankingService = new BankingService(db);

    // Register routes
    app.use('/api/auth', createAuthRouter(bankingService));
    app.use('/api/banks', createBanksRouter(db));
    app.use('/api/accounts', createAccountsRouter(bankingService));
    app.use('/api/transactions', createTransactionsRouter(bankingService));
    app.use('/api/payments', createPaymentsRouter(bankingService));
    app.use('/api/analytics', createAnalyticsRouter(bankingService, db));

    // Global 404 handler for unknown API routes
    app.use('/api/*', (_req: Request, res: Response) => {
      res.status(404).json({ success: false, message: 'API route not found.' });
    });

    cachedApp = app;
    return app;
  })();

  return initPromise;
}
