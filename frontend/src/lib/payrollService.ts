import axios from 'axios';

// Configure axios instance - FIXED: Point to backend port
const api = axios.create({
  baseURL: 'http://localhost:5000', // Backend is on port 5000
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests if available
// IMPORTANT: Removed localStorage usage as it causes issues in artifacts
api.interceptors.request.use(
  (config) => {
    // If running in browser, try to get token
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Could not access localStorage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types matching your schemas
export interface PayrollRun {
  _id: string;
  runId: string;
  payrollPeriod: Date;
  status: string;
  entity: string;
  employees: number;
  exceptions: number;
  totalnetpay: number;
  payrollSpecialistId: string;
  paymentStatus: string;
  payrollManagerId?: string;
  financeStaffId?: string;
  rejectionReason?: string;
  unlockReason?: string;
  managerApprovalDate?: Date;
  financeApprovalDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SigningBonus {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  signingBonusId: string;
  givenAmount: number;
  paymentDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Benefit {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  benefitId: string;
  terminationId: string;
  givenAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeePayrollDetails {
  _id: string;
  employeeId: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  netPay: number;
  bankStatus: string;
  exceptions?: string;
  bonus?: number;
  benefit?: number;
  payrollRunId: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Service Object
const payrollService = {
  // ============ PAYROLL RUNS ============
  
  getAllPayrollRuns: async (filters: { status?: string; entity?: string; startDate?: string; endDate?: string } = {}) => {
    try {
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.entity) params.entity = filters.entity;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const response = await api.get<PayrollRun[]>('/payroll-execution/payroll-runs', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all payroll runs:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getPayrollRunById: async (id: string) => {
    try {
      const response = await api.get<PayrollRun>(`/payroll-execution/payroll-runs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching payroll run ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  createPayrollRun: async (data: {
    runId: string;
    payrollPeriod: string;
    payrollSpecialistId: string;
    entity: string;
  }) => {
    try {
      const response = await api.post<PayrollRun>('/payroll-execution/payroll-runs/start', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating payroll run:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deletePayrollRun: async (id: string) => {
    try {
      const response = await api.delete(`/payroll-execution/payroll-runs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting payroll run ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  editPayrollPeriod: async (id: string, payrollPeriod: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${id}/edit`, {
        payrollPeriod
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error editing payroll period for ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  validatePayrollPeriod: async (payrollPeriod: string) => {
    try {
      const response = await api.post('/payroll-execution/payroll-period/validate', {
        payrollPeriod
      });
      return response.data;
    } catch (error: any) {
      console.error('Error validating payroll period:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getSuggestedPayrollPeriod: async () => {
    try {
      const response = await api.get<{ payrollPeriod: string }>('/payroll-execution/payroll-period/suggested');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching suggested payroll period:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ SIGNING BONUSES ============
  
  getPendingSigningBonuses: async () => {
    try {
      const response = await api.get<SigningBonus[]>('/payroll-execution/signing-bonuses/pending');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending signing bonuses:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getSigningBonusById: async (id: string) => {
    try {
      const response = await api.get<SigningBonus>(`/payroll-execution/signing-bonuses/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching signing bonus ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  approveSigningBonus: async (id: string) => {
    try {
      const response = await api.patch<SigningBonus>(`/payroll-execution/signing-bonuses/${id}/approve`);
      return response.data;
    } catch (error: any) {
      console.error(`Error approving signing bonus ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  rejectSigningBonus: async (id: string) => {
    try {
      const response = await api.patch<SigningBonus>(`/payroll-execution/signing-bonuses/${id}/reject`);
      return response.data;
    } catch (error: any) {
      console.error(`Error rejecting signing bonus ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  editSigningBonus: async (id: string, givenAmount: number, paymentDate?: string) => {
    try {
      const payload: any = { givenAmount };
      if (paymentDate) payload.paymentDate = paymentDate;
      
      const response = await api.patch<SigningBonus>(`/payroll-execution/signing-bonuses/${id}/edit`, payload);
      return response.data;
    } catch (error: any) {
      console.error(`Error editing signing bonus ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ BENEFITS ============
  
  getPendingBenefits: async () => {
    try {
      const response = await api.get<Benefit[]>('/payroll-execution/benefits/pending');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending benefits:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getBenefitById: async (id: string) => {
    try {
      const response = await api.get<Benefit>(`/payroll-execution/benefits/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching benefit ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  approveBenefit: async (id: string) => {
    try {
      const response = await api.patch<Benefit>(`/payroll-execution/benefits/${id}/approve`);
      return response.data;
    } catch (error: any) {
      console.error(`Error approving benefit ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  rejectBenefit: async (id: string) => {
    try {
      const response = await api.patch<Benefit>(`/payroll-execution/benefits/${id}/reject`);
      return response.data;
    } catch (error: any) {
      console.error(`Error rejecting benefit ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  editBenefit: async (id: string, givenAmount: number) => {
    try {
      const response = await api.patch<Benefit>(`/payroll-execution/benefits/${id}/edit`, {
        givenAmount
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error editing benefit ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ PRE-RUN CHECK ============
  
  checkPreRunApprovals: async () => {
    try {
      const response = await api.get('/payroll-execution/pre-run-check');
      return response.data;
    } catch (error: any) {
      console.error('Error checking pre-run approvals:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ APPROVALS & WORKFLOW ============
  
  publishDraftForApproval: async (runId: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/publish`);
      return response.data;
    } catch (error: any) {
      console.error(`Error publishing draft ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  managerApprove: async (runId: string, approverId?: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/manager-approve`, {
        approverId
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error manager approving ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  managerReject: async (runId: string, reason: string, approverId?: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/manager-reject`, {
        reason,
        approverId
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error manager rejecting ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  financeApprove: async (runId: string, approverId?: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/finance-approve`, {
        approverId
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error finance approving ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  financeReject: async (runId: string, reason: string, approverId?: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/finance-reject`, {
        reason,
        approverId
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error finance rejecting ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getApprovalsByRunId: async (runId: string) => {
    try {
      const response = await api.get(`/payroll-execution/payroll-runs/${runId}/approvals`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching approvals for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ EXCEPTIONS ============
  
  getPayrollRunExceptions: async (runId: string) => {
    try {
      const response = await api.get(`/payroll-execution/payroll-runs/${runId}/exceptions`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching exceptions for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  flagPayrollExceptions: async (runId: string) => {
    try {
      const response = await api.post(`/payroll-execution/payroll-runs/${runId}/exceptions/flag`);
      return response.data;
    } catch (error: any) {
      console.error(`Error flagging exceptions for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  resolveException: async (runId: string, employeeId: string, resolutionNote?: string) => {
    try {
      const response = await api.patch(
        `/payroll-execution/payroll-runs/${runId}/exceptions/${employeeId}/resolve`,
        { resolutionNote }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error resolving exception for employee ${employeeId} in run ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ PAYROLL ADJUSTMENTS ============
  
  createPayrollAdjustment: async (
    runId: string,
    employeeId: string,
    type: 'bonus' | 'deduction' | 'benefit',
    amount: number,
    reason?: string
  ) => {
    try {
      const response = await api.post(`/payroll-execution/payroll-runs/${runId}/adjustments`, {
        employeeId,
        type,
        amount,
        reason
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error creating adjustment for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ PAYSLIPS ============
  
  generatePayslips: async (runId: string) => {
    try {
      const response = await api.post(`/payroll-execution/payroll-runs/${runId}/payslips/generate`);
      return response.data;
    } catch (error: any) {
      console.error(`Error generating payslips for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  distributePayslips: async (runId: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/payslips/distribute`);
      return response.data;
    } catch (error: any) {
      console.error(`Error distributing payslips for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  markPayrollAsPaid: async (runId: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/mark-paid`);
      return response.data;
    } catch (error: any) {
      console.error(`Error marking payroll as paid for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ REVIEW ============
  
  reviewPayrollDraft: async (runId: string) => {
    try {
      const response = await api.get(`/payroll-execution/payroll-runs/${runId}/review/draft`);
      return response.data;
    } catch (error: any) {
      console.error(`Error reviewing draft for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getPayrollForManagerReview: async (runId: string) => {
    try {
      const response = await api.get(`/payroll-execution/payroll-runs/${runId}/review/manager`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching manager review for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getPayrollForFinanceReview: async (runId: string) => {
    try {
      const response = await api.get(`/payroll-execution/payroll-runs/${runId}/review/finance`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching finance review for ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ FREEZE/UNFREEZE ============
  
  freezePayroll: async (runId: string, reason?: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/freeze`, {
        reason
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error freezing payroll ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  unfreezePayroll: async (runId: string, unlockReason?: string) => {
    try {
      const response = await api.patch(`/payroll-execution/payroll-runs/${runId}/unfreeze`, {
        unlockReason
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error unfreezing payroll ${runId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

getPayslips: async (runId: string) => {
  try {
    const response = await api.get(`/payroll-execution/payroll-runs/${runId}/payslips`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching payslips for ${runId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
},
};

export default payrollService;