import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  operationType: string;
  amountRupees: number;
  details: { label: string; value: string | number }[];
  remainingBalance?: number;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  operationType,
  amountRupees,
  details,
  remainingBalance,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900">{title}</h3>
            <p className="text-xs text-slate-500">Please review transaction details before confirming</p>
          </div>
        </div>

        {/* Amount Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-4 text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">{operationType}</span>
          <div className="text-3xl font-extrabold text-navy-900 mt-1">
            ₹{amountRupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {remainingBalance !== undefined && (
            <div className="text-xs text-slate-500 mt-1">
              Estimated remaining balance:{' '}
              <span className="font-semibold text-emerald-600">
                ₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Details List */}
        <div className="space-y-2 mb-6">
          {details.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">{item.label}</span>
              <span className="text-slate-900 font-semibold text-right">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Disclaimers & Action buttons */}
        <p className="text-[11px] text-slate-400 text-center mb-4 italic">
          * Educational prototype simulation. Balance will be updated persistently in local SQLite database.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel Transaction
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-1/2 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Pay
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
