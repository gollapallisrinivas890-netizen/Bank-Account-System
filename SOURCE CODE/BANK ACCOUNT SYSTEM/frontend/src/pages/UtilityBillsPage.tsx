import React, { useState } from 'react';
import { Receipt, Zap, Flame, Droplets, Tv, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { PinModal } from '../components/PinModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const UtilityBillsPage: React.FC = () => {
  const { accounts, currentAccount, refreshAccounts } = useBank();
  const [accountId, setAccountId] = useState<number>(
    currentAccount?.accountId || accounts[0]?.accountId || 10000001
  );
  const [billType, setBillType] = useState<
    'ELECTRICITY BILL' | 'GAS BILL' | 'WATER BILL' | 'DTH BILL' | 'OTHER BILL'
  >('ELECTRICITY BILL');
  const [providerName, setProviderName] = useState('APEPDCL (Eastern Power)');
  const [consumerNumber, setConsumerNumber] = useState('EP1008892');
  const [amount, setAmount] = useState('1450');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState<Transaction | null>(null);

  const selectedAcc = accounts.find((a) => a.accountId === accountId);
  const MAX_BILL = 50000;

  const billCategories = [
    {
      id: 'ELECTRICITY BILL',
      label: 'Electricity',
      icon: Zap,
      defaultProvider: 'APEPDCL (Eastern Power)',
      providers: ['APEPDCL (Eastern Power)', 'TSSPDCL (Southern Power)', 'BESCOM Bengaluru', 'Tata Power', 'Adani Electricity']
    },
    {
      id: 'GAS BILL',
      label: 'Piped / Cylinder Gas',
      icon: Flame,
      defaultProvider: 'Indane Gas',
      providers: ['Indane Gas', 'Bharat Gas', 'HP Gas', 'Mahanagar Gas (MGL)', 'Gujarat Gas']
    },
    {
      id: 'WATER BILL',
      label: 'Municipal Water',
      icon: Droplets,
      defaultProvider: 'Municipal Corporation Water Board',
      providers: ['Municipal Corporation Water Board', 'Hyderabad HMWSSB', 'Delhi Jal Board (DJB)', 'Bangalore BWSSB']
    },
    {
      id: 'DTH BILL',
      label: 'DTH / TV Cable',
      icon: Tv,
      defaultProvider: 'Tata Play (Tata Sky)',
      providers: ['Tata Play (Tata Sky)', 'Airtel Digital TV', 'Dish TV', 'Sun Direct', 'D2H']
    },
    {
      id: 'OTHER BILL',
      label: 'Other Utility',
      icon: Receipt,
      defaultProvider: 'Broadband / Municipal Tax',
      providers: ['JioFiber Broadband', 'Airtel Xstream', 'ACT Fibernet', 'Property Tax', 'Municipal Waste']
    }
  ];

  const currentCat = billCategories.find((c) => c.id === billType) || billCategories[0];

  const handleCategoryChange = (catId: any) => {
    setBillType(catId);
    const cat = billCategories.find((c) => c.id === catId);
    if (cat) {
      setProviderName(cat.defaultProvider);
      if (catId === 'ELECTRICITY BILL') setConsumerNumber('EP1008892');
      else if (catId === 'GAS BILL') setConsumerNumber('GAS-987410');
      else if (catId === 'WATER BILL') setConsumerNumber('WTR-55441');
      else if (catId === 'DTH BILL') setConsumerNumber('SUB-8877112');
      else setConsumerNumber('REF-992211');
    }
  };

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!consumerNumber.trim()) {
      setError('Please enter the consumer/connection number.');
      return;
    }
    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Please enter a valid bill amount.');
      return;
    }
    if (amtNum > MAX_BILL) {
      setError(`Utility bill payment limit is ₹${MAX_BILL.toLocaleString('en-IN')} per transaction.`);
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
      const res = await api.payBill({
        accountId,
        billType,
        providerName,
        consumerNumber: consumerNumber.trim(),
        amount: Number(amount),
        pin
      });
      await refreshAccounts();
      setIsPinOpen(false);
      setReceiptTxn(res.transaction);
    } catch (err: any) {
      setIsPinOpen(false);
      setError(err.message || 'Bill payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2 border border-cyan-200">
          <Receipt className="w-3.5 h-3.5" />
          Utility Bill Payments
        </div>
        <h2 className="text-2xl font-black text-navy-900 tracking-tight">Utility Bill Desk (Simulation)</h2>
        <p className="text-xs text-slate-500">
          Electricity, Gas, Water, DTH, and Utility bills • Strict ₹50,000 per-transaction cap
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

          {/* Category Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Bill Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {billCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = billType === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 text-xs font-semibold ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-800 ring-1 ring-cyan-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Board / Provider
            </label>
            <select
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs font-semibold outline-none transition bg-white"
            >
              {currentCat.providers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Consumer / Reference Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Consumer / Service Connection Number
            </label>
            <input
              type="text"
              value={consumerNumber}
              onChange={(e) => setConsumerNumber(e.target.value)}
              placeholder="e.g. EP1008892"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-mono outline-none transition"
              required
            />
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Bill Amount (₹) • Max ₹50,000
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="10"
                max={MAX_BILL}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1450"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-base font-bold outline-none transition"
                required
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {['500', '1450', '2500', '5000', '12000'].map((preset) => (
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
            <Receipt className="w-5 h-5 text-cyan-400" />
            Proceed to Pay Bill ₹{Number(amount || 0).toLocaleString('en-IN')}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSummary}
        title={`Confirm ${billType}`}
        operationType={billType}
        amountRupees={Number(amount || 0)}
        remainingBalance={selectedAcc ? selectedAcc.balanceRupees - Number(amount || 0) : undefined}
        details={[
          { label: 'Debit Account', value: `${selectedAcc?.customerName} (${selectedAcc?.accountId})` },
          { label: 'Bill Category', value: billType },
          { label: 'Biller / Board', value: providerName },
          { label: 'Consumer Number', value: consumerNumber },
          { label: 'Bill Cap', value: '₹50,000.00' }
        ]}
      />

      {/* PIN Modal */}
      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onConfirm={handleVerifyPin}
        title="Authorize Bill Payment"
        description="Verify your 4-digit PIN to finalize this utility payment debit."
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
