# Leaves Subsystem - Quick Reference Guide

## 🚀 Quick Start (5 Minutes)

### 1. Seed Database

```bash
cd backend
node scripts/leave-seeder.js
```

**Creates:** 3 categories, 8 leave types, 8 policies, 2 calendar years

### 2. Start Backend

```bash
npm run start:dev
```

**Running on:** http://localhost:5000

### 3. Start Frontend

```bash
cd ../frontend
npm run dev
```

**Running on:** http://localhost:3001

### 4. Login & Test

- Login as HR Admin
- Go to `/leaves/admin/categories` to view seeded data
- Go to `/leaves/request` to submit a test request

---

## 📋 Common Tasks

### Initialize New Employee

```bash
POST /leaves/admin/entitlements/initialize
{
  "employeeId": "67ab123...",
  "employmentType": "FULL_TIME",
  "tenure": 0
}
```

### Submit Leave Request

```bash
POST /leaves/requests
{
  "leaveTypeId": "67ab456...",
  "fromDate": "2025-01-15",
  "toDate": "2025-01-20",
  "justification": "Vacation"
}
```

### Approve Request (Manager)

```bash
POST /leaves/requests/67ab789.../approve
{
  "comments": "Approved"
}
```

### Add Holiday

```bash
POST /leaves/admin/calendar/2025/holidays
{
  "holidays": [
    {
      "date": "2025-12-25",
      "name": "Christmas Day"
    }
  ]
}
```

---

## 🎯 User Roles & Permissions

| Action                | Employee | Manager | HR Admin |
| --------------------- | -------- | ------- | -------- |
| Submit request        | ✅       | ✅      | ✅       |
| View own requests     | ✅       | ✅      | ✅       |
| Check own balance     | ✅       | ✅      | ✅       |
| Approve team requests | ❌       | ✅      | ✅       |
| Configure policies    | ❌       | ❌      | ✅       |
| Manage entitlements   | ❌       | ❌      | ✅       |
| Process settlements   | ❌       | ❌      | ✅       |

---

## 📊 Leave Types (Pre-Seeded)

| Code | Name            | Days/Year | Paid | Deductible |
| ---- | --------------- | --------- | ---- | ---------- |
| AL   | Annual Leave    | 30        | ✅   | ✅         |
| SL   | Sick Leave      | 15        | ✅   | ❌         |
| ML   | Maternity Leave | 90        | ✅   | ❌         |
| PL   | Paternity Leave | 3         | ✅   | ❌         |
| UL   | Unpaid Leave    | Unlimited | ❌   | ✅         |
| EL   | Emergency Leave | 5         | ✅   | ✅         |
| MSL  | Mission Leave   | Unlimited | ✅   | ❌         |
| MAR  | Marriage Leave  | 7         | ✅   | ❌         |

---

## 🔄 Automated Processes

### Monthly Accrual (1st of Month 00:00)

- Adds monthly leave accrual to all eligible employees
- Applies rounding rules per policy
- Updates balances automatically

### Auto-Escalation (Every 6 Hours)

- Finds requests pending > 48 hours
- Sends email to HR
- Marks request as escalated

---

## 📧 Email Notifications

Automatic emails sent for:

- ✉️ New request → Manager
- ✉️ Approved → Employee
- ✉️ Rejected → Employee
- ✉️ Escalated → HR Admin
- ✉️ Delegated → Delegate

**Configure in `.env`:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 🐛 Troubleshooting

### "Insufficient balance"

→ Check `/leaves/balance` for current balance
→ Verify entitlement initialized  
→ Check pending requests consuming balance

### Auto-escalation not working

→ Verify cron service is running
→ Check email configuration  
→ Review backend logs

### Request rejected automatically

→ Check block periods in calendar
→ Verify tenure eligibility (BR 8)
→ Check annual cumulative limits (BR 41)

---

## 📱 Frontend Routes

**Employee:**

- `/leaves/request` - Submit new request
- `/leaves/my-requests` - View all requests
- `/leaves/balance` - Check balances

**Manager:**

- `/leaves/approvals` - Review pending requests

**HR Admin:**

- `/leaves/admin/categories` - Manage categories
- `/leaves/admin/types` - Manage leave types
- `/leaves/admin/calendar` - Manage holidays
- `/leaves/admin/entitlements` - View/edit entitlements

---

## 💡 Pro Tips

1. **Bulk Operations:** Use `/entitlements/bulk-update` for annual adjustments
2. **Year-End:** Process carry-forward before resetting balances
3. **Testing:** Use `manualAccrualTrigger()` to test accrual without waiting
4. **Monitoring:** Check cron logs for automated task execution
5. **Backups:** Always backup before year-end processing

---

**Need more details?** See full [README.md](./README.md)

**Last Updated:** 2025-12-18
