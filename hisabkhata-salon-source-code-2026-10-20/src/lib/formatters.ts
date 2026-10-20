/**
 * Currency & Date formatting utilities for Noble Reflxion Lifestyle Salon (HIsabkhata)
 */

export function formatBDT(amount: number | undefined | null): string {
  const val = Number(amount) || 0;
  return `৳ ${val.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}

export function formatBDTFull(amount: number | undefined | null): string {
  const val = Number(amount) || 0;
  return `৳ ${val.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

export function formatDateDhaka(dateString?: string): string {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-');
  if (!y || !m || !d) return dateString;

  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonthName(monthKey: string): string {
  // monthKey: YYYY-MM
  const [year, month] = monthKey.split('-');
  if (!year || !month) return monthKey;

  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const enName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const bngMonths: Record<string, string> = {
    '01': 'জানুয়ারি',
    '02': 'ফেব্রুয়ারি',
    '03': 'মার্চ',
    '04': 'এপ্রিল',
    '05': 'মে',
    '06': 'জুন',
    '07': 'জুলাই',
    '08': 'আগস্ট',
    '09': 'সেপ্টেম্বর',
    '10': 'অক্টোবর',
    '11': 'নভেম্বর',
    '12': 'ডিসেম্বর',
  };

  const bnMonth = bngMonths[month] || '';
  return `${enName} (${bnMonth})`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}
