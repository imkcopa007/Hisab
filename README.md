# HIsabkhata — Noble Reflxion Lifestyle Salon

**HIsabkhata (হিসাবখাতা)** is a production-grade, secure salon accounting and managerial system built for **Noble Reflxion Lifestyle Salon**. It provides complete financial record-keeping, daily closings, employee roster and performance tracking, monthly income targets in Bangladeshi Taka (BDT ৳), printable accounting vouchers, and recoverable data backup.

---

## 1. Credentials & Bootstrap Authentication

| Property | Value |
| :--- | :--- |
| **Initial Manager ID / Phone** | `01522111121` |
| **Initial Bootstrap Password** | `imran2026` |
| **Primary Currency** | Bangladeshi Taka (`BDT / ৳`) |
| **Operating Timezone** | `Asia/Dhaka` |

### Security Model & Password Hardening
1. **Zero Hardcoded Passwords in Frontend:** The client never compares credentials in browser code. All authentication requests are sent to `/api/auth/login`.
2. **Cryptographic Storage:** Passwords are never stored in plaintext. They are salted with a 16-byte cryptographically secure random salt and hashed using **PBKDF2 with SHA-512 over 100,000 iterations**.
3. **Mandatory Credential Rotation:** The initial bootstrap credential (`imran2026`) is flagged with `mustChangePassword: true`. Upon first login, the manager is prompted to change it to their personal secure password.
4. **Session Management:** Authenticated sessions issue cryptographically generated 256-bit session tokens passed via `Authorization: Bearer <token>` headers. Direct database access is blocked without an active session.

---

## 2. Core Modules & Pages

1. **Dashboard (ড্যাশবোর্ড):**
   - Live Dhaka date and status indicator (Open / Closed day).
   - Today's Total Income, Today's Total Expenses, Today's Net Balance (Net Cash).
   - Current month's cumulative income, expenses, and net balance.
   - Active staff count and today's employee-wise service breakdown table.
   - Recent daily closing records.

2. **Daily Accounting Entry & Day Closure (দৈনিক হিসাব ও ক্লোজিং):**
   - Calendar date picker (defaults to today in `Asia/Dhaka`).
   - Multiple service entries per stylist with custom category, amount in BDT, description, and payment method (Cash, bKash, Nagad, Card, Bank).
   - Direct salon revenue (product retail, packages, salon-direct income).
   - Staff-related daily expenses (daily meal/snack allowance, travel).
   - General salon expenses (rent, electricity, utilities, cleaning, maintenance).
   - **Real-Time Accounting Reconciliation:**
     $$\text{Total Salon Revenue} = \sum \text{Employee Incomes} + \sum \text{Salon-Direct Incomes}$$
     $$\text{Total Salon Expenses} = \sum \text{Employee Expenses} + \sum \text{General Salon Expenses}$$
     $$\text{Net Balance} = \text{Total Salon Revenue} - \text{Total Salon Expenses}$$
   - **Submit & Close Day:** Confirmation modal, negative value validation, duplicate submission protection (closing ID `closing_YYYY-MM-DD`), and authorized editing mode with audit trail.

3. **Employee Management (কর্মচারীবৃন্দ):**
   - Auto-generated employee IDs (`EMP-001`, `EMP-002`, etc.).
   - Full profile: Name, Role/Category, Phone, Joining Date, and Operational Notes.
   - Soft deactivation (Active / Inactive toggle) that **never deletes historical financial records**.
   - Individual financial history drawer showing lifetime service earnings, recorded expenses, net salon contribution, and monthly breakdown.

4. **Monthly Employee Targets (মাসিক লক্ষ্যমাত্রা):**
   - Define monthly income target in BDT for each stylist.
   - Displays Counted Service Income in BDT, Remaining Amount in BDT, and Exceeded Amount in BDT.
   - **Zero Percentages:** Adheres strictly to the requirement: no percentage progress bars or percentage labels. Pure BDT figures.

