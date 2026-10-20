import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { formatDateDhaka } from '../lib/formatters';
import { SalonSettings, AuditLog } from '../types';
import { 
  Settings as SettingsIcon, 
  Lock, 
  ShieldCheck, 
  Tag, 
  Clock, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  LogOut,
  User,
  ShieldAlert
} from 'lucide-react';

interface Props {
  onOpenPasswordModal: () => void;
}

export const Settings: React.FC<Props> = ({ onOpenPasswordModal }) => {
  const { manager, logout } = useAuth();
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // New category inputs
  const [newIncomeCat, setNewIncomeCat] = useState('');
  const [newExpenseCat, setNewExpenseCat] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [sets, logs] = await Promise.all([
        api.settings.get(),
        api.auditLogs.getAll(),
      ]);
      setSettings(sets);
      setAuditLogs(logs);
    } catch (err: any) {
      setError(err.message || 'সেটিংস লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddIncomeCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncomeCat.trim() || !settings) return;

    const updatedCategories = [...settings.incomeCategories, newIncomeCat.trim()];
    try {
      const res = await api.settings.update({ incomeCategories: updatedCategories });
      setSettings(res);
      setNewIncomeCat('');
      setSaveSuccess('নতুন আয়ের ক্যাটাগরি যুক্ত করা হয়েছে');
      setTimeout(() => setSaveSuccess(null), 2500);
    } catch (err: any) {
      alert(err.message || 'ক্যাটাগরি যুক্ত করতে ব্যর্থ হয়েছে');
    }
  };

  const handleAddExpenseCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseCat.trim() || !settings) return;

    const updatedCategories = [...settings.expenseCategories, newExpenseCat.trim()];
    try {
      const res = await api.settings.update({ expenseCategories: updatedCategories });
      setSettings(res);
      setNewExpenseCat('');
      setSaveSuccess('নতুন ব্যয়ের ক্যাটাগরি যুক্ত করা হয়েছে');
      setTimeout(() => setSaveSuccess(null), 2500);
    } catch (err: any) {
      alert(err.message || 'ক্যাটাগরি যুক্ত করতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-[#0F2E22]" />
            সেটিংস ও নিরাপত্তা (Settings & Security)
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            ম্যানেজার পাসওয়ার্ড পরিবর্তন, স্যালন কনফিগারেশন এবং অডিট হিস্টোরি।
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>লগআউট (Logout)</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Grid: Manager Security & Salon Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manager Profile & Security Card */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
              <User className="w-5 h-5 text-[#0F2E22]" />
              ম্যানেজার অ্যাকাউন্ট তথ্য (Manager Security)
            </div>
            <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              Authorized
            </span>
          </div>

          <div className="space-y-2 text-xs text-stone-700">
            <div className="flex justify-between py-1.5 border-b border-stone-50">
              <span className="text-stone-500">ম্যানেজার নাম:</span>
              <strong className="text-stone-900">{manager?.fullName}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-50">
              <span className="text-stone-500">লগইন আইডি / ফোন:</span>
              <strong className="font-mono text-stone-900">{manager?.loginIdentifier}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-50">
              <span className="text-stone-500">অনুমোদিত রোল:</span>
              <span className="uppercase font-mono text-[11px] bg-stone-100 px-2 py-0.5 rounded">
                {manager?.role}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-stone-500">সর্বশেষ লগইন:</span>
              <span className="font-mono text-stone-700">
                {manager?.lastLoginAt ? new Date(manager.lastLoginAt).toLocaleString('en-GB') : 'বর্তমান সেশন'}
              </span>
            </div>
          </div>

          {manager?.mustChangePassword && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>নিরাপত্তা নোটিশ:</strong> আপনি এখনও প্রাথমিক পাসওয়ার্ড ব্যবহার করছেন। এখনই পাসওয়ার্ড পরিবর্তন করুন।
              </span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onOpenPasswordModal}
              className="w-full py-2.5 bg-[#0F2E22] hover:bg-[#16423C] text-amber-300 font-semibold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>পাসওয়ার্ড পরিবর্তন করুন (Change Password)</span>
            </button>
          </div>
        </div>

        {/* Salon System Information */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base pb-3 border-b border-stone-100">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            স্যালন সিস্টেম কনফিগারেশন (System Info)
          </div>

          <div className="space-y-2 text-xs text-stone-700">
            <div className="flex justify-between py-1.5 border-b border-stone-50">
              <span className="text-stone-500">প্রতিষ্ঠান:</span>
              <strong className="text-stone-900">{settings?.salonName}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-50">
              <span className="text-stone-500">অ্যাপ্লিকেশন:</span>
              <strong className="text-stone-900">{settings?.appName}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-50">
              <span className="text-stone-500">প্রাথমিক মুদ্রা (Currency):</span>
              <strong className="font-mono text-emerald-800">BDT (৳) — বাংলাদেশী টাকা</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-50">
              <span className="text-stone-500">সময় অঞ্চল (Timezone):</span>
              <strong className="font-mono text-stone-800">{settings?.timezone} (ঢাকা)</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-stone-500">আর্কিটেকচার:</span>
              <span className="text-stone-700">Persistent Cloud Database & Session Auth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
          <h3 className="font-serif font-bold text-stone-900 text-sm mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-700" />
            সেবা ও আয়ের ক্যাটাগরি তালিকা (Income Categories)
          </h3>
          <ul className="space-y-1.5 mb-4 max-h-48 overflow-y-auto text-xs text-stone-800">
            {settings?.incomeCategories?.map((cat, idx) => (
              <li key={idx} className="p-2 bg-stone-50 rounded border border-stone-200/80 flex items-center justify-between">
                <span>{cat}</span>
                <span className="text-[10px] font-mono text-stone-400">#{idx + 1}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddIncomeCategory} className="flex gap-2">
            <input
              type="text"
              value={newIncomeCat}
              onChange={(e) => setNewIncomeCat(e.target.value)}
              placeholder="নতুন সার্ভিস ক্যাটাগরি নাম..."
              className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-[#0F2E22] text-amber-300 rounded-lg text-xs font-semibold cursor-pointer"
            >
              + যোগ করুন
            </button>
          </form>
        </div>

        {/* Expense Categories */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
          <h3 className="font-serif font-bold text-stone-900 text-sm mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-rose-700" />
            ব্যয়ের ক্যাটাগরি তালিকা (Expense Categories)
          </h3>
          <ul className="space-y-1.5 mb-4 max-h-48 overflow-y-auto text-xs text-stone-800">
            {settings?.expenseCategories?.map((cat, idx) => (
              <li key={idx} className="p-2 bg-stone-50 rounded border border-stone-200/80 flex items-center justify-between">
                <span>{cat}</span>
                <span className="text-[10px] font-mono text-stone-400">#{idx + 1}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddExpenseCategory} className="flex gap-2">
            <input
              type="text"
              value={newExpenseCat}
              onChange={(e) => setNewExpenseCat(e.target.value)}
              placeholder="নতুন ব্যয়ের ক্যাটাগরি নাম..."
              className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-rose-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              + যোগ করুন
            </button>
          </form>
        </div>
      </div>

      {/* Audit Trail Viewer */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-600" />
              অডিট ট্রেইল ও নিরাপত্তা লগ (Recent Audit Trail)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              হিসাব সংশোধন, দৈনিক ক্লোজিং এবং কর্মচারী পরিবর্তনের সময়ানুক্রমিক রেকর্ড।
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-1.5 text-stone-600 hover:text-stone-900 rounded cursor-pointer"
            title="রিফ্রেশ"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4">সময় (Timestamp)</th>
                <th className="py-2.5 px-4">অ্যাকশন</th>
                <th className="py-2.5 px-4">বিবরণ (Details)</th>
                <th className="py-2.5 px-4">কর্তা (Actor)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-4 font-mono text-stone-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString('en-GB')}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-medium text-stone-900">
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-stone-700">{log.details}</td>
                    <td className="py-2.5 px-4 font-mono text-stone-500 text-[11px]">{log.actorId}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-stone-400">
                    কোন অডিট লগ রেকর্ড নেই
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
