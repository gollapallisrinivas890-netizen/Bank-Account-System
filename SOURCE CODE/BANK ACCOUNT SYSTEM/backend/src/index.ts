import { createBankingApp } from './app';
import { getDb } from './db/database';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const app = await createBankingApp();
    const db = await getDb();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`BANK ACCOUNT MANAGEMENT SYSTEM — BACKEND API SERVER`);
      console.log(`Educational Prototype for Batch 13 College Project`);
      console.log(`Server listening on: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    process.on('SIGINT', () => {
      db.persist();
      server.close(() => {
        console.log('Server shut down cleanly.');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to start backend server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { createBankingApp };
