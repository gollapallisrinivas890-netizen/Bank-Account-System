import React, { useState } from 'react';
import { Lock, UserCheck, AlertCircle, ShieldCheck, ArrowRight, Building2 } from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { banks, accounts, loginAccount } = useBank();
  const [accountId, setAccountId] = useState('10000001');
  const [pin, setPin] = useState('1234');
  const [bankCode, setBankCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRemainingAttempts(null);

    const idNum = Number(accountId);
    if (!idNum || isNaN(idNum)) {
      setError('Please enter a valid numeric Account ID.');
      return;
    }
    if (!pin || pin.length !== 4) {
      setError('PIN must contain exactly 4 digits.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(idNum, pin, bankCode || undefined);
      if (res.success && res.account) {
        loginAccount(res.account);
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (accId: number, demoPin: string) => {
    setAccountId(String(accId));
    setPin(demoPin);
    setError('');
  };

  const demoPresets = [
    { id: 10000001, name: 'G Srinivas', bank: 'SBI', pin: '1234', role: 'Project Manager' },
    { id: 10000002, name: 'P Sai Tharun', bank: 'HDFC', pin: '2345', role: 'Account Management' },
    { id: 10000003, name: 'B Venkatesh', bank: 'ICICI', pin: '3456', role: 'Transaction Dev' },
    { id: 10000004, name: 'T Harika', bank: 'CANARA', pin: '4567', role: 'DB & Docs' },
    { id: 10000005, name: 'Demo Customer', bank: 'AXIS', pin: '1111', role: 'Retail Demo' }
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-navy-800 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-navy-900 tracking-tight">Customer Account Portal Login</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Authenticate using your 8-digit Account ID and 4-digit PIN • Security rule: 3 failed attempts locks the account
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Bank selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Bank (Optional Filter)
            </label>
            <select
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              <option value="">Any Supported Bank</option>
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Account ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Account ID (8 Digits)
            </label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value.replace(/\D/g, '').slice(0, 18))}
              placeholder="e.g. 10000001"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-mono outline-none transition"
              required
            />
          </div>

          {/* PIN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              4-Digit PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-center tracking-widest text-lg font-bold outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-bold text-white bg-navy-900 hover:bg-navy-800 disabled:opacity-50 rounded-xl transition shadow-lg shadow-navy-900/15 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-cyan-400" />
                Sign In to Account
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Panel */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
            Quick One-Click Demo Credentials (Batch 13 Accounts)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoPresets.map((demo) => (
              <button
                type="button"
                key={demo.id}
                onClick={() => handleQuickDemo(demo.id, demo.pin)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50/60 border border-slate-200 hover:border-cyan-200 text-left transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{demo.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {demo.id} • PIN: <strong className="text-cyan-700">{demo.pin}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                  {demo.bank}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
