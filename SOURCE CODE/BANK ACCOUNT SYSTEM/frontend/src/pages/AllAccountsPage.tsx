import React, { useState } from 'react';
import {
  Users,
  Search,
  Building2,
  Lock,
  Unlock,
  Eye,
  ArrowDownCircle,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';
import { Account } from '../types';

interface AllAccountsPageProps {
  onNavigate: (tab: string) => void;
}

export const AllAccountsPage: React.FC<AllAccountsPageProps> = ({ onNavigate }) => {
  const { accounts, banks, selectedBankCode, setSelectedBankCode, setCurrentAccount, refreshAccounts } = useBank();
  const [searchQuery, setSearchQuery] = useState('');
  const [unlockingId, setUnlockingId] = useState<number | null>(null);

  const filteredAccounts = accounts.filter((acc) => {
    const matchesBank = !selectedBankCode || acc.bankCode === selectedBankCode;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      String(acc.accountId).includes(q) ||
      acc.customerName.toLowerCase().includes(q) ||
      acc.phone.includes(q) ||
      acc.upiId.toLowerCase().includes(q);
    return matchesBank && matchesSearch;
  });

  const handleUnlock = async (id: number) => {
    setUnlockingId(id);
    try {
      await api.unlockAccount(id);
      await refreshAccounts();
    } catch (e) {
      console.error(e);
    } finally {
      setUnlockingId(null);
    }
  };

  const handleSelectCustomer = (acc: Account) => {
    setCurrentAccount(acc);
    onNavigate('dashboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">Customer Accounts Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of all customer records across participating banks • Module 3 &amp; 5
          </p>
        </div>

        <button
          onClick={() => onNavigate('create-account')}
          className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl text-xs transition shadow-sm"
        >
          + Add New Account
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, phone, UPI..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-cyan-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter Bank:</span>
          <select
            value={selectedBankCode}
            onChange={(e) => setSelectedBankCode(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
          >
            <option value="">All Banks</option>
            {banks.map((b) => (
              <option key={b.code} value={b.code}>
                {b.code} - {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Account ID</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Bank</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4 text-center">Security Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc) => (
                  <tr key={acc.accountId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-navy-900 text-sm">
                      {acc.accountId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 text-xs">{acc.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {acc.phone} • {acc.email}
                      </div>
                      <div className="text-[10px] text-cyan-600 font-mono mt-0.5">{acc.upiId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-700">{acc.bankCode}</span>
                      <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">{acc.bankName}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">{acc.accountType}</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600 text-sm whitespace-nowrap">
                      ₹{acc.balanceRupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {acc.locked ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Lock className="w-3 h-3 text-rose-600" />
                          LOCKED (3 FAILS)
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ACTIVE
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {acc.locked ? (
                          <button
                            onClick={() => handleUnlock(acc.accountId)}
                            disabled={unlockingId === acc.accountId}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition border border-rose-200 flex items-center gap-1"
                          >
                            <Unlock className="w-3 h-3" />
                            Unlock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectCustomer(acc)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition border border-cyan-200"
                          >
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setCurrentAccount(acc);
                            onNavigate('balance');
                          }}
                          className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition"
                          title="View Balance Passbook"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No matching customer accounts found.
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