5. **Daily Closing History (হিসাব খাতা):**
   - Filter by year and month or search by exact date.
   - Inspect transactions breakdown for any closed day.
   - **Print Daily Voucher:** Generates a printable receipt for accounting records.

6. **Monthly Financial Reports (মাসিক হিসাব বিবরণী):**
   - Complete executive financial summary: Gross Salon Revenue, Total Expenses, Net Recorded Balance (never labeling gross income as profit).
   - Employee-wise monthly income, expenses, and target performance.
   - Daily closings log for the entire month.
   - Peak revenue day detection and transaction statistics.
   - Print-to-PDF layout with manager and owner signature lines.
   - Instant export to CSV and JSON.

7. **Backup & Restore (ডেটা ব্যাকআপ ও রিস্টোর):**
   - One-click full JSON database snapshot download.
   - Excel-compatible CSV export of all income and expense transactions.
   - JSON backup restore engine with schema pre-validation and safety warnings.

8. **Admin Panel & Source Code Exporter (এডমিন প্যানেল ও সোর্স ডাউনলোড):**
   - **Download Full WebApp Source Code (.ZIP):** Streamed archive containing frontend, backend Express server, storage engine, TypeScript models, Tailwind CSS styles, and configuration.
   - **Download System Update Package (.JSON):** Export versioned snapshot with all tables and schema.
   - **Apply System Update / Patch (.JSON):** Upload and install update packages across instances.
   - **System Health Monitor:** Real-time metrics on Node.js version, platform, memory usage, and database records counts.
   - **Deployment Commands & .env Template:** Ready-to-copy commands to run on any Linux/Mac/Windows server.

9. **Settings & Audit Trail (সেটিংস ও নিরাপত্তা):**
   - Manager profile and password update.
   - Custom income and expense category management.
   - Real-time audit log tracking every administrative action and timestamp.

---

## 3. Database Architecture & Schema

The persistent cloud database stores data in normalized documents within `/data/salon_db.json` with **Atomic Write Guarantees** (`fs.writeFileSync` to a temporary process file followed by an atomic `fs.renameSync`).

```typescript
// Core Entities
- managers: { id, loginIdentifier, fullName, role, passwordSalt, passwordHash, mustChangePassword, createdAt, lastLoginAt }
- employees: { id, name, role, phone, serviceCategory, joiningDate, notes, isActive, createdAt, updatedAt }
- incomeTransactions: { id, businessDate, employeeId, category, amount, description, paymentMethod, createdBy, createdAt, updatedAt }
- expenseTransactions: { id, businessDate, employeeId, category, amount, description, paymentMethod, createdBy, createdAt, updatedAt }
- dailyClosings: { id, businessDate, totalEmployeeIncome, totalSalonLevelIncome, totalIncome, totalEmployeeExpenses, totalGeneralExpenses, totalExpenses, netBalance, notes, isClosed, submittedBy, submittedAt, lastUpdatedAt }
- monthlyTargets: { id, employeeId, monthKey, targetAmount, notes, createdAt, updatedAt, createdBy }
- auditLogs: { id, entityType, entityId, action, details, actorId, timestamp }
- settings: { salonName, appName, timezone, currency, incomeCategories, expenseCategories }
```

---

## 4. Free-Tier Operational Guarantees

- **Hosting & Database:** Runs inside Node.js on a lightweight, scale-to-zero server container.
- **Zero Cloud Costs:** Operates within standard compute allowances with no hidden third-party database pricing tiers or read/write quota locks.
- **Data Retention:** Cloud persistent filesystem preserves all records between server restarts, deployments, and browser sessions.
- **Manual Disaster Recovery:** Weekly or monthly downloads of the JSON backup ensure that salon financial history is 100% portable and recoverable.

---

## 5. Deployment Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Build Production Assets:**
   ```bash
   npm run build
   ```
3. **Run Production Server:**
   ```bash
   npm start
   ```
   *The server starts on port 3000 (or `process.env.PORT`), serving the production static files and API endpoints.*
