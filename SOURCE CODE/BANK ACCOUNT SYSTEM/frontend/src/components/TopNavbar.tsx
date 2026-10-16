import React from 'react';
import {
  Menu,
  Building2,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  Clock,
  Sparkles
} from 'lucide-react';
import { useBank } from '../context/BankContext';

interface TopNavbarProps {
  onToggleMobile: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleMobile }) => {
  const {
    banks,
    accounts,
    currentAccount,
    selectedBankCode,
    setSelectedBankCode,
    setCurrentAccount,
    refreshAccounts
  } = useBank();

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBankCode(e.target.value);
  };

  const handleAccountSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    if (!id) {
      setCurrentAccount(null);
    } else {
      const acc = accounts.find((a) => a.accountId === id);
      if (acc) setCurrentAccount(acc);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-2.5 shadow-sm no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobile}
            className="p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-xl lg:hidden transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">Multi-Bank Engine:</span>
            <span className="text-xs font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              8 Banks Active
            </span>
          </div>
        </div>

        {/* Right: Bank Filter + Quick Account Switcher + Status */}
        <div className="flex items-center gap-3">
          {/* Bank selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedBankCode}
              onChange={handleBankChange}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="">All Banks (Consolidated)</option>
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Demo Customer Switcher */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-[11px] text-slate-500">Active User:</span>
            <select
              value={currentAccount?.accountId || ''}
              onChange={handleAccountSwitch}
              className="bg-transparent text-xs font-semibold text-slate-900 outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="">Admin / Overview</option>
              {accounts.map((a) => (
                <option key={a.accountId} value={a.accountId}>
                  {a.customerName} ({a.bankCode}) - ₹{a.balanceRupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </option>
              ))}
            </select>
          </div>

          {/* System Mode Badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium border-l border-slate-200 pl-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">SQLite Persistent (Paise Math)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
