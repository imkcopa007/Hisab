import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { PasswordChangeModal } from './components/PasswordChangeModal';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DailyEntry } from './pages/DailyEntry';
import { EmployeeManagement } from './pages/EmployeeManagement';
import { MonthlyTargets } from './pages/MonthlyTargets';
import { DailyHistory } from './pages/DailyHistory';
import { MonthlyReports } from './pages/MonthlyReports';
import { BackupRestore } from './pages/BackupRestore';
import { AdminPanel } from './pages/AdminPanel';
import { Settings } from './pages/Settings';
import { Sparkles, RefreshCw } from 'lucide-react';

const MainApp: React.FC = () => {
  const { manager, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedDailyDate, setSelectedDailyDate] = useState<string | undefined>(undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF9F1] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-[#0F2E22] text-amber-300 flex items-center justify-center shadow-lg mb-3">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <p className="font-serif font-bold text-stone-800 text-sm">HIsabkhata</p>
        <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0F2E22]" />
          নিরাপদ সংযোগ যাচাই হচ্ছে...
        </p>
      </div>
    );
  }

  if (!manager) {
    return <Login />;
  }

  const handleOpenDailyForDate = (date: string) => {
    setSelectedDailyDate(date);
    setActiveTab('daily');
  };

  return (
    <div className="min-h-screen bg-[#FBF9F1] text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Top Navbar */}
      <Navbar onOpenPasswordModal={() => setIsPasswordModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={setActiveTab}
              onOpenDailyDate={handleOpenDailyForDate}
            />
          )}

          {activeTab === 'daily' && (
            <DailyEntry
              key={selectedDailyDate || 'default-today'}
              initialDate={selectedDailyDate}
            />
          )}

          {activeTab === 'employees' && <EmployeeManagement />}

          {activeTab === 'targets' && <MonthlyTargets />}

          {activeTab === 'history' && (
            <DailyHistory onOpenDateForEdit={handleOpenDailyForDate} />
          )}

          {activeTab === 'reports' && <MonthlyReports />}

          {activeTab === 'backup' && <BackupRestore />}

          {activeTab === 'admin' && <AdminPanel />}

          {activeTab === 'settings' && (
            <Settings onOpenPasswordModal={() => setIsPasswordModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen || Boolean(manager?.mustChangePassword)}
        isMandatory={Boolean(manager?.mustChangePassword)}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
