import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { db } from './db.js';
import { verifyPassword, createSession, validateSession, revokeSession, updateSessionPasswordFlag } from './auth.js';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export const apiRouter = Router();

// Authentication middleware for protected endpoints
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  const session = validateSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  (req as any).user = session;
  next();
}

// ==================== AUTHENTICATION ROUTES ====================

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { loginIdentifier, password } = req.body;

  if (!loginIdentifier || !password) {
    return res.status(400).json({ error: 'Login ID and password are required.' });
  }

  const manager = db.getManagerByIdentifier(String(loginIdentifier).trim());
  if (!manager) {
    return res.status(401).json({ error: 'Invalid manager ID or password.' });
  }

  const isValid = verifyPassword(password, manager.passwordSalt, manager.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid manager ID or password.' });
  }

  db.recordManagerLogin(manager.id);
  const { token, session } = createSession(manager);

  return res.json({
    token,
    manager: {
      id: manager.id,
      loginIdentifier: manager.loginIdentifier,
      fullName: manager.fullName,
      role: manager.role,
      mustChangePassword: manager.mustChangePassword,
    }
  });
});

apiRouter.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const manager = db.getManagerById(user.managerId);
  if (!manager) {
    return res.status(404).json({ error: 'Manager profile not found.' });
  }

  return res.json({
    id: manager.id,
    loginIdentifier: manager.loginIdentifier,
    fullName: manager.fullName,
    role: manager.role,
    mustChangePassword: manager.mustChangePassword,
    lastLoginAt: manager.lastLoginAt,
  });
});

apiRouter.post('/auth/change-password', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const manager = db.getManagerById(user.managerId);
  if (!manager) {
    return res.status(404).json({ error: 'Manager not found.' });
  }

  const isCurrentValid = verifyPassword(currentPassword, manager.passwordSalt, manager.passwordHash);
  if (!isCurrentValid) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  db.updateManagerPassword(manager.id, newPassword);
  updateSessionPasswordFlag(manager.id, false);

  return res.json({ success: true, message: 'Password successfully updated.' });
});

apiRouter.post('/auth/logout', requireAuth, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    revokeSession(token);
  }
  return res.json({ success: true });
});

// ==================== DASHBOARD ROUTES ====================

apiRouter.get('/dashboard', requireAuth, (req: Request, res: Response) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const todayDate = `${year}-${month}-${day}`;
  const currentMonthKey = `${year}-${month}`;

  // Today stats
  const todayData = db.getTransactionsByDate(todayDate);
  const todayClosing = todayData.closing;

  const todayIncome = todayData.income.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const todayExpenses = todayData.expenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const todayNet = todayIncome - todayExpenses;

  // Month stats
  const monthlyReport = db.getMonthlyReport(currentMonthKey);

  // Active employees count
  const allEmployees = db.getEmployees(true);
  const activeEmployees = allEmployees.filter(e => e.isActive);

  // Recent closings (last 7)
  const recentClosings = db.getAllDailyClosings().slice(0, 7);

  // Today employee-wise summary
  const employeeTodaySummary = activeEmployees.map(emp => {
    const empIncomes = todayData.income.filter(t => t.employeeId === emp.id);
    const empExpenses = todayData.expenses.filter(t => t.employeeId === emp.id);
    const income = empIncomes.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const expenses = empExpenses.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    return {
      id: emp.id,
      name: emp.name,
      role: emp.role,
      income,
      expenses,
      net: income - expenses,
      transactionCount: empIncomes.length,
    };
  });

  return res.json({
    todayDate,
    currentMonthKey,
    today: {
      totalIncome: todayIncome,
      totalExpenses: todayExpenses,
      netBalance: todayNet,
      isClosed: Boolean(todayClosing?.isClosed),
      employeeIncome: todayData.income.filter(t => Boolean(t.employeeId)).reduce((s, t) => s + (Number(t.amount) || 0), 0),
      salonLevelIncome: todayData.income.filter(t => !t.employeeId).reduce((s, t) => s + (Number(t.amount) || 0), 0),
    },
    month: {
      totalIncome: monthlyReport.totalIncome,
      totalExpenses: monthlyReport.totalExpenses,
      netBalance: monthlyReport.netBalance,
      totalEmployeeIncome: monthlyReport.totalEmployeeIncome,
      totalSalonLevelIncome: monthlyReport.totalSalonLevelIncome,
      closingsCount: monthlyReport.closingsCount,
    },
    activeEmployeesCount: activeEmployees.length,
    totalEmployeesCount: allEmployees.length,
    employeeTodaySummary,
    recentClosings,
  });
});

