# Leaves Management Module

## Overview

The Leaves Management Module is a comprehensive subsystem for managing employee leave requests, approvals, balances, and policies within the HR Management System.

## Features

### For Employees

- **Submit Leave Requests** with file attachments
- **View Personal Requests** with status tracking
- **Check Leave Balances** in real-time
- **Cancel Pending Requests**

### For Managers

- **Review Team Requests** with urgency indicators
- **Approve/Reject Requests** with comments
- **Auto-Escalation** after 48 hours
- **Email Notifications** for all actions

### For HR Administrators

- **Configure Leave Categories** (Paid, Unpaid, Special)
- **Manage Leave Types** (Annual, Sick, Maternity, etc.)
- **Set Leave Policies** (accrual rules, eligibility)
- **Manage Calendar** (holidays, blocked periods)
- **View/Edit Entitlements** for all employees
- **Process Year-End** carry-forwards and settlements

## Quick Start

### 1. Seed Initial Data

```bash
cd backend
node scripts/leave-seeder.js
```

This will create:

- 3 Leave Categories
- 8 Leave Types (AL, SL, ML, PL, UL, EL, MSL, MAR)
- 8 Leave Policies with accrual rules
- 2 Calendar Years with holidays

### 2. Initialize Employee Entitlements

When a new employee joins, initialize their entitlements:

```typescript
POST /leaves/admin/entitlements/initialize
{
  "employeeId": "employee_id_here",
  "employmentType": "FULL_TIME",
  "tenure": 0
}
```

### 3. Employee Submits Leave Request

```typescript
POST /leaves/requests
{
  "leaveTypeId": "leave_type_id",
  "fromDate": "2025-01-15",
  "toDate": "2025-01-20",
  "justification": "Family vacation",
  "attachmentId": "optional_file_id"
}
```

### 4. Manager Approves Request

```typescript
POST /leaves/requests/:id/approve
{
  "comments": "Approved - have a great time!"
}
```

## API Endpoints

### Employee Endpoints

```
GET    /leaves/balance              - Check leave balances
GET    /leaves/requests/my-requests - View personal requests
POST   /leaves/requests             - Submit new request
PATCH  /leaves/requests/:id/cancel  - Cancel pending request
GET    /leaves/types                - List available leave types
```

### Manager Endpoints

```
GET    /leaves/requests/pending-approval - View team requests
POST   /leaves/requests/:id/approve      - Approve request
POST   /leaves/requests/:id/reject       - Reject request
POST   /leaves/requests/:id/delegate     - Delegate approval
```

### HR Admin Endpoints

```
# Categories
GET    /leaves/admin/categories
POST   /leaves/admin/categories
PUT    /leaves/admin/categories/:id
DELETE /leaves/admin/categories/:id

# Leave Types
GET    /leaves/types
POST   /leaves/types
PUT    /leaves/types/:id
DELETE /leaves/types/:id

# Policies
GET    /leaves/admin/policies
POST   /leaves/admin/policies
PUT    /leaves/admin/policies/:id

# Calendar
GET    /leaves/admin/calendar/:year
POST   /leaves/admin/calendar
POST   /leaves/admin/calendar/:year/holidays
DELETE /leaves/admin/calendar/:year/holidays

# Entitlements
GET    /leaves/admin/entitlements
POST   /leaves/admin/entitlements
PUT    /leaves/admin/entitlements/:id
DELETE /leaves/admin/entitlements/:id
POST   /leaves/admin/entitlements/initialize
POST   /leaves/admin/entitlements/bulk-update

# Processing
POST   /leaves/admin/process-accrual
POST   /leaves/admin/process-carry-forward
```

## Business Rules

### Leave Balances

- **BR 40**: Monthly accrual for eligible leave types
- **BR 45**: Carry-forward limits apply per policy
- **BR 52**: Final settlement on employee exit
- **BR 53**: Encashment capped at 30 days

### Request Validation

- **BR 8**: Tenure eligibility checked
- **BR 29**: Excess leave requires approval
- **BR 31**: Post-leave requests allowed with documentation
- **BR 41**: Annual cumulative limits enforced
- **BR 55**: Block periods prevent requests

### Workflow

- **REQ-028**: Auto-escalation after 48 hours
- **REQ-023**: Delegation support for managers
- **REQ-042**: Integration with Time & Payroll (placeholders)

## Data Models

### LeaveCategory

```typescript
{
  code: string;        // e.g., "PAID", "UNPAID"
  name: string;
  description?: string;
}
```

### LeaveType

```typescript
{
  code: string;              // e.g., "AL", "SL"
  name: string;
  categoryId: ObjectId;
  paid: boolean;
  deductible: boolean;
  requiresAttachment: boolean;
  minTenureMonths?: number;
  maxDurationDays?: number;
  isActive: boolean;
}
```

### LeavePolicy

