export interface Manager {
  id: string;
  loginIdentifier: string; // e.g., '01522111121'
  fullName: string;
  role: 'manager' | 'owner';
  passwordSalt: string;
  passwordHash: string;
  mustChangePassword: boolean;
  createdAt: string;
  lastLoginAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: string; // e.g., 'EMP-001'
  name: string;
  role: string;
  phone?: string;
  serviceCategory: string;
  joiningDate: string; // YYYY-MM-DD
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Card' | 'Bank Transfer';

export interface IncomeTransaction {
  id: string; // inc_...
  businessDate: string; // YYYY-MM-DD
  employeeId?: string | null; // null for general salon income
  category: string;
  amount: number;
  description?: string;
  paymentMethod: PaymentMethod;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseTransaction {
  id: string; // exp_...
  businessDate: string; // YYYY-MM-DD
  employeeId?: string | null; // null for general salon expenses
  category: string;
  amount: number;
  description?: string;
  paymentMethod: PaymentMethod;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyClosing {
  id: string; // closing_YYYY-MM-DD
  businessDate: string; // YYYY-MM-DD
  totalEmployeeIncome: number;
  totalSalonLevelIncome: number;
  totalIncome: number;
  totalEmployeeExpenses: number;
  totalGeneralExpenses: number;
  totalExpenses: number;
  netBalance: number;
  notes?: string;
  isClosed: boolean;
  submittedBy: string;
  submittedAt: string;
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
}

export interface MonthlyTarget {
  id: string; // tgt_EMP-001_YYYY-MM
  employeeId: string;
  monthKey: string; // YYYY-MM
  targetAmount: number; // in BDT
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  entityType: 'daily_closing' | 'transaction' | 'employee' | 'target' | 'manager' | 'backup';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'close_day' | 'reopen_day' | 'restore';
  details: string;
  actorId: string;
  timestamp: string;
}

export interface SalonSettings {
  salonName: string;
  appName: string;
  timezone: string;
  currency: string;
  incomeCategories: string[];
  expenseCategories: string[];
  autoCloseTime?: string;
}

export interface DatabaseSchema {
  managers: Manager[];
  employees: Employee[];
  incomeTransactions: IncomeTransaction[];
  expenseTransactions: ExpenseTransaction[];
  dailyClosings: DailyClosing[];
  monthlyTargets: MonthlyTarget[];
  auditLogs: AuditLog[];
  settings: SalonSettings;
}
