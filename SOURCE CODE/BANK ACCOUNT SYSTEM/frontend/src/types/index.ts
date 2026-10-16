export interface Bank {
  code: string;
  name: string;
  ifscPrefix: string;
  logoColor: string;
  accountCount?: number;
  totalBalanceRupees?: number;
}

export type AccountType = 'Savings Account' | 'Current Account';

export interface Account {
  accountId: number;
  customerName: string;
  phone: string;
  email: string;
  accountType: AccountType;
  bankCode: string;
  bankName: string;
  upiId: string;
  balancePaise: number;
  balanceRupees: number;
  locked: boolean;
  failedLoginAttempts: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | 'ACCOUNT OPEN'
  | 'DEPOSIT'
  | 'ATM WITHDRAWAL'
  | 'BANK WITHDRAWAL'
  | 'TRANSFER SENT'
  | 'TRANSFER RECEIVED'
  | 'UPI PAYMENT'
  | 'UPI RECEIVED'
  | 'MOBILE RECHARGE'
  | 'ELECTRICITY BILL'
  | 'GAS BILL'
  | 'WATER BILL'
  | 'DTH BILL'
  | 'OTHER BILL'
  | 'SECURITY';

export interface Transaction {
  id: number;
  accountId: number;
  dateTime: string;
  dateOnly: string;
  type: TransactionType;
  amountPaise: number;
  amountRupees: number;
  description: string;
  balanceAfterPaise: number;
  balanceAfterRupees: number;
  relatedAccountId?: number | null;
  referenceId: string;
}

export interface DashboardStats {
  totalAccounts: number;
  totalBalanceRupees: number;
  totalDepositsRupees: number;
  totalWithdrawalsRupees: number;
  totalTransactionsCount: number;
  todayOutgoingRupees: number;
  activeAccountsCount: number;
  lockedAccountsCount: number;
  recentTransactions: Transaction[];
  typeDistribution: { type: string; count: number; totalAmount: number }[];
  dailyActivity: { date: string; deposits: number; withdrawals: number; others: number }[];
}

export interface SecurityLimits {
  atmWithdrawalMax: number;
  bankWithdrawalMax: number;
  upiPaymentMax: number;
  rechargeMax: number;
  billPaymentMax: number;
  dailyOutgoingMax: number;
}
