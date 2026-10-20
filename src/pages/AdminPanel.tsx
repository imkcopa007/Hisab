import React, { useState, useEffect } from 'react';
import { api, getStoredToken } from '../lib/api';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  FileCode, 
  FileJson, 
  Server, 
  Cpu, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Copy, 
  FolderArchive,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update file upload state
  const [selectedUpdateFile, setSelectedUpdateFile] = useState<File | null>(null);
  const [updatePreview, setUpdatePreview] = useState<any | null>(null);
  const [updateParseError, setUpdateParseError] = useState<string | null>(null);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState<string | null>(null);

  // Copied code feedback
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedDeploy, setCopiedDeploy] = useState(false);

  const fetchSystemInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.admin.getSystemInfo();
      setSystemInfo(res);
    } catch (err: any) {
      setError(err.message || 'সিস্টেম তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const handleDownloadSourceZip = () => {
    const token = getStoredToken();
    // Direct browser download via authenticated fetch blob
    fetch(api.admin.downloadSourceUrl(), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('সোর্স কোড জিপ তৈরি ব্যর্থ হয়েছে');
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hisabkhata-salon-source-code-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        alert(err.message || 'ডাউনলোড ব্যর্থ হয়েছে');
      });
  };

  const handleDownloadUpdatePackage = () => {
    const token = getStoredToken();
    fetch(api.admin.downloadUpdateUrl(), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('আপডেট ফাইল তৈরি ব্যর্থ হয়েছে');
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hisabkhata-update-package-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        alert(err.message || 'ডাউনলোড ব্যর্থ হয়েছে');
      });
  };

  const handleUpdateFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUpdateParseError(null);
    setUpdateSuccessMessage(null);
    setUpdatePreview(null);

    if (!file) {
      setSelectedUpdateFile(null);
      return;
    }

    setSelectedUpdateFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);

        const dataObj = parsed.data || parsed;
        if (!dataObj || !Array.isArray(dataObj.employees) || !Array.isArray(dataObj.incomeTransactions)) {
          throw new Error('অবৈধ আপডেট প্যাকেজ। প্রয়োজনীয় ডেটা টেবিল বা স্কিমা অনুপস্থিত।');
        }

        setUpdatePreview({
          version: parsed.version || 'v1.0.0',
          appName: parsed.appName || 'HIsabkhata',
          exportedAt: parsed.exportedAt || 'Unknown',
          employeesCount: dataObj.employees.length,
          closingsCount: dataObj.dailyClosings?.length || 0,
          incomesCount: dataObj.incomeTransactions.length,
          expensesCount: dataObj.expenseTransactions?.length || 0,
          rawPayload: parsed,
        });
      } catch (err: any) {
        setUpdateParseError(err.message || 'ফাইলটি সঠিক JSON আপডেট ফাইল নয়');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyUpdate = async () => {
    if (!updatePreview?.rawPayload) return;

    const confirm = window.confirm(
      'আপনি কি নিশ্চিত যে এই আপডেট প্যাকেজটি প্রয়োগ করতে চান?\n\nএটি বর্তমান ডেটাবেজের সাথে আপডেট ডেটা সিঙ্ক করবে।'
    );
    if (!confirm) return;

    try {
      setIsApplyingUpdate(true);
      setUpdateParseError(null);
      const res = await api.admin.applyUpdate(updatePreview.rawPayload);
      setUpdateSuccessMessage(res.message);
      setSelectedUpdateFile(null);
      setUpdatePreview(null);
      await fetchSystemInfo();
    } catch (err: any) {
      setUpdateParseError(err.message || 'আপডেট প্রয়োগ করতে সমস্যা হয়েছে');
    } finally {
      setIsApplyingUpdate(false);
    }
  };

  const copyToClipboard = (text: string, type: 'env' | 'deploy') => {
    navigator.clipboard.writeText(text);
    if (type === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    } else {
      setCopiedDeploy(true);
      setTimeout(() => setCopiedDeploy(false), 2000);
    }
  };

  const sampleEnvText = `# HIsabkhata Salon Accounting System Configuration
PORT=3000
NODE_ENV=production
SALON_NAME="Noble Reflxion Lifestyle Salon"
TIMEZONE="Asia/Dhaka"
CURRENCY="BDT"
`;

  const sampleDeployCommands = `# 1. Extract zip package
unzip hisabkhata-salon-source-code.zip
cd hisabkhata-salon-source-code

# 2. Install dependencies
npm install

# 3. Build optimized production webapp
npm run build

# 4. Start production server on port 3000
npm start
`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#0F2E22] text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              এডমিন কন্ট্রোল প্যানেল (Admin Panel)
            </h1>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            স্যালনের সম্পূর্ণ ওয়েবঅ্যাপ সোর্স কোড ডাউনলোড, আপডেট প্যাকেজ ডাউনলোড ও সার্ভার নিয়ন্ত্রণ।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Version 1.2.0 (Active)
          </span>

          <button
            onClick={fetchSystemInfo}
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {updateSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="font-semibold">{updateSuccessMessage}</span>
        </div>
      )}

      {/* CORE DOWNLOAD SECTION: FULL SOURCE CODE & UPDATE PACKAGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Full Source Code .ZIP Download */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#0F2E22]/30 shadow-md flex flex-col justify-between hover:border-[#0F2E22] transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#0F2E22] text-amber-300 text-[10px] font-mono px-3 py-1 rounded-bl-lg font-bold tracking-wider uppercase">
            Full Codebase .ZIP
          </div>

          <div>
            <div className="w-12 h-12 rounded-xl bg-[#0F2E22] text-amber-300 flex items-center justify-center mb-4 shadow-sm">
              <FolderArchive className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-serif font-bold text-stone-900 mb-1">
              সম্পূর্ণ ওয়েবঅ্যাপ সোর্স কোড ডাউনলোড
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              এই পুরো অ্যাপ্লিকেশনটির সমস্ত ফ্রন্টএন্ড, এক্সপ্রেস ব্যাকএন্ড, ডেটাবেজ ইঞ্জিন, টাইপস্ক্রিপ্ট ফাইল এবং কনফিগারেশন সরাসরি একটি <strong>.ZIP</strong> ফাইল আকারে ডাউনলোড করুন।
            </p>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-[11px] text-stone-700 space-y-1 mb-5">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>React 19 + TypeScript + Tailwind CSS UI</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Express API Server & Atomic Persistent Storage</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>PBKDF2 Manager Authentication & Security Rules</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadSourceZip}
            className="w-full py-3 bg-[#0F2E22] hover:bg-[#16423C] text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>সোর্স কোড (.ZIP) ডাউনলোড করুন</span>
          </button>
        </div>

        {/* Card 2: Update Package .JSON Download */}
        <div className="bg-white p-6 rounded-2xl border-2 border-amber-600/30 shadow-md flex flex-col justify-between hover:border-amber-600 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-700 text-white text-[10px] font-mono px-3 py-1 rounded-bl-lg font-bold tracking-wider uppercase">
            Update File .JSON
          </div>

          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 flex items-center justify-center mb-4 shadow-sm">
              <FileJson className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-serif font-bold text-stone-900 mb-1">
              সিস্টেম আপডেট ও ডেটা প্যাকেজ ডাউনলোড
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              আপনার স্যালনের বর্তমান ডেটাবেজের সম্পূর্ণ হিস্টোরি, কর্মচারী তালিকা, দৈনিক ক্লোজিং এবং সিস্টেম কনফিগারেশনের সমন্বয়ে গঠিত <strong>Update Package (.JSON)</strong> ফাইল।
            </p>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-[11px] text-stone-700 space-y-1 mb-5">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                <span>সকল কর্মচারী ও সেবা আয়ের হিস্টোরি সহ</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                <span>মাসিক টার্গেট, দৈনিক ক্লোজিং ও অডিট ট্রেইল</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                <span>যেকোনো নতুন হোস্টিং বা সার্ভারে এক ক্লিকে ইমপোর্টযোগ্য</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadUpdatePackage}
            className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>আপডেট প্যাকেজ (.JSON) ডাউনলোড করুন</span>
          </button>
        </div>
      </div>

      {/* UPDATE APPLIER / INSTALLER SECTION */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base pb-3 border-b border-stone-100">
          <Upload className="w-5 h-5 text-[#0F2E22]" />
          <span>সিস্টেম আপডেট ফাইল আপলোড ও ইনস্টল (Apply Update / Patch)</span>
        </div>
        <p className="text-xs text-stone-600">
          ডাউনলোডকৃত বা নতুন কোনো <strong>.JSON</strong> আপডেট ফাইল নির্বাচন করে সরাসরি এই ওয়েবঅ্যাপে ইনস্টল করুন।
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-2 border-dashed border-stone-300 rounded-xl p-5 text-center hover:border-emerald-700 transition-colors flex flex-col items-center justify-center">
            <input
              type="file"
              id="update-upload"
              accept=".json,application/json"
              onChange={handleUpdateFileSelected}
              className="hidden"
            />
            <label htmlFor="update-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <FileJson className="w-8 h-8 text-stone-400" />
              <span className="text-xs font-bold text-stone-800">
                {selectedUpdateFile ? selectedUpdateFile.name : 'আপডেট প্যাকেজ (.JSON) নির্বাচন করুন'}
              </span>
              <span className="text-[11px] text-stone-500">
                কম্পিউটার বা ডিভাইস থেকে ফাইল ব্রাউজ করুন
              </span>
            </label>
          </div>

          <div>
            {updateParseError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{updateParseError}</span>
              </div>
            )}

            {updatePreview ? (
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2">
                <div className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  আপডেট প্যাকেজ বিবরণী
                </div>
                <div className="text-stone-700 text-[11px] space-y-1">
                  <div>&bull; অ্যাপ্লিকেশন: <strong>{updatePreview.appName}</strong> ({updatePreview.version})</div>
                  <div>&bull; কর্মচারী রেকর্ড: <strong>{updatePreview.employeesCount} জন</strong></div>
                  <div>&bull; দৈনিক ক্লোজিং হিসাব: <strong>{updatePreview.closingsCount} দিন</strong></div>
                  <div>&bull; মোট লেনদেন: <strong>{updatePreview.incomesCount + updatePreview.expensesCount} টি</strong></div>
                </div>

                <button
                  onClick={handleApplyUpdate}
                  disabled={isApplyingUpdate}
                  className="w-full mt-3 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isApplyingUpdate ? 'আপডেট প্রয়োগ হচ্ছে...' : 'আপডেট প্রয়োগ ও সেভ করুন (Apply Update)'}
                </button>
              </div>
            ) : (
              <div className="h-full min-h-[120px] rounded-xl bg-stone-50 border border-stone-200 p-4 flex flex-col justify-center text-xs text-stone-500">
                <p>কোনো ফাইল এখনও নির্বাচন করা হয়নি। বাম পাশের বাক্সে ক্লিক করে আপনার আপডেট বা ব্যাকআপ ফাইলটি আপলোড করুন।</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SYSTEM STATS & DATABASE OVERVIEW */}
      {systemInfo && (
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
              <Server className="w-5 h-5 text-[#0F2E22]" />
              সার্ভার ও ডেটাবেজ পরিসংখ্যান (System Health & Statistics)
            </div>
            <span className="text-xs font-mono text-stone-500">
              Platform: {systemInfo.platform} &bull; Node {systemInfo.nodeVersion}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-stone-500 block mb-1">মোট কর্মচারী</span>
              <div className="text-xl font-bold font-mono text-stone-900">
                {systemInfo.counts.employees} জন
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-stone-500 block mb-1">দৈনিক ক্লোজিং দিন</span>
              <div className="text-xl font-bold font-mono text-stone-900">
                {systemInfo.counts.dailyClosings} দিন
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-stone-500 block mb-1">আয় ও ব্যয় লেনদেন</span>
              <div className="text-xl font-bold font-mono text-stone-900">
                {systemInfo.counts.incomeTransactions + systemInfo.counts.expenseTransactions} টি
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-stone-500 block mb-1">মেমোরি ব্যবহার (RSS)</span>
              <div className="text-xl font-bold font-mono text-emerald-800">
                {systemInfo.memoryUsageMB} MB
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENVIRONMENT & DEPLOYMENT INSTRUCTIONS VIEWER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Terminal Run Guide */}
        <div className="bg-stone-900 text-stone-100 p-5 rounded-xl border border-stone-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
              <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold">
                <Terminal className="w-4 h-4" />
                <span>যেকোনো সার্ভারে চালুর কমান্ড (Run Commands)</span>
              </div>
              <button
                onClick={() => copyToClipboard(sampleDeployCommands, 'deploy')}
                className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200 transition-colors"
                title="কপি করুন"
              >
                {copiedDeploy ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-stone-300 overflow-x-auto leading-relaxed">
              {sampleDeployCommands}
            </pre>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-800 text-[10px] text-stone-500 font-mono">
            Node.js 18+ বা 20+ সমর্থিত।
          </div>
        </div>

        {/* Env Template */}
        <div className="bg-stone-900 text-stone-100 p-5 rounded-xl border border-stone-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
              <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold">
                <FileCode className="w-4 h-4" />
                <span>কনফিগারেশন ফাইল (.env.example)</span>
              </div>
              <button
                onClick={() => copyToClipboard(sampleEnvText, 'env')}
                className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200 transition-colors"
                title="কপি করুন"
              >
                {copiedEnv ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-stone-300 overflow-x-auto leading-relaxed">
              {sampleEnvText}
            </pre>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-800 text-[10px] text-stone-500 font-mono">
            সার্ভার পোর্ট 3000 এবং টাইমজোন এশিয়া/ঢাকা কনফিগার করা আছে।
          </div>
        </div>
      </div>
    </div>
  );
};