// ==================== EMPLOYEES ====================

apiRouter.get('/employees', requireAuth, (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive !== 'false';
  const employees = db.getEmployees(includeInactive);
  return res.json(employees);
});

apiRouter.post('/employees', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { name, role, phone, serviceCategory, joiningDate, notes } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'Employee name and role are required.' });
  }

  const newEmp = db.addEmployee(
    {
      name: name.trim(),
      role: role.trim(),
      phone: phone ? phone.trim() : '',
      serviceCategory: serviceCategory ? serviceCategory.trim() : 'General Styling',
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      notes: notes || '',
      isActive: true,
    },
    user.managerId
  );

  return res.status(201).json(newEmp);
});

apiRouter.put('/employees/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { name, role, phone, serviceCategory, joiningDate, notes, isActive } = req.body;

  const updated = db.updateEmployee(
    id,
    {
      name,
      role,
      phone,
      serviceCategory,
      joiningDate,
      notes,
      isActive: typeof isActive === 'boolean' ? isActive : undefined,
    },
    user.managerId
  );

  if (!updated) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  return res.json(updated);
});

apiRouter.delete('/employees/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const success = db.removeEmployee(id, user.managerId);
  if (!success) {
    return res.status(404).json({ error: 'কর্মচারী খুঁজে পাওয়া যায়নি (Employee not found).' });
  }

  return res.json({ success: true, message: 'কর্মচারী সফলভাবে তালিকা থেকে রিমুভ করা হয়েছে।' });
});

apiRouter.patch('/employees/:id/status', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'isActive must be a boolean.' });
  }

  const updated = db.setEmployeeActive(id, isActive, user.managerId);
  if (!updated) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  return res.json(updated);
});

apiRouter.get('/employees/:id/history', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const emp = db.getEmployeeById(id);
  if (!emp) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  const rawData = db.getRawData();
  const incomes = rawData.incomeTransactions.filter(t => t.employeeId === id);
  const expenses = rawData.expenseTransactions.filter(t => t.employeeId === id);
  const totalIncome = incomes.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalExpenses = expenses.reduce((s, t) => s + (Number(t.amount) || 0), 0);

  // Group by month
  const monthlyMap: Record<string, { monthKey: string; income: number; expenses: number; transactions: number }> = {};
  incomes.forEach(t => {
    const m = t.businessDate.substring(0, 7);
    if (!monthlyMap[m]) monthlyMap[m] = { monthKey: m, income: 0, expenses: 0, transactions: 0 };
    monthlyMap[m].income += Number(t.amount) || 0;
    monthlyMap[m].transactions += 1;
  });
  expenses.forEach(t => {
    const m = t.businessDate.substring(0, 7);
    if (!monthlyMap[m]) monthlyMap[m] = { monthKey: m, income: 0, expenses: 0, transactions: 0 };
    monthlyMap[m].expenses += Number(t.amount) || 0;
  });

  const targets = rawData.monthlyTargets.filter(t => t.employeeId === id);

  return res.json({
    employee: emp,
    lifetimeIncome: totalIncome,
    lifetimeExpenses: totalExpenses,
    netBalance: totalIncome - totalExpenses,
    recentIncomes: incomes.slice(-20).reverse(),
    recentExpenses: expenses.slice(-20).reverse(),
    monthlyBreakdown: Object.values(monthlyMap).sort((a, b) => b.monthKey.localeCompare(a.monthKey)),
    targets,
  });
});

// ==================== DAILY TRANSACTIONS & CLOSING ====================

apiRouter.get('/daily/:date', requireAuth, (req: Request, res: Response) => {
  const { date } = req.params;
  const data = db.getTransactionsByDate(date);
  return res.json(data);
});

