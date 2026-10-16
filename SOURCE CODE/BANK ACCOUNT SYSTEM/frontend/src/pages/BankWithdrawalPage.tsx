import React, { useState } from 'react';
import { Building, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { PinModal } from '../components/PinModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const BankWithdrawalPage: React.FC = () => {
  const { accounts, currentAccount, refreshAccounts } = useBank();
  const [selectedAccountId, setSelectedAccountId] = useState<number>(
    currentAccount?.accountId || accounts[0]?.accountId || 10000001
  );
  const [amount, setAmount] = useState('10000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState<Transaction | null>(null);

  const selectedAcc = accounts.find((a) => a.accountId === selectedAccountId);
  const MAX_LIMIT = 50000;

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }
    if (amtNum > MAX_LIMIT) {
      setError(`Bank Counter Withdrawal limit is ₹${MAX_LIMIT.toLocaleString('en-IN')} per transaction.`);
      return;
    }
    if (selectedAcc && amtNum > selectedAcc.balanceRupees) {
      setError(`Insufficient balance. Current balance is ₹${selectedAcc.balanceRupees.toLocaleString('en-IN')}.`);
      return;
    }
    if (selectedAcc?.locked) {
      setError('Account is locked. Please contact branch administrator.');
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmSummary = () => {
    setIsConfirmOpen(false);
    setIsPinOpen(true);
  };

  const handleVerifyPin = async (pin: string) => {
    setLoading(true);
    try {
      const res = await api.withdraw(selectedAccountId, Number(amount), 'BANK WITHDRAWAL', pin);
      await refreshAccounts();
      setIsPinOpen(false);
      setReceiptTxn(res.transaction);
    } catch (err: any) {
      setIsPinOpen(false);
      setError(err.message || 'Counter withdrawal failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
          <Building className="w-3.5 h-3.5" />
          Bank Counter Withdrawal
        </div>
        <h2 className="text-2xl font-black text-navy-900 tracking-tight">Bank Teller Counter Withdrawal</h2>
        <p className="text-xs text-slate-500">
          High-value withdrawal up to ₹50,000 per transaction • Teller counter authorization with 4-digit PIN
        </p>
      </div>

      {/* Counter Limit Callout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-850 text-white border border-navy-800 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">Branch Teller Cap</span>
            <span className="text-sm font-extrabold text-white">Max ₹50,000.00 / txn</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-mono">Daily Outgoing Limit</span>
          <span className="text-xs font-bold text-amber-400">₹1,00,000 Total</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleInitiate} className="space-y-5">
          {/* Account Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Customer Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs font-semibold outline-none transition bg-white"
            >
              {accounts.map((a) => (
                <option key={a.accountId} value={a.accountId}>
                  {a.accountId} - {a.customerName} ({a.bankCode}) • Available: ₹{a.balanceRupees.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          {/* Balance card */}
          {selectedAcc && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 block">Available Balance</span>
                <span className="text-lg font-black text-navy-900">
                  ₹{selectedAcc.balanceRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Branch Bank</span>
                <span className="font-bold text-slate-800">{selectedAcc.bankName}</span>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Withdrawal Amount (₹) • Max ₹50,000
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="100"
                max={MAX_LIMIT}
                step="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-base font-bold outline-none transition"
                required
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {['2000', '5000', '10000', '25000', '50000'].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className="px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  ₹{Number(preset).toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 text-sm font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition shadow-lg shadow-navy-900/15 flex items-center justify-center gap-2"
          >
            <Building className="w-5 h-5 text-cyan-400" />
            Proceed to Bank Counter Cash Withdrawal
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSummary}
        title="Confirm Bank Counter Withdrawal"
        operationType="Bank Counter Withdrawal"
        amountRupees={Number(amount || 0)}
        remainingBalance={selectedAcc ? selectedAcc.balanceRupees - Number(amount || 0) : undefined}
        details={[
          { label: 'Bank Branch', value: selectedAcc?.bankName || '' },
          { label: 'Account ID', value: selectedAcc?.accountId || '' },
          { label: 'Customer Name', value: selectedAcc?.customerName || '' },
          { label: 'Channel', value: 'Bank Branch Cash Counter' },
          { label: 'Per-Transaction Limit', value: '₹50,000.00' }
        ]}
      />

      {/* PIN Modal */}
      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onConfirm={handleVerifyPin}
        title="Authorize Counter Withdrawal"
        description="Customer or teller verification PIN required before cash handover."
        loading={loading}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(receiptTxn)}
        onClose={() => setReceiptTxn(null)}
        transaction={receiptTxn}
        account={selectedAcc}
      />
    </div>
  );
};
