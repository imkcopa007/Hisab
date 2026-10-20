export interface ManagerUser {
  id: string;
  loginIdentifier: string;
  fullName: string;
  role: 'manager' | 'owner';
  mustChangePassword: boolean;
  lastLoginAt?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone?: string;
  serviceCategory: string;
  joiningDate: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Card' | 'Bank Transfer';

export interface IncomeTransaction {
  id: string;
  businessDate: string;
  employeeId?: string | null;
  category: string;
  amount: number;
  description?: string;
  paymentMethod: PaymentMethod;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseTransaction {
  id: string;
  businessDate: string;
  employeeId?: string | null;
  category: string;
  amount: number;
  description?: string;
  paymentMethod: PaymentMethod;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyClosing {
  id: string;
  businessDate: string;
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

export interface EmployeeTargetStatus {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  monthKey: string;
  targetAmount: number;
  countedIncome: number;
  remainingAmount: number;
  excessAmount: number;
  status: 'not_set' | 'not_reached' | 'achieved' | 'exceeded';
  notes?: string;
  updatedAt?: string;
}

export interface MonthlyReportData {
  monthKey: string;
  settings: {
    salonName: string;
    appName: string;
    timezone: string;
    currency: string;
  };
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalEmployeeIncome: number;
  totalSalonLevelIncome: number;
  totalEmployeeExpenses: number;
  totalGeneralExpenses: number;
  peakDay: { date: string; income: number } | null;
  closingsCount: number;
  incomeTransactionsCount: number;
  expenseTransactionsCount: number;
  employeeBreakdown: {
    employee: Employee;
    countedIncome: number;
    recordedExpenses: number;
    transactionCount: number;
    targetAmount: number;
    remainingAmount: number;
    excessAmount: number;
    targetStatus: 'not_set' | 'not_reached' | 'achieved' | 'exceeded';
  }[];
  dailyClosings: DailyClosing[];
}

export interface SalonSettings {
  salonName: string;
  appName: string;
  timezone: string;
  currency: string;
  incomeCategories: string[];
  expenseCategories: string[];
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  details: string;
  actorId: string;
  timestamp: string;
}
