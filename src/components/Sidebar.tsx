import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Users, 
  Target, 
  History, 
  FileSpreadsheet, 
  Database, 
  Settings as SettingsIcon,
  ShieldCheck 
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'daily' 
  | 'employees' 
  | 'targets' 
  | 'history' 
  | 'reports' 
  | 'backup' 
  | 'admin'
  | 'settings';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const navItems: { id: NavTab; labelBn: string; labelEn: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', labelBn: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily', labelBn: 'দৈনিক হিসাব', labelEn: 'Daily Entry', icon: ReceiptText },
    { id: 'employees', labelBn: 'কর্মচারীবৃন্দ', labelEn: 'Staff & Stylists', icon: Users },
    { id: 'targets', labelBn: 'মাসিক টার্গেট', labelEn: 'Monthly Targets', icon: Target },
    { id: 'history', labelBn: 'হিসাব খাতা', labelEn: 'Daily History', icon: History },
    { id: 'reports', labelBn: 'মাসিক রিপোর্ট', labelEn: 'Monthly Reports', icon: FileSpreadsheet },
    { id: 'backup', labelBn: 'ব্যাকআপ ও রিস্টোর', labelEn: 'Backup & Data', icon: Database },
    { id: 'admin', labelBn: 'এডমিন প্যানেল', labelEn: 'Admin Panel & Source', icon: ShieldCheck },
    { id: 'settings', labelBn: 'সেটিংস', labelEn: 'Settings & Security', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#F7F5EE] border-r border-stone-200/90 min-h-[calc(100vh-4rem)] p-4 shrink-0 shadow-xs">
        <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider px-3 mb-2 font-mono">
          মূল মেনু (Navigation)
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-all text-xs font-medium ${
                  isActive
                    ? 'bg-[#0F2E22] text-amber-200 shadow-sm font-semibold'
                    : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-stone-500'}`} />
                <div className="flex-1 truncate">
                  <div className="leading-tight">{item.labelBn}</div>
                  <div className={`text-[10px] ${isActive ? 'text-amber-300/80' : 'text-stone-500'}`}>
                    {item.labelEn}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-stone-200/90 px-3">
          <div className="bg-[#0F2E22]/5 rounded-lg p-3 border border-stone-200/70">
            <div className="text-[11px] font-semibold text-[#0F2E22]">Noble Reflxion</div>
            <div className="text-[10px] text-stone-600">Lifestyle Salon Accounts</div>
            <div className="text-[9px] font-mono text-stone-600 mt-1">Authorized Manager Session</div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom / Horizontal Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F2E22] text-stone-200 border-t border-amber-900/40 px-2 py-1 flex items-center justify-around shadow-xl">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors ${
                isActive ? 'text-amber-300 font-semibold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-tight">{item.labelBn}</span>
            </button>
          );
        })}
        {/* Overflow dropdown / button for mobile */}
        <button
          onClick={() => onTabChange(activeTab === 'reports' ? 'backup' : 'reports')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-md ${
            ['reports', 'backup', 'settings'].includes(activeTab) ? 'text-amber-300 font-semibold' : 'text-stone-400'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-tight">অন্যান্য</span>
        </button>
      </div>
    </>
  );
};
