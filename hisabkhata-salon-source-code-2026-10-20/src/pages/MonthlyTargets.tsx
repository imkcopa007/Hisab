import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatBDT, formatMonthName, getCurrentMonthKey } from '../lib/formatters';
import { EmployeeTargetStatus } from '../types';
import { 
  Target, 
  Calendar, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  Save,
  X
} from 'lucide-react';

export const MonthlyTargets: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [targets, setTargets] = useState<EmployeeTargetStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit target modal state
  const [editingTarget, setEditingTarget] = useState<EmployeeTargetStatus | null>(null);
  const [targetAmountInput, setTargetAmountInput] = useState<number | ''>('');
  const [targetNotesInput, setTargetNotesInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchTargets = async (month: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.targets.getByMonth(month);
      setTargets(res.targets);
    } catch (err: any) {
      setError(err.message || 'টার্গেট তালিকা লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets(selectedMonth);
  }, [selectedMonth]);

  const openEditModal = (t: EmployeeTargetStatus) => {
    setEditingTarget(t);
    setTargetAmountInput(t.targetAmount || '');
    setTargetNotesInput(t.notes || '');
    setSaveError(null);
  };

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    if (targetAmountInput === '' || Number(targetAmountInput) < 0) {
      setSaveError('টার্গেটের পরিমাণ ০ বা তার বেশি হতে হবে');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      await api.targets.upsert({
        employeeId: editingTarget.employeeId,
        monthKey: selectedMonth,
        targetAmount: Number(targetAmountInput),
        notes: targetNotesInput,
      });
      setEditingTarget(null);
      await fetchTargets(selectedMonth);
    } catch (err: any) {
      setSaveError(err.message || 'টার্গেট সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Month Selector */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-[#0F2E22]" />
            মাসিক কর্মচারী লক্ষ্যমাত্রা (Monthly Income Targets)
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            প্রতিটি কর্মচারীর মাসিক সেবা আয়ের লক্ষ্যমাত্রা ও অর্জিত হিসাব (BDT ৳ ভিত্তিক)।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-stone-600">মাস নির্বাচন:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:bg-white cursor-pointer"
            />
          </div>

          <button
            onClick={() => fetchTargets(selectedMonth)}
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Notice about Accounting Rule */}
      <div className="p-4 bg-stone-50 border border-stone-200/90 rounded-xl flex items-start gap-3 text-xs text-stone-700">
        <HelpCircle className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>হিসাব নীতি:</strong> কর্মচারীর লক্ষ্যমাত্রায় কেবল সংশ্লিষ্ট কর্মচারীর ব্যক্তিগত সেবা আয় গণনা করা হয়। সাধারণ স্যালন বিক্রয় বা অন্যান্য স্টাফের আয় এতে অন্তর্ভুক্ত নয়। লক্ষ্যমাত্রা পূরণ হিসাব সম্পূর্ণ BDT অঙ্কে প্রদর্শিত হয়।
        </div>
      </div>

      {/* Targets Table / Cards */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center text-stone-500 bg-white rounded-xl border border-stone-200">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0F2E22] mb-2" />
          <p className="text-xs">টার্গেট হিসাব লোড হচ্ছে...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchTargets(selectedMonth)}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded font-medium"
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {targets.map((item) => {
            const isExceeded = item.status === 'exceeded';
            const isAchieved = item.status === 'achieved';
            const isNotReached = item.status === 'not_reached';
            const isNotSet = item.status === 'not_set';

            return (
              <div
                key={item.employeeId}
                className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-800/30 transition-all"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-stone-900">
                          {item.employeeName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                          {item.employeeId}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">{item.employeeRole}</div>
                    </div>

                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-stone-500 hover:text-emerald-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="টার্গেট নির্ধারণ বা সম্পাদনা করুন"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Financial Figures in BDT (strictly text-based, zero percentage) */}
                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-600">নির্ধারিত মাসিক লক্ষ্যমাত্রা (Target):</span>
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {item.targetAmount > 0 ? formatBDT(item.targetAmount) : 'নির্ধারিত হয়নি'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-600">চলতি মাসে অর্জিত সেবা আয় (Counted):</span>
                      <span className="font-mono font-bold text-emerald-800 text-sm">
                        {formatBDT(item.countedIncome)}
                      </span>
                    </div>

                    {item.targetAmount > 0 && (
                      <>
                        {isNotReached && (
                          <div className="flex items-center justify-between py-1 text-amber-900 bg-amber-50/80 px-2 rounded">
                            <span className="font-medium">লক্ষ্যমাত্রা পূরণে বাকি রয়েছে (Remaining):</span>
                            <span className="font-mono font-bold text-amber-900">
                              {formatBDT(item.remainingAmount)}
                            </span>
                          </div>
                        )}

                        {isExceeded && (
                          <div className="flex items-center justify-between py-1 text-emerald-950 bg-emerald-50 px-2 rounded">
                            <span className="font-medium">লক্ষ্যমাত্রার অতিরিক্ত আয় (Exceeded By):</span>
                            <span className="font-mono font-bold text-emerald-800">
                              + {formatBDT(item.excessAmount)}
                            </span>
                          </div>
                        )}

                        {isAchieved && (
                          <div className="flex items-center justify-between py-1 text-emerald-950 bg-emerald-50 px-2 rounded">
                            <span className="font-medium">লক্ষ্যমাত্রা সফলভাবে সম্পূর্ণ:</span>
                            <span className="font-mono font-bold text-emerald-800">
                              {formatBDT(item.countedIncome)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Status Indicator & Notes Footer */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div>
                    {isNotSet && (
                      <span className="text-stone-500 font-medium">লক্ষ্য নির্ধারণ করা হয়নি</span>
                    )}
                    {isNotReached && (
                      <span className="inline-flex items-center gap-1 text-amber-800 font-semibold bg-amber-100 px-2.5 py-0.5 rounded-full text-[11px]">
                        <Clock className="w-3 h-3 text-amber-700" />
                        টার্গেট এখনও অপূর্ণ (বাকি {formatBDT(item.remainingAmount)})
                      </span>
                    )}
                    {isAchieved && (
                      <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        টার্গেট যথাযথভাবে অর্জিত
                      </span>
                    )}
                    {isExceeded && (
                      <span className="inline-flex items-center gap-1 text-emerald-900 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
                        <Sparkles className="w-3 h-3 text-emerald-700" />
                        টার্গেট সফলভাবে অতিক্রম ({formatBDT(item.excessAmount)} অতিরিক্ত)
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openEditModal(item)}
                    className="text-xs font-semibold text-[#0F2E22] hover:underline cursor-pointer"
                  >
                    {item.targetAmount > 0 ? 'টার্গেট পরিবর্তন' : '+ টার্গেট দিন'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Target Modal */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-[#0F2E22] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-100">
                  মাসিক আয়ের লক্ষ্যমাত্রা নির্ধারণ
                </h3>
                <p className="text-xs text-stone-300">
                  {editingTarget.employeeName} ({editingTarget.employeeId}) &bull; {formatMonthName(selectedMonth)}
                </p>
              </div>
              <button
                onClick={() => setEditingTarget(null)}
                className="text-stone-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTarget} className="p-6 space-y-4">
              {saveError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
                  {saveError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  মাসিক আয়ের টার্গেট (Target in BDT ৳) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={targetAmountInput}
                  onChange={(e) => setTargetAmountInput(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="যেমন: 50000"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm font-mono font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:bg-white"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  এই মাসে এই স্টাফ থেকে প্রত্যাশিত সেবা রাজস্বের পরিমাণ
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  নোট বা মন্তব্য (Optional Notes)
                </label>
                <textarea
                  rows={2}
                  value={targetNotesInput}
                  onChange={(e) => setTargetNotesInput(e.target.value)}
                  placeholder="টার্গেটের ভিত্তি বা বিশেষ বোনাস সম্পর্কিত নোট..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#0F2E22] hover:bg-[#16423C] text-amber-300 font-semibold text-xs rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'টার্গেট সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
