import React, { useState } from 'react';
import { ArrowRightLeft, AlertCircle, ShieldCheck, CheckCircle2, UserCheck } from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { PinModal } from '../components/PinModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const TransferMoneyPage: React.FC = () => {
  const { accounts, currentAccount, refreshAccounts } = useBank();
  const [senderId, setSenderId] = useState<number>(
    currentAccount?.accountId || accounts[0]?.accountId || 10000001
  );
  const [receiverId, setReceiverId] = useState('');
  const [receiverNameVerify, setReceiverNameVerify] = useState('');
  const [amount, setAmount] = useState('1500');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState<Transaction | null>(null);

  const senderAcc = accounts.find((a) => a.accountId === senderId);
  const potentialReceiver = accounts.find((a) => a.accountId === Number(receiverId));

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const recIdNum = Number(receiverId);
    if (!recIdNum || isNaN(recIdNum)) {
      setError('Please enter a valid receiver Account ID.');
      return;
    }
    if (senderId === recIdNum) {
      setError('You cannot transfer money to your own account.');
      return;
    }
    if (!potentialReceiver) {
      setError('Receiver account not found in database records.');
      return;
    }
    if (!receiverNameVerify || receiverNameVerify.trim().toLowerCase() !== potentialReceiver.customerName.trim().toLowerCase()) {
      setError(`Receiver verification failed. Entered name does not match record for ID ${recIdNum}.`);
      return;
    }

    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Please enter a positive transfer amount.');
      return;
    }
    if (amtNum > 100000) {
      setError('Transfer limit exceeded. Maximum allowed: ₹1,00,000 per transaction.');
      return;
    }
    if (senderAcc && amtNum > senderAcc.balanceRupees) {
      setError(`Insufficient balance. Available: ₹${senderAcc.balanceRupees.toLocaleString('en-IN')}.`);
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
      const res = await api.transfer(
        senderId,
        Number(receiverId),
        receiverNameVerify.trim(),
        Number(amount),
        pin
      );
      await refreshAccounts();
      setIsPinOpen(false);
      setReceiptTxn(res.transaction);
      setAmount('1500');
    } catch (err: any) {
      setIsPinOpen(false);
      setError(err.message || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2 border border-purple-200">
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Account-to-Account Transfer
        </div>
        <h2 className="text-2xl font-black text-navy-900 tracking-tight">Direct Inter-Bank / Intra-Bank Transfer</h2>
        <p className="text-xs text-slate-500">
          Requires receiver name verification &amp; 4-digit PIN • Atomic SQLite two-account ledger debit/credit
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
          {/* Sender Account */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              From (Sender Account)
            </label>
            <select
              value={senderId}
              onChange={(e) => setSenderId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs font-semibold outline-none transition bg-white"
            >
              {accounts.map((a) => (
                <option key={a.accountId} value={a.accountId}>
                  {a.accountId} - {a.customerName} ({a.bankCode}) • Available: ₹{a.balanceRupees.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
            {senderAcc && (
              <span className="text-[11px] text-slate-500 mt-1 block">
                Available balance:{' '}
                <strong className="text-emerald-600">
                  ₹{senderAcc.balanceRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </span>
            )}
          </div>

          {/* Receiver Account ID & Lookup */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              To (Receiver Account ID)
            </label>
            <input
              type="text"
              value={receiverId}
              onChange={(e) => {
                setReceiverId(e.target.value.replace(/\D/g, '').slice(0, 18));
              }}
              placeholder="e.g. 10000002"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-mono outline-none transition"
              required
            />
            {potentialReceiver && (
              <div className="mt-2 p-2.5 rounded-xl bg-purple-50/60 border border-purple-200 text-xs flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-purple-700 font-bold block uppercase">Matched Bank Record</span>
                  <span className="font-semibold text-slate-800">{potentialReceiver.bankName}</span>
                </div>
                <span className="text-[10px] text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200 font-mono font-bold">
                  {potentialReceiver.bankCode}
                </span>
              </div>
            )}
          </div>

          {/* Receiver Name Verification (Enforced by C++ Code!) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Receiver Name for Verification</span>
              <span className="text-[10px] text-cyan-600 lowercase font-medium">Security rule from C++ source</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={receiverNameVerify}
                onChange={(e) => setReceiverNameVerify(e.target.value)}
                placeholder="Enter exact full name of recipient"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition"
                required
              />
              {potentialReceiver && (
                <button
                  type="button"
                  onClick={() => setReceiverNameVerify(potentialReceiver.customerName)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 px-2 py-1 rounded-md transition"
                >
                  Auto-fill demo name
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              For security, system prevents transfers if name does not match recipient account.
            </span>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Transfer Amount (₹) • Max ₹1,00,000
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
                placeholder="1500"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-base font-bold outline-none transition"
                required
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {['500', '1000', '2500', '5000', '10000', '25000'].map((preset) => (
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
            <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
            Verify Details &amp; Proceed to Transfer
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSummary}
        title="Confirm Account Transfer"
        operationType="Inter-Account Transfer"
        amountRupees={Number(amount || 0)}
        remainingBalance={senderAcc ? senderAcc.balanceRupees - Number(amount || 0) : undefined}
        details={[
          { label: 'Sender Account', value: `${senderAcc?.customerName} (${senderAcc?.accountId})` },
          { label: 'Sender Bank', value: senderAcc?.bankName || '' },
          { label: 'Recipient Account', value: receiverId },
          { label: 'Verified Recipient', value: receiverNameVerify },
          { label: 'Recipient Bank', value: potentialReceiver?.bankName || '' },
          { label: 'Per-Transaction Cap', value: '₹1,00,000.00' }
        ]}
      />

      {/* PIN Modal */}
      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onConfirm={handleVerifyPin}
        title="Enter Transfer PIN"
        description="Verify your 4-digit security PIN to finalize this inter-account transfer."
        loading={loading}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(receiptTxn)}
        onClose={() => setReceiptTxn(null)}
        transaction={receiptTxn}
        account={senderAcc}
        receiverName={receiverNameVerify}
      />
    </div>
  );
};
