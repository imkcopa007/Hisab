import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatBDT, formatDateDhaka, formatMonthName } from '../lib/formatters';
import { DailyClosing, IncomeTransaction, ExpenseTransaction } from '../types';
import { 
  History, 
  Calendar, 
  Search, 
  CheckCircle2, 
  Printer, 
  Edit3, 
  Eye, 
  RefreshCw, 
  AlertCircle, 
  X,
  FileSpreadsheet
} from 'lucide-react';

interface Props {
  onOpenDateForEdit: (date: string) => void;
}

export const DailyHistory: React.FC<Props> = ({ onOpenDateForEdit }) => {
  const [closings, setClosings] = useState<DailyClosing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('2026');
  const [searchDate, setSearchDate] = useState<string>('');

  // Day detail modal
  const [viewingDate, setViewingDate] = useState<string | null>(null);
  const [viewingData, setViewingData] = useState<{
    income: IncomeTransaction[];
    expenses: ExpenseTransaction[];
    closing?: DailyClosing;
  } | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.history.getAll(filterMonth, filterYear);
      setClosings(res);
    } catch (err: any) {
      setError(err.message || 'পূর্ববর্তী হিসাব খাতা লোড করা যায়নি');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterMonth, filterYear]);

  const handleOpenDetail = async (date: string) => {
    try {
      setViewingDate(date);
      setIsDetailLoading(true);
      const res = await api.daily.getByDate(date);
      setViewingData(res);
    } catch (err: any) {
      alert(err.message || 'দিনের রেকর্ড লোড ব্যর্থ হয়েছে');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handlePrintDailyVoucher = () => {
    window.print();
  };

  const filteredClosings = closings.filter((c) => {
    if (searchDate) {
      return c.businessDate.includes(searchDate);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <History className="w-6 h-6 text-[#0F2E22]" />
            পূর্ববর্তী হিসাব খাতা (Daily Closing History & Archives)
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            পূর্বে ক্লোজ করা দিনগুলোর বিবরণ, ভাউচার প্রিন্ট এবং অডিট ট্রেইল সংবলিত সংশোধন।
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-600 transition-colors self-start sm:self-auto cursor-pointer"
          title="রিফ্রেশ করুন"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-600">বছর:</span>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-stone-800"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-600">মাস:</span>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800"
            >
              <option value="">সকল মাস (All Months)</option>
              <option value="01">জানুয়ারি (January)</option>
              <option value="02">ফেব্রুয়ারি (February)</option>
              <option value="03">মার্চ (March)</option>
              <option value="04">এপ্রিল (April)</option>
              <option value="05">মে (May)</option>
              <option value="06">জুন (June)</option>
              <option value="07">জুলাই (July)</option>
              <option value="08">আগস্ট (August)</option>
              <option value="09">সেপ্টেম্বর (September)</option>
              <option value="10">অক্টোবর (October)</option>
              <option value="11">নভেম্বর (November)</option>
              <option value="12">ডিসেম্বর (December)</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            placeholder="তারিখ খুঁজুন (YYYY-MM-DD)..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-[#0F2E22]"
          />
        </div>
      </div>

      {/* History Table */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center text-stone-500 bg-white rounded-xl border border-stone-200">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0F2E22] mb-2" />
          <p className="text-xs">হিসাব খাতা লোড হচ্ছে...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={fetchHistory} className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded font-medium">
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">তারিখ (Date)</th>
                  <th className="py-3 px-4 text-right">স্টাফ আয়</th>
                  <th className="py-3 px-4 text-right">স্যালন আয়</th>
                  <th className="py-3 px-4 text-right">মোট আয়</th>
                  <th className="py-3 px-4 text-right">মোট ব্যয়</th>
                  <th className="py-3 px-4 text-right">নেট ব্যালেন্স (BDT)</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredClosings.length > 0 ? (
                  filteredClosings.map((closing) => (
                    <tr key={closing.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-stone-900">
                          {formatDateDhaka(closing.businessDate)}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          {closing.businessDate}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-stone-700">
                        {formatBDT(closing.totalEmployeeIncome)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-stone-700">
                        {formatBDT(closing.totalSalonLevelIncome)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                        {formatBDT(closing.totalIncome)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-rose-700">
                        {formatBDT(closing.totalExpenses)}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${closing.netBalance >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                        {formatBDT(closing.netBalance)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" /> ক্লোজড
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(closing.businessDate)}
                            className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="বিস্তারিত হিসাব দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenDateForEdit(closing.businessDate)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="হিসাব এডিট বা সংশোধন করুন"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-400">
                      এই ফিল্টারে কোন পূর্ববর্তী ক্লোজিং রেকর্ড পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Day Detail & Print Voucher Modal */}
      {viewingDate && viewingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#0F2E22] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-stone-100">
                  দৈনিক হিসাব ভাউচার (Daily Accounts Voucher)
                </h3>
                <p className="text-xs text-stone-300">
                  তারিখ: <strong className="font-mono text-amber-200">{formatDateDhaka(viewingDate)}</strong> &bull; Noble Reflxion Lifestyle Salon
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDailyVoucher}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="ভাউচার প্রিন্ট করুন"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট (Print)</span>
                </button>
                <button
                  onClick={() => setViewingDate(null)}
                  className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 print:p-0">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-xs text-stone-500 block mb-1">মোট আয় (Revenue)</span>
                  <div className="text-xl font-bold font-mono text-stone-900">
                    {formatBDT(viewingData.closing?.totalIncome)}
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-xs text-stone-500 block mb-1">মোট ব্যয় (Expenses)</span>
                  <div className="text-xl font-bold font-mono text-rose-700">
                    {formatBDT(viewingData.closing?.totalExpenses)}
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-xs text-stone-500 block mb-1">নেট স্থিতি (Net Cash)</span>
                  <div className={`text-xl font-bold font-mono ${Number(viewingData.closing?.netBalance) >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                    {formatBDT(viewingData.closing?.netBalance)}
                  </div>
                </div>
              </div>

              {/* Incomes Table */}
              <div>
                <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  আয়ের বিবরণী ({viewingData.income.length} টি এন্ট্রি)
                </h4>
                <div className="border border-stone-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                      <tr>
                        <th className="py-2 px-3">উৎস / স্টাফ</th>
                        <th className="py-2 px-3">সার্ভিস ক্যাটাগরি</th>
                        <th className="py-2 px-3">বিবরণ</th>
                        <th className="py-2 px-3">পেমেন্ট মাধ্যম</th>
                        <th className="py-2 px-3 text-right">পরিমাণ (BDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {viewingData.income.map((t) => (
                        <tr key={t.id}>
                          <td className="py-2 px-3 font-semibold text-stone-800">
                            {t.employeeId ? t.employeeId : '(স্যালন সরাসরি)'}
                          </td>
                          <td className="py-2 px-3 text-stone-700">{t.category}</td>
                          <td className="py-2 px-3 text-stone-500">{t.description || '-'}</td>
                          <td className="py-2 px-3 font-mono text-stone-600">{t.paymentMethod}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">
                            {formatBDT(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expenses Table */}
              <div>
                <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  ব্যয়ের বিবরণী ({viewingData.expenses.length} টি এন্ট্রি)
                </h4>
                <div className="border border-stone-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                      <tr>
                        <th className="py-2 px-3">কাদের জন্য / খাত</th>
                        <th className="py-2 px-3">খরচের ক্যাটাগরি</th>
                        <th className="py-2 px-3">বিবরণ</th>
                        <th className="py-2 px-3">পেমেন্ট মাধ্যম</th>
                        <th className="py-2 px-3 text-right">পরিমাণ (BDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {viewingData.expenses.length > 0 ? (
                        viewingData.expenses.map((t) => (
                          <tr key={t.id}>
                            <td className="py-2 px-3 font-semibold text-stone-800">
                              {t.employeeId ? t.employeeId : '(সাধারণ স্যালন)'}
                            </td>
                            <td className="py-2 px-3 text-stone-700">{t.category}</td>
                            <td className="py-2 px-3 text-stone-500">{t.description || '-'}</td>
                            <td className="py-2 px-3 font-mono text-stone-600">{t.paymentMethod}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-rose-700">
                              {formatBDT(t.amount)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-3 text-center text-stone-400">
                            কোন ব্যয়ের রেকর্ড নেই
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Closing Notes */}
              {viewingData.closing?.notes && (
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-700">
                  <strong>ম্যানেজার নোট:</strong> {viewingData.closing.notes}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex justify-between items-center">
              <button
                onClick={() => {
                  const d = viewingDate;
                  setViewingDate(null);
                  onOpenDateForEdit(d);
                }}
                className="text-xs font-semibold text-[#0F2E22] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                এই দিনটি এডিট করতে চান?
              </button>

              <button
                onClick={() => setViewingDate(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg cursor-pointer"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
