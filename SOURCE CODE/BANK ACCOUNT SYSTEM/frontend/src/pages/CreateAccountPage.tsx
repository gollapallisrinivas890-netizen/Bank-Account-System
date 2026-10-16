import React, { useState } from 'react';
import { UserPlus, ShieldCheck, CheckCircle2, Sparkles, Building2, AlertCircle } from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';
import { Account } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';

interface CreateAccountPageProps {
  onNavigate: (tab: string) => void;
}

export const CreateAccountPage: React.FC<CreateAccountPageProps> = ({ onNavigate }) => {
  const { banks, refreshAccounts, refreshBanks, loginAccount } = useBank();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bankCode, setBankCode] = useState(banks[0]?.code || 'SBI');
  const [accountType, setAccountType] = useState<'Savings Account' | 'Current Account'>('Savings Account');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('5000');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdAccount, setCreatedAccount] = useState<Account | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!customerName || customerName.trim().length < 2) {
      setError('Please enter a valid customer full name (at least 2 characters).');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 numeric digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('4-digit PIN and confirmation PIN do not match.');
      return;
    }
    const depositNum = Number(initialDeposit);
    if (isNaN(depositNum) || depositNum <= 0) {
      setError('Initial deposit must be greater than zero.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createAccount({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        bankCode,
        accountType,
        pin,
        initialDeposit: depositNum
      });

      await refreshAccounts();
      await refreshBanks();
      setCreatedAccount(res.account);
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2 border border-cyan-200">
          <UserPlus className="w-3.5 h-3.5" />
          Module 2 • Account Creation
        </div>
        <h2 className="text-2xl font-black text-navy-900 tracking-tight">Open New Customer Account</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generates a unique 8-digit Account ID, auto-configures UPI ID, and stores records in SQLite
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Bank Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Bank Partner
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {banks.map((b) => (
                <button
                  type="button"
                  key={b.code}
                  onClick={() => setBankCode(b.code)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    bankCode === b.code
                      ? 'border-cyan-500 bg-cyan-50/50 text-navy-900 font-bold ring-1 ring-cyan-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <span className="text-xs">{b.code}</span>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[50px]">{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Customer Full Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rahul Verma"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition"
              required
            />
          </div>

          {/* Phone & Email Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number (10 Digits)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                maxLength={10}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition"
                required
              />
            </div>
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['Savings Account', 'Current Account'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setAccountType(type)}
                  className={`py-3 px-4 rounded-xl border text-center transition text-xs font-semibold ${
                    accountType === type
                      ? 'border-navy-900 bg-navy-900 text-white shadow-md shadow-navy-900/10'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* PIN Setup (4 digits) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Create 4-Digit Security PIN
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
              <span className="text-[10px] text-slate-400 mt-0.5 block">Used for login and transaction checks</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm 4-Digit PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-center tracking-widest text-lg font-bold outline-none transition"
                required
              />
            </div>
          </div>

          {/* Initial Deposit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Initial Deposit Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="100"
                step="100"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                placeholder="5000"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-semibold outline-none transition"
                required
              />
            </div>
            <div className="flex gap-2 mt-2">
              {['1000', '5000', '10000', '25000'].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setInitialDeposit(preset)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  +₹{Number(preset).toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold text-white bg-navy-900 hover:bg-navy-800 disabled:opacity-50 rounded-xl transition shadow-lg shadow-navy-900/15 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Customer Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Dialog */}
      {createdAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-navy-900">Account Created Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1">Your new bank account is active and ready for transactions.</p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-5 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Bank</span>
                <span className="font-bold text-slate-900">{createdAccount.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Generated Account ID</span>
                <span className="font-mono font-bold text-cyan-700 text-sm">{createdAccount.accountId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name</span>
                <span className="font-semibold text-slate-900">{createdAccount.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Generated UPI ID</span>
                <span className="font-mono text-slate-800 font-semibold">{createdAccount.upiId}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500 font-medium">Initial Balance</span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  ₹{createdAccount.balanceRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  loginAccount(createdAccount);
                  setCreatedAccount(null);
                  onNavigate('dashboard');
                }}
                className="w-1/2 py-2.5 text-xs font-bold text-navy-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition"
              >
                Login as this User
              </button>
              <button
                onClick={() => {
                  setCreatedAccount(null);
                  onNavigate('accounts');
                }}
                className="w-1/2 py-2.5 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition"
              >
                View in All Accounts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
