import React, { useState } from 'react';
import { ArrowDownCircle, CheckCircle2, Wallet, AlertCircle } from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';

export const DepositPage: React.FC = () => {
  const { accounts, currentAccount, refreshAccounts } = useBank();
  const [selectedAccountId, setSelectedAccountId] = useState<number>(
    currentAccount?.accountId || accounts[0]?.accountId || 10000001
  );
  const [amount, setAmount] = useState('2000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receiptTxn, setReceiptTxn] = useState<Transaction | null>(null);

  const selectedAcc = accounts.find((a) => a.accountId === selectedAccountId);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Please enter a valid positive deposit amount.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.deposit(selectedAccountId, amtNum);
      await refreshAccounts();
      setReceiptTxn(res.transaction);
      setAmount('2000');
    } catch (err: any) {
      setError(err.message || 'Deposit failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
          <ArrowDownCircle className="w-3.5 h-3.5" />
          Module 4 • Cash Deposit
        </div>
        <h2 className="text-2xl font-black text-navy-900 tracking-tight">Deposit Funds to Account</h2>
        <p className="text-xs text-slate-500">
          Instant balance credit with ledger audit record • As implemented in original C++ deposit module
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleDeposit} className="space-y-5">
          {/* Account Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Destination Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs font-semibold outline-none transition bg-white"
            >
              {accounts.map((a) => (
                <option key={a.accountId} value={a.accountId}>
                  {a.accountId} - {a.customerName} ({a.bankCode}) • Current: ₹{a.balanceRupees.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          {/* Current Balance Display */}
          {selectedAcc && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 block">Current Available Balance</span>
                <span className="text-lg font-black text-navy-900">
                  ₹{selectedAcc.balanceRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Bank</span>
                <span className="font-bold text-slate-800">{selectedAcc.bankName}</span>
              </div>
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Enter Deposit Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2000"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-base font-bold outline-none transition"
                required
              />
            </div>
            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {['500', '1000', '2000', '5000', '10000', '50000'].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className="px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  +₹{Number(preset).toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated New Balance */}
          {selectedAcc && Number(amount) > 0 && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex justify-between items-center text-xs">
              <span className="text-emerald-800 font-medium">New balance after credit:</span>
              <span className="font-black text-emerald-700 text-sm">
                ₹{(selectedAcc.balanceRupees + Number(amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition shadow-lg shadow-emerald-600/15 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ArrowDownCircle className="w-5 h-5" />
                Deposit ₹{Number(amount || 0).toLocaleString('en-IN')}
              </>
            )}
          </button>
        </form>
      </div>

      <ReceiptModal
        isOpen={Boolean(receiptTxn)}
        onClose={() => setReceiptTxn(null)}
        transaction={receiptTxn}
        account={selectedAcc}
      />
    </div>
  );
};
