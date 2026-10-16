import React from 'react';
import { Building2, ShieldCheck, ArrowRight, UserPlus, Users, Wallet } from 'lucide-react';
import { useBank } from '../context/BankContext';

interface BankPortalPageProps {
  onNavigate: (tab: string) => void;
}

export const BankPortalPage: React.FC<BankPortalPageProps> = ({ onNavigate }) => {
  const { banks, selectedBankCode, setSelectedBankCode } = useBank();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 rounded-2xl p-6 text-white border border-navy-800 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2 border border-cyan-500/30">
              <Building2 className="w-3.5 h-3.5" />
              Multi-Bank Simulation Engine
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Supported Banks Portal</h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              The project features 8 simulated premier Indian banks as implemented in the original C++ console system.
              Select any bank to filter operations, create new accounts, or view bank-specific ledgers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('create-account')}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Open Bank Account
            </button>
          </div>
        </div>
      </div>

      {/* 8 Banks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {banks.map((bank) => {
          const isSelected = selectedBankCode === bank.code;

          return (
            <div
              key={bank.code}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-500 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm"
                    style={{ backgroundColor: bank.logoColor || '#0b192c' }}
                  >
                    {bank.code.slice(0, 3)}
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {bank.code}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-navy-900 line-clamp-1">{bank.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">IFSC: {bank.ifscPrefix}XXXX</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Accounts
                    </span>
                    <span className="font-bold text-slate-800">{bank.accountCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5" /> Total Balance
                    </span>
                    <span className="font-bold text-emerald-600">
                      ₹{(bank.totalBalanceRupees ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 flex gap-2">
                <button
                  onClick={() => setSelectedBankCode(isSelected ? '' : bank.code)}
                  className={`w-full py-2 text-xs font-semibold rounded-xl transition ${
                    isSelected
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'Deselect Bank' : 'Filter by ' + bank.code}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
