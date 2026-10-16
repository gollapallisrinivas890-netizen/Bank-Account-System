import React, { useState } from 'react';
import { Smartphone, AlertCircle, ShieldAlert, CheckCircle2, User, Phone, QrCode } from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { PinModal } from '../components/PinModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const UpiPaymentPage: React.FC = () => {
  const { accounts, currentAccount, refreshAccounts } = useBank();
  const [payerId, setPayerId] = useState<number>(
    currentAccount?.accountId || accounts[0]?.accountId || 10000001
  );
  const [method, setMethod] = useState<'accountId' | 'phone' | 'upiId'>('phone');
  const [recipientValue, setRecipientValue] = useState('');
  const [amount, setAmount] = useState('750');
  const [note, setNote] = useState('Payment via simulated UPI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState<Transaction | null>(null);
  const [resolvedRecipient, setResolvedRecipient] = useState<string>('');

  const payerAcc = accounts.find((a) => a.accountId === payerId);

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!recipientValue.trim()) {
      setError('Please enter the recipient information.');
      return;
    }

    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }
    if (amtNum > 100000) {
      setError('UPI simulation limit is ₹1,00,000 per transaction.');
      return;
    }
    if (payerAcc && amtNum > payerAcc.balanceRupees) {
      setError(`Insufficient balance. Current balance is ₹${payerAcc.balanceRupees.toLocaleString('en-IN')}.`);
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
      const res = await api.upiPayment({
        payerId,
        method,
        recipientValue: recipientValue.trim(),
        amount: Number(amount),
        note,
        pin
      });
      await refreshAccounts();
      setIsPinOpen(false);
      setResolvedRecipient(res.recipientName);
      setReceiptTxn(res.transaction);
      setAmount('750');
    } catch (err: any) {
      setIsPinOpen(false);
      setError(err.message || 'UPI payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2 border border-cyan-200">
          <Smartphone className="w-3.5 h-3.5" />
          Digital Services • UPI &amp; Instant Payments
        </div>
        <h2 className="text-2xl font-black text-navy-900 tracking-tight">UPI / Phone Payment Simulation</h2>
        <p className="text-xs text-slate-500">
          3-channel recipient routing (Account ID, Mobile Number, or VPA UPI ID) • Max ₹1,00,000 per transaction
        </p>
      </div>

      {/* Educational Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Educational Simulation Notice:</strong> This feature simulates UPI / PhonePe protocols for the college project. No real telecom, NPCI, or banking networks are connected.
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
          {/* Payer Account */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              From (Payer Account)
            </label>
            <select
              value={payerId}
              onChange={(e) => setPayerId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs font-semibold outline-none transition bg-white"
            >
              {accounts.map((a) => (
                <option key={a.accountId} value={a.accountId}>
                  {a.accountId} - {a.customerName} ({a.bankCode}) • Available: ₹{a.balanceRupees.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Selector (3 Modes from C++ code) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Recipient Identifier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'phone', label: 'Mobile Number', icon: Phone },
                { id: 'upiId', label: 'UPI ID / VPA', icon: QrCode },
                { id: 'accountId', label: 'Account ID', icon: User }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = method === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => {
                      setMethod(m.id as any);
                      setRecipientValue('');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-center transition flex flex-col items-center gap-1 text-xs font-semibold ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-800 ring-1 ring-cyan-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {method === 'phone' && 'Receiver Mobile Number (10 Digits)'}
              {method === 'upiId' && 'Receiver UPI ID (e.g. saitharun10000002@hdfc)'}
              {method === 'accountId' && 'Receiver Account ID (8 Digits)'}
            </label>
            <input
              type="text"
              value={recipientValue}
              onChange={(e) => setRecipientValue(e.target.value)}
              placeholder={
                method === 'phone'
                  ? 'e.g. 9876543211'
                  : method === 'upiId'
                  ? 'e.g. saitharun10000002@hdfc'
                  : 'e.g. 10000002'
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-mono outline-none transition"
              required
            />
            {/* Quick demo recipient helpers */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 self-center">Demo contacts:</span>
              {accounts
                .filter((a) => a.accountId !== payerId)
                .slice(0, 3)
                .map((a) => (
                  <button
                    type="button"
                    key={a.accountId}
                    onClick={() => {
                      if (method === 'phone') setRecipientValue(a.phone);
                      else if (method === 'upiId') setRecipientValue(a.upiId);
                      else setRecipientValue(String(a.accountId));
                    }}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 font-medium transition"
                  >
                    {a.customerName}
                  </button>
                ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Amount (₹) • Max ₹1,00,000
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="1"
                max="100000"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="750"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-base font-bold outline-none transition"
                required
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Note / Purpose
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lunch split, project fee, grocery"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 text-sm font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition shadow-lg shadow-navy-900/15 flex items-center justify-center gap-2"
          >
            <Smartphone className="w-5 h-5 text-cyan-400" />
            Send UPI Payment
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSummary}
        title="Confirm Simulated UPI Payment"
        operationType="UPI Payment Simulation"
        amountRupees={Number(amount || 0)}
        remainingBalance={payerAcc ? payerAcc.balanceRupees - Number(amount || 0) : undefined}
        details={[
          { label: 'Payer Account', value: `${payerAcc?.customerName} (${payerAcc?.accountId})` },
          { label: 'Routing Channel', value: method.toUpperCase() },
          { label: 'Recipient Identifier', value: recipientValue },
          { label: 'Payment Note', value: note || 'UPI Payment' },
          { label: 'UPI Cap', value: '₹1,00,000.00' }
        ]}
      />

      {/* PIN Modal */}
      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onConfirm={handleVerifyPin}
        title="Enter UPI PIN"
        description="Verify your 4-digit PIN to authenticate the UPI digital transaction."
        loading={loading}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(receiptTxn)}
        onClose={() => setReceiptTxn(null)}
        transaction={receiptTxn}
        account={payerAcc}
        receiverName={resolvedRecipient}
      />
    </div>
  );
};