apiRouter.post('/daily/submit', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { date, incomes, expenses, notes, isEdit } = req.body;

  if (!date) {
    return res.status(400).json({ error: 'Date is required.' });
  }

  if (!Array.isArray(incomes) || !Array.isArray(expenses)) {
    return res.status(400).json({ error: 'Incomes and expenses must be arrays.' });
  }

  // Validate negative values
  for (const inc of incomes) {
    if (Number(inc.amount) < 0) {
      return res.status(400).json({ error: 'Income amounts cannot be negative.' });
    }
  }
  for (const exp of expenses) {
    if (Number(exp.amount) < 0) {
      return res.status(400).json({ error: 'Expense amounts cannot be negative.' });
    }
  }

  try {
    const result = db.submitDay(date, incomes, expenses, notes, user.managerId, Boolean(isEdit));
    return res.json({
      success: true,
      message: `Day ${date} successfully ${isEdit ? 'updated' : 'closed and saved'}.`,
      ...result,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to submit daily accounts.' });
  }
});

// ==================== HISTORY & CALENDAR ====================

apiRouter.get('/history', requireAuth, (req: Request, res: Response) => {
  const { month, year } = req.query;
  let closings = db.getAllDailyClosings();

  if (month && year) {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    closings = closings.filter(c => c.businessDate.startsWith(key));
  } else if (year) {
    closings = closings.filter(c => c.businessDate.startsWith(String(year)));
  }

  return res.json(closings);
});

// ==================== MONTHLY TARGETS (AMOUNTS IN BDT ONLY, NO PERCENTAGES) ====================

apiRouter.get('/targets/:month', requireAuth, (req: Request, res: Response) => {
  const { month } = req.params; // YYYY-MM
  const targets = db.getMonthlyTargets(month);
  const employees = db.getEmployees(true);
  const rawData = db.getRawData();
  const monthIncomes = rawData.incomeTransactions.filter(t => t.businessDate.startsWith(month));

  const list = employees.map(emp => {
    const targetObj = targets.find(t => t.employeeId === emp.id);
    const targetAmount = targetObj ? targetObj.targetAmount : 0;
    const empIncomes = monthIncomes.filter(t => t.employeeId === emp.id);
    const countedIncome = empIncomes.reduce((s, t) => s + (Number(t.amount) || 0), 0);

    // Strict requirement: BDT amounts only, never percentages
    const remainingAmount = targetAmount > countedIncome ? targetAmount - countedIncome : 0;
    const excessAmount = countedIncome > targetAmount ? countedIncome - targetAmount : 0;
    let status: 'not_set' | 'not_reached' | 'achieved' | 'exceeded' = 'not_set';
    if (targetAmount > 0) {
      if (countedIncome > targetAmount) status = 'exceeded';
      else if (countedIncome === targetAmount) status = 'achieved';
      else status = 'not_reached';
    }

    return {
      employeeId: emp.id,
      employeeName: emp.name,
      employeeRole: emp.role,
      monthKey: month,
      targetAmount,
      countedIncome,
      remainingAmount,
      excessAmount,
      status,
      notes: targetObj?.notes || '',
      updatedAt: targetObj?.updatedAt,
    };
  });

  return res.json({ monthKey: month, targets: list });
});

apiRouter.post('/targets', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { employeeId, monthKey, targetAmount, notes } = req.body;

  if (!employeeId || !monthKey || typeof targetAmount !== 'number') {
    return res.status(400).json({ error: 'employeeId, monthKey, and numeric targetAmount are required.' });
  }

  if (targetAmount < 0) {
    return res.status(400).json({ error: 'Target amount cannot be negative.' });
  }

  const record = db.upsertMonthlyTarget(employeeId, monthKey, targetAmount, notes, user.managerId);
  return res.json(record);
});

// ==================== MONTHLY REPORTS ====================

apiRouter.get('/reports/monthly', requireAuth, (req: Request, res: Response) => {
  const { month } = req.query;
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const monthKey = typeof month === 'string' && month ? month : defaultMonth;

  const report = db.getMonthlyReport(monthKey);
  return res.json(report);
});

// ==================== BACKUP & RESTORE ====================

apiRouter.get('/backup/export', requireAuth, (req: Request, res: Response) => {
  const format = req.query.format === 'csv' ? 'csv' : 'json';
  const data = db.exportFullBackup();

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="hisabkhata-backup-${new Date().toISOString().split('T')[0]}.json"`);
    return res.send(JSON.stringify(data, null, 2));
  }

  // Export CSV of transactions
  let csv = 'Type,Transaction ID,Date,Employee ID,Category,Amount BDT,Payment Method,Description\n';
  data.incomeTransactions.forEach(t => {
    csv += `"Income","${t.id}","${t.businessDate}","${t.employeeId || 'Salon-Level'}","${t.category}","${t.amount}","${t.paymentMethod}","${(t.description || '').replace(/"/g, '""')}"\n`;
  });
  data.expenseTransactions.forEach(t => {
    csv += `"Expense","${t.id}","${t.businessDate}","${t.employeeId || 'General Salon'}","${t.category}","${t.amount}","${t.paymentMethod}","${(t.description || '').replace(/"/g, '""')}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="hisabkhata-transactions-${new Date().toISOString().split('T')[0]}.csv"`);
  return res.send(csv);
});

apiRouter.post('/backup/restore', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const incomingData = req.body;

  try {
    const result = db.restoreBackup(incomingData, user.managerId);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to restore backup.' });
  }
});

