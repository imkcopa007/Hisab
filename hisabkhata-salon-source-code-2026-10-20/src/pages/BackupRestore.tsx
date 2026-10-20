import React, { useState } from 'react';
import { api } from '../lib/api';
import { 
  Database, 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Info
} from 'lucide-react';

export const BackupRestore: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDownloadJSON = () => {
    window.open('/api/backup/export?format=json', '_blank');
  };

  const handleDownloadCSV = () => {
    window.open('/api/backup/export?format=csv', '_blank');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setParseError(null);
    setRestoreStatus(null);
    setPreviewData(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed.employees) || !Array.isArray(parsed.incomeTransactions)) {
          throw new Error('অবৈধ ব্যাকআপ ফাইল। প্রয়োজনীয় কর্মচারীবৃন্দ বা লেনদেন তালিকা এতে নেই।');
        }

        setPreviewData({
          employeesCount: parsed.employees.length,
          closingsCount: parsed.dailyClosings?.length || 0,
          incomesCount: parsed.incomeTransactions.length,
          expensesCount: parsed.expenseTransactions?.length || 0,
          auditLogsCount: parsed.auditLogs?.length || 0,
          raw: parsed,
        });
      } catch (err: any) {
        setParseError(err.message || 'JSON ফাইলটি পার্স করা সম্ভব হয়নি');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = async () => {
    if (!previewData?.raw) return;

    try {
      setIsRestoring(true);
      setRestoreStatus(null);
      const res = await api.backup.restore(previewData.raw);
      setRestoreStatus({ success: true, message: res.message });
      setShowConfirmModal(false);
      setSelectedFile(null);
      setPreviewData(null);
    } catch (err: any) {
      setRestoreStatus({ success: false, message: err.message || 'রিস্টোর ব্যর্থ হয়েছে' });
      setShowConfirmModal(false);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
          <Database className="w-6 h-6 text-[#0F2E22]" />
          ডেটা ব্যাকআপ ও রিস্টোর (Backup & Data Restoration)
        </h1>
        <p className="text-xs text-stone-600 mt-1">
          স্যালনের সকল কর্মচারী, দৈনিক হিসাব, মাসিক লক্ষ্যমাত্রা ও লেনদেনের স্থায়ী ডেটা ডাউনলোড ও সংরক্ষণ করুন।
        </p>
      </div>

      {restoreStatus && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
            restoreStatus.success
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {restoreStatus.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
          )}
          <span className="font-medium">{restoreStatus.message}</span>
        </div>
      )}

      {/* Grid: Download vs Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DOWNLOAD SECTION */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-[#0F2E22] mb-3">
              <Download className="w-5 h-5" />
              <h2 className="font-serif font-bold text-base text-stone-900">
                ১. সম্পূর্ণ ডেটা ডাউনলোড করুন (Export Backup)
              </h2>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              আপনার স্যালনের সমস্ত হিসাব, অডিট ট্রেইল ও কর্মচারীদের তথ্য দুটি স্ট্যান্ডার্ড ফরম্যাটে ডাউনলোড করতে পারেন। এই ফাইলটি আপনার কম্পিউটার, গুগল ড্রাইভ বা পেনড্রাইভে সুরক্ষিত রাখুন।
            </p>

            <div className="space-y-3">
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileJson className="w-5 h-5 text-amber-700" />
                  <div>
                    <div className="text-xs font-bold text-stone-900">পূর্ণাঙ্গ JSON ডেটাবেজ স্ন্যাপশট</div>
                    <div className="text-[11px] text-stone-500">
                      ভবিষ্যতে এক ক্লিকে রিস্টোর করার উপযোগী কমপ্লিট ফাইল
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDownloadJSON}
                  className="px-3.5 py-1.5 bg-[#0F2E22] hover:bg-[#16423C] text-amber-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  JSON ডাউনলোড
                </button>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <div>
                    <div className="text-xs font-bold text-stone-900">এক্সেল উপযোগী CSV ফাইল</div>
                    <div className="text-[11px] text-stone-500">
                      সকল আয় ও ব্যয়ের লেনদেন মাইক্রোসফট এক্সেলে দেখার জন্য
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDownloadCSV}
                  className="px-3.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  CSV ডাউনলোড
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-[11px] text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>কোন পাসওয়ার্ড ফাইল ডাউনলোডে এক্সপোজ হয় না।</span>
          </div>
        </div>

        {/* RESTORE SECTION */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-[#0F2E22] mb-3">
              <Upload className="w-5 h-5" />
              <h2 className="font-serif font-bold text-base text-stone-900">
                ২. ব্যাকআপ থেকে রিস্টোর করুন (Restore From File)
              </h2>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              পূর্বে ডাউনলোডকৃত HIsabkhata JSON ব্যাকআপ ফাইল নির্বাচন করুন। রিস্টোর করার পূর্বে ফাইলটি স্বয়ংক্রিয়ভাবে যাচাই করা হবে।
            </p>

            <div className="space-y-3">
              <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center hover:border-emerald-700 transition-colors">
                <input
                  type="file"
                  id="backup-upload"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="backup-upload"
                  className="cursor-pointer flex flex-col items-center gap-1.5"
                >
                  <FileJson className="w-8 h-8 text-stone-400" />
                  <span className="text-xs font-semibold text-stone-800">
                    {selectedFile ? selectedFile.name : 'JSON ব্যাকআপ ফাইল নির্বাচন করুন'}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    ক্লিক করে ফাইল ব্রাউজ করুন
                  </span>
                </label>
              </div>

              {parseError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{parseError}</span>
                </div>
              )}

              {previewData && (
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1.5">
                  <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ব্যাকআপ ফাইল যাচাইকরণ সফল হয়েছে:
                  </div>
                  <div className="text-stone-600">
                    &bull; কর্মচারীর সংখ্যা: <strong>{previewData.employeesCount} জন</strong>
                  </div>
                  <div className="text-stone-600">
                    &bull; দৈনিক ক্লোজিং রেকর্ড: <strong>{previewData.closingsCount} দিন</strong>
                  </div>
                  <div className="text-stone-600">
                    &bull; মোট লেনদেন: <strong>{previewData.incomesCount + previewData.expensesCount} টি</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full mt-2 py-2 bg-rose-900 hover:bg-rose-950 text-white font-semibold rounded-lg text-xs shadow-xs cursor-pointer"
                  >
                    এই ব্যাকআপ ডেটাবেজে রিস্টোর করুন
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-[11px] text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
            <span>সতর্কতা: রিস্টোর করলে বর্তমান ডেটাবেজের তথ্য ব্যাকআপের তথ্যে প্রতিস্থাপিত হবে।</span>
          </div>
        </div>
      </div>

      {/* DOCUMENTATION: FREE TIER & RETENTION PROCEDURE */}
      <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-3">
        <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#0F2E22]" />
          স্থায়ী ডেটা ও ফ্রি-টিয়ার আর্কিটেকচার সম্পর্কিত তথ্যাবলী (Architecture & Recovery Guide)
        </h3>
        <p className="leading-relaxed">
          <strong>ডেটাবেজ ও ক্লাউড স্টোরেজ:</strong> HIsabkhata এর সমস্ত হিসাব সার্ভার-সাইড পারসিস্টেন্ট স্টোরেজে সম্পূর্ণ নিরাপদে ও পারমাণবিকভাবে (Atomic Write Guarantee) সংরক্ষিত হয়। ব্রাউজার রিফ্রেশ, ডিভাইস পরিবর্তন বা ব্রাউজার ক্যাশ ক্লিয়ার করলেও ক্লাউড ডেটাবেজের আর্থিক রেকর্ড ও কর্মচারীদের প্রোফাইল অপরিবর্তিত থাকে।
        </p>
        <p className="leading-relaxed">
          <strong>বিনামূল্যে পরিচালনা (Free-Tier Notice):</strong> এই আর্কিটেকচারে কোনো লুকানো বা অপ্রত্যাশিত ক্লাউড বিলিং এর ঝুঁকি নেই। প্রতি সপ্তাহে বা মাসের শেষে পরিচালকদের সুবিধার্থে একটি অফলাইন JSON এবং CSV কপি ডাউনলোড করে রেখে দিলে শতভাগ ডেটা রিকভারি নিশ্চিত থাকে।
        </p>
      </div>

      {/* CONFIRMATION RESTORE MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-rose-900 px-6 py-4 text-white">
              <h3 className="font-serif font-bold text-base text-stone-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                রিস্টোর করার চূড়ান্ত সতর্কতা
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-stone-700 leading-relaxed">
                আপনি <strong>{selectedFile?.name}</strong> ফাইল থেকে ডেটাবেজ রিস্টোর করতে যাচ্ছেন। এর ফলে এতে থাকা <strong>{previewData?.closingsCount} দিনের দৈনিক হিসাব</strong> এবং <strong>{previewData?.employeesCount} জন কর্মচারীর তথ্য</strong> বর্তমান ডেটাবেজে প্রতিস্থাপিত হবে।
              </p>
              <p className="text-xs font-semibold text-rose-800">
                আপনি কি এগিয়ে যেতে চান?
              </p>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isRestoring}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={isRestoring}
                  className="px-5 py-2.5 bg-rose-900 hover:bg-rose-950 text-white font-bold text-xs rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isRestoring ? 'রিস্টোর হচ্ছে...' : 'হ্যাঁ, রিস্টোর নিশ্চিত করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
