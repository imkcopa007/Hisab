import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSchema, Employee, IncomeTransaction, ExpenseTransaction, DailyClosing, MonthlyTarget, AuditLog, SalonSettings } from './types.js';
import { hashPassword } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'salon_db.json');

const DEFAULT_SETTINGS: SalonSettings = {
  salonName: 'Noble Reflxion Lifestyle Salon',
  appName: 'HIsabkhata',
  timezone: 'Asia/Dhaka',
  currency: 'BDT',
  incomeCategories: [
    'Haircut & Styling (চুল কাটা ও স্টাইলিং)',
    'Facial & Skincare (ফেসিয়াল ও ত্বক পরিচর্যা)',
    'Hair Treatment & Spa (হেয়ার ট্রিটমেন্ট ও স্পা)',
    'Beard Grooming & Shave (দাড়ি ও শেভ)',
    'Hair Color & Highlights (হেয়ার কালার)',
    'Bridal & Groom Packages (গ্রুম ও ব্রাইডাল প্যাকেজ)',
    'Product Sales (প্রোডাক্ট বিক্রয়)',
    'Other Salon Services (অন্যান্য সেবা)'
  ],
  expenseCategories: [
    'Product & Raw Material Purchases (পণ্য ও প্রসাধন সামগ্রী)',
    'Employee Daily Allowance / Snack (স্টাফ খরচ/টিফিন)',
    'Utilities (Electricity, Water, Internet)',
    'Salon Rent & Maintenance (দোকান ভাড়া ও মেরামত)',
    'Laundry & Cleaning Supplies (লন্ড্রি ও পরিষ্কার পরিচ্ছন্নতা)',
    'Equipment & Tool Repairs (যন্ত্রপাতি মেরামত)',
    'Marketing & Promotion (প্রচারণা)',
    'Other Operating Expenses (বিবিধ খরচ)'
  ]
};

// Initial employee roster for Noble Reflxion Lifestyle Salon
const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Sazzad Hossain',
    role: 'Senior Hair Stylist (সিনিয়র হেয়ার স্টাইলিস্ট)',
    phone: '01711223344',
    serviceCategory: 'Haircut & Styling, Hair Treatment',
    joiningDate: '2024-01-15',
    notes: 'Master stylist, expert in fade cuts and keratin treatment.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'EMP-002',
    name: 'Tanvir Ahmed',
    role: 'Hair Colorist & Specialist (হেয়ার কালারিস্ট)',
    phone: '01822334455',
    serviceCategory: 'Hair Color, Highlights & Spa',
    joiningDate: '2024-03-01',
    notes: 'Certified color specialist.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'EMP-003',
    name: 'Kamrul Hasan',
    role: 'Skincare & Facial Expert (স্কিন কেয়ার এক্সপার্ট)',
    phone: '01933445566',
    serviceCategory: 'Facial, Cleanup & Grooming',
    joiningDate: '2024-05-10',
    notes: 'Hydra facial and organic skincare specialist.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'EMP-004',
    name: 'Rakibul Islam',
    role: 'Junior Stylist & Groomer (জুনিয়র স্টাইলিস্ট)',
    phone: '01644556677',
    serviceCategory: 'Haircut, Shave & Head Massage',
    joiningDate: '2024-08-01',
    notes: 'Handles basic styling and head massage.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