// ==================== SETTINGS & AUDIT LOGS ====================

apiRouter.get('/settings', requireAuth, (_req: Request, res: Response) => {
  return res.json(db.getSettings());
});

apiRouter.put('/settings', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const updates = req.body;
  const updated = db.updateSettings(updates, user.managerId);
  return res.json(updated);
});

apiRouter.get('/audit-logs', requireAuth, (_req: Request, res: Response) => {
  const raw = db.getRawData();
  return res.json(raw.auditLogs.slice(0, 100));
});

// ==================== ADMIN PANEL & SYSTEM UPDATES ====================

apiRouter.get('/admin/system-info', requireAuth, (_req: Request, res: Response) => {
  const rawData = db.getRawData();
  const memory = process.memoryUsage();
  return res.json({
    version: '1.2.0',
    appName: 'HIsabkhata — Noble Reflxion Lifestyle Salon',
    status: 'online',
    nodeVersion: process.version,
    platform: process.platform,
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(memory.rss / (1024 * 1024)),
    counts: {
      employees: rawData.employees.length,
      dailyClosings: rawData.dailyClosings.length,
      incomeTransactions: rawData.incomeTransactions.length,
      expenseTransactions: rawData.expenseTransactions.length,
      monthlyTargets: rawData.monthlyTargets.length,
      auditLogs: rawData.auditLogs.length,
    },
    settings: rawData.settings,
  });
});

function createZipArchive(options: any = {}) {
  if (typeof archiver === 'function') return archiver('zip', options);
  if (archiver && archiver.ZipArchive) return new archiver.ZipArchive(options);
  if (archiver && archiver.Archiver) return new archiver.Archiver('zip', options);
  if (archiver && typeof archiver.default === 'function') return archiver.default('zip', options);
  throw new Error('Unsupported archiver format');
}

apiRouter.get('/admin/download-source', requireAuth, (_req: Request, res: Response) => {
  const archive = createZipArchive({
    zlib: { level: 9 },
  });

  const timestamp = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="hisabkhata-salon-source-${timestamp}.zip"`);

  archive.on('error', (err: any) => {
    console.error('Source archive error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to create source code archive.' });
    }
  });

  archive.pipe(res);

  // Add source directories
  const dirsToInclude = ['src', 'server', 'data'];
  for (const dir of dirsToInclude) {
    const fullDirPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullDirPath)) {
      archive.directory(fullDirPath, dir);
    }
  }

  // Add root files
  const filesToInclude = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'server.ts',
    'index.html',
    'metadata.json',
    '.env.example',
    'README.md',
    '.gitignore',
  ];

  for (const file of filesToInclude) {
    const fullFilePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(fullFilePath)) {
      archive.file(fullFilePath, { name: file });
    }
  }

  archive.finalize();
});

apiRouter.get('/admin/download-update-package', requireAuth, (_req: Request, res: Response) => {
  const rawData = db.getRawData();
  const timestamp = new Date().toISOString();
  const dateStr = timestamp.split('T')[0];

  const updatePackage = {
    appName: 'HIsabkhata — Noble Reflxion Lifestyle Salon',
    version: '1.2.0',
    schemaVersion: 1,
    exportedAt: timestamp,
    salonName: rawData.settings.salonName,
    summary: {
      employeesCount: rawData.employees.length,
      closingsCount: rawData.dailyClosings.length,
      incomeTransactionsCount: rawData.incomeTransactions.length,
      expenseTransactionsCount: rawData.expenseTransactions.length,
      monthlyTargetsCount: rawData.monthlyTargets.length,
      auditLogsCount: rawData.auditLogs.length,
    },
    data: rawData,
    instructions: [
      'This file contains the complete database state and configuration update for HIsabkhata.',
      'To apply this update package on any server, open Admin Panel > Apply Update / Restore and upload this file.',
      'All historical salon daily records, employee services, targets, and closings are safely serialized.'
    ]
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="hisabkhata-update-package-${dateStr}.json"`);
  return res.send(JSON.stringify(updatePackage, null, 2));
});

apiRouter.post('/admin/apply-update', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const payload = req.body;

  try {
    const dataToRestore = payload?.data ? payload.data : payload;
    const result = db.restoreBackup(dataToRestore, user.managerId);
    return res.json({
      success: true,
      message: `সিস্টেম আপডেট সফলভাবে কার্যকর হয়েছে। ${result.message}`
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'আপডেট ফাইল প্রয়োগ করতে ব্যর্থ হয়েছে।' });
  }
});
