import React from 'react';
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  Users,
  Eye,
  ArrowDownCircle,
  CreditCard,
  Building,
  ArrowRightLeft,
  Smartphone,
  Zap,
  Receipt,
  Search,
  History,
  Shield,
  BarChart3,
  BookOpen,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useBank } from '../context/BankContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const { currentAccount, logoutAccount, selectedBankCode } = useBank();

  const navSections = [
    {
      title: 'CORE BANKING',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'banks', label: 'Supported Banks (8)', icon: Building2 },
        { id: 'create-account', label: 'Create Account', icon: UserPlus },
        { id: 'accounts', label: 'All Accounts', icon: Users },
        { id: 'balance', label: 'Balance Enquiry', icon: Eye }
      ]
    },
    {
      title: 'TRANSACTIONS',
      items: [
        { id: 'deposit', label: 'Deposit Money', icon: ArrowDownCircle },
        { id: 'atm-withdraw', label: 'ATM Withdrawal (₹20k)', icon: CreditCard },
        { id: 'counter-withdraw', label: 'Counter Withdrawal (₹50k)', icon: Building },
        { id: 'transfer', label: 'Account Transfer', icon: ArrowRightLeft }
      ]
    },
    {
      title: 'DIGITAL SERVICES (SIMULATED)',
      items: [
        { id: 'upi', label: 'UPI / Phone Payment', icon: Smartphone },
        { id: 'recharge', label: 'Mobile Recharge', icon: Zap },
        { id: 'bills', label: 'Utility Bill Payments', icon: Receipt }
      ]
    },
    {
      title: 'MANAGEMENT & AUDIT',
      items: [
        { id: 'search-update', label: 'Search & Update', icon: Search },
        { id: 'transactions', label: 'Transaction History', icon: History },
        { id: 'security', label: 'Security & Change PIN', icon: Shield },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'project-info', label: 'Project Info (Batch 13)', icon: BookOpen }
      ]
    }
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden no-print"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-900 text-white flex flex-col border-r border-navy-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-navy-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 font-bold text-lg text-white">
              B
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight">
                BANK SYSTEM
              </h1>
              <p className="text-[10px] text-cyan-400 font-mono tracking-wider">C++ PROTOTYPE</p>
            </div>
          </div>
          {selectedBankCode && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {selectedBankCode}
            </span>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              <h2 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                {section.title}
              </h2>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md shadow-cyan-600/20 font-semibold'
                          : 'text-slate-300 hover:bg-navy-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-200" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Current Active Account Profile Card */}
        {currentAccount ? (
          <div className="p-3 border-t border-navy-800 bg-navy-950/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-medium">Logged-in Customer</span>
              <button
                onClick={logoutAccount}
                title="Logout"
                className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
              >
                <LogOut className="w-3 h-3" />
                Exit
              </button>
            </div>
            <div className="bg-navy-900/90 border border-navy-800 rounded-xl p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[130px]">
                  {currentAccount.customerName}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  {currentAccount.bankCode}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-slate-400 font-mono">ID: {currentAccount.accountId}</span>
                <span className="font-bold text-cyan-400">
                  ₹{currentAccount.balanceRupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-navy-800 bg-navy-950/80 text-center">
            <button
              onClick={() => handleSelect('dashboard')}
              className="w-full py-2 bg-navy-800 hover:bg-navy-700 text-cyan-300 rounded-xl text-xs font-semibold transition border border-navy-700"
            >
              Demo Admin Mode
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
