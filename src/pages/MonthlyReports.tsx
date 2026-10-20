import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatBDT, formatMonthName, formatDateDhaka, getCurrentMonthKey } from '../lib/formatters';
import { MonthlyReportData } from '../types';
import { 
  FileSpreadsheet, 
  Calendar, 
  Printer, 
  Download, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Award, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  FileText
} from 'lucide-react';

export const MonthlyReports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [report, setReport] = useState<MonthlyReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (month: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.reports.getMonthly(month);
      setReport(res);
    } catch (err: any) {
      setError(err.message || 'মাসিক রিপোর্ট লোড করা যায়নি');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedMonth);
  }, [selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    window.open(`/api/backup/export?format=csv`, '_blank');
  };

  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hisabkhata-report-${selectedMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Control Header (hidden on print) */}
      <div className="print:hidden bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#0F2E22]" />
            মাসিক হিসাব বিবরণী ও নিরীক্ষা রিপোর্ট (Monthly Financial Report)
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            আয়, ব্যয়, কর্মচারীদের লক্ষ্যমাত্রা অর্জন ও দৈনিক হিসাবের পূর্ণাঙ্গ নথি।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-stone-600">মাস:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:bg-white cursor-pointer"
            />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F2E22] hover:bg-[#16423C] text-amber-300 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট / PDF সেভ করুন</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="CSV ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="JSON ডাউনলোড করুন"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center text-stone-500 bg-white rounded-xl border border-stone-200">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0F2E22] mb-2" />
          <p className="text-xs">রিপোর্ট প্রস্তুত হচ্ছে...</p>
        </div>
      ) : error || !report ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error || 'রিপোর্ট লোড করা সম্ভব হয়নি'}</span>
          </div>
          <button
            onClick={() => fetchReport(selectedMonth)}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded font-medium"
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      ) : (
        /* PRINTABLE REPORT SHEET */
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm print:shadow-none print:border-none print:p-0 space-y-6">
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-[#0F2E22] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono tracking-widest uppercase text-amber-800 font-bold mb-1">
                Official Financial Statement &bull; HIsabkhata
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#0F2E22]">
                Noble Reflxion Lifestyle Salon
              </h2>
              <p className="text-xs text-stone-600 mt-1 font-sans">
                প্রিমিয়াম সেলুন অ্যাকাউন্টিং ও নিরীক্ষা স্টেটমেন্ট
              </p>
            </div>

            <div className="text-left sm:text-right text-xs">
              <div className="text-stone-500">প্রতিবেদন সময়কাল (Period):</div>
              <div className="font-bold text-stone-900 text-base font-serif">
                {formatMonthName(report.monthKey)}
              </div>
              <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                রিপোর্ট তৈরি: {formatDateDhaka(new Date().toISOString().split('T')[0])}
              </div>
            </div>
          </div>

          {/* Key Executive Summary (Strict Accounting Labels: Gross Income, Total Expenses, Net Balance) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70">
              <div className="text-xs font-semibold text-stone-600 flex items-center justify-between">
                <span>মোট মোট স্যালন রাজস্ব (Gross Revenue)</span>
                <TrendingUp className="w-4 h-4 text-emerald-800" />
              </div>
              <div className="text-2xl font-serif font-bold text-stone-900 font-mono mt-1">
                {formatBDT(report.totalIncome)}
              </div>
              <div className="text-[11px] text-stone-500 mt-1 flex justify-between">
                <span>স্টাফ সেবা: {formatBDT(report.totalEmployeeIncome)}</span>
                <span>স্যালন সরাসরি: {formatBDT(report.totalSalonLevelIncome)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70">
              <div className="text-xs font-semibold text-stone-600 flex items-center justify-between">
                <span>মোট রেকর্ডকৃত ব্যয় (Total Expenses)</span>
                <TrendingDown className="w-4 h-4 text-rose-700" />
              </div>
              <div className="text-2xl font-serif font-bold text-rose-700 font-mono mt-1">
                {formatBDT(report.totalExpenses)}
              </div>
              <div className="text-[11px] text-stone-500 mt-1 flex justify-between">
                <span>স্টাফ খরচ: {formatBDT(report.totalEmployeeExpenses)}</span>
                <span>সাধারণ খরচ: {formatBDT(report.totalGeneralExpenses)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#0F2E22] bg-[#0F2E22]/5">
              <div className="text-xs font-semibold text-[#0F2E22] flex items-center justify-between">
                <span>নেট রেকর্ডকৃত ব্যালেন্স (Net Balance)</span>
                <Wallet className="w-4 h-4 text-[#0F2E22]" />
              </div>
              <div className={`text-2xl font-serif font-bold font-mono mt-1 ${report.netBalance >= 0 ? 'text-emerald-900' : 'text-rose-700'}`}>
                {formatBDT(report.netBalance)}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                {report.netBalance >= 0 ? 'মোট উদ্বৃত্ত ক্যাশ' : 'ঘাটতি'} (আয় - ব্যয়)
              </div>
            </div>
          </div>

          {/* Highlights: Peak Day & Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.peakDay && (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-800 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-amber-900 font-semibold">
                    সর্বোচ্চ আয়ের দিন (Peak Revenue Day):
                  </div>
                  <div className="text-sm font-mono font-bold text-stone-900">
                    {formatDateDhaka(report.peakDay.date)} — মোট আয়: {formatBDT(report.peakDay.income)}
                  </div>
                </div>
              </div>
            )}

            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-around text-center text-xs">
              <div>
                <div className="text-stone-500">ক্লোজড দিন সংখ্যা</div>
                <div className="font-mono font-bold text-base text-stone-800">{report.closingsCount} দিন</div>
              </div>
              <div className="h-8 w-px bg-stone-300"></div>
              <div>
                <div className="text-stone-500">আয় লেনদেন</div>
                <div className="font-mono font-bold text-base text-emerald-800">{report.incomeTransactionsCount} টি</div>
              </div>
              <div className="h-8 w-px bg-stone-300"></div>
              <div>
                <div className="text-stone-500">ব্যয় লেনদেন</div>
                <div className="font-mono font-bold text-base text-rose-700">{report.expenseTransactionsCount} টি</div>
              </div>
            </div>
          </div>

          {/* SECTION 1: EMPLOYEE-WISE MONTHLY BREAKDOWN & TARGET PERFORMANCE (NO PERCENTAGES) */}
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F2E22]"></span>
              ১. কর্মচারীভিত্তিক আয়, ব্যয় ও লক্ষ্যমাত্রা বিবরণী (Staff Financials & Targets)
            </h3>
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">স্টাফ নাম ও পদবী</th>
                    <th className="py-2.5 px-3 text-center">সার্ভিস সংখ্যা</th>
                    <th className="py-2.5 px-3 text-right">অর্জিত সেবা আয়</th>
                    <th className="py-2.5 px-3 text-right">স্টাফ খরচ</th>
                    <th className="py-2.5 px-3 text-right">নির্ধারিত টার্গেট</th>
                    <th className="py-2.5 px-3 text-right">টার্গেট স্থিতি (বাকি / অতিরিক্ত)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {report.employeeBreakdown.map((row) => (
                    <tr key={row.employee.id} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-stone-900">{row.employee.name}</div>
                        <div className="text-[11px] text-stone-500">{row.employee.role} ({row.employee.id})</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{row.transactionCount}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                        {formatBDT(row.countedIncome)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                        {formatBDT(row.recordedExpenses)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-stone-700">
                        {row.targetAmount > 0 ? formatBDT(row.targetAmount) : 'নির্ধারিত নয়'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">
                        {row.targetStatus === 'exceeded' && (
                          <span className="text-emerald-800 font-bold">
                            + {formatBDT(row.excessAmount)} (অতিরিক্ত)
                          </span>
                        )}
                        {row.targetStatus === 'achieved' && (
                          <span className="text-emerald-800 font-bold">
                            সম্পূর্ণ অর্জিত
                          </span>
                        )}
                        {row.targetStatus === 'not_reached' && (
                          <span className="text-amber-800">
                            বাকি: {formatBDT(row.remainingAmount)}
                          </span>
                        )}
                        {row.targetStatus === 'not_set' && (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: DAILY SUMMARY TABLE FOR THE MONTH */}
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F2E22]"></span>
              ২. দৈনিক ক্লোজিং হিসাব তালিকা (Daily Closings Log)
            </h3>
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">তারিখ</th>
                    <th className="py-2.5 px-3 text-right">স্টাফ সেবা আয়</th>
                    <th className="py-2.5 px-3 text-right">স্যালন বিক্রয় আয়</th>
                    <th className="py-2.5 px-3 text-right">মোট দৈনিক আয়</th>
                    <th className="py-2.5 px-3 text-right">মোট দৈনিক ব্যয়</th>
                    <th className="py-2.5 px-3 text-right">নেট ব্যালেন্স (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {report.dailyClosings.length > 0 ? (
                    report.dailyClosings.map((closing) => (
                      <tr key={closing.id}>
                        <td className="py-2.5 px-3 font-mono font-medium text-stone-900">
                          {formatDateDhaka(closing.businessDate)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-stone-700">
                          {formatBDT(closing.totalEmployeeIncome)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-stone-700">
                          {formatBDT(closing.totalSalonLevelIncome)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                          {formatBDT(closing.totalIncome)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                          {formatBDT(closing.totalExpenses)}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono font-bold ${closing.netBalance >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                          {formatBDT(closing.netBalance)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-stone-400">
                        এই মাসে কোনো দৈনিক ক্লোজিং রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formal Audit & Signatures Footer for Print */}
          <div className="pt-8 border-t border-stone-300 mt-8 grid grid-cols-2 gap-8 text-xs text-stone-600">
            <div>
              <div className="border-b border-stone-400 w-48 mb-1"></div>
              <div className="font-semibold text-stone-800">ম্যানেজারের স্বাক্ষর (Manager's Signature)</div>
              <div className="text-[10px] text-stone-500">Md. Imran &bull; Noble Reflxion Lifestyle Salon</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="border-b border-stone-400 w-48 mb-1"></div>
              <div className="font-semibold text-stone-800">মালিক / পরিচালকের স্বাক্ষর (Authorized Owner)</div>
              <div className="text-[10px] text-stone-500">হিসাব নিরীক্ষিত ও অনুমোদিত</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
