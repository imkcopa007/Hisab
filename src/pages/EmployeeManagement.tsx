import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatDateDhaka } from '../lib/formatters';
import { Employee } from '../types';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  History, 
  Phone, 
  Calendar, 
  Briefcase, 
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  UserX
} from 'lucide-react';

const COMMON_ROLES = [
  'সিনিয়র হেয়ার স্টাইলিস্ট (Senior Hair Stylist)',
  'হেয়ার কালারিস্ট (Hair Colorist)',
  'স্কিন ও ফেসিয়াল এক্সপার্ট (Facial & Skincare)',
  'জুনিয়র হেয়ার স্টাইলিস্ট (Junior Stylist)',
  'হেয়ার ট্রিটমেন্ট বিশেষজ্ঞ (Treatment Specialist)',
  'দাড়ি ও গ্রুমিং স্পেশালিস্ট (Beard & Grooming)',
];

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [removingEmployee, setRemovingEmployee] = useState<Employee | null>(null);
  const [viewingHistoryEmployee, setViewingHistoryEmployee] = useState<Employee | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.employees.getAll(true);
      setEmployees(res);
    } catch (err: any) {
      setError(err.message || 'কর্মচারী তালিকা লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const openAddModal = () => {
    setFormName('');
    setFormRole(COMMON_ROLES[0]);
    setFormPhone('');
    setFormNotes('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormRole(emp.role);
    setFormPhone(emp.phone || '');
    setFormNotes(emp.notes || '');
    setFormError(null);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formName.trim();
    const trimmedRole = formRole.trim();

    if (!trimmedName) {
      setFormError('অনুগ্রহ করে কর্মচারীর নাম লিখুন');
      return;
    }
    if (!trimmedRole) {
      setFormError('অনুগ্রহ করে পদবী বা দায়িত্ব নির্বাচন করুন');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingEmployee) {
        const updated = await api.employees.update(editingEmployee.id, {
          name: trimmedName,
          role: trimmedRole,
          phone: formPhone.trim(),
          serviceCategory: trimmedRole,
          notes: formNotes.trim(),
        });
        setEmployees(employees.map(emp => emp.id === updated.id ? updated : emp));
        setEditingEmployee(null);
        showFeedback('success', `কর্মচারী "${updated.name}"-এর তথ্য আপডেট করা হয়েছে।`);
      } else {
        const newEmp = await api.employees.create({
          name: trimmedName,
          role: trimmedRole,
          phone: formPhone.trim(),
          serviceCategory: trimmedRole,
          joiningDate: new Date().toISOString().split('T')[0],
          notes: formNotes.trim(),
        });
        setEmployees([...employees, newEmp]);
        setIsAddModalOpen(false);
        showFeedback('success', `নতুন কর্মচারী "${newEmp.name}" (${newEmp.id}) সফলভাবে যোগ করা হয়েছে।`);
      }
    } catch (err: any) {
      setFormError(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!removingEmployee) return;

    try {
      setIsSubmitting(true);
      await api.employees.remove(removingEmployee.id);
      setEmployees(employees.filter(e => e.id !== removingEmployee.id));
      showFeedback('success', `কর্মচারী "${removingEmployee.name}" (${removingEmployee.id}) সফলভাবে তালিকা থেকে রিমুভ করা হয়েছে।`);
      setRemovingEmployee(null);
    } catch (err: any) {
      alert(err.message || 'রিমুভ করতে ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      emp.id.toLowerCase().includes(q) ||
      (emp.phone && emp.phone.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Main Action */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0F2E22]" />
            কর্মচারী ব্যবস্থাপনা (Employee Management)
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            সহজেই নতুন কর্মচারী যুক্ত করুন অথবা পুরোনো কর্মচারীদের তালিকা থেকে রিমুভ করুন।
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0F2E22] hover:bg-[#16423C] text-amber-300 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ নতুন কর্মচারী যোগ করুন (Add Employee)</span>
        </button>
      </div>

      {/* Feedback banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 shadow-xs border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
          )}
          <span className="font-medium">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Search and Summary Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, আইডি বা পদবী দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:bg-white"
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
            মোট কর্মচারী: <strong className="text-stone-900 font-mono text-sm">{employees.length}</strong> জন
          </span>

          <button
            onClick={fetchEmployees}
            className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-300 rounded-lg transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Employees List */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center text-stone-500 bg-white rounded-xl border border-stone-200">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0F2E22] mb-2" />
          <p className="text-xs">কর্মচারী তালিকা লোড হচ্ছে...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchEmployees}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded font-medium"
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 border-b border-stone-200 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">আইডি (ID)</th>
                  <th className="py-3.5 px-4">কর্মচারীর নাম (Name)</th>
                  <th className="py-3.5 px-4">পদবী / কাজ (Role)</th>
                  <th className="py-3.5 px-4">মোবাইল (Phone)</th>
                  <th className="py-3.5 px-4">যোগদানের তারিখ</th>
                  <th className="py-3.5 px-4 text-center">অ্যাকশন (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-950">
                        {emp.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900 text-sm">{emp.name}</div>
                        {emp.notes && (
                          <div className="text-[11px] text-stone-500 truncate max-w-xs mt-0.5">
                            {emp.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-stone-800 font-medium">{emp.role}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-stone-600">
                        {emp.phone || <span className="text-stone-400">-</span>}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-stone-600">
                        {formatDateDhaka(emp.joiningDate)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* View History */}
                          <button
                            onClick={() => setViewingHistoryEmployee(emp)}
                            className="flex items-center gap-1 px-2.5 py-1 text-stone-700 hover:text-emerald-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer text-xs font-medium"
                            title="হিসাব ও ইতিহাসের বিবরণ দেখুন"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">ইতিহাস</span>
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => openEditModal(emp)}
                            className="flex items-center gap-1 px-2.5 py-1 text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer text-xs font-medium"
                            title="তথ্য এডিট করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">এডিট</span>
                          </button>

                          {/* Remove / Delete Button */}
                          <button
                            onClick={() => setRemovingEmployee(emp)}
                            className="flex items-center gap-1 px-2.5 py-1 text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-700 border border-rose-200 hover:border-rose-700 rounded-md transition-colors cursor-pointer text-xs font-semibold"
                            title="কর্মচারী রিমুভ করুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>রিমুভ</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-stone-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-stone-300" />
                        <p className="text-sm font-medium text-stone-600">কোন কর্মচারী রেকর্ড পাওয়া যায়নি</p>
                        <button
                          onClick={openAddModal}
                          className="mt-1 text-xs text-[#0F2E22] font-bold underline cursor-pointer"
                        >
                          + প্রথম কর্মচারী যোগ করুন
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EASY ADD / EDIT EMPLOYEE MODAL */}
      {(isAddModalOpen || editingEmployee) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#0F2E22] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-100">
                  {editingEmployee ? 'কর্মচারীর তথ্য পরিবর্তন' : 'নতুন কর্মচারী যোগ করুন (Add Staff)'}
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  {editingEmployee ? `আইডি: ${editingEmployee.id}` : 'নাম ও পদবী দিয়ে সহজেই যোগ করুন'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingEmployee(null);
                }}
                className="text-stone-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Name */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  কর্মচারীর নাম (Employee Name) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="যেমন: মোঃ সাজ্জাদ হোসেন"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:bg-white font-medium"
                />
              </div>

              {/* 2. Role */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  পদবী / কাজ (Designation / Role) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="যেমন: সিনিয়র হেয়ার স্টাইলিস্ট"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:bg-white mb-2"
                />
                
                {/* Quick suggestions chips */}
                <div className="text-[11px] text-stone-500 mb-1 font-medium">দ্রুত পছন্দ করুন:</div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {COMMON_ROLES.map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setFormRole(r)}
                      className={`text-[10px] px-2 py-1 rounded-md border text-left transition-colors cursor-pointer ${
                        formRole === r
                          ? 'bg-[#0F2E22] text-amber-300 border-[#0F2E22]'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {r.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Phone (Optional) */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  মোবাইল নম্বর (Phone Number) <span className="text-stone-400 font-normal">(ঐচ্ছিক)</span>
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm font-mono text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:bg-white"
                />
              </div>

              {/* 4. Notes (Optional) */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  মন্তব্য বা নোট (Optional Notes)
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="যেমন: ফেড কাট ও স্পা অভিজ্ঞ..."
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingEmployee(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 cursor-pointer"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#0F2E22] hover:bg-[#16423C] text-amber-300 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingEmployee ? 'আপডেট করুন (Save)' : 'কর্মচারী যোগ করুন (Add)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM REMOVE MODAL */}
      {removingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-rose-900 px-6 py-4 text-white flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <UserX className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-white">
                  কর্মচারী রিমুভ করার নিশ্চিতকরণ
                </h3>
                <p className="text-xs text-rose-200">
                  {removingEmployee.name} ({removingEmployee.id})
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-stone-700 leading-relaxed">
                আপনি কি নিশ্চিত যে <strong>"{removingEmployee.name}"</strong>-কে বর্তমান কর্মচারী তালিকা থেকে রিমুভ (মুছে ফেলতে) করতে চান?
              </p>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-600 leading-relaxed">
                <strong>উল্লেখ্য:</strong> রিমুভ করার পর তিনি আর দৈনিক হিসাবের ড্রপডাউনে আসবেন না, তবে তার পূর্ববর্তী সকল কাজের রেকর্ড ও হিসাব সম্পূর্ণ নিরাপদে থাকবে।
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRemovingEmployee(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 cursor-pointer"
                >
                  বাতিল (Cancel)
                </button>

                <button
                  type="button"
                  onClick={handleConfirmRemove}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'রিমুভ হচ্ছে...' : 'হ্যাঁ, রিমুভ করুন (Remove)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer Modal */}
      {viewingHistoryEmployee && (
        <EmployeeDetailModal
          employee={viewingHistoryEmployee}
          onClose={() => setViewingHistoryEmployee(null)}
        />
      )}
    </div>
  );
};
