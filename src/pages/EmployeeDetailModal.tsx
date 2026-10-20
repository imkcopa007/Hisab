import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatBDT, formatDateDhaka, formatMonthName } from '../lib/formatters';
import { X, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight, User, Phone, Briefcase, FileText } from 'lucide-react';
import { Employee, IncomeTransaction, ExpenseTransaction } from '../types';

interface Props {
  employee: Employee | null;
  onClose: () => void;
}

export const EmployeeDetailModal: React.FC<Props> = ({ employee, onClose }) => {
  const [data, setData] = useState<{
    lifetimeIncome: number;
    lifetimeExpenses: number;
    netBalance: number;
    recentIncomes: IncomeTransaction[];
    recentExpenses: ExpenseTransaction[];
    monthlyBreakdown: { monthKey: string; income: number; expenses: number; transactions: number }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employee) return;
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.employees.getHistory(employee.id);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'কর্মচারীর হিসাব লোড করা যায়নি');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [employee]);

  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0F2E22] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold font-serif text-sm">
              {employee.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-stone-100">{employee.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-amber-300 border border-amber-400/30">
                  {employee.id}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  employee.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-stone-500/20 text-stone-300'
                }`}>
                  {employee.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
              </div>
              <p className="text-xs text-stone-300">{employee.role}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Employee Basic Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-stone-500" />
              <span>মোবাইল: <strong className="font-mono">{employee.phone || 'দেওয়া নেই'}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-stone-500" />
              <span>সার্ভিস: <strong>{employee.serviceCategory}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-500" />
              <span>যোগদানের তারিখ: <strong className="font-mono">{formatDateDhaka(employee.joiningDate)}</strong></span>
            </div>
            {employee.notes && (
              <div className="sm:col-span-3 flex items-start gap-2 pt-2 border-t border-stone-200/60 text-stone-600">
                <FileText className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span>নোট: {employee.notes}</span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-stone-500">
              <RefreshCw className="w-6 h-6 animate-spin text-[#0F2E22] mb-2" />
              <p className="text-xs">হিসাব বিবরণী গণনা করা হচ্ছে...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Financial Lifetime Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-xs text-stone-500 block mb-1">সর্বমোট সার্ভিস আয় (Lifetime Income)</span>
                  <div className="text-xl font-bold font-mono text-stone-900">
                    {formatBDT(data.lifetimeIncome)}
                  </div>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-xs text-stone-500 block mb-1">মোট স্টাফ খরচ (Recorded Expenses)</span>
                  <div className="text-xl font-bold font-mono text-rose-700">
                    {formatBDT(data.lifetimeExpenses)}
                  </div>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-xs text-stone-500 block mb-1">নেট কন্ট্রিবিউশন (Net Balance)</span>
                  <div className={`text-xl font-bold font-mono ${data.netBalance >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                    {formatBDT(data.netBalance)}
                  </div>
                </div>
              </div>

              {/* Monthly Breakdown Table */}
              <div>
                <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  মাসভিত্তিক আয়ের রেকর্ড (Monthly Summary)
                </h4>
                <div className="border border-stone-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                      <tr>
                        <th className="py-2.5 px-3">মাস</th>
                        <th className="py-2.5 px-3 text-center">লেনদেন সংখ্যা</th>
                        <th className="py-2.5 px-3 text-right">মোট সেবা আয়</th>
                        <th className="py-2.5 px-3 text-right">স্টাফ খরচ</th>
                        <th className="py-2.5 px-3 text-right">নেট উদ্বৃত্ত</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {data.monthlyBreakdown.length > 0 ? (
                        data.monthlyBreakdown.map((m) => (
                          <tr key={m.monthKey} className="hover:bg-stone-50/60">
                            <td className="py-2.5 px-3 font-medium text-stone-900">
                              {formatMonthName(m.monthKey)}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono">{m.transactions}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-stone-900">
                              {formatBDT(m.income)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                              {formatBDT(m.expenses)}
                            </td>
                            <td className={`py-2.5 px-3 text-right font-mono font-semibold ${m.income - m.expenses >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                              {formatBDT(m.income - m.expenses)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-stone-400">
                            এখনও কোন পূর্ববর্তী মাসের লেনদেন নেই
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent 10 Income Transactions */}
              <div>
                <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  সাম্প্রতিক সার্ভিস এন্ট্রি (Recent Service Entries)
                </h4>
                <div className="border border-stone-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                      <tr>
                        <th className="py-2 px-3">তারিখ</th>
                        <th className="py-2 px-3">ক্যাটাগরি</th>
                        <th className="py-2 px-3">বিবরণ</th>
                        <th className="py-2 px-3">পেমেন্ট মাধ্যম</th>
                        <th className="py-2 px-3 text-right">পরিমাণ (BDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {data.recentIncomes.length > 0 ? (
                        data.recentIncomes.slice(0, 10).map((t) => (
                          <tr key={t.id} className="hover:bg-stone-50/50">
                            <td className="py-2 px-3 font-mono text-stone-700">{formatDateDhaka(t.businessDate)}</td>
                            <td className="py-2 px-3 text-stone-900">{t.category}</td>
                            <td className="py-2 px-3 text-stone-500">{t.description || '-'}</td>
                            <td className="py-2 px-3 font-mono text-stone-600">{t.paymentMethod}</td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-stone-900">
                              {formatBDT(t.amount)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-stone-400">
                            কোন লেনদেন পাওয়া যায়নি
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
