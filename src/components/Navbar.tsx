import React from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDateDhaka, getTodayDateString } from '../lib/formatters';
import { Sparkles, Calendar, User, LogOut, ShieldAlert, KeyRound } from 'lucide-react';

interface Props {
  onOpenPasswordModal: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenPasswordModal }) => {
  const { manager, logout } = useAuth();
  const todayStr = getTodayDateString();

  return (
    <header className="bg-[#0F2E22] text-stone-100 border-b border-amber-900/40 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg tracking-wide text-amber-100">
                  HIsabkhata
                </span>
                <span className="text-[10px] tracking-widest font-mono uppercase bg-amber-400/15 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                  BDT ৳
                </span>
              </div>
              <p className="text-xs text-stone-300 font-light hidden sm:block">
                Noble Reflxion Lifestyle Salon
              </p>
            </div>
          </div>

          {/* Center: Live Date in Asia/Dhaka */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-xs text-stone-200">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium text-stone-300">আজকের তারিখ:</span>
            <span className="font-mono font-medium text-amber-200">{formatDateDhaka(todayStr)}</span>
            <span className="text-[10px] text-stone-400 font-mono">(ঢাকা সময়)</span>
          </div>

          {/* Right: Manager Profile & Actions */}
          <div className="flex items-center gap-3">
            {manager?.mustChangePassword && (
              <button
                onClick={onOpenPasswordModal}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-300 hover:bg-amber-200 rounded-md transition-colors animate-pulse"
                title="প্রাথমিক পাসওয়ার্ড পরিবর্তন করুন"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">পাসওয়ার্ড পরিবর্তন করুন</span>
              </button>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-emerald-800/60">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-medium text-stone-100">{manager?.fullName || 'Salon Manager'}</div>
                <div className="text-[11px] font-mono text-amber-300/80">ID: {manager?.loginIdentifier}</div>
              </div>
              
              <button
                onClick={onOpenPasswordModal}
                title="পাসওয়ার্ড বা সিকিউরিটি পরিবর্তন"
                className="p-2 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/80 text-stone-300 hover:text-amber-300 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
              </button>

              <button
                onClick={logout}
                title="লগআউট (Logout)"
                className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-stone-300 hover:text-rose-300 border border-rose-900/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
