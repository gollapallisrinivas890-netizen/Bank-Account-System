import React, { useState } from 'react';
import { Zap, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { PinModal } from '../components/PinModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const MobileRechargePage: React.FC = () => {
  const { accounts, currentAccount, refreshAccounts } = useBank();
  const [accountId, setAccountId] = useState<number>(
    currentAccount?.accountId || accounts[0]?.accountId || 10000001
  );
  const [mobileNumber, setMobileNumber] = useState(currentAccount?.phone || '9876543210');
  const [rechargeType, setRechargeType] = useState<'Prepaid' | 'Postpaid'>('Prepaid');
  const [operator, setOperator] = useState('Jio');
  const [plan, setPlan] = useState('2GB/Day 84 Days Unlimited (₹719)');
  const [amount, setAmount] = useState('719');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState<Transaction | null>(null);

  const selectedAcc = accounts.find((a) => a.accountId === accountId);
  const MAX_RECHARGE = 10000;

  const popularPlans = [
    { name: '1.5GB/Day 28 Days', amount: '299' },
    { name: '2GB/Day 84 Days Unlimited', amount: '719' },
    { name: '3GB/Day 28 Days + OTT', amount: '499' },
    { name: '2.5GB/Day 365 Days Annual', amount: '2999' },
    { name: 'Data Booster 12GB', amount: '121' }
  ];

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Please enter a valid recharge amount.');
      return;
    }
    if (amtNum > MAX_RECHARGE) {
      setError(`Mobile recharge limit is ₹${MAX_RECHARGE.toLocaleString('en-IN')} per transaction.`);
      return;
    }
    if (selectedAcc && amtNum > selectedAcc.balanceRupees) {
      setError(`Insufficient balance. Current balance is ₹${selectedAcc.balanceRupees.toLocaleString('en-IN')}.`);
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
      const res = await api.mobileRecharge({
        accountId,
        mobileNumber,
        rechargeType,
        operator,
        plan,
        amount: Number(amount),
        pin
      });
      await refreshAccounts();
      setIsPinOpen(false);
      setReceiptTxn(res.transaction);
    } catch (err: any) {
      setIsPinOpen(false);
      setError(err.message || 'Mobile recharge failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2 border border-cyan-200">
          <Zap className="w-3.5 h-3.5" />
          Telecom Simulation
        </div>
        <h2 className="text-2xl font-black text-navy-900 tracking-tight">Mobile Recharge &amp; Postpaid Bill</h2>
        <p className="text-xs text-slate-500">
          Enforces ₹10,000 maximum recharge limit • Instant simulation debit
        </p>
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
              Payment Source Account
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs font-semibold outline-none transition bg-white"
            >
              {accounts.map((a) => (
                <option key={a.accountId} value={a.accountId}>
                  {a.accountId} - {a.customerName} ({a.bankCode}) • Available: ₹{a.balanceRupees.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Recharge Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['Prepaid', 'Postpaid'] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setRechargeType(t)}
                  className={`py-2.5 px-4 rounded-xl border text-center transition text-xs font-semibold ${
                    rechargeType === t
                      ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t} Recharge
                </button>
              ))}
            </div>
          </div>

          {/* Operator Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Operator
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Jio', 'Airtel', 'Vi', 'BSNL'].map((op) => (
                <button
                  type="button"
                  key={op}
                  onClick={() => setOperator(op)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center ${
                    operator === op
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-800 ring-1 ring-cyan-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              10-Digit Mobile Number
            </label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-mono outline-none transition"
              required
            />
          </div>

          {/* Popular Plans Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Popular Plan
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {popularPlans.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setPlan(p.name);
                    setAmount(p.amount);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs flex justify-between items-center transition ${
                    amount === p.amount && plan === p.name
                      ? 'border-cyan-500 bg-cyan-50/60 font-semibold text-cyan-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="font-bold text-navy-900">₹{p.amount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Recharge Amount (₹) • Max ₹10,000
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="10"
                max={MAX_RECHARGE}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="719"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-bold outline-none transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 text-sm font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition shadow-lg shadow-navy-900/15 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            Proceed to Recharge ₹{Number(amount || 0).toLocaleString('en-IN')}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSummary}
        title="Confirm Mobile Recharge"
        operationType="Mobile Recharge"
        amountRupees={Number(amount || 0)}
        remainingBalance={selectedAcc ? selectedAcc.balanceRupees - Number(amount || 0) : undefined}
        details={[
          { label: 'Debit Account', value: `${selectedAcc?.customerName} (${selectedAcc?.accountId})` },
          { label: 'Operator & Type', value: `${operator} - ${rechargeType}` },
          { label: 'Target Mobile Number', value: mobileNumber },
          { label: 'Selected Plan', value: plan },
          { label: 'Recharge Cap', value: '₹10,000.00' }
        ]}
      />

      {/* PIN Modal */}
      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onConfirm={handleVerifyPin}
        title="Authorize Mobile Recharge"
        description="Enter your 4-digit PIN to commit the simulated recharge debit."
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
