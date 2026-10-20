import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatBDT, formatDateDhaka, getTodayDateString } from '../lib/formatters';
import { Employee, PaymentMethod, DailyClosing } from '../types';
import { 
  ReceiptText, 
  Calendar, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldCheck, 
  RefreshCw,
  Edit2
} from 'lucide-react';

interface IncomeRow {
  employeeId: string | ''; // '' means salon-level
  category: string;
  amount: number | '';
  description: string;
  paymentMethod: PaymentMethod;
}

interface ExpenseRow {
  employeeId: string | ''; // '' means general salon
  category: string;
  amount: number | '';
  description: string;
  paymentMethod: PaymentMethod;
}

interface Props {
  initialDate?: string;
}

export const DailyEntry: React.FC<Props> = ({ initialDate }) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || getTodayDateString());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<any>(null);

  const [incomeRows, setIncomeRows] = useState<IncomeRow[]>([]);
  const [expenseRows, setExpenseRows] = useState<ExpenseRow[]>([]);
  const [closingNotes, setClosingNotes] = useState('');

  const [existingClosing, setExistingClosing] = useState<DailyClosing | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load staff & categories
  useEffect(() => {
    const initData = async () => {
      try {
        const [empRes, setRes] = await Promise.all([
          api.employees.getAll(true),
          api.settings.get(),
        ]);
        setEmployees(empRes);
        setSettings(setRes);
      } catch (err: any) {
        setErrorMessage(err.message || 'প্রাথমিক ডেটা লোড ব্যর্থ হয়েছে');
      }
    };
    initData();
  }, []);

  // Load date transactions
  const loadDateRecords = async (date: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      const res = await api.daily.getByDate(date);

      if (res.closing) {
        setExistingClosing(res.closing);
        setIsEditMode(false);
      } else {
        setExistingClosing(null);
        setIsEditMode(true);
      }

      // Populate rows from DB
      if (res.income && res.income.length > 0) {
        setIncomeRows(
          res.income.map(i => ({
            employeeId: i.employeeId || '',
            category: i.category,
            amount: i.amount,
            description: i.description || '',
            paymentMethod: i.paymentMethod || 'Cash',
          }))
        );
      } else {
        // Default rows: 1 entry per employee
        if (employees.length > 0 && !res.closing) {
          setIncomeRows(
            employees.map(emp => ({
              employeeId: emp.id,
              category: 'Haircut & Styling (চুল কাটা ও স্টাইলিং)',
              amount: '',
              description: '',
              paymentMethod: 'Cash',
            }))
          );
        } else {
          setIncomeRows([]);
        }
      }

      if (res.expenses && res.expenses.length > 0) {
        setExpenseRows(
          res.expenses.map(e => ({
            employeeId: e.employeeId || '',
            category: e.category,
            amount: e.amount,
            description: e.description || '',
            paymentMethod: e.paymentMethod || 'Cash',
          }))
        );
      } else {
        setExpenseRows([]);
      }

      setClosingNotes(res.closing?.notes || '');
    } catch (err: any) {
      setErrorMessage(err.message || 'তারিখের রেকর্ড লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (employees.length > 0) {
      loadDateRecords(selectedDate);
    }
  }, [selectedDate, employees]);

  // Income Row Management
  const addIncomeRow = (employeeId: string = '') => {
    const defaultCat = settings?.incomeCategories?.[0] || 'Haircut & Styling (চুল কাটা ও স্টাইলিং)';
    setIncomeRows([
      ...incomeRows,
      { employeeId, category: defaultCat, amount: '', description: '', paymentMethod: 'Cash' },
    ]);
  };

  const updateIncomeRow = (index: number, field: keyof IncomeRow, value: any) => {
    const updated = [...incomeRows];
    updated[index] = { ...updated[index], [field]: value };
    setIncomeRows(updated);
  };

  const removeIncomeRow = (index: number) => {
    setIncomeRows(incomeRows.filter((_, i) => i !== index));
  };

  // Expense Row Management
  const addExpenseRow = (employeeId: string = '') => {
    const defaultCat = employeeId
      ? 'Employee Daily Allowance / Snack (স্টাফ খরচ/টিফিন)'
      : settings?.expenseCategories?.[0] || 'Other Operating Expenses (বিবিধ খরচ)';
    setExpenseRows([
      ...expenseRows,
      { employeeId, category: defaultCat, amount: '', description: '', paymentMethod: 'Cash' },
    ]);
  };

  const updateExpenseRow = (index: number, field: keyof ExpenseRow, value: any) => {
    const updated = [...expenseRows];
    updated[index] = { ...updated[index], [field]: value };
    setExpenseRows(updated);
  };

  const removeExpenseRow = (index: number) => {
    setExpenseRows(expenseRows.filter((_, i) => i !== index));
  };

  // Real-time Calculations
  const validIncomeRows = incomeRows.filter(r => Number(r.amount) > 0);
  const validExpenseRows = expenseRows.filter(r => Number(r.amount) > 0);

  const totalEmployeeIncome = validIncomeRows
    .filter(r => Boolean(r.employeeId))
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const totalSalonLevelIncome = validIncomeRows
    .filter(r => !r.employeeId)
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const totalIncome = totalEmployeeIncome + totalSalonLevelIncome;

  const totalEmployeeExpenses = validExpenseRows
    .filter(r => Boolean(r.employeeId))
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const totalGeneralExpenses = validExpenseRows
    .filter(r => !r.employeeId)
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const totalExpenses = totalEmployeeExpenses + totalGeneralExpenses;
  const netBalance = totalIncome - totalExpenses;

  // Pre-submission validation
  const handleOpenConfirm = () => {
    setErrorMessage(null);

    for (const r of incomeRows) {
      if (r.amount !== '' && Number(r.amount) < 0) {
        setErrorMessage('আয়ের পরিমাণ ঋণাত্মক হতে পারবে না');
        return;
      }
    }
    for (const r of expenseRows) {
      if (r.amount !== '' && Number(r.amount) < 0) {
        setErrorMessage('ব্যয়ের পরিমাণ ঋণাত্মক হতে পারবে না');
        return;
      }
    }

    if (validIncomeRows.length === 0 && validExpenseRows.length === 0) {
      setErrorMessage('অন্তত একটি বৈধ আয় বা ব্যয়ের লেনদেন এন্ট্রি করুন');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSaving(true);
      setErrorMessage(null);

      const payload = {
        date: selectedDate,
        incomes: validIncomeRows.map(r => ({
          employeeId: r.employeeId || null,
          category: r.category,
          amount: Number(r.amount),
          description: r.description,
          paymentMethod: r.paymentMethod,
        })),
        expenses: validExpenseRows.map(r => ({
          employeeId: r.employeeId || null,
          category: r.category,
          amount: Number(r.amount),
          description: r.description,
          paymentMethod: r.paymentMethod,
        })),
        notes: closingNotes,
        isEdit: Boolean(existingClosing),
      };

      const res = await api.daily.submitDay(payload);
      setSuccessMessage(res.message);
      setShowConfirmModal(false);
      await loadDateRecords(selectedDate);
    } catch (err: any) {
      setErrorMessage(err.message || 'দিন ক্লোজ করতে ব্যর্থ হয়েছে');
      setShowConfirmModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Selector */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-[#0F2E22]" />
            দৈনিক হিসাব ও ক্লোজিং (Daily Accounting Entry)
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            কর্মচারীদের সেবা আয়, খরচ এবং সাধারণ স্যালন আয়-ব্যয় হিসাব অন্তর্ভুক্ত করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:bg-white cursor-pointer"
            />
          </div>

          <button
            onClick={() => loadDateRecords(selectedDate)}
            className="p-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-600 transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Closed Warning / Notice */}
      {existingClosing && !isEditMode && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block">
                {formatDateDhaka(selectedDate)} তারিখের হিসাব ইতিমধ্যে সফলভাবে সাবমিট ও ক্লোজ করা আছে।
              </span>
              <span className="text-emerald-800 text-[11px]">
                ক্লোজিং সময়: {new Date(existingClosing.submittedAt).toLocaleTimeString('en-US')} &bull; মোট আয়: {formatBDT(existingClosing.totalIncome)} &bull; নেট: {formatBDT(existingClosing.netBalance)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditMode(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0F2E22] hover:bg-[#16423C] text-amber-300 rounded-lg font-medium shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            হিসাব সংশোধন / এডিট করুন
          </button>
        </div>
      )}

      {existingClosing && isEditMode && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>সংশোধন মোড:</strong> আপনি পূর্ববর্তী সাবমিট করা হিসাব এডিট করছেন। পরিবর্তনের অডিট ট্রেইল সংরক্ষিত থাকবে।
            </span>
          </div>
          <button
            onClick={() => {
              setIsEditMode(false);
              loadDateRecords(selectedDate);
            }}
            className="underline font-medium text-amber-800 hover:text-amber-950 cursor-pointer"
          >
            বাতিল
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SUMMARY BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1 text-xs">
            <span>মোট আয় (Total Revenue)</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 font-mono">
            {formatBDT(totalIncome)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex justify-between">
            <span>স্টাফ: {formatBDT(totalEmployeeIncome)}</span>
            <span>স্যালন: {formatBDT(totalSalonLevelIncome)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1 text-xs">
            <span>মোট ব্যয় (Total Expenses)</span>
            <TrendingDown className="w-4 h-4 text-rose-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-rose-700 font-mono">
            {formatBDT(totalExpenses)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex justify-between">
            <span>স্টাফ খরচ: {formatBDT(totalEmployeeExpenses)}</span>
            <span>সাধারণ: {formatBDT(totalGeneralExpenses)}</span>
          </div>
        </div>

        <div className="bg-[#0F2E22] text-white p-4 rounded-xl border border-emerald-900 shadow-md">
          <div className="flex items-center justify-between text-stone-300 mb-1 text-xs">
            <span className="text-amber-200">নেট ব্যালেন্স (Net Balance)</span>
            <Wallet className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-50 font-mono">
            {formatBDT(netBalance)}
          </div>
          <p className="text-[11px] text-stone-300 mt-1">
            (মোট আয় - মোট ব্যয়)
          </p>
        </div>
      </div>

      {/* SECTION 1: INCOME ENTRIES */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-50/80 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              ১. আয়ের হিসাব এন্ট্রি (Service & Product Income)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              প্রতিটি কর্মচারীর সেবা আয় অথবা স্যালন লেভেলের সরাসরি প্রোডাক্ট বা প্যাকেজ বিক্রয়
            </p>
          </div>

          {isEditMode && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => addIncomeRow('')}
                className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                + স্যালন আয় (Direct Salon)
              </button>
              <button
                type="button"
                onClick={() => addIncomeRow(employees[0]?.id || '')}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#0F2E22] hover:bg-[#16423C] text-amber-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                + স্টাফ সার্ভিস আয়
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          {incomeRows.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-xs">
              কোন আয়ের এন্ট্রি নেই। উপরের বোতাম চেপে সেবা বা বিক্রয় আয় যোগ করুন।
            </div>
          ) : (
            <div className="space-y-3">
              {incomeRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-stone-50/60 border border-stone-200 rounded-lg items-center"
                >
                  {/* Employee Select */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-0.5">
                      স্টাফ / উৎস
                    </label>
                    <select
                      disabled={!isEditMode}
                      value={row.employeeId}
                      onChange={(e) => updateIncomeRow(idx, 'employeeId', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900 focus:ring-1 focus:ring-[#0F2E22]"
                    >
                      <option value="">(সাধারণ স্যালন আয় / Salon-Direct)</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-0.5">
                      সার্ভিস ক্যাটাগরি
                    </label>
                    <select
                      disabled={!isEditMode}
                      value={row.category}
                      onChange={(e) => updateIncomeRow(idx, 'category', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900 focus:ring-1 focus:ring-[#0F2E22]"
                    >
                      {settings?.incomeCategories?.map((cat: string) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount BDT */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-0.5">
                      টাকার পরিমাণ (BDT ৳) *
                    </label>
                    <input
                      type="number"
                      disabled={!isEditMode}
                      min="0"
                      value={row.amount}
                      onChange={(e) => updateIncomeRow(idx, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="৳ 0"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs font-mono font-bold text-stone-900 focus:ring-1 focus:ring-[#0F2E22]"
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-0.5">
                      পেমেন্ট মাধ্যম
                    </label>
                    <select
                      disabled={!isEditMode}
                      value={row.paymentMethod}
                      onChange={(e) => updateIncomeRow(idx, 'paymentMethod', e.target.value as PaymentMethod)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900 focus:ring-1 focus:ring-[#0F2E22]"
                    >
                      <option value="Cash">নগদ (Cash)</option>
                      <option value="bKash">বিকাশ (bKash)</option>
                      <option value="Nagad">নগদ (Nagad)</option>
                      <option value="Card">কার্ড (Card)</option>
                      <option value="Bank Transfer">ব্যাংক ট্রান্সফার</option>
                    </select>
                  </div>

                  {/* Description & Delete */}
                  <div className="sm:col-span-2 flex items-center gap-1.5 pt-4 sm:pt-0">
                    <input
                      type="text"
                      disabled={!isEditMode}
                      value={row.description}
                      onChange={(e) => updateIncomeRow(idx, 'description', e.target.value)}
                      placeholder="সংক্ষিপ্ত বিবরণ"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-700"
                    />
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => removeIncomeRow(idx)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                        title="মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: EXPENSE ENTRIES */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-50/80 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              ২. খরচের হিসাব এন্ট্রি (Staff Allowance & Salon Expenses)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              স্টাফের দৈনিক খরচ বা কমিশন অগ্রিম এবং সাধারণ স্যালন পরিচালনা ব্যয়
            </p>
          </div>

          {isEditMode && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => addExpenseRow('')}
                className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                + সাধারণ স্যালন ব্যয় (General Salon)
              </button>
              <button
                type="button"
                onClick={() => addExpenseRow(employees[0]?.id || '')}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-900 hover:bg-rose-950 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                + স্টাফ-সম্পর্কিত খরচ
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          {expenseRows.length === 0 ? (
            <div className="py-6 text-center text-stone-400 text-xs">
              কোন ব্যয়ের এন্ট্রি নেই। কোনো খরচ থাকলে উপরের বোতাম চেপে যোগ করুন।
            </div>
          ) : (
            <div className="space-y-3">
              {expenseRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-rose-50/30 border border-stone-200 rounded-lg items-center"
                >
                  {/* Employee Select */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-0.5">
                      কাদের জন্য ব্যয়
                    </label>
                    <select
                      disabled={!isEditMode}
                      value={row.employeeId}
                      onChange={(e) => updateExpenseRow(idx, 'employeeId', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900 focus:ring-1 focus:ring-rose-700"
                    >
                      <option value="">(সাধারণ স্যালন ব্যয় / General Salon)</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-0.5">
                      খরচের ক্যাটাগরি
                    </label>
                    <select
                      disabled={!isEditMode}
                      value={row.category}
                      onChange={(e) => updateExpenseRow(idx, 'category', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900 focus:ring-1 focus:ring-rose-700"
                    >
                      {settings?.expenseCategories?.map((cat: string) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount BDT */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-0.5">
                      টাকার পরিমাণ (BDT ৳) *
                    </label>
                    <input
                      type="number"
                      disabled={!isEditMode}
                      min="0"
                      value={row.amount}
                      onChange={(e) => updateExpenseRow(idx, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="৳ 0"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs font-mono font-bold text-rose-700 focus:ring-1 focus:ring-rose-700"
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-0.5">
                      পেমেন্ট মাধ্যম
                    </label>
                    <select
                      disabled={!isEditMode}
                      value={row.paymentMethod}
                      onChange={(e) => updateExpenseRow(idx, 'paymentMethod', e.target.value as PaymentMethod)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900 focus:ring-1 focus:ring-rose-700"
                    >
                      <option value="Cash">নগদ (Cash)</option>
                      <option value="bKash">বিকাশ (bKash)</option>
                      <option value="Nagad">নগদ (Nagad)</option>
                      <option value="Card">কার্ড (Card)</option>
                      <option value="Bank Transfer">ব্যাংক ট্রান্সফার</option>
                    </select>
                  </div>

                  {/* Description & Delete */}
                  <div className="sm:col-span-2 flex items-center gap-1.5 pt-4 sm:pt-0">
                    <input
                      type="text"
                      disabled={!isEditMode}
                      value={row.description}
                      onChange={(e) => updateExpenseRow(idx, 'description', e.target.value)}
                      placeholder="খরচের বিবরণ..."
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-700"
                    />
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => removeExpenseRow(idx)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                        title="মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: NOTES & SUBMIT DAY */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
          দৈনিক ক্লোজিং মন্তব্য ও হিসাব বিবরণী নোট (Closing Notes)
        </label>
        <textarea
          rows={2}
          disabled={!isEditMode}
          value={closingNotes}
          onChange={(e) => setClosingNotes(e.target.value)}
          placeholder="যেমন: আজকের দিন শান্ত ছিল, বিকেলে ব্রাইডাল বুকিং সম্পন্ন হয়েছে..."
          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#0F2E22] focus:bg-white"
        />

        {isEditMode && (
          <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-stone-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>
                সাবমিট করার সাথে সাথে ক্লাউড ডেটাবেজে স্থায়ীভাবে সংরক্ষিত হবে ও অডিট ট্রেইল তৈরি হবে।
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenConfirm}
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3 bg-[#0F2E22] hover:bg-[#16423C] text-amber-300 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{existingClosing ? 'দিন সংশোধন করে সেভ করুন (Update Day)' : 'আজকের দিন ক্লোজ করুন (Submit & Close Day)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-[#0F2E22] px-6 py-4 text-white">
              <h3 className="font-serif font-bold text-base text-stone-100">
                দৈনিক হিসাব চূড়ান্ত নিশ্চিতকরণ (Final Day Closing)
              </h3>
              <p className="text-xs text-stone-300">
                তারিখ: <strong className="font-mono">{formatDateDhaka(selectedDate)}</strong>
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>মোট রেকর্ডকৃত আয়:</span>
                  <span className="font-mono font-bold text-stone-900">{formatBDT(totalIncome)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>মোট রেকর্ডকৃত ব্যয়:</span>
                  <span className="font-mono font-bold text-rose-700">{formatBDT(totalExpenses)}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-[#0F2E22]">
                  <span>নেট ব্যালেন্স (ক্যাশ স্থিতি):</span>
                  <span className="font-mono">{formatBDT(netBalance)}</span>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                আপনি কি নিশ্চিত যে এই দিনের হিসাব সমাপ্ত ও ক্লোজ করতে চান? সকল স্টাফের মাসিক লক্ষ্যমাত্রার হিসাব স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে।
              </p>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 cursor-pointer"
                >
                  ফিরে যান (Back)
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#0F2E22] hover:bg-[#16423C] text-amber-300 font-bold text-xs rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'হ্যাঁ, ক্লোজ নিশ্চিত করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
