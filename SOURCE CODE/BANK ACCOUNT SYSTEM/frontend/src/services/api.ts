import { Account, Bank, Transaction, DashboardStats, SecurityLimits } from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'An unexpected server error occurred.');
  }
  return data;
}

export const api = {
  // Auth
  login: async (accountId: number, pin: string, bankCode?: string) => {
    return fetchJson<{ success: boolean; account: Account; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ accountId, pin, bankCode })
    });
  },
  verifyPin: async (accountId: number, pin: string) => {
    return fetchJson<{ success: boolean; message: string }>('/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ accountId, pin })
    });
  },
  changePin: async (accountId: number, oldPin: string, newPin: string, confirmPin: string) => {
    return fetchJson<{ success: boolean; message: string }>('/auth/change-pin', {
      method: 'POST',
      body: JSON.stringify({ accountId, oldPin, newPin, confirmPin })
    });
  },
  unlockAccount: async (accountId: number) => {
    return fetchJson<{ success: boolean; message: string; account: Account }>('/auth/unlock', {
      method: 'POST',
      body: JSON.stringify({ accountId })
    });
  },

  // Banks
  getBanks: async () => {
    return fetchJson<{ success: boolean; banks: Bank[] }>('/banks');
  },
  getBankDetails: async (code: string) => {
    return fetchJson<{ success: boolean; bank: Bank }>('/banks/' + code);
  },

  // Accounts
  getAccounts: async (q?: string, bankCode?: string) => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (bankCode) params.append('bankCode', bankCode);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<{ success: boolean; count: number; accounts: Account[] }>('/accounts' + query);
  },
  getAccount: async (id: number) => {
    return fetchJson<{ success: boolean; account: Account }>(`/accounts/${id}`);
  },
  getBalance: async (id: number) => {
    return fetchJson<{
      success: boolean;
      accountId: number;
      customerName: string;
      bankName: string;
      accountType: string;
      balanceRupees: number;
      locked: boolean;
    }>(`/accounts/${id}/balance`);
  },
  getLimits: async (id: number) => {
    return fetchJson<{
      success: boolean;
      todayOutgoingRupees: number;
      maxDailyLimitRupees: number;
      remainingDailyLimitRupees: number;
      limits: SecurityLimits;
    }>(`/accounts/${id}/today-outgoing`);
  },
  createAccount: async (data: {
    customerName: string;
    phone: string;
    email: string;
    accountType: string;
    bankCode: string;
    pin: string;
    initialDeposit: number;
  }) => {
    return fetchJson<{ success: boolean; message: string; account: Account; referenceId: string }>('/accounts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  updateAccount: async (id: number, data: { customerName?: string; phone?: string; email?: string }) => {
    return fetchJson<{ success: boolean; message: string; account: Account }>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Transactions
  getTransactions: async (accountId?: number, limit: number = 100) => {
    const params = new URLSearchParams();
    if (accountId) params.append('accountId', String(accountId));
    params.append('limit', String(limit));
    return fetchJson<{ success: boolean; count: number; transactions: Transaction[] }>(
      `/transactions?${params.toString()}`
    );
  },
  getTransactionReceipt: async (id: number) => {
    return fetchJson<{
      success: boolean;
      transaction: Transaction;
      account: Account;
      relatedAccount?: Account | null;
    }>(`/transactions/${id}`);
  },
  deposit: async (accountId: number, amount: number) => {
    return fetchJson<{ success: boolean; message: string; transaction: Transaction; newBalanceRupees: number }>(
      '/transactions/deposit',
      {
        method: 'POST',
        body: JSON.stringify({ accountId, amount })
      }
    );
  },
  withdraw: async (accountId: number, amount: number, type: 'ATM WITHDRAWAL' | 'BANK WITHDRAWAL', pin: string) => {
    return fetchJson<{ success: boolean; message: string; transaction: Transaction; newBalanceRupees: number }>(
      '/transactions/withdraw',
      {
        method: 'POST',
        body: JSON.stringify({ accountId, amount, type, pin })
      }
    );
  },
  transfer: async (senderId: number, receiverId: number, receiverNameVerify: string, amount: number, pin: string) => {
    return fetchJson<{
      success: boolean;
      message: string;
      transaction: Transaction;
      newBalanceRupees: number;
      receiverName: string;
    }>('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify({ senderId, receiverId, receiverNameVerify, amount, pin })
    });
  },

  // Payments
  upiPayment: async (data: {
    payerId: number;
    method: 'accountId' | 'phone' | 'upiId';
    recipientValue: string;
    amount: number;
    note?: string;
    pin: string;
  }) => {
    return fetchJson<{
      success: boolean;
      message: string;
      transaction: Transaction;
      newBalanceRupees: number;
      recipientName: string;
    }>('/payments/upi', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  mobileRecharge: async (data: {
    accountId: number;
    mobileNumber: string;
    rechargeType: 'Prepaid' | 'Postpaid';
    operator: string;
    plan: string;
    amount: number;
    pin: string;
  }) => {
    return fetchJson<{ success: boolean; message: string; transaction: Transaction; newBalanceRupees: number }>(
      '/payments/recharge',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },
  payBill: async (data: {
    accountId: number;
    billType: 'ELECTRICITY BILL' | 'GAS BILL' | 'WATER BILL' | 'DTH BILL' | 'OTHER BILL';
    providerName: string;
    consumerNumber: string;
    amount: number;
    pin: string;
  }) => {
    return fetchJson<{ success: boolean; message: string; transaction: Transaction; newBalanceRupees: number }>(
      '/payments/bill',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },

  // Analytics
  getDashboardStats: async (bankCode?: string) => {
    const query = bankCode ? `?bankCode=${bankCode}` : '';
    return fetchJson<{ success: boolean; stats: DashboardStats }>(`/analytics/dashboard${query}`);
  },
  getSecurityLogs: async (accountId?: number) => {
    const query = accountId ? `?accountId=${accountId}` : '';
    return fetchJson<{ success: boolean; logs: any[] }>(`/analytics/security-logs${query}`);
  }
};
