import React, { useEffect, useState } from 'react';
import {
  Users,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Building,
  ArrowRightLeft,
  Smartphone,
  Receipt,
  Download,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../services/api';
import { useBank } from '../context/BankContext';
import { DashboardStats, Transaction } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

const COLORS = ['#0284c7', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { selectedBankCode } = useBank();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState<Transaction | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats(selectedBankCode || undefined);
      setStats(res.stats);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedBankCode]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
            Banking Operations Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ledger data calculated directly from SQLite persistent database • Batch 13
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/analytics/export-csv?type=accounts"
            download="bank_accounts.csv"
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Accounts CSV
          </a>
          <a
            href="/api/analytics/export-csv?type=transactions"
            download="bank_transactions.csv"
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Transactions CSV
          </a>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Accounts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Accounts</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-navy-900">
            {stats?.totalAccounts ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>{stats?.activeAccountsCount ?? 0} Active</span>
            {Boolean(stats?.lockedAccountsCount) && (
              <span className="text-rose-600 font-semibold">• {stats?.lockedAccountsCount} Locked</span>
            )}
          </div>
        </div>

        {/* Total Deposits / Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Simulated Assets</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-navy-900">
            ₹{(stats?.totalBalanceRupees ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Total stored balance across accounts
          </div>
        </div>

        {/* Total Deposits Inflow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inflow</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-700">
            ₹{(stats?.totalDepositsRupees ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Deposits & Opening balances</div>
        </div>

        {/* Total Outflow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Outflow</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
            ₹{(stats?.totalWithdrawalsRupees ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Withdrawals, Transfers & Payments</div>
        </div>
      </div>

      {/* Quick Banking Action Buttons */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-navy-900/10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
          Quick Banking Actions (Select Operation)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          <button
            onClick={() => onNavigate('deposit')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-navy-800/80 hover:bg-navy-700 hover:scale-[1.02] border border-navy-700 transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:bg-emerald-500 group-hover:text-white transition">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-100">Deposit</span>
            <span className="text-[10px] text-slate-400">Cash Inflow</span>
          </button>

          <button
            onClick={() => onNavigate('atm-withdraw')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-navy-800/80 hover:bg-navy-700 hover:scale-[1.02] border border-navy-700 transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2 group-hover:bg-cyan-500 group-hover:text-white transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-100">ATM Cash</span>
            <span className="text-[10px] text-slate-400">Max ₹20k</span>
          </button>

          <button
            onClick={() => onNavigate('counter-withdraw')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-navy-800/80 hover:bg-navy-700 hover:scale-[1.02] border border-navy-700 transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 group-hover:bg-blue-500 group-hover:text-white transition">
              <Building className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-100">Bank Counter</span>
            <span className="text-[10px] text-slate-400">Max ₹50k</span>
          </button>

          <button
            onClick={() => onNavigate('transfer')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-navy-800/80 hover:bg-navy-700 hover:scale-[1.02] border border-navy-700 transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:bg-purple-500 group-hover:text-white transition">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-100">P2P Transfer</span>
            <span className="text-[10px] text-slate-400">Verified Recipient</span>
          </button>

          <button
            onClick={() => onNavigate('upi')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-navy-800/80 hover:bg-navy-700 hover:scale-[1.02] border border-navy-700 transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:bg-amber-500 group-hover:text-white transition">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-100">UPI Payment</span>
            <span className="text-[10px] text-slate-400">Phone / VPA</span>
          </button>

          <button
            onClick={() => onNavigate('bills')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-navy-800/80 hover:bg-navy-700 hover:scale-[1.02] border border-navy-700 transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 group-hover:bg-rose-500 group-hover:text-white transition">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-100">Utility Bills</span>
            <span className="text-[10px] text-slate-400">Power, Gas, DTH</span>
          </button>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Cash Flow Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Activity Overview (Daily Volume)</h3>
              <p className="text-xs text-slate-500">Calculated dynamically from transaction logs</p>
            </div>
            <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-lg">
              Live Chart
            </span>
          </div>
          <div className="h-64">
            {stats && stats.dailyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyActivity}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="deposits" name="Inflow (Deposits)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="withdrawals" name="Outflow (Withdrawals)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No transaction data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Transaction Type Breakdown Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-navy-900">Operation Distribution</h3>
            <p className="text-xs text-slate-500">Proportion by operation type</p>
          </div>
          <div className="h-48">
            {stats && stats.typeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.typeDistribution}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={35}
                    paddingAngle={4}
                  >
                    {stats.typeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(count: number, name: string) => [`${count} operations`, name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No operations logged yet.
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-1.5 mt-2 max-h-24 overflow-y-auto">
            {stats?.typeDistribution.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-600 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{item.type}</span>
                <span className="font-bold text-slate-900 ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-base font-bold text-navy-900">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Last 10 recorded transactions across accounts</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition"
          >
            View All Transactions →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Ref ID</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Account ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Resulting Balance</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((txn) => {
                  const isDebit =
                    txn.type === 'ATM WITHDRAWAL' ||
                    txn.type === 'BANK WITHDRAWAL' ||
                    txn.type === 'TRANSFER SENT' ||
                    txn.type === 'UPI PAYMENT' ||
                    txn.type === 'MOBILE RECHARGE' ||
                    txn.type.includes('BILL');

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">{txn.referenceId}</td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{txn.dateTime}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-navy-900">{txn.accountId}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                            isDebit
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{txn.description}</td>
                      <td
                        className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                          isDebit ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {isDebit ? '-' : '+'}₹{txn.amountRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800 whitespace-nowrap">
                        ₹{txn.balanceAfterRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedReceiptTxn(txn)}
                          className="px-2 py-1 text-[11px] font-semibold text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceiptTxn)}
        onClose={() => setSelectedReceiptTxn(null)}
        transaction={selectedReceiptTxn}
      />
    </div>
  );
};
