import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  isMandatory?: boolean;
}

export const PasswordChangeModal: React.FC<Props> = ({ isOpen, onClose, isMandatory = false }) => {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError('অনুগ্রহ করে বর্তমান পাসওয়ার্ড দিন (Please enter current password)');
      return;
    }
    if (newPassword.length < 6) {
      setError('নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে (New password must be at least 6 characters)');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('নতুন পাসওয়ার্ড দুটি মিলছে না (New passwords do not match)');
      return;
    }

    try {
      setIsSubmitting(true);
      await changePassword(currentPassword, newPassword);
      setSuccess('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে (Password changed successfully)');
      setTimeout(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess(null);
        if (onClose) onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-stone-50 rounded-xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0F2E22] px-6 py-4 text-white flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-300">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-medium text-lg text-stone-100">
              {isMandatory ? 'পাসওয়ার্ড পরিবর্তন আবশ্যক' : 'পাসওয়ার্ড পরিবর্তন করুন'}
            </h3>
            <p className="text-xs text-stone-300">
              {isMandatory ? 'Security Notice: Please update temporary bootstrap password' : 'Change Manager Password'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isMandatory && (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong>নিরাপত্তা সতর্কতা:</strong> আপনি প্রাথমিক অস্থায়ী পাসওয়ার্ড দিয়ে লগইন করেছেন। স্যালন অ্যাকাউন্টিং ডেটার সুরক্ষায় এখনই আপনার নিজস্ব গোপন পাসওয়ার্ড সেট করুন।
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                বর্তমান পাসওয়ার্ড (Current Password)
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড দিন"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                নতুন পাসওয়ার্ড (New Password)
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="ন্যূনতম ৬ অক্ষর"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ডটি আবার লিখুন"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F2E22] focus:border-transparent"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              {!isMandatory && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 transition-colors"
                >
                  বাতিল (Cancel)
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#0F2E22] text-amber-300 font-medium text-xs uppercase tracking-wider rounded-lg shadow-sm hover:bg-[#16423C] disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন (Save Password)'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
