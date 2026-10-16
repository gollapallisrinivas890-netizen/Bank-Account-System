import React, { useState, useEffect } from 'react';
import { History, Download, Search, Filter, Printer, Eye, CheckCircle2 } from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';

export const TransactionHistoryPage: React.FC = () => {
  const { accounts, currentAccount } = useBank();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    currentAccount ? String(currentAccount.accountId) : ''
  );
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const accId = selectedAccountId ? Number(selectedAccountId) : undefined;
      const res = await api.getTransactions(accId, 200);
      setTransactions(res.transactions);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedAccountId]);

  const filteredTxns = transactions.filter((t) => {
    const matchesType = !selectedType || t.type === selectedType;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      String(t.accountId).includes(q) ||
      t.referenceId.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2 border border-cyan-200">
            <History className="w-3.5 h-3.5" />
            Module 9 &amp; 10 • Ledger &amp; CSV File Records
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
            Comprehensive Transaction Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full chronological audit trail with printable receipts and CSV file export
          </p>
        </div>

        <a
          href="/api/analytics/export-csv?type=transactions"
          download="bank_transactions.csv"
          className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          Download CSV File (Module 10)
        </a>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ref ID, note, account ID..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-cyan-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Account Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-[11px] font-medium text-slate-400">Account:</span>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
            >
              <option value="">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.accountId} value={a.accountId}>
                  {a.accountId} - {a.customerName}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-[11px] font-medium text-slate-400">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
            >
              <option value="">All Operations</option>
              <option value="ACCOUNT OPEN">ACCOUNT OPEN</option>
              <option value="DEPOSIT">DEPOSIT</option>
              <option value="ATM WITHDRAWAL">ATM WITHDRAWAL</option>
              <option value="BANK WITHDRAWAL">BANK WITHDRAWAL</option>
              <option value="TRANSFER SENT">TRANSFER SENT</option>
              <option value="TRANSFER RECEIVED">TRANSFER RECEIVED</option>
              <option value="UPI PAYMENT">UPI PAYMENT</option>
              <option value="UPI RECEIVED">UPI RECEIVED</option>
              <option value="MOBILE RECHARGE">MOBILE RECHARGE</option>
              <option value="ELECTRICITY BILL">ELECTRICITY BILL</option>
              <option value="GAS BILL">GAS BILL</option>
              <option value="WATER BILL">WATER BILL</option>
              <option value="DTH BILL">DTH BILL</option>
              <option value="OTHER BILL">OTHER BILL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Ref ID</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Account ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-right">Resulting Balance</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxns.length > 0 ? (
                filteredTxns.map((txn) => {
                  const isDebit =
                    txn.type === 'ATM WITHDRAWAL' ||
                    txn.type === 'BANK WITHDRAWAL' ||
                    txn.type === 'TRANSFER SENT' ||
                    txn.type === 'UPI PAYMENT' ||
                    txn.type === 'MOBILE RECHARGE' ||
                    txn.type.includes('BILL');

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{txn.referenceId}</td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{txn.dateTime}</td>
                      <td className="py-3 px-4 font-mono font-bold text-navy-900">{txn.accountId}</td>
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
                      <td className="py-3 px-4 text-slate-700 max-w-sm truncate">{txn.description}</td>
                      <td
                        className={`py-3 px-4 text-right font-black whitespace-nowrap ${
                          isDebit ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {isDebit ? '-' : '+'}₹{txn.amountRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800 whitespace-nowrap">
                        ₹{txn.balanceAfterRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedReceiptTxn(txn)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition border border-cyan-200"
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No transactions match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReceiptModal
        isOpen={Boolean(selectedReceiptTxn)}
        onClose={() => setSelectedReceiptTxn(null)}
        transaction={selectedReceiptTxn}
      />
    </div>
  );
};
