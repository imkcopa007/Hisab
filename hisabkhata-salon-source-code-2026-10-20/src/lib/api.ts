import { ManagerUser, Employee, DailyClosing, MonthlyReportData, EmployeeTargetStatus, SalonSettings, AuditLog, IncomeTransaction, ExpenseTransaction } from '../types';

const TOKEN_KEY = 'hisabkhata_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new Error('Unable to connect to salon accounting server. Please check network connection.');
  }

  if (response.status === 401) {
    clearStoredToken();
    if (!window.location.pathname.includes('/login')) {
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (loginIdentifier: string, password: string) =>
      request<{ token: string; manager: ManagerUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ loginIdentifier, password }),
      }),
    getMe: () => request<ManagerUser>('/api/auth/me'),
    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ success: boolean; message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    logout: () =>
      request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  },

  dashboard: {
    getSummary: () => request<any>('/api/dashboard'),
  },

  employees: {
    getAll: (includeInactive = true) =>
      request<Employee[]>(`/api/employees?includeInactive=${includeInactive}`),
    create: (data: Partial<Employee>) =>
      request<Employee>('/api/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Employee>) =>
      request<Employee>(`/api/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    setStatus: (id: string, isActive: boolean) =>
      request<Employee>(`/api/employees/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }),
    remove: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/employees/${id}`, {
        method: 'DELETE',
      }),
    getHistory: (id: string) =>
      request<{
        employee: Employee;
        lifetimeIncome: number;
        lifetimeExpenses: number;
        netBalance: number;
        recentIncomes: IncomeTransaction[];
        recentExpenses: ExpenseTransaction[];
        monthlyBreakdown: { monthKey: string; income: number; expenses: number; transactions: number }[];
      }>(`/api/employees/${id}/history`),
  },

  daily: {
    getByDate: (date: string) =>
      request<{
        income: IncomeTransaction[];
        expenses: ExpenseTransaction[];
        closing?: DailyClosing;
      }>(`/api/daily/${date}`),
    submitDay: (payload: {
      date: string;
      incomes: any[];
      expenses: any[];
      notes?: string;
      isEdit?: boolean;
    }) =>
      request<{
        success: boolean;
        message: string;
        closing: DailyClosing;
        incomeCount: number;
        expenseCount: number;
      }>('/api/daily/submit', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  history: {
    getAll: (month?: string, year?: string) => {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      return request<DailyClosing[]>(`/api/history?${params.toString()}`);
    },
  },

  targets: {
    getByMonth: (monthKey: string) =>
      request<{ monthKey: string; targets: EmployeeTargetStatus[] }>(`/api/targets/${monthKey}`),
    upsert: (payload: { employeeId: string; monthKey: string; targetAmount: number; notes?: string }) =>
      request<any>('/api/targets', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  reports: {
    getMonthly: (monthKey: string) =>
      request<MonthlyReportData>(`/api/reports/monthly?month=${monthKey}`),
  },

  backup: {
    exportJsonUrl: () => `/api/backup/export?format=json`,
    exportCsvUrl: () => `/api/backup/export?format=csv`,
    restore: (payload: any) =>
      request<{ success: boolean; message: string }>('/api/backup/restore', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  settings: {
    get: () => request<SalonSettings>('/api/settings'),
    update: (data: Partial<SalonSettings>) =>
      request<SalonSettings>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  auditLogs: {
    getAll: () => request<AuditLog[]>('/api/audit-logs'),
  },

  admin: {
    getSystemInfo: () =>
      request<{
        version: string;
        appName: string;
        status: string;
        nodeVersion: string;
        platform: string;
        uptimeSeconds: number;
        memoryUsageMB: number;
        counts: {
          employees: number;
          dailyClosings: number;
          incomeTransactions: number;
          expenseTransactions: number;
          monthlyTargets: number;
          auditLogs: number;
        };
        settings: any;
      }>('/api/admin/system-info'),
    downloadSourceUrl: () => '/api/admin/download-source',
    downloadUpdateUrl: () => '/api/admin/download-update-package',
    applyUpdate: (payload: any) =>
      request<{ success: boolean; message: string }>('/api/admin/apply-update', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
};
