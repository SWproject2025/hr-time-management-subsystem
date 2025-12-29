import axios, { InternalAxiosRequestConfig } from 'axios';

// Configure axios instance - match pattern in other services
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Could not access localStorage:', error);
      }
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Types
export interface ShiftType {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// These interfaces are now defined above with proper types

export interface Holiday {
  _id: string;
  name: string;
  date: string;
  region?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ScheduleRule {
  _id: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OvertimeRule {
  _id: string;
  name: string;
  multiplier: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LatenessRule {
  _id: string;
  name: string;
  thresholdMinutes: number;
  penalty?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// TimeException interface is now defined above with proper types

export interface NotificationLog {
  _id: string;
  to: string;
  title?: string;
  body?: string;
  read?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const base = '/time-management';

// Helper function for consistent employee name formatting
export function formatEmployeeName(employeeId: any): string {
  if (!employeeId) return 'Unknown';

  if (typeof employeeId === 'object' && employeeId !== null) {
    // Populated employee object
    if (employeeId.firstName && employeeId.lastName) {
      return `${employeeId.firstName} ${employeeId.lastName}`;
    }
    if (employeeId.name) {
      return employeeId.name;
    }
    if (employeeId._id) {
      return `Employee ${employeeId._id}`;
    }
  }

  // String ID or fallback
  return String(employeeId);
}

// Helper function to get employee ID (string)
export function getEmployeeId(employeeId: any): string {
  if (typeof employeeId === 'object' && employeeId !== null) {
    return employeeId._id || String(employeeId);
  }
  return String(employeeId);
}

// Updated interfaces to handle populated data
export interface EmployeeData {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

export interface AttendanceRecord {
  _id: string;
  employeeId: string | EmployeeData;
  clockIn?: Date;
  clockOut?: Date;
  status?: string;
  exceptionIds?: string[];
  punches?: Array<{
    type: 'IN' | 'OUT';
    time: string;
  }>;
  totalWorkMinutes?: number;
  hasMissedPunch?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ShiftAssignment {
  _id: string;
  shiftId: string | ShiftType;
  employeeId?: string | EmployeeData;
  departmentId?: string;
  positionId?: string;
  scheduleRuleId?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TimeException {
  _id: string;
  employeeId: string | EmployeeData;
  attendanceRecordId?: string;
  assignedTo?: string | EmployeeData;
  type?: string;
  notes?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CorrectionRequest {
  _id: string;
  employeeId: string | EmployeeData;
  attendanceRecord?: string | AttendanceRecord;
  reason?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const timeManagementService = {
  // ============ SHIFT TYPES ============
  createShiftType: async (data: Partial<ShiftType>) => {
    try {
      const response = await api.post<ShiftType>(`${base}/shift-types`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating shift type:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getAllShiftTypes: async (params: any = {}) => {
    try {
      const response = await api.get<ShiftType[]>(`${base}/shift-types`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching shift types:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getShiftTypeById: async (id: string) => {
    try {
      const response = await api.get<ShiftType>(`${base}/shift-types/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching shift type ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateShiftType: async (id: string, data: Partial<ShiftType>) => {
    try {
      const response = await api.put<ShiftType>(`${base}/shift-types/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating shift type ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deleteShiftType: async (id: string) => {
    try {
      const response = await api.delete(`${base}/shift-types/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting shift type ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ SHIFT ASSIGNMENTS ============
  createShiftAssignment: async (data: Partial<ShiftAssignment>) => {
    try {
      const response = await api.post<ShiftAssignment>(`${base}/shift-assignments`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating shift assignment:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  bulkAssignShifts: async (assignments: Partial<ShiftAssignment>[]) => {
    try {
      console.log('Frontend: Attempting bulk shift assignment with', assignments.length, 'assignments');
      console.log('Frontend: Assignment data:', assignments);

      const response = await api.post(`${base}/shift-assignments/bulk-assign`, { assignments });
      console.log('Frontend: Bulk shift assignment successful');
      return response.data;
    } catch (error: any) {
      console.error('Frontend: Error bulk assigning shifts');
      console.error('Frontend: Error type:', typeof error);
      console.error('Frontend: Error constructor:', error?.constructor?.name);
      console.error('Frontend: Error keys:', error ? Object.keys(error) : 'no keys');
      console.error('Frontend: Error toString:', error?.toString?.());
      console.error('Frontend: Raw error object:', error);

      // Check if it's an Axios error
      if (error?.isAxiosError) {
        console.error('Frontend: Axios error details:', {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          config: {
            url: error?.config?.url,
            method: error?.config?.method,
            data: error?.config?.data
          }
        });
      }

      // Provide more meaningful error message
      let errorMessage = 'Failed to bulk assign shifts';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.status === 400) {
        errorMessage = 'Invalid data provided for shift assignment';
      } else if (error?.response?.status === 404) {
        errorMessage = 'Shift, employee, or department not found';
      } else if (error?.response?.status === 500) {
        errorMessage = 'Server error occurred during shift assignment';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      console.error('Frontend: Final error message:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  updateShiftAssignment: async (id: string, data: Partial<ShiftAssignment>) => {
    try {
      const response = await api.put<ShiftAssignment>(`${base}/shift-assignments/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating shift assignment ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getAllShiftAssignments: async (params: any = {}) => {
    try {
      const response = await api.get<ShiftAssignment[]>(`${base}/shift-assignments`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching shift assignments:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getShiftAssignmentById: async (id: string) => {
    try {
      const response = await api.get<ShiftAssignment>(`${base}/shift-assignments/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching shift assignment ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deleteShiftAssignment: async (id: string) => {
    try {
      const response = await api.delete(`${base}/shift-assignments/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting shift assignment ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ ATTENDANCE RECORDS ============
  clockIn: async (employeeId: string, payload: any = {}) => {
    try {
      console.log('Frontend: Attempting to clock in with employeeId:', employeeId);
      const response = await api.post(`${base}/attendance-records/clock-in`, { employeeId, ...payload });
      console.log('Frontend: Clock in successful');
      return response.data;
    } catch (error: any) {
      console.error('Frontend: Error clocking in:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        employeeId,
        fullError: error
      });
      console.error('Raw error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error keys:', error ? Object.keys(error) : 'no error object');

      // Try to extract error message from various possible locations
      let errorMessage = 'Unknown error occurred';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data) {
        errorMessage = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      console.error('Extracted error message:', errorMessage);
      throw errorMessage;
    }
  },

  clockOut: async (employeeId: string, payload: any = {}) => {
    try {
      console.log('Frontend: Attempting to clock out with employeeId:', employeeId);
      const response = await api.post(`${base}/attendance-records/clock-out`, { employeeId, ...payload });
      console.log('Frontend: Clock out successful');
      return response.data;
    } catch (error: any) {
      console.error('Frontend: Error clocking out:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        employeeId,
        fullError: error
      });
      console.error('Raw error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error keys:', error ? Object.keys(error) : 'no error object');

      // Try to extract error message from various possible locations
      let errorMessage = 'Unknown error occurred';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data) {
        errorMessage = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      console.error('Extracted error message:', errorMessage);
      throw errorMessage;
    }
  },

  getAttendanceRecords: async (params: any = {}) => {
    try {
      const response = await api.get<AttendanceRecord[]>(`${base}/attendance-records`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching attendance records:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getAttendanceRecordById: async (id: string) => {
    try {
      const response = await api.get<AttendanceRecord>(`${base}/attendance-records/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching attendance record ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateAttendanceRecord: async (id: string, data: Partial<AttendanceRecord>) => {
    try {
      const response = await api.put<AttendanceRecord>(`${base}/attendance-records/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating attendance record ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deleteAttendanceRecord: async (id: string) => {
    try {
      const response = await api.delete(`${base}/attendance-records/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting attendance record ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Attendance correction requests
  createCorrectionRequest: async (data: Partial<CorrectionRequest>) => {
    try {
      const response = await api.post<CorrectionRequest>(`${base}/correction-requests`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating correction request:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getCorrectionRequests: async (params: any = {}) => {
    try {
      const response = await api.get<CorrectionRequest[]>(`${base}/correction-requests`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching correction requests:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateCorrectionRequest: async (id: string, data: Partial<CorrectionRequest>) => {
    try {
      const response = await api.put<CorrectionRequest>(`${base}/correction-requests/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating correction request ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deleteCorrectionRequest: async (id: string) => {
    try {
      const response = await api.delete(`${base}/correction-requests/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting correction request ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ HOLIDAYS ============
  createHoliday: async (data: Partial<Holiday>) => {
    try {
      const response = await api.post<Holiday>(`${base}/holidays`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating holiday:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getAllHolidays: async (params: any = {}) => {
    try {
      const response = await api.get<Holiday[]>(`${base}/holidays`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching holidays:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getHolidayById: async (id: string) => {
    try {
      const response = await api.get<Holiday>(`${base}/holidays/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching holiday ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deleteHoliday: async (id: string) => {
    try {
      const response = await api.delete(`${base}/holidays/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting holiday ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateHoliday: async (id: string, data: any) => {
    try {
      const response = await api.put(`${base}/holidays/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating holiday ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  syncNationalCalendar: async () => {
    try {
      const response = await api.post(`${base}/holidays/sync-national`);
      return response.data;
    } catch (error: any) {
      console.error('Error syncing national calendar:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ REST DAY CONFIGURATIONS ============
  getRestDayConfigurations: async () => {
    try {
      const response = await api.get(`${base}/rest-day-configurations`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching rest day configurations:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  createRestDayConfiguration: async (data: any) => {
    try {
      const response = await api.post(`${base}/rest-day-configurations`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating rest day configuration:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateRestDayConfiguration: async (id: string, data: any) => {
    try {
      const response = await api.put(`${base}/rest-day-configurations/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating rest day configuration:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateDefaultRestDays: async (data: any) => {
    try {
      const response = await api.put(`${base}/rest-day-configurations/default`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating default rest days:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deleteRestDayConfiguration: async (id: string) => {
    try {
      const response = await api.delete(`${base}/rest-day-configurations/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting rest day configuration:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getDepartments: async () => {
    try {
      const response = await api.get('/organization-structure/departments');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching departments:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getPositions: async () => {
    try {
      const response = await api.get('/organization-structure/positions');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching positions:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ SYSTEM INTEGRATION & SYNCHRONIZATION ============
  getPayrollSyncStatus: async () => {
    try {
      const response = await api.get(`${base}/integration/payroll/status`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payroll sync status:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getLeaveSyncStatus: async () => {
    try {
      const response = await api.get(`${base}/integration/leave/status`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching leave sync status:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  syncWithPayrollNow: async () => {
    try {
      const response = await api.post(`${base}/integration/payroll/sync-now`);
      return response.data;
    } catch (error: any) {
      console.error('Error syncing with payroll:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  syncWithLeaveManagementNow: async () => {
    try {
      const response = await api.post(`${base}/integration/leave/sync-now`);
      return response.data;
    } catch (error: any) {
      console.error('Error syncing with leave management:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getSyncLogs: async (limit: number = 50) => {
    try {
      const response = await api.get(`${base}/integration/sync-logs`, { params: { limit } });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching sync logs:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  retryFailedSync: async (logId: string) => {
    try {
      const response = await api.post(`${base}/integration/sync-logs/${logId}/retry`);
      return response.data;
    } catch (error: any) {
      console.error('Error retrying failed sync:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getIntegrationConfig: async () => {
    try {
      const response = await api.get(`${base}/integration/config`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching integration config:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateIntegrationConfig: async (config: any) => {
    try {
      const response = await api.put(`${base}/integration/config`, config);
      return response.data;
    } catch (error: any) {
      console.error('Error updating integration config:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ PRE-PAYROLL CLOSURE AUTOMATION ============
  getPayrollClosureConfig: async () => {
    try {
      const response = await api.get(`${base}/payroll-closure/config`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payroll closure config:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updatePayrollClosureConfig: async (config: any) => {
    try {
      const response = await api.put(`${base}/payroll-closure/config`, config);
      return response.data;
    } catch (error: any) {
      console.error('Error updating payroll closure config:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getPendingPayrollApprovals: async () => {
    try {
      const response = await api.get(`${base}/payroll-closure/pending-approvals`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending payroll approvals:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getPayrollValidationStatus: async () => {
    try {
      const response = await api.get(`${base}/payroll-closure/validation-status`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payroll validation status:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  forceEscalatePendingApprovals: async () => {
    try {
      const response = await api.post(`${base}/payroll-closure/force-escalate`);
      return response.data;
    } catch (error: any) {
      console.error('Error force escalating pending approvals:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  generatePrePayrollReport: async () => {
    try {
      const response = await api.post(`${base}/payroll-closure/generate-report`);
      return response.data;
    } catch (error: any) {
      console.error('Error generating pre-payroll report:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ EXCEPTION & APPROVAL WORKFLOW CONFIGURATION ============
  getApprovalWorkflows: async () => {
    try {
      const response = await api.get(`${base}/approval-workflows`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching approval workflows:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  createApprovalWorkflow: async (workflow: any) => {
    try {
      const response = await api.post(`${base}/approval-workflows`, workflow);
      return response.data;
    } catch (error: any) {
      console.error('Error creating approval workflow:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateApprovalWorkflow: async (id: string, workflow: any) => {
    try {
      const response = await api.put(`${base}/approval-workflows/${id}`, workflow);
      return response.data;
    } catch (error: any) {
      console.error('Error updating approval workflow:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deleteApprovalWorkflow: async (id: string) => {
    try {
      const response = await api.delete(`${base}/approval-workflows/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting approval workflow:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ SCHEDULE RULES ============
  createScheduleRule: async (data: Partial<ScheduleRule>) => {
    try {
      const response = await api.post<ScheduleRule>(`${base}/schedule-rules`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating schedule rule:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getAllScheduleRules: async (params: any = {}) => {
    try {
      const response = await api.get<ScheduleRule[]>(`${base}/schedule-rules`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching schedule rules:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getScheduleRuleById: async (id: string) => {
    try {
      const response = await api.get<ScheduleRule>(`${base}/schedule-rules/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching schedule rule ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateScheduleRule: async (id: string, data: Partial<ScheduleRule>) => {
    try {
      const response = await api.put<ScheduleRule>(`${base}/schedule-rules/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating schedule rule ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deleteScheduleRule: async (id: string) => {
    try {
      const response = await api.delete(`${base}/schedule-rules/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting schedule rule ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ OVERTIME RULES ============
  createOvertimeRule: async (data: Partial<OvertimeRule>) => {
    try {
      const response = await api.post<OvertimeRule>(`${base}/overtime-rules`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating overtime rule:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getAllOvertimeRules: async (params: any = {}) => {
    try {
      const response = await api.get<OvertimeRule[]>(`${base}/overtime-rules`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching overtime rules:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getOvertimeRuleById: async (id: string) => {
    try {
      const response = await api.get<OvertimeRule>(`${base}/overtime-rules/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching overtime rule ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateOvertimeRule: async (id: string, data: Partial<OvertimeRule>) => {
    try {
      const response = await api.put<OvertimeRule>(`${base}/overtime-rules/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating overtime rule ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deleteOvertimeRule: async (id: string) => {
    try {
      const response = await api.delete(`${base}/overtime-rules/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting overtime rule ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ LATENESS RULES ============
  createLatenessRule: async (data: Partial<LatenessRule>) => {
    try {
      const response = await api.post<LatenessRule>(`${base}/lateness-rules`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating lateness rule:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getAllLatenessRules: async (params: any = {}) => {
    try {
      const response = await api.get<LatenessRule[]>(`${base}/lateness-rules`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching lateness rules:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getLatenessRuleById: async (id: string) => {
    try {
      const response = await api.get<LatenessRule>(`${base}/lateness-rules/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching lateness rule ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateLatenessRule: async (id: string, data: Partial<LatenessRule>) => {
    try {
      const response = await api.put<LatenessRule>(`${base}/lateness-rules/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating lateness rule ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deleteLatenessRule: async (id: string) => {
    try {
      const response = await api.delete(`${base}/lateness-rules/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting lateness rule ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ TIME EXCEPTIONS ============
  createTimeException: async (data: Partial<TimeException>) => {
    try {
      const response = await api.post<TimeException>(`${base}/time-exceptions`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating time exception:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getAllTimeExceptions: async (params: any = {}) => {
    try {
      const response = await api.get<TimeException[]>(`${base}/time-exceptions`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching time exceptions:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getTimeExceptionById: async (id: string) => {
    try {
      const response = await api.get<TimeException>(`${base}/time-exceptions/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching time exception ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateTimeException: async (id: string, data: Partial<TimeException>) => {
    try {
      const response = await api.put<TimeException>(`${base}/time-exceptions/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating time exception ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deleteTimeException: async (id: string) => {
    try {
      const response = await api.delete(`${base}/time-exceptions/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting time exception ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  approveTimeException: async (id: string) => {
    try {
      const response = await api.patch(`${base}/time-exceptions/${id}/approve`);
      return response.data;
    } catch (error: any) {
      console.error(`Error approving time exception ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  rejectTimeException: async (id: string, reason?: string) => {
    try {
      const response = await api.patch(`${base}/time-exceptions/${id}/reject`, { reason });
      return response.data;
    } catch (error: any) {
      console.error(`Error rejecting time exception ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ NOTIFICATION LOGS ============
  getNotificationLogs: async (params: any = {}) => {
    try {
      const response = await api.get<NotificationLog[]>(`${base}/notification-logs`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching notification logs:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getNotificationLogById: async (id: string) => {
    try {
      const response = await api.get<NotificationLog>(`${base}/notification-logs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching notification log ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  markNotificationAsRead: async (id: string) => {
    try {
      const response = await api.patch(`${base}/notification-logs/${id}/mark-read`);
      return response.data;
    } catch (error: any) {
      console.error(`Error marking notification ${id} as read:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
  // ============ NOTIFICATIONS ============
  createNotificationLog: async (data: { to: string; type: string; title?: string; message?: string; body?: string }) => {
    try {
      const response = await api.post(`/notification-logs`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating notification log:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
  // ============ PAYROLL SYNC ============
  /**
   * Trigger a payroll sync for a given payroll period.
   * attendanceData should be an array of attendance records or summarized payload.
   */
  syncWithPayroll: async (periodId: string, attendanceData: any[]) => {
    try {
      const response = await api.post(`/payroll/sync`, { periodId, attendanceData });
      return response.data;
    } catch (error: any) {
      console.error('Error syncing with payroll:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Get pending payroll sync jobs or records that require syncing.
   */
  getPendingPayrollSync: async () => {
    try {
      const response = await api.get(`/payroll/sync/pending`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending payroll sync items:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Validate attendance for payroll before syncing. Returns validation report.
   */
  validateAttendanceForPayroll: async (startDate: string, endDate: string) => {
    try {
      const response = await api.post('/payroll/validate-attendance', { startDate, endDate });
      return response.data;
    } catch (error: any) {
      console.error('Error validating attendance for payroll:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ ATTENDANCE RULES ============
  /**
   * Get current attendance rules configuration
   */
  getAttendanceRules: async () => {
    try {
      const response = await api.get(`${base}/attendance-rules`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching attendance rules:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Update attendance rules configuration
   */
  updateAttendanceRules: async (rules: any) => {
    try {
      const response = await api.put(`${base}/attendance-rules`, rules);
      return response.data;
    } catch (error: any) {
      console.error('Error updating attendance rules:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ FLEXIBLE PUNCH CONFIGURATION ============
  /**
   * Get current flexible punch configuration
   */
  getFlexiblePunchConfig: async () => {
    try {
      const response = await api.get(`${base}/flexible-punch-config`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching flexible punch config:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Update flexible punch configuration
   */
  updateFlexiblePunchConfig: async (config: any) => {
    try {
      const response = await api.put(`${base}/flexible-punch-config`, config);
      return response.data;
    } catch (error: any) {
      console.error('Error updating flexible punch config:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ SYSTEM MONITORING & REPORTS ============
  getAttendanceOverview: async () => {
    try {
      const response = await api.get(`${base}/monitoring/attendance-overview`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching attendance overview:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getCurrentEmployeeStatuses: async () => {
    try {
      const response = await api.get(`${base}/monitoring/current-employees`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching current employee statuses:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getSystemHealth: async () => {
    try {
      const response = await api.get(`${base}/monitoring/system-health`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching system health:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getGeoTrackingStatus: async () => {
    try {
      const response = await api.get(`${base}/monitoring/geo-tracking-status`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching geo-tracking status:', error.response?.data || error.message);
      // Return false as default if geo-tracking is not configured
      return false;
    }
  },

  // ============ ADMIN REPORTS ============
  generateReport: async (reportData: {
    reportType: string;
    filters?: {
      dateRange?: { startDate: string; endDate: string };
      department?: string;
      shiftType?: string;
      exportFormat?: 'PDF' | 'EXCEL' | 'CSV';
    };
  }) => {
    try {
      const response = await api.post(`${base}/reports/generate`, reportData, {
        responseType: 'blob' // For file downloads
      });
      return response;
    } catch (error: any) {
      console.error('Error generating report:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getAvailableReports: async () => {
    try {
      const response = await api.get(`${base}/reports/available`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching available reports:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getReportHistory: async (limit: number = 20) => {
    try {
      const response = await api.get(`${base}/reports/history`, { params: { limit } });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching report history:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  scheduleReport: async (scheduleData: {
    reportType: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    filters?: any;
    recipients: string[];
  }) => {
    try {
      const response = await api.post(`${base}/reports/schedule`, scheduleData);
      return response.data;
    } catch (error: any) {
      console.error('Error scheduling report:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ SYSTEM SETTINGS ============
  getSystemSettings: async () => {
    try {
      const response = await api.get(`${base}/settings`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching system settings:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateSystemSettings: async (settings: any) => {
    try {
      const response = await api.put(`${base}/settings`, settings);
      return response.data;
    } catch (error: any) {
      console.error('Error updating system settings:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  createBackup: async () => {
    try {
      const response = await api.post(`${base}/settings/backup`);
      return response.data;
    } catch (error: any) {
      console.error('Error creating backup:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getBackupHistory: async (limit: number = 20) => {
    try {
      const response = await api.get(`${base}/settings/backups`, { params: { limit } });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching backup history:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  restoreFromBackup: async (backupId: string) => {
    try {
      const response = await api.post(`${base}/settings/backup/${backupId}/restore`);
      return response.data;
    } catch (error: any) {
      console.error('Error restoring from backup:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ SYSTEM ACTIVITY LOGS ============
  getActivityLogs: async (params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    userRole?: string;
    actionType?: string;
    module?: string;
    searchTerm?: string;
  } = {}) => {
    try {
      const response = await api.get(`${base}/activity-logs`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching activity logs:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  exportActivityLogs: async (params: {
    startDate?: string;
    endDate?: string;
    userRole?: string;
    actionType?: string;
    module?: string;
    searchTerm?: string;
    format?: 'CSV' | 'PDF';
  }) => {
    try {
      const response = await api.get(`${base}/activity-logs/export`, {
        params,
        responseType: 'blob'
      });
      return response;
    } catch (error: any) {
      console.error('Error exporting activity logs:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ DASHBOARD METRICS & ALERTS ============
  /**
   * Get comprehensive dashboard metrics and alerts for time management
   */
  getDashboardMetrics: async () => {
    try {
      const response = await api.get(`${base}/dashboard/metrics`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching dashboard metrics:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Get shift expiry notifications with detailed information
   */
  getShiftExpiryNotifications: async (daysAhead: number = 30) => {
    try {
      const response = await api.get(`${base}/dashboard/shift-expiry-notifications`, {
        params: { daysAhead }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching shift expiry notifications:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Get pending approvals requiring escalation
   */
  getPendingApprovalsRequiringEscalation: async () => {
    try {
      const response = await api.get(`${base}/dashboard/pending-approvals-escalation`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending approvals requiring escalation:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Get missing punch alerts summary
   */
  getMissingPunchAlertsSummary: async () => {
    try {
      const response = await api.get(`${base}/dashboard/missing-punch-alerts`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching missing punch alerts summary:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Get system sync status overview
   */
  getSystemSyncStatusOverview: async () => {
    try {
      const response = await api.get(`${base}/dashboard/sync-status-overview`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching system sync status overview:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Quick action: Bulk renew shifts
   */
  bulkRenewShifts: async (shiftIds: string[], newEndDate: string) => {
    try {
      const response = await api.post(`${base}/dashboard/bulk-renew-shifts`, {
        shiftIds,
        newEndDate
      });
      return response.data;
    } catch (error: any) {
      console.error('Error bulk renewing shifts:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  previewBulkAssignment: async (data: { departmentId?: string; positionId?: string; shiftId: string; startDate: string; endDate?: string }) => {
    try {
      const response = await api.post(`${base}/shift-assignments/bulk-preview`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error previewing bulk assignment:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getActivityLogStats: async (params: {
    startDate?: string;
    endDate?: string;
  } = {}) => {
    try {
      const response = await api.get(`${base}/activity-logs/stats`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching activity log stats:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};

export default timeManagementService;


