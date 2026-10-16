import React from 'react';
import { CheckCircle, Printer, X, Download } from 'lucide-react';
import { Transaction, Account } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  account?: Account | null;
  receiverName?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  account,
  receiverName
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative overflow-hidden printable-card">
        {/* Modal controls - hidden in print */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 no-print">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction Receipt</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 text-xs font-medium"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="pt-4 text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-200">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-navy-900">Transaction Successful</h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Ref: {transaction.referenceId}</p>

          <div className="my-5 py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 uppercase">{transaction.type}</span>
            <div className="text-3xl font-black text-navy-900 mt-0.5">
              ₹{transaction.amountRupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">{transaction.description}</div>
          </div>

          <div className="space-y-2.5 text-xs text-left bg-white border border-slate-100 rounded-xl p-4 shadow-sm mb-5">
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Date & Time</span>
              <span className="font-semibold text-slate-800">{transaction.dateTime}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Account ID</span>
              <span className="font-semibold font-mono text-slate-800">{transaction.accountId}</span>
            </div>
            {account && (
              <>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Account Holder</span>
                  <span className="font-semibold text-slate-800">{account.customerName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Bank</span>
                  <span className="font-semibold text-slate-800">
                    {account.bankName} ({account.bankCode})
                  </span>
                </div>
              </>
            )}
            {receiverName && (
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Recipient Name</span>
                <span className="font-semibold text-slate-800">{receiverName}</span>
              </div>
            )}
            <div className="flex justify-between pt-0.5">
              <span className="text-slate-500 font-medium">Available Balance After Transaction</span>
              <span className="font-bold text-emerald-600 text-sm">
                ₹{transaction.balanceAfterRupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Academic Signature stamp */}
          <div className="border-t border-dashed border-slate-200 pt-3 text-[11px] text-slate-400 text-center space-y-0.5">
            <p className="font-medium text-slate-600">Bank Account Management System Using C++ (Batch 13)</p>
            <p>Cornerstone Academic Simulation Prototype • Aditya University</p>
          </div>
        </div>

        {/* Bottom Actions - Hidden on print */}
        <div className="mt-5 flex gap-2 no-print">
          <button
            onClick={handlePrint}
            className="w-1/2 py-2.5 text-xs font-semibold text-navy-900 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="w-1/2 py-2.5 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
