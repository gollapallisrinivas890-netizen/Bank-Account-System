import React, { useState } from 'react';
import { ShieldCheck, X, Delete } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Transaction PIN Verification',
  description = 'Enter your 4-digit security PIN to authorize this banking transaction.',
  loading = false
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        // can auto submit or wait for submit button
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) {
      setError('Please enter all 4 digits of your PIN.');
      return;
    }
    onConfirm(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 relative overflow-hidden">
        {/* Header accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-navy-800 via-cyan-500 to-navy-900" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-cyan-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">{description}</p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex justify-center gap-4 my-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                pin.length > idx
                  ? 'border-navy-800 bg-navy-50 text-navy-900 scale-105 shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-transparent'
              }`}
            >
              {pin.length > idx ? '●' : ''}
            </div>
          ))}
        </div>

        {error && (
          <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg py-1.5 px-3 mb-4 text-center font-medium">
            {error}
          </div>
        )}

        {/* On-screen Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="py-3 text-base font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 active:bg-cyan-50 active:text-cyan-700 rounded-xl transition border border-slate-200/80"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setPin('');
              setError('');
            }}
            className="py-3 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition border border-slate-200/80"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3 text-base font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 active:bg-cyan-50 active:text-cyan-700 rounded-xl transition border border-slate-200/80"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 flex items-center justify-center text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition border border-slate-200/80"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={pin.length !== 4 || loading}
            className="w-1/2 py-2.5 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-md shadow-navy-900/10 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Verify & Pay'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