class DatabaseEngine {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = this.getDefaultState();
    this.init();
  }

  private getDefaultState(): DatabaseSchema {
    return {
      managers: [],
      employees: INITIAL_EMPLOYEES,
      incomeTransactions: [],
      expenseTransactions: [],
      dailyClosings: [],
      monthlyTargets: [],
      auditLogs: [],
      settings: DEFAULT_SETTINGS,
    };
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.isLoaded = true;
      } else {
        this.data = this.getDefaultState();
        this.bootstrapInitialManager();
        this.persist();
        this.isLoaded = true;
      }

      // Ensure manager exists
      if (!this.data.managers || this.data.managers.length === 0) {
        this.bootstrapInitialManager();
        this.persist();
      }
    } catch (err) {
      console.error('Failed to initialize database file:', err);
      this.data = this.getDefaultState();
      this.bootstrapInitialManager();
    }
  }

  private bootstrapInitialManager() {
    // Initial manager specified in user brief: ID 01522111121, temporary password imran2026
    const { salt, hash } = hashPassword('imran2026');
    this.data.managers = [
      {
        id: 'MGR-001',
        loginIdentifier: '01522111121',
        fullName: 'Md. Imran (Salon Manager)',
        role: 'manager',
        passwordSalt: salt,
        passwordHash: hash,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
      }
    ];
    this.logAudit({
      entityType: 'manager',
      entityId: 'MGR-001',
      action: 'create',
      details: 'Initial bootstrap manager account provisioned securely with temporary credential.',
      actorId: 'system'
    });
  }

  private persist(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Database write error:', err);
      throw new Error('Failed to persist financial records to disk.');
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const audit: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    this.data.auditLogs.unshift(audit);
    // Keep max 1000 audit logs
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
  }

  // --- Manager methods ---
  public getManagerByIdentifier(identifier: string) {
    return this.data.managers.find(m => m.loginIdentifier === identifier);
  }

  public getManagerById(id: string) {
    return this.data.managers.find(m => m.id === id);
  }

  public updateManagerPassword(id: string, newPassword: string): boolean {
    const mgr = this.getManagerById(id);
    if (!mgr) return false;
    const { salt, hash } = hashPassword(newPassword);
    mgr.passwordSalt = salt;
    mgr.passwordHash = hash;
    mgr.mustChangePassword = false;
    mgr.updatedAt = new Date().toISOString();
    this.logAudit({
      entityType: 'manager',
      entityId: id,
      action: 'update',
      details: 'Manager updated account password.',
      actorId: id
    });
    this.persist();
    return true;
  }

  public recordManagerLogin(id: string) {
    const mgr = this.getManagerById(id);
    if (mgr) {
      mgr.lastLoginAt = new Date().toISOString();
      this.persist();
    }
  }

  // --- Employee methods ---
  public getEmployees(includeInactive = true): Employee[] {
    if (includeInactive) return this.data.employees;
    return this.data.employees.filter(e => e.isActive);
  }

  public getEmployeeById(id: string): Employee | undefined {
    return this.data.employees.find(e => e.id === id);
  }

  public addEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>, actorId: string): Employee {
    let maxIdNum = 0;
    for (const emp of this.data.employees) {
      const match = emp.id.match(/^EMP-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIdNum) maxIdNum = num;
      }
    }
    const nextNum = (maxIdNum + 1).toString().padStart(3, '0');
    const newEmp: Employee = {
      ...employee,
      id: `EMP-${nextNum}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.employees.push(newEmp);
    this.logAudit({
      entityType: 'employee',
      entityId: newEmp.id,
      action: 'create',
      details: `Added new employee ${newEmp.name} (${newEmp.role})`,
      actorId
    });
    this.persist();
    return newEmp;
  }

  public updateEmployee(id: string, updates: Partial<Omit<Employee, 'id' | 'createdAt'>>, actorId: string): Employee | null {
    const index = this.data.employees.findIndex(e => e.id === id);
    if (index === -1) return null;

    this.data.employees[index] = {
      ...this.data.employees[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.logAudit({
      entityType: 'employee',
      entityId: id,
      action: 'update',
      details: `Updated employee details for ${this.data.employees[index].name}`,
      actorId
    });
    this.persist();
    return this.data.employees[index];
  }

  public removeEmployee(id: string, actorId: string): boolean {
    const index = this.data.employees.findIndex(e => e.id === id);
    if (index === -1) return false;
    const emp = this.data.employees[index];
    this.data.employees.splice(index, 1);
    this.logAudit({
      entityType: 'employee',
      entityId: id,
      action: 'delete',
      details: `Removed employee ${emp.name} (${emp.id}) from active staff roster`,
      actorId
    });
    this.persist();
    return true;
  }

  public setEmployeeActive(id: string, isActive: boolean, actorId: string): Employee | null {
    const emp = this.getEmployeeById(id);
    if (!emp) return null;
    emp.isActive = isActive;
    emp.updatedAt = new Date().toISOString();
    this.logAudit({
      entityType: 'employee',
      entityId: id,
      action: 'update',
      details: `${isActive ? 'Activated' : 'Deactivated'} employee ${emp.name}`,
      actorId
    });
    this.persist();
    return emp;
  }

  // --- Daily Transactions & Closings ---
  public getTransactionsByDate(date: string) {
    const income = this.data.incomeTransactions.filter(t => t.businessDate === date);
    const expenses = this.data.expenseTransactions.filter(t => t.businessDate === date);
    const closing = this.data.dailyClosings.find(c => c.businessDate === date);
    return { income, expenses, closing };
  }

  public getDailyClosingByDate(date: string): DailyClosing | undefined {
    return this.data.dailyClosings.find(c => c.businessDate === date);
  }

  public getAllDailyClosings(): DailyClosing[] {
    return [...this.data.dailyClosings].sort((a, b) => b.businessDate.localeCompare(a.businessDate));
  }

  public submitDay(
    date: string,
    incomes: Omit<IncomeTransaction, 'id' | 'businessDate' | 'createdAt' | 'updatedAt' | 'createdBy'>[],
    expenses: Omit<ExpenseTransaction, 'id' | 'businessDate' | 'createdAt' | 'updatedAt' | 'createdBy'>[],
    notes: string | undefined,
    actorId: string,
    isEdit = false
  ): { closing: DailyClosing; incomeCount: number; expenseCount: number } {
    const existingClosing = this.getDailyClosingByDate(date);
    if (existingClosing && !isEdit) {
      throw new Error(`Date ${date} has already been submitted and closed. Use edit mode to update.`);
    }

    const timestamp = new Date().toISOString();

    // Remove prior transactions for this date if editing
    if (isEdit) {
      this.data.incomeTransactions = this.data.incomeTransactions.filter(t => t.businessDate !== date);
      this.data.expenseTransactions = this.data.expenseTransactions.filter(t => t.businessDate !== date);
    }

    // Insert new incomes
    const createdIncomes: IncomeTransaction[] = incomes.map((inc, i) => ({
      ...inc,
      id: `inc_${date}_${Date.now()}_${i}`,
      businessDate: date,
      createdBy: actorId,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    // Insert new expenses
    const createdExpenses: ExpenseTransaction[] = expenses.map((exp, i) => ({
      ...exp,
      id: `exp_${date}_${Date.now()}_${i}`,
      businessDate: date,
      createdBy: actorId,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    this.data.incomeTransactions.push(...createdIncomes);
    this.data.expenseTransactions.push(...createdExpenses);

    // Calculate totals strictly according to the defined salon accounting formula:
    // 1. Employee income: transactions where employeeId is set
    // 2. Salon-level income: transactions where employeeId is null/undefined
    // 3. Total income: Employee income + Salon-level income
    // 4. Employee expenses: transactions where employeeId is set
    // 5. General salon expenses: transactions where employeeId is null/undefined
    // 6. Total expenses: Employee expenses + General expenses
    // 7. Net balance: Total income - Total expenses
    const totalEmployeeIncome = createdIncomes
      .filter(t => Boolean(t.employeeId))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalSalonLevelIncome = createdIncomes
      .filter(t => !t.employeeId)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalIncome = totalEmployeeIncome + totalSalonLevelIncome;

    const totalEmployeeExpenses = createdExpenses
      .filter(t => Boolean(t.employeeId))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalGeneralExpenses = createdExpenses
      .filter(t => !t.employeeId)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalExpenses = totalEmployeeExpenses + totalGeneralExpenses;
    const netBalance = totalIncome - totalExpenses;

    const closingId = `closing_${date}`;
    const closing: DailyClosing = {
      id: closingId,
      businessDate: date,
      totalEmployeeIncome,
      totalSalonLevelIncome,
      totalIncome,
      totalEmployeeExpenses,
      totalGeneralExpenses,
      totalExpenses,
      netBalance,
      notes: notes || '',
      isClosed: true,
      submittedBy: existingClosing?.submittedBy || actorId,
      submittedAt: existingClosing?.submittedAt || timestamp,
      lastUpdatedAt: isEdit ? timestamp : undefined,
      lastUpdatedBy: isEdit ? actorId : undefined,
    };

    const closingIndex = this.data.dailyClosings.findIndex(c => c.businessDate === date);
    if (closingIndex >= 0) {
      this.data.dailyClosings[closingIndex] = closing;
    } else {
      this.data.dailyClosings.push(closing);
    }

    this.logAudit({
      entityType: 'daily_closing',
      entityId: closingId,
      action: isEdit ? 'update' : 'close_day',
      details: `${isEdit ? 'Modified' : 'Closed'} accounts for ${date}. Income: ৳${totalIncome.toLocaleString()}, Expenses: ৳${totalExpenses.toLocaleString()}, Net: ৳${netBalance.toLocaleString()}`,
      actorId
    });

    this.persist();
    return { closing, incomeCount: createdIncomes.length, expenseCount: createdExpenses.length };
  }

  // --- Monthly Targets ---
  public getMonthlyTargets(monthKey: string): MonthlyTarget[] {
    return this.data.monthlyTargets.filter(t => t.monthKey === monthKey);
  }

  public upsertMonthlyTarget(employeeId: string, monthKey: string, targetAmount: number, notes: string | undefined, actorId: string): MonthlyTarget {
    const id = `tgt_${employeeId}_${monthKey}`;
    const timestamp = new Date().toISOString();
    const existingIndex = this.data.monthlyTargets.findIndex(t => t.id === id);

    let record: MonthlyTarget;
    if (existingIndex >= 0) {
      record = {
        ...this.data.monthlyTargets[existingIndex],
        targetAmount,
        notes: notes ?? this.data.monthlyTargets[existingIndex].notes,
        updatedAt: timestamp,
      };
      this.data.monthlyTargets[existingIndex] = record;
      this.logAudit({
        entityType: 'target',
        entityId: id,
        action: 'update',
        details: `Updated target for employee ${employeeId} for month ${monthKey} to ৳${targetAmount.toLocaleString()}`,
        actorId
      });
    } else {
      record = {
        id,
        employeeId,
        monthKey,
        targetAmount,
        notes,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: actorId,
      };
      this.data.monthlyTargets.push(record);
      this.logAudit({
        entityType: 'target',
        entityId: id,
        action: 'create',
        details: `Set target for employee ${employeeId} for month ${monthKey} to ৳${targetAmount.toLocaleString()}`,
        actorId
      });
    }
    this.persist();
    return record;
  }

  // --- Reports & Calculations ---
  public getMonthlyReport(monthKey: string) {
    // monthKey: YYYY-MM
    const startDate = `${monthKey}-01`;
    const endDate = `${monthKey}-31`;

    const monthClosings = this.data.dailyClosings
      .filter(c => c.businessDate.startsWith(monthKey))
      .sort((a, b) => a.businessDate.localeCompare(b.businessDate));

    const monthIncomes = this.data.incomeTransactions.filter(t => t.businessDate.startsWith(monthKey));
    const monthExpenses = this.data.expenseTransactions.filter(t => t.businessDate.startsWith(monthKey));

    const totalIncome = monthIncomes.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalExpenses = monthExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const netBalance = totalIncome - totalExpenses;

    const totalEmployeeIncome = monthIncomes
      .filter(t => Boolean(t.employeeId))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalSalonLevelIncome = monthIncomes
      .filter(t => !t.employeeId)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalEmployeeExpenses = monthExpenses
      .filter(t => Boolean(t.employeeId))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalGeneralExpenses = monthExpenses
      .filter(t => !t.employeeId)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // Peak day
    let peakDay: { date: string; income: number } | null = null;
    monthClosings.forEach(c => {
      if (!peakDay || c.totalIncome > peakDay.income) {
        peakDay = { date: c.businessDate, income: c.totalIncome };
      }
    });

    // Employee breakdown
    const targets = this.getMonthlyTargets(monthKey);
    const employeeBreakdown = this.data.employees.map(emp => {
      const empIncomes = monthIncomes.filter(t => t.employeeId === emp.id);
      const empExpenses = monthExpenses.filter(t => t.employeeId === emp.id);
      const countedIncome = empIncomes.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const recordedExpenses = empExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
      const targetObj = targets.find(t => t.employeeId === emp.id);
      const targetAmount = targetObj ? targetObj.targetAmount : 0;
      
      // Calculate BDT remaining or excess (NEVER PERCENTAGE)
      const remainingAmount = targetAmount > countedIncome ? targetAmount - countedIncome : 0;
      const excessAmount = countedIncome > targetAmount ? countedIncome - targetAmount : 0;
      let targetStatus: 'not_set' | 'not_reached' | 'achieved' | 'exceeded' = 'not_set';
      if (targetAmount > 0) {
        if (countedIncome > targetAmount) targetStatus = 'exceeded';
        else if (countedIncome === targetAmount) targetStatus = 'achieved';
        else targetStatus = 'not_reached';
      }

      return {
        employee: emp,
        countedIncome,
        recordedExpenses,
        transactionCount: empIncomes.length,
        targetAmount,
        remainingAmount,
        excessAmount,
        targetStatus,
      };
    });

    return {
      monthKey,
      settings: this.data.settings,
      totalIncome,
      totalExpenses,
      netBalance,
      totalEmployeeIncome,
      totalSalonLevelIncome,
      totalEmployeeExpenses,
      totalGeneralExpenses,
      peakDay,
      closingsCount: monthClosings.length,
      incomeTransactionsCount: monthIncomes.length,
      expenseTransactionsCount: monthExpenses.length,
      employeeBreakdown,
      dailyClosings: monthClosings,
    };
  }

  // --- Settings ---
  public getSettings(): SalonSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SalonSettings>, actorId: string): SalonSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.logAudit({
      entityType: 'backup',
      entityId: 'settings',
      action: 'update',
      details: 'Updated salon settings and configuration.',
      actorId
    });
    this.persist();
    return this.data.settings;
  }

  // --- Backup & Restore ---
  public exportFullBackup(): DatabaseSchema {
    return JSON.parse(JSON.stringify(this.data));
  }

  public restoreBackup(incomingData: Partial<DatabaseSchema>, actorId: string): { success: boolean; message: string } {
    if (!incomingData || typeof incomingData !== 'object') {
      throw new Error('Invalid backup file format');
    }

    if (!Array.isArray(incomingData.employees) || !Array.isArray(incomingData.incomeTransactions)) {
      throw new Error('Backup payload is missing vital collections (employees or transactions)');
    }

    // Preserve current managers credentials if not provided or maintain safety
    const managers = (incomingData.managers && incomingData.managers.length > 0) 
      ? incomingData.managers 
      : this.data.managers;

    this.data = {
      managers,
      employees: incomingData.employees || [],
      incomeTransactions: incomingData.incomeTransactions || [],
      expenseTransactions: incomingData.expenseTransactions || [],
      dailyClosings: incomingData.dailyClosings || [],
      monthlyTargets: incomingData.monthlyTargets || [],
      auditLogs: incomingData.auditLogs || [],
      settings: incomingData.settings || DEFAULT_SETTINGS,
    };

    this.logAudit({
      entityType: 'backup',
      entityId: 'system',
      action: 'restore',
      details: `Full database restored from backup. Restored ${this.data.dailyClosings.length} closings and ${this.data.incomeTransactions.length} income entries.`,
      actorId
    });

    this.persist();
    return {
      success: true,
      message: `Successfully restored ${this.data.employees.length} employees, ${this.data.dailyClosings.length} daily closings, and ${this.data.incomeTransactions.length + this.data.expenseTransactions.length} transactions.`
    };
  }
}

export const db = new DatabaseEngine();
