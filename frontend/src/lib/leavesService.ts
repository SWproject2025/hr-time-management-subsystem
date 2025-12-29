/**
 * Centralized Leaves API Service
 * Handles all leave-related API calls with consistent error handling and authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper to get auth token
const getToken = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
};

// Helper for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized');
    }
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ==================== EMPLOYEE ENDPOINTS ====================

export const leavesService = {
  // Get all leave types
  getLeaveTypes: () => apiCall<{ leaveTypes: any[] }>('/leaves/types'),

  // Get employee leave balance
  getLeaveBalance: (leaveTypeId?: string) => {
    const params = leaveTypeId ? `?leaveTypeId=${leaveTypeId}` : '';
    return apiCall<any[]>(`/leaves/balance${params}`);
  },

  // Get employee's leave requests
  getMyLeaveRequests: (status?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      ...(status && { status }),
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiCall<{ requests: any[]; pagination: any }>(
      `/leaves/requests/my-requests?${params}`
    );
  },

  // Create leave request
  createLeaveRequest: (data: {
    leaveTypeId: string;
    fromDate: string;
    toDate: string;
    justification: string;
    attachmentId?: string;
  }) =>
    apiCall('/leaves/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get leave request details
  getLeaveRequestDetails: (requestId: string) =>
    apiCall(`/leaves/requests/${requestId}`),

  // Cancel leave request
  cancelLeaveRequest: (requestId: string) =>
    apiCall(`/leaves/requests/${requestId}/cancel`, {
      method: 'PATCH',
    }),

  // Update leave request
  updateLeaveRequest: (requestId: string, data: any) =>
    apiCall(`/leaves/requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // ==================== MANAGER ENDPOINTS ====================

  // Get pending leave requests for manager approval
  getPendingLeaveRequests: (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiCall<{ requests: any[]; pagination: any }>(
      `/leaves/requests/pending-approval?${params}`
    );
  },

  // Approve leave request (manager)
  approveLeaveRequestByManager: (requestId: string, comments?: string) =>
    apiCall(`/leaves/requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    }),

  // Reject leave request (manager)
  rejectLeaveRequestByManager: (requestId: string, reason: string) =>
    apiCall(`/leaves/requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // ==================== HR ADMIN ENDPOINTS ====================

  // Get all leave requests for HR
  getAllLeaveRequestsForHR: (status?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      ...(status && status !== 'all' && { status }),
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiCall<{ requests: any[]; pagination: any }>(
      `/leaves/admin/requests?${params}`
    );
  },

  // Approve leave request (HR)
  approveLeaveRequestByHR: (requestId: string, comments?: string) =>
    apiCall(`/leaves/admin/requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    }),

  // Override rejected leave request (HR)
  overrideLeaveRequest: (requestId: string, comments?: string) =>
    apiCall(`/leaves/admin/requests/${requestId}/override`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    }),

  // Create leave adjustment
  createLeaveAdjustment: (data: {
    employeeId: string;
    leaveTypeId: string;
    adjustmentType: string;
    amount: number;
    reason: string;
  }) =>
    apiCall('/leaves/admin/adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get employee leave balance (for HR)
  getEmployeeLeaveBalanceForHR: (employeeId: string, leaveTypeId?: string) => {
    const params = leaveTypeId ? `?leaveTypeId=${leaveTypeId}` : '';
    return apiCall(`/leaves/admin/employees/${employeeId}/balance${params}`);
  },

  // Get all entitlements
  getAllEntitlements: (employeeId?: string, leaveTypeId?: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      ...(employeeId && { employeeId }),
      ...(leaveTypeId && { leaveTypeId }),
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiCall<{ entitlements: any[]; pagination: any }>(
      `/leaves/admin/entitlements?${params}`
    );
  },

  // Update entitlement
  updateEntitlement: (id: string, data: { yearlyEntitlement: number; carryForward: number }) =>
    apiCall(`/leaves/admin/entitlements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // ==================== LEAVE POLICY ENDPOINTS ====================

  // Create leave type
  createLeaveType: (data: {
    code: string;
    name: string;
    categoryId: string;
    description?: string;
    paid?: boolean;
    deductible?: boolean;
  }) =>
    apiCall('/leaves/admin/types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Create leave policy
  createLeavePolicy: (data: {
    leaveTypeId: string;
    accrualMethod: string;
    monthlyRate?: number;
    yearlyRate?: number;
    carryForwardAllowed?: boolean;
    maxCarryForward?: number;
  }) =>
    apiCall('/leaves/admin/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Configure organizational calendar
  configureCalendar: (data: {
    year: number;
    holidays: any[];
    blockedPeriods?: any[];
  }) =>
    apiCall('/leaves/admin/calendar', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ==================== CATEGORIES/BLOCK PERIODS ====================
  
  // Get leave policies
  getLeavePolicies: () => apiCall<any[]>('/leaves/admin/policies'),

  // Get leave categories
  getLeaveCategories: () => apiCall('/leaves/admin/categories'),

  // Create leave category
  createLeaveCategory: (data: { code: string; name: string; description?: string }) =>
    apiCall('/leaves/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Delete leave category
  deleteLeaveCategory: (id: string) =>
    apiCall(`/leaves/admin/categories/${id}`, { method: 'DELETE' }),

  // Get block periods
  getBlockPeriods: () => apiCall('/leaves/admin/block-periods'),

  // Create block period
  createBlockPeriod: (data: {
    name: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    exemptLeaveTypes?: string[];
  }) =>
    apiCall('/leaves/admin/block-periods', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Delete block period
  deleteBlockPeriod: (id: string) =>
    apiCall(`/leaves/admin/block-periods/${id}`, { method: 'DELETE' }),

  // ==================== DELEGATION ====================

  // Set delegation
  setDelegation: (data: {
    delegateId: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }) =>
    apiCall('/leaves/delegation', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get active delegations
  getActiveDelegations: () => apiCall<any[]>('/leaves/delegation/active'),

  // Get team members (for delegation dropdown)
  getTeamMembers: (managerId: string) => apiCall<any[]>(`/employee-profile/team/${managerId}`),

  // ==================== CALENDAR ENDPOINTS ====================

  // Get calendar for a year
  getCalendar: (year: number) => apiCall<any>(`/leaves/admin/calendar/${year}`),

  // Add holiday to calendar
  addHoliday: (year: number, holiday: { date: string; name: string; description?: string }) =>
    apiCall(`/leaves/admin/calendar/${year}/holidays`, {
      method: 'POST',
      body: JSON.stringify(holiday),
    }),

  // Delete holiday from calendar
  deleteHoliday: (year: number, date: string) =>
    apiCall(`/leaves/admin/calendar/${year}/holidays/${encodeURIComponent(date)}`, {
      method: 'DELETE',
    }),

  // ==================== LEAVE TYPE MANAGEMENT ====================

  // Update leave type
  updateLeaveType: (id: string, data: any) =>
    apiCall(`/leaves/admin/types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // ==================== ADJUSTMENTS ====================

  // Get all adjustments (for audit trail)
  getAdjustments: (page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiCall<{ adjustments: any[]; pagination: any }>(
      `/leaves/admin/adjustments?${params}`
    );
  },

  // ==================== DASHBOARD & STATISTICS ====================

  // Get HR Dashboard statistics
  getDashboardStats: () => apiCall<{
    totalEmployees: number;
    onLeaveToday: number;
    approvedThisMonth: number;
    pendingApprovals: number;
    pendingHRReview: number;
  }>('/leaves/admin/dashboard/stats'),

  // Get team leave calendar (for managers)
  getTeamCalendar: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return apiCall<{ teamMembers: any[]; leavesInPeriod: any[] }>(
      `/leaves/team-calendar?${params}`
    );
  },

  // ==================== OFFBOARDING & SETTLEMENT ====================

  // Calculate final settlement for terminating employee
  calculateFinalSettlement: (employeeId: string, dailySalaryRate: number) =>
    apiCall<{
      totalEncashment: number;
      details: Array<{
        leaveType: string;
        remainingDays: number;
        encashableDays: number;
        encashmentAmount: number;
      }>;
    }>(`/leaves/admin/settlement/${employeeId}?dailySalaryRate=${dailySalaryRate}`),

  // Process final settlement (zero out balances)
  processFinalSettlement: (employeeId: string, dailySalaryRate: number) =>
    apiCall(`/leaves/admin/settlement/${employeeId}/process`, {
      method: 'POST',
      body: JSON.stringify({ dailySalaryRate }),
    }),

  // Generate settlement report
  getSettlementReport: (employeeId: string, dailySalaryRate: number) =>
    apiCall<{ report: string }>(
      `/leaves/admin/settlement/${employeeId}/report?dailySalaryRate=${dailySalaryRate}`
    ),

  // ==================== ANALYTICS ====================

  // Get irregular leave patterns for an employee
  getLeavePatterns: (employeeId: string) =>
    apiCall<any[]>(`/leaves/admin/analytics/patterns/${employeeId}`),

  // Acknowledge irregular leave pattern
  acknowledgePattern: (patternId: string) =>
    apiCall(`/leaves/admin/analytics/patterns/${patternId}/acknowledge`, {
      method: 'PATCH',
    }),
};

export default leavesService;
