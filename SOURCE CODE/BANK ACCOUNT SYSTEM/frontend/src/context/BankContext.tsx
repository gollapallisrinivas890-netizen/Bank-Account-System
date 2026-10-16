import React, { createContext, useContext, useState, useEffect } from 'react';
import { Account, Bank } from '../types';
import { api } from '../services/api';

interface BankContextType {
  banks: Bank[];
  accounts: Account[];
  currentAccount: Account | null;
  selectedBankCode: string;
  isAdminMode: boolean;
  loading: boolean;
  setCurrentAccount: (account: Account | null) => void;
  setSelectedBankCode: (code: string) => void;
  setIsAdminMode: (admin: boolean) => void;
  refreshAccounts: () => Promise<void>;
  refreshBanks: () => Promise<void>;
  loginAccount: (account: Account) => void;
  logoutAccount: () => void;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

export const BankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [selectedBankCode, setSelectedBankCode] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshBanks = async () => {
    try {
      const res = await api.getBanks();
      setBanks(res.banks);
    } catch (err) {
      console.error('Failed to load banks:', err);
    }
  };

  const refreshAccounts = async () => {
    try {
      const res = await api.getAccounts(undefined, selectedBankCode || undefined);
      setAccounts(res.accounts);

      // If current logged in account exists, refresh its data
      if (currentAccount) {
        const updated = res.accounts.find((a) => a.accountId === currentAccount.accountId);
        if (updated) setCurrentAccount(updated);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshBanks();
      await refreshAccounts();
      setLoading(false);
    };
    init();
  }, [selectedBankCode]);

  // Load saved session if exists
  useEffect(() => {
    const saved = localStorage.getItem('active_bank_account');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentAccount(parsed);
      } catch (e) {
        localStorage.removeItem('active_bank_account');
      }
    }
  }, []);

  const loginAccount = (account: Account) => {
    setCurrentAccount(account);
    localStorage.setItem('active_bank_account', JSON.stringify(account));
  };

  const logoutAccount = () => {
    setCurrentAccount(null);
    localStorage.removeItem('active_bank_account');
  };

  return (
    <BankContext.Provider
      value={{
        banks,
        accounts,
        currentAccount,
        selectedBankCode,
        isAdminMode,
        loading,
        setCurrentAccount,
        setSelectedBankCode,
        setIsAdminMode,
        refreshAccounts,
        refreshBanks,
        loginAccount,
        logoutAccount
      }}
    >
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => {
  const context = useContext(BankContext);
  if (!context) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return context;
};
