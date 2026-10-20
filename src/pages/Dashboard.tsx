import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatBDT, formatDateDhaka, formatMonthName } from '../lib/formatters';
import { NavTab } from '../components/Sidebar';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Users, 
  PlusCircle, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  History, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface Props {
  onNavigate: (tab: NavTab) => void;
  onOpenDailyDate?: (date: string) => void;
}

export const Dashboard: React.FC<Props> = ({ onNavigate, onOpenDailyDate }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.dashboard.getSummary();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'ড্যাশবোর্ড ডেটা লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0F2E22]" />
          <p className="text-xs font-medium">হিসাব বিবরণী লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error || 'ডেটা লোড করা যায়নি'}</span>
          </div>
          <button
            onClick={fetchDashboard}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded font-medium"
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }

  const { today, month, todayDate, currentMonthKey, activeEmployeesCount, totalEmployeesCount, employeeTodaySummary, recentClosings } = data;

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            স্যালন ড্যাশবোর্ড ও হিসাব বিবরণী
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            আজকের তারিখ: <strong className="font-mono text-stone-800">{formatDateDhaka(todayDate)}</strong> &bull; {formatMonthName(currentMonthKey)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('daily')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F2E22] hover:bg-[#16423C] text-amber-300 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>আজকের দৈনিক হিসাব লিখুন</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
            <span>মাসিক রিপোর্ট</span>
          </button>

          <button
            onClick={fetchDashboard}
            className="p-2 bg-white hover:bg-stone-50 text-stone-600 border border-stone-300 rounded-lg transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TODAY'S METRICS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            আজকের দৈনিক আর্থিক অবস্থা (Today's Balance - {formatDateDhaka(todayDate)})
          </h2>
          {today.isClosed ? (
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/80 border border-emerald-300/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              আজকের দিনটি সাবমিট ও ক্লোজ করা হয়েছে
            </span>
          ) : (
            <span className="text-[11px] font-medium text-amber-800 bg-amber-100/80 border border-amber-300/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-700" />
              চলতি হিসাব (দিন ক্লোজ করা বাকি)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today Income */}
          <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs hover:border-emerald-700/40 transition-colors">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium">আজকের মোট আয় (Income)</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-bold text-stone-900 font-mono tracking-tight">
              {formatBDT(today.totalIncome)}
            </div>
            <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
              <span>স্টাফ সার্ভিস: {formatBDT(today.employeeIncome)}</span>
              <span>স্যালন সরাসরি: {formatBDT(today.salonLevelIncome)}</span>
            </div>
          </div>

          {/* Today Expenses */}
          <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs hover:border-rose-700/40 transition-colors">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium">আজকের মোট ব্যয় (Expenses)</span>
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-bold text-rose-700 font-mono tracking-tight">
              {formatBDT(today.totalExpenses)}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              স্টাফ খরচ ও স্যালন পরিচালনা ব্যয়
            </p>
          </div>

          {/* Today Net Balance */}
          <div className="bg-[#0F2E22] text-white p-4 rounded-xl border border-emerald-900 shadow-md">
            <div className="flex items-center justify-between text-stone-300 mb-2">
              <span className="text-xs font-medium text-amber-200">আজকের নেট ব্যালেন্স (Net Cash)</span>
              <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-bold text-stone-50 font-mono tracking-tight">
              {formatBDT(today.netBalance)}
            </div>
            <p className="text-[11px] text-stone-300 mt-1 font-light">
              আয় থেকে ব্যয় বাদ দিয়ে হাতে থাকা অর্থ
            </p>
          </div>

          {/* Total Employees */}
          <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium">স্যালন কর্মচারীবৃন্দ (Staff)</span>
              <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-serif font-bold text-stone-900 font-mono tracking-tight">
              {totalEmployeesCount} <span className="text-xs font-normal text-stone-500 font-sans">জন স্টাফ</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
              <span>স্টাফ রোস্টার ও হিসাব</span>
              <button
                onClick={() => onNavigate('employees')}
                className="text-emerald-800 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                যোগ / রিমুভ <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CURRENT MONTH TOTALS */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-500" />
            চলতি মাসের হিসাব (Monthly Totals — {formatMonthName(currentMonthKey)})
          </h2>
          <span className="text-xs text-stone-500 font-mono">
            {month.closingsCount} টি দৈনিক ক্লোজিং নথিভুক্ত
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 bg-white rounded-lg border border-stone-200">
            <div className="text-xs text-stone-500">মাসের মোট আয় (Monthly Revenue)</div>
            <div className="text-xl font-bold font-mono text-stone-900 mt-1">
              {formatBDT(month.totalIncome)}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              স্টাফ আয়: {formatBDT(month.totalEmployeeIncome)}
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-lg border border-stone-200">
            <div className="text-xs text-stone-500">মাসের মোট ব্যয় (Monthly Expenses)</div>
            <div className="text-xl font-bold font-mono text-rose-700 mt-1">
              {formatBDT(month.totalExpenses)}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              সাধারণ ও স্টাফ ব্যয়সহ
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-lg border border-stone-200">
            <div className="text-xs text-stone-500">মাসের নেট স্থিতি (Monthly Net Balance)</div>
            <div className={`text-xl font-bold font-mono mt-1 ${month.netBalance >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
              {formatBDT(month.netBalance)}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              {month.netBalance >= 0 ? 'লাভজনক উদ্বৃত্ত' : 'ঘাটতি'}
            </div>
          </div>
        </div>
      </div>

      {/* TODAY'S EMPLOYEE-WISE INCOME SUMMARY */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-sm">
              আজকের কর্মচারীভিত্তিক সেবা ও আয় বিবরণী (Today's Staff Breakdown)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              আজকে কোন স্টাফ কত টাকার সার্ভিস প্রদান করেছেন ও কত টাকা খরচ হয়েছে
            </p>
          </div>
          <button
            onClick={() => onNavigate('daily')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            হিসাব এন্ট্রি করুন <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">আইডি ও নাম</th>
                <th className="py-3 px-4">পদবী (Role)</th>
                <th className="py-3 px-4 text-center">সার্ভিস সংখ্যা</th>
                <th className="py-3 px-4 text-right">আজকের সার্ভিস আয় (BDT)</th>
                <th className="py-3 px-4 text-right">আজকের খরচ (BDT)</th>
                <th className="py-3 px-4 text-right">নেট আয় (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {employeeTodaySummary && employeeTodaySummary.length > 0 ? (
                employeeTodaySummary.map((emp: any) => (
                  <tr key={emp.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{emp.name}</div>
                      <div className="text-[11px] font-mono text-stone-500">{emp.id}</div>
                    </td>
                    <td className="py-3 px-4 text-stone-600">{emp.role}</td>
                    <td className="py-3 px-4 text-center font-mono">{emp.transactionCount}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-stone-900">
                      {formatBDT(emp.income)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-700">
                      {formatBDT(emp.expenses)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-semibold ${emp.net >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                      {formatBDT(emp.net)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400">
                    কোন সক্রিয় কর্মচারী পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT DAILY RECORDS */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-sm">
              সাম্প্রতিক দৈনিক হিসাব খাতা (Recent Daily Records)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              পূর্বে সাবমিট করা দিনগুলোর সারসংক্ষেপ
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            সব খাতা দেখুন <History className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">তারিখ (Date)</th>
                <th className="py-3 px-4 text-right">মোট আয়</th>
                <th className="py-3 px-4 text-right">মোট ব্যয়</th>
                <th className="py-3 px-4 text-right">নেট ব্যালেন্স</th>
                <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentClosings && recentClosings.length > 0 ? (
                recentClosings.map((closing: any) => (
                  <tr key={closing.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-stone-800">
                      {formatDateDhaka(closing.businessDate)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-stone-900">
                      {formatBDT(closing.totalIncome)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-700">
                      {formatBDT(closing.totalExpenses)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${closing.netBalance >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                      {formatBDT(closing.netBalance)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> ক্লোজড
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (onOpenDailyDate) onOpenDailyDate(closing.businessDate);
                          onNavigate('daily');
                        }}
                        className="text-xs text-[#0F2E22] font-semibold hover:underline cursor-pointer"
                      >
                        বিস্তারিত / এডিট
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400">
                    এখনও কোন পূর্ববর্তী দিনের ক্লোজিং রেকর্ড নেই। আজকের হিসাব এন্ট্রি করে সাবমিট করুন।
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
