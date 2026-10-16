import React, { useState } from 'react';
import { CreditCard, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { PinModal } from '../components/PinModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const AtmWithdrawalPage: React.FC = () => {
  const { accounts, currentAccount, refreshAccounts } = useBank();
  const [selectedAccountId, setSelectedAccountId] = useState<number>(
    currentAccount?.accountId || accounts[0]?.accountId || 10000001
  );
  const [amount, setAmount] = useState('2000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState<Transaction | null>(null);

  const selectedAcc = accounts.find((a) => a.accountId === selectedAccountId);
  const MAX_LIMIT = 20000;

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }
    if (amtNum > MAX_LIMIT) {
      setError(`ATM Cash Withdrawal limit is ₹${MAX_LIMIT.toLocaleString('en-IN')} per transaction.`);
      return;
    }
    if (selectedAcc && amtNum > selectedAcc.balanceRupees) {
      setError(`Insufficient balance. Current balance is ₹${selectedAcc.balanceRupees.toLocaleString('en-IN')}.`);
      return;
    }
    if (selectedAcc?.locked) {
      setError('Account is locked. Please unlock via security settings or contact bank.');
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
      const res = await api.withdraw(selectedAccountId, Number(amount), 'ATM WITHDRAWAL', pin);
      await refreshAccounts();
      setIsPinOpen(false);
      setReceiptTxn(res.transaction);
    } catch (err: any) {
      setIsPinOpen(false);
      setError(err.message || 'ATM withdrawal failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2 border border-cyan-200">
          <CreditCard className="w-3.5 h-3.5" />
          ATM Cash Withdrawal
        </div>
        <h2 className="text-2xl font-black text-navy-900 tracking-tight">ATM Cash Dispenser</h2>
        <p className="text-xs text-slate-500">
          Strict ₹20,000 per-transaction ATM limit enforced • Requires 4-digit PIN verification
        </p>
      </div>

      {/* ATM Limit Callout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-850 text-white border border-navy-800 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">Rule Enforcement</span>
            <span className="text-sm font-extrabold text-white">ATM Cap: ₹20,000.00 / txn</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-mono">Max Daily Outgoing</span>
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
              Select Source Account
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
                <span className="text-slate-500 block">Status</span>
                <span
                  className={`font-bold ${selectedAcc.locked ? 'text-rose-600' : 'text-emerald-600'}`}
                >
                  {selectedAcc.locked ? 'LOCKED' : 'ACTIVE'}
                </span>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Withdrawal Amount (₹) • Max ₹20,000
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
                placeholder="2000"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-base font-bold outline-none transition"
                required
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {['500', '1000', '2000', '5000', '10000', '20000'].map((preset) => (
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
            <CreditCard className="w-5 h-5 text-cyan-400" />
            Proceed to ATM Cash Withdrawal
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSummary}
        title="Confirm ATM Cash Withdrawal"
        operationType="ATM Cash Withdrawal"
        amountRupees={Number(amount || 0)}
        remainingBalance={selectedAcc ? selectedAcc.balanceRupees - Number(amount || 0) : undefined}
        details={[
          { label: 'Bank', value: selectedAcc?.bankName || '' },
          { label: 'Account ID', value: selectedAcc?.accountId || '' },
          { label: 'Account Holder', value: selectedAcc?.customerName || '' },
          { label: 'Channel', value: 'Automated Teller Machine (ATM)' },
          { label: 'ATM Per-Transaction Cap', value: '₹20,000.00' }
        ]}
      />

      {/* PIN Modal */}
      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onConfirm={handleVerifyPin}
        title="Enter ATM PIN"
        description="Verify your 4-digit PIN to release cash from the simulated dispenser."
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
