import React, { useState } from 'react';
import { Search, Edit3, CheckCircle2, AlertCircle, User, Phone, Mail, Building2, Save } from 'lucide-react';
import { useBank } from '../context/BankContext';
import { api } from '../services/api';
import { Account } from '../types';

export const SearchUpdatePage: React.FC = () => {
  const { refreshAccounts } = useBank();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Account[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.getAccounts(searchTerm.trim());
      setSearchResults(res.accounts);
      setHasSearched(true);
      setEditingAccount(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (acc: Account) => {
    setEditingAccount(acc);
    setEditName(acc.customerName);
    setEditPhone(acc.phone);
    setEditEmail(acc.email);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (editName.trim().length < 2) {
      setErrorMsg('Customer name must be at least 2 characters.');
      return;
    }
    if (!/^\d{10}$/.test(editPhone)) {
      setErrorMsg('Mobile number must be exactly 10 digits.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.updateAccount(editingAccount.accountId, {
        customerName: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim()
      });

      setSuccessMsg(`Customer details for account ${editingAccount.accountId} successfully updated.`);
      await refreshAccounts();

      // update local list
      setSearchResults((prev) =>
        prev.map((a) => (a.accountId === editingAccount.accountId ? res.account : a))
      );
      setEditingAccount(res.account);
    } catch (err: any) {
      setErrorMsg(err.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2 border border-cyan-200">
          <Search className="w-3.5 h-3.5" />
          Modules 7 &amp; 8 • Search &amp; Update Customer Records
        </div>
        <h2 className="text-2xl font-black text-navy-900 tracking-tight">Search &amp; Manage Accounts</h2>
        <p className="text-xs text-slate-500">
          Find accounts by Account ID or Customer Name as per report requirements, and modify customer contact info
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter Account ID (e.g. 10000001) or Customer Name (e.g. Srinivas)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs sm:text-sm outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-navy-900/10 flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </form>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Results List */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-500 px-1">
            <span>Search Results ({searchResults.length} accounts found)</span>
          </div>

          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((acc) => (
                <div
                  key={acc.accountId}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-navy-900">#{acc.accountId}</span>
                      <span className="font-bold text-xs text-slate-800">{acc.customerName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {acc.bankCode}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Phone: <strong className="text-slate-700">{acc.phone}</strong></span>
                      <span>Email: <strong className="text-slate-700">{acc.email}</strong></span>
                      <span>Type: <strong className="text-slate-700">{acc.accountType}</strong></span>
                    </div>

                    <div className="text-[11px] text-cyan-700 font-mono">
                      UPI ID: {acc.upiId}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Balance</span>
                      <span className="font-black text-emerald-600 text-sm">
                        ₹{acc.balanceRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={() => startEdit(acc)}
                      className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-semibold text-xs rounded-xl transition border border-cyan-200 flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              No accounts matched your search query. Try searching by first name, bank code, or full 8-digit ID.
            </div>
          )}
        </div>
      )}

      {/* Edit Modal / Inline Editor */}
      {editingAccount && (
        <div className="bg-slate-50 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-md animate-fade-in">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-cyan-600" />
              <h3 className="text-sm font-bold text-navy-900">
                Update Customer Record (Account #{editingAccount.accountId})
              </h3>
            </div>
            <button
              onClick={() => setEditingAccount(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Customer Full Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-cyan-500 transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number (10 Digits)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-white outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-xl transition border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
