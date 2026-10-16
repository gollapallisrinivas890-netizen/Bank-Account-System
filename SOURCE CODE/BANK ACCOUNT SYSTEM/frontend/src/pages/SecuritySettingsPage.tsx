import React, { useState } from 'react';
import { Shield, KeyRound, AlertTriangle, CheckCircle2, Lock, Unlock, AlertCircle } from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';

export const SecuritySettingsPage: React.FC = () => {
  const { accounts, currentAccount, refreshAccounts } = useBank();
  const [selectedAccountId, setSelectedAccountId] = useState<number>(
    currentAccount?.accountId || accounts[0]?.accountId || 10000001
  );

  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedAcc = accounts.find((a) => a.accountId === selectedAccountId);

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (oldPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
      setErrorMsg('All PIN fields must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('New PIN and confirmation PIN do not match.');
      return;
    }
    if (newPin === oldPin) {
      setErrorMsg('New PIN must be different from current PIN.');
      return;
    }

    setLoading(true);
    try {
      await api.changePin(selectedAccountId, oldPin, newPin, confirmPin);
      setSuccessMsg('PIN changed successfully. Your new PIN is active.');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      await refreshAccounts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to change PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!selectedAcc) return;
    setLoading(true);
    try {
      await api.unlockAccount(selectedAcc.accountId);
      await refreshAccounts();
      setSuccessMsg(`Account ${selectedAcc.accountId} has been unlocked successfully.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unlock failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2 border border-cyan-200">
          <Shield className="w-3.5 h-3.5" />
          Security Center &amp; Access Controls
        </div>
        <h2 className="text-2xl font-black text-navy-900 tracking-tight">Security &amp; PIN Management</h2>
        <p className="text-xs text-slate-500">
          3-attempt account lockout policy, change PIN facility, and cryptographic salt+hash protection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change PIN Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <KeyRound className="w-5 h-5 text-cyan-600" />
            <h3 className="text-sm font-bold text-navy-900">Change 4-Digit Security PIN</h3>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleChangePin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Account
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.accountId} value={a.accountId}>
                    {a.accountId} - {a.customerName} ({a.bankCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current 4-Digit PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full px-3 py-2 text-center text-sm font-bold tracking-widest rounded-xl border border-slate-200 outline-none focus:border-cyan-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New 4-Digit PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full px-3 py-2 text-center text-sm font-bold tracking-widest rounded-xl border border-slate-200 outline-none focus:border-cyan-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full px-3 py-2 text-center text-sm font-bold tracking-widest rounded-xl border border-slate-200 outline-none focus:border-cyan-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition shadow-sm mt-2"
            >
              Update Security PIN
            </button>
          </form>
        </div>

        {/* Lockout & Security Status Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-navy-900 mb-2">Account Lockout Status</h3>
            <p className="text-xs text-slate-500 mb-4">
              Accounts are automatically locked after 3 consecutive failed login attempts as programmed in the C++ project.
            </p>

            {selectedAcc && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  selectedAcc.locked
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {selectedAcc.locked ? <Lock className="w-5 h-5 text-rose-600" /> : <Unlock className="w-5 h-5 text-emerald-600" />}
                  <div>
                    <span className="text-xs font-bold block">
                      Account #{selectedAcc.accountId}: {selectedAcc.locked ? 'LOCKED' : 'ACTIVE'}
                    </span>
                    <span className="text-[11px] opacity-80">
                      Failed attempts: {selectedAcc.failedLoginAttempts}/3
                    </span>
                  </div>
                </div>

                {selectedAcc.locked && (
                  <button
                    onClick={handleUnlock}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition"
                  >
                    Unlock Account
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 10 Security Rules from C++ Source Code */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs space-y-2">
            <h4 className="font-bold text-navy-900 text-xs uppercase tracking-wider mb-2">
              Security Rules Implemented in C++ Source
            </h4>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600">
              <li>Login requires 8-digit Account ID + 4-digit PIN</li>
              <li>3 incorrect login attempts lock the account</li>
              <li>Outgoing transactions require 4-digit PIN verification</li>
              <li>Receiver name verification enforced for transfers</li>
              <li>Transaction confirmation prompt required before debit</li>
              <li>ATM withdrawal capped at ₹20,000 per transaction</li>
              <li>Bank counter withdrawal capped at ₹50,000 per transaction</li>
              <li>Simulated daily outgoing transaction limit: ₹1,00,000</li>
              <li>PINs are salted and hashed (never stored in plain text)</li>
              <li>Transaction history records date, time, type, amount, resulting balance</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
