import React, { useState, useEffect } from 'react';
import { Eye, Printer, Wallet, ShieldCheck, ArrowDownCircle, ArrowUpRight, History } from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';
import { Account, Transaction } from '../types';

export const BalanceEnquiryPage: React.FC = () => {
  const { accounts, currentAccount } = useBank();
  const [selectedAccountId, setSelectedAccountId] = useState<number>(
    currentAccount?.accountId || accounts[0]?.accountId || 10000001
  );
  const [accountDetails, setAccountDetails] = useState<Account | null>(null);
  const [limitsInfo, setLimitsInfo] = useState<any>(null);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentAccount) {
      setSelectedAccountId(currentAccount.accountId);
    }
  }, [currentAccount]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!selectedAccountId) return;
      setLoading(true);
      try {
        const accRes = await api.getAccount(selectedAccountId);
        setAccountDetails(accRes.account);

        const limRes = await api.getLimits(selectedAccountId);
        setLimitsInfo(limRes);

        const txnRes = await api.getTransactions(selectedAccountId, 5);
        setRecentTxns(txnRes.transactions);
      } catch (err) {
        console.error('Failed to fetch balance enquiry:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [selectedAccountId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Selector & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2 border border-cyan-200">
            <Eye className="w-3.5 h-3.5" />
            Module 6 • Balance Enquiry
          </div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">Account Balance &amp; Passbook</h2>
          <p className="text-xs text-slate-500">Real-time ledger audit and remaining daily transaction quota</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(Number(e.target.value))}
            className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl shadow-sm outline-none cursor-pointer w-full sm:w-auto"
          >
            {accounts.map((a) => (
              <option key={a.accountId} value={a.accountId}>
                {a.accountId} - {a.customerName} ({a.bankCode})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Passbook
          </button>
        </div>
      </div>

      {/* Printable Digital Passbook Card */}
      {accountDetails && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 relative overflow-hidden printable-card">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-navy-900 via-cyan-500 to-navy-800" />

          {/* Bank & Passbook Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-navy-900 text-cyan-300 font-extrabold flex items-center justify-center text-sm shadow-md">
                  {accountDetails.bankCode}
                </div>
                <div>
                  <h3 className="text-lg font-black text-navy-900">{accountDetails.bankName}</h3>
                  <p className="text-[11px] text-slate-500">
                    Official Educational Simulation Bank Passbook
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Account Status</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold mt-0.5 ${
                  accountDetails.locked
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {accountDetails.locked ? 'LOCKED (3 ATTEMPTS)' : 'ACTIVE & VERIFIED'}
              </span>
            </div>
          </div>

          {/* Account Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Account Number</span>
              <span className="font-mono font-bold text-navy-900 text-sm">{accountDetails.accountId}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Customer Name</span>
              <span className="font-bold text-slate-800 text-sm">{accountDetails.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Account Type</span>
              <span className="font-semibold text-slate-700">{accountDetails.accountType}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Registered Mobile</span>
              <span className="font-mono text-slate-700 font-medium">{accountDetails.phone}</span>
            </div>
          </div>

          {/* Balance Hero Box */}
          <div className="my-6 p-6 rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-850 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
                Current Available Balance
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
                ₹{accountDetails.balanceRupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                Exact Integer Units: {accountDetails.balancePaise} Paise
              </span>
            </div>

            <div className="bg-navy-800/90 border border-navy-700/80 rounded-xl p-3 text-right">
              <span className="text-[10px] text-slate-300 block uppercase font-bold">UPI Virtual Payment Address</span>
              <span className="text-xs font-mono font-bold text-cyan-300">{accountDetails.upiId}</span>
            </div>
          </div>

          {/* Daily Outgoing Limit Meter */}
          {limitsInfo && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-slate-700">Today's Outgoing vs ₹1,00,000 Daily Limit</span>
                <span className="font-semibold text-slate-600">
                  ₹{limitsInfo.todayOutgoingRupees.toLocaleString('en-IN')} / ₹1,00,000
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (limitsInfo.todayOutgoingRupees / 100000) * 100)}%`
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                <span>Remaining daily allowance:</span>
                <span className="font-bold text-emerald-600">
                  ₹{limitsInfo.remainingDailyLimitRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Recent Mini Ledger */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Recent Account Ledger Entries
            </h4>
            <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTxns.length > 0 ? (
                    recentTxns.map((t) => {
                      const isDebit =
                        t.type === 'ATM WITHDRAWAL' ||
                        t.type === 'BANK WITHDRAWAL' ||
                        t.type === 'TRANSFER SENT' ||
                        t.type === 'UPI PAYMENT' ||
                        t.type === 'MOBILE RECHARGE' ||
                        t.type.includes('BILL');

                      return (
                        <tr key={t.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{t.dateOnly}</td>
                          <td className="py-2 px-3 font-medium text-slate-700">{t.type}</td>
                          <td className="py-2 px-3 text-slate-600 truncate max-w-xs">{t.description}</td>
                          <td className={`py-2 px-3 text-right font-bold ${isDebit ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {isDebit ? '-' : '+'}₹{t.amountRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-slate-800">
                            ₹{t.balanceAfterRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        No transactions found for this account.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