```typescript
{
  leaveTypeId: ObjectId;
  accrualMethod: 'MONTHLY' | 'YEARLY' | 'ON_DEMAND';
  monthlyRate?: number;
  yearlyRate: number;
  carryForwardAllowed: boolean;
  maxCarryForward?: number;
  roundingRule: 'ROUND_UP' | 'ROUND_DOWN' | 'NONE';
  eligibility: {
    minTenureMonths?: number;
    contractTypesAllowed?: string[];
  };
}
```

### LeaveEntitlement

```typescript
{
  employeeId: ObjectId;
  leaveTypeId: ObjectId;
  yearlyEntitlement: number;
  accruedActual: number;
  accruedRounded: number;
  carryForward: number;
  taken: number;
  pending: number;
  remaining: number;
  lastAccrualDate: Date;
  nextResetDate: Date;
}
```

### LeaveRequest

```typescript
{
  employeeId: ObjectId;
  leaveTypeId: ObjectId;
  dates: { from: Date; to: Date; };
  durationDays: number;
  status: 'PENDING' | 'PENDING_HR' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  justification?: string;
  attachmentId?: ObjectId;
  approvalFlow: Array<{
    role: string;
    status: string;
    decidedBy?: ObjectId;
    decidedAt?: Date;
    comments?: string;
  }>;
  isPostLeave: boolean;
  escalatedAt?: Date;
  delegatedBy?: ObjectId;
}
```

## Cron Jobs

### Auto-Escalation (Every 6 Hours)

Checks for requests pending > 48 hours and escalates to HR.

```typescript
@Cron(CronExpression.EVERY_6_HOURS)
async checkPendingApprovals()
```

### Monthly Accrual (1st of Month)

Processes monthly leave accrual for all employees.

```typescript
@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
async processMonthlyAccrual()
```

## Email Notifications

Automatic emails sent for:

- ✅ New request submitted (to manager)
- ✅ Request approved (to employee)
- ✅ Request rejected (to employee)
- ✅ Request escalated (to HR)
- ✅ Request delegated (to delegate)

## Frontend Pages

### Employee Pages

- `/leaves/request` - Submit new request
- `/leaves/my-requests` - View all requests
- `/leaves/balance` - Check balances

### Manager Pages

- `/leaves/approvals` - Pending approvals

### HR Admin Pages

- `/leaves/admin/categories` - Manage categories
- `/leaves/admin/types` - Manage leave types
- `/leaves/admin/calendar` - Manage calendar
- `/leaves/admin/entitlements` - View/edit entitlements

## Configuration

### Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/hr-main

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3001
```

## Testing

### Manual Testing Checklist

**Employee Flow:**

1. ✓ Submit leave request
2. ✓ View request status
3. ✓ Check balance
4. ✓ Cancel pending request

**Manager Flow:**

1. ✓ View pending approvals
2. ✓ Approve request (check email sent)
3. ✓ Reject request with reason
4. ✓ Verify auto-escalation (>48h)

**HR Flow:**

1. ✓ Create new leave type
2. ✓ Add holiday to calendar
3. ✓ Initialize entitlements for new employee
4. ✓ Process year-end carry-forward
5. ✓ Calculate final settlement

## Common Operations

### Add New Leave Type

```javascript
// 1. Create leave type
POST /leaves/types
{
  "code": "BL",
  "name": "Bereavement Leave",
  "categoryId": "special_category_id",
  "paid": true,
  "deductible": false,
  "requiresAttachment": false,
  "maxDurationDays": 5
}

// 2. Create policy
POST /leaves/admin/policies
{
  "leaveTypeId": "new_type_id",
  "accrualMethod": "ON_DEMAND",
  "yearlyRate": 5,
  "carryForwardAllowed": false
}
```

### Process Year-End

```javascript
// 1. Process carry-forward
POST /leaves/admin/process-carry-forward
{
  "year": 2024
}

// 2. Reset taken/pending to 0
// 3. Apply carry-forward limits per policy
```

### Calculate Final Settlement

```javascript
POST /leaves/admin/settlement/:employeeId
{
  "dailySalaryRate": 150.00
}

// Returns:
{
  "totalEncashment": 4500.00,
  "details": [
    {
      "leaveType": "Annual Leave",
      "remainingDays": 30,
      "encashableDays": 30,
      "encashmentAmount": 4500.00
    }
  ]
}
```

## Troubleshooting

### Request Rejected: "Insufficient balance"

- Check employee's remaining balance for that leave type
- Verify entitlement has been initialized
- Check if pending requests are consuming balance

### Auto-escalation not working

- Verify cron service is running
- Check email service configuration
- Review logs for errors

### Entitlement not found

- Run initialization: `POST /leaves/admin/entitlements/initialize`
- Verify leave policies are configured
- Check employee eligibility based on tenure/contract type

## Support

For issues or questions:

- Check logs: `/backend/logs`
- Review business rules in implementation plan
- Contact system administrator

---

**Module Status:** Production Ready (90% Complete)
**Last Updated:** 2025-12-18
**Version:** 1.0.0
