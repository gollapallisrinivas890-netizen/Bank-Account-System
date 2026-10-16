import React, { useState } from 'react';
import { BankProvider } from './context/BankContext';
import { EducationalBanner } from './components/EducationalBanner';
import { TopNavbar } from './components/TopNavbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { BankPortalPage } from './pages/BankPortalPage';
import { CreateAccountPage } from './pages/CreateAccountPage';
import { AllAccountsPage } from './pages/AllAccountsPage';
import { BalanceEnquiryPage } from './pages/BalanceEnquiryPage';
import { DepositPage } from './pages/DepositPage';
import { AtmWithdrawalPage } from './pages/AtmWithdrawalPage';
import { BankWithdrawalPage } from './pages/BankWithdrawalPage';
import { TransferMoneyPage } from './pages/TransferMoneyPage';
import { UpiPaymentPage } from './pages/UpiPaymentPage';
import { MobileRechargePage } from './pages/MobileRechargePage';
import { UtilityBillsPage } from './pages/UtilityBillsPage';
import { SearchUpdatePage } from './pages/SearchUpdatePage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { SecuritySettingsPage } from './pages/SecuritySettingsPage';
import { ReportsPage } from './pages/ReportsPage';
import { LoginPage } from './pages/LoginPage';
import { ProjectInfoPage } from './pages/ProjectInfoPage';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'banks':
        return <BankPortalPage onNavigate={setActiveTab} />;
      case 'create-account':
        return <CreateAccountPage onNavigate={setActiveTab} />;
      case 'accounts':
        return <AllAccountsPage onNavigate={setActiveTab} />;
      case 'balance':
        return <BalanceEnquiryPage />;
      case 'deposit':
        return <DepositPage />;
      case 'atm-withdraw':
        return <AtmWithdrawalPage />;
      case 'counter-withdraw':
        return <BankWithdrawalPage />;
      case 'transfer':
        return <TransferMoneyPage />;
      case 'upi':
        return <UpiPaymentPage />;
      case 'recharge':
        return <MobileRechargePage />;
      case 'bills':
        return <UtilityBillsPage />;
      case 'search-update':
        return <SearchUpdatePage />;
      case 'transactions':
        return <TransactionHistoryPage />;
      case 'security':
        return <SecuritySettingsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'login':
        return <LoginPage onNavigate={setActiveTab} />;
      case 'project-info':
        return <ProjectInfoPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <EducationalBanner />
      <div className="flex-1 flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isOpenMobile}
          setIsOpenMobile={setIsOpenMobile}
        />

        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <TopNavbar onToggleMobile={() => setIsOpenMobile((prev) => !prev)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderActivePage()}
          </main>
          <footer className="border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400 no-print">
            Bank Account Management System Using C++ • Batch 13 • Aditya University (2026–2027)
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BankProvider>
      <AppContent />
    </BankProvider>
  );
}
