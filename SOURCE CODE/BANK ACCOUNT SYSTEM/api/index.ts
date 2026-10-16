import type { IncomingMessage, ServerResponse } from 'http';
import { createBankingApp } from '../backend/src/app';

let appInstance: any = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (!appInstance) {
      appInstance = await createBankingApp();
    }
    return appInstance(req, res);
  } catch (error: any) {
    console.error('Vercel serverless API error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      message: 'Internal Server Error in Banking System Backend.',
      error: error?.message || String(error)
    }));
  }
}
