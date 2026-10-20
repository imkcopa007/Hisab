import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Phone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [loginIdentifier, setLoginIdentifier] = useState('01522111121');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginIdentifier.trim() || !password) {
      setError('অনুগ্রহ করে ম্যানেজার আইডি ও পাসওয়ার্ড প্রদান করুন');
      return;
    }

    try {
      setIsLoading(true);
      await login(loginIdentifier.trim(), password);
    } catch (err: any) {
      setError(err.message || 'লগইন ব্যর্থ হয়েছে। সঠিক আইডি ও পাসওয়ার্ড ব্যবহার করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setLoginIdentifier('01522111121');
    setPassword('imran2026');
  };

  return (
    <div className="min-h-screen bg-[#FBF9F1] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-amber-200">
      {/* Decorative top bar */}
      <div className="absolute top-0 inset-x-0 h-2 bg-[#0F2E22]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Salon Crest & App Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0F2E22] text-amber-300 shadow-xl border border-amber-500/30 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 tracking-tight">
            HIsabkhata
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
            Noble Reflxion Lifestyle Salon
          </p>
          <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-emerald-950/10 border border-emerald-900/20 text-[11px] font-mono text-[#0F2E22]">
            ম্যানেজার লগইন পোর্টাল (Manager Portal)
          </div>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-stone-200">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                ম্যানেজার আইডি / ফোন নম্বর (Manager ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="01522111121"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm font-mono text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0F2E22] hover:bg-[#16423C] text-amber-200 font-semibold text-xs uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <span>লগইন যাচাই হচ্ছে...</span>
              ) : (
                <>
                  <span>লগইন করুন (Sign In)</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>
          </form>

          {/* Initial credential quick-fill prompt */}
          <div className="mt-6 pt-5 border-t border-stone-200/80">
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  প্রাথমিক লগইন তথ্য (Initial Credentials):
                </span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] underline font-medium text-amber-800 hover:text-amber-950 cursor-pointer"
                >
                  তথ্য পূরণ করুন
                </button>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-tight">
                আইডি: <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200">01522111121</code> | পাসওয়ার্ড: <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200">imran2026</code>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-stone-600">
          সিস্টেম কারেন্সি: <span className="font-semibold text-stone-700">BDT (৳)</span> &bull; টাইমজোন: <span className="font-semibold text-stone-700">Asia/Dhaka</span>
        </div>
      </div>
    </div>
  );
};
