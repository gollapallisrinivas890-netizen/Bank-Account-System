import React, { useState, useEffect } from 'react';
import { BarChart3, ShieldAlert, Download, FileText, CheckCircle2, History } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { DashboardStats } from '../types';

const COLORS = ['#0284c7', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.getDashboardStats(),
          api.getSecurityLogs()
        ]);
        setStats(statsRes.stats);
        setSecurityLogs(logsRes.logs);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2 border border-cyan-200">
            <BarChart3 className="w-3.5 h-3.5" />
            Visual Reports &amp; Audit Logs
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">System Analytics &amp; Security Logs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit history, daily flow charts, and data export compliant with college project specifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/analytics/export-csv?type=accounts"
            download="accounts_report.csv"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Accounts CSV
          </a>
          <a
            href="/api/analytics/export-csv?type=transactions"
            download="transactions_report.csv"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Ledger CSV
          </a>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Transaction Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-navy-900 mb-1">Cash Inflow vs Outflow Flow</h3>
          <p className="text-xs text-slate-500 mb-4">Daily deposits vs debit transactions</p>
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
                  <Bar dataKey="deposits" name="Deposits" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="withdrawals" name="Withdrawals" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="others" name="Transfers/Bills" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity data logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Operation Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-navy-900 mb-1">Transaction Type Share</h3>
          <p className="text-xs text-slate-500 mb-4">Total operations logged by category</p>
          <div className="h-64">
            {stats && stats.typeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.typeDistribution}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
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
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No type distribution data.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Audit Trail Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-navy-900">Security &amp; Authentication Audit Trail</h3>
            <p className="text-xs text-slate-500">Live security event logs (logins, lockouts, PIN updates)</p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            {securityLogs.length} Events Logged
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Event ID</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Account ID</th>
                <th className="py-2.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {securityLogs.length > 0 ? (
                securityLogs.map((log) => {
                  const isAlert = log.action === 'ACCOUNT_LOCKED' || log.action === 'LOGIN_FAILED';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-slate-500">#{log.id}</td>
                      <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isAlert
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-800">{log.account_id || 'System'}</td>
                      <td className="py-2.5 px-4 text-slate-700 font-sans text-xs">{log.details}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                    No security events recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
