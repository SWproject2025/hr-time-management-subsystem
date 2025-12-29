import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance with token interceptor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types
export interface Payslip {
  _id: string;
  payslipId: string;
  employeeId: any;
  payrollRunId: any;
  totalGrossSalary: number;
  netPay: number;
  totaDeductions: number;
  paymentStatus: string;
  earningsDetails: any;
  deductionsDetails: any;
  createdAt: Date;
}

export interface Dispute {
  _id: string;
  disputeId: string;
  employeeId: any;
  payslipId: any;
  description: string;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date;
  resolvedAt?: Date;
  rejectionReason?: string;
  resolutionComment?: string;
  approvalHistory: any[];
}

export interface Claim {
  _id: string;
  claimId: string;
  employeeId: any;
  description: string;
  claimType: string;
  amount: number;
  approvedAmount?: number;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date;
  resolvedAt?: Date;
  rejectionReason?: string;
  resolutionComment?: string;
  approvalHistory: any[];
}

export interface SalaryDetails {
  employeeId: string;
  baseSalary: number;
  leaveCompensation: number;
  transportationCompensation: number;
  taxDeductions: number;
  insuranceDeductions: number;
  salaryDeductions: number;
  unpaidLeaveDeductions: number;
  employerContributions: number;
  netSalary: number;
  netPay: number;
  latestPayrollRun: any;
}

// Employee endpoints
export const payrollTrackingService = {
  // Payslips
  getPayslipHistory: async (filters?: {
    fromDate?: string;
    toDate?: string;
    payrollRunId?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/payroll-tracking/employee/payslips', { params: filters });
    return response.data;
  },

  getPayslip: async (payslipId: string) => {
    const response = await api.get(`/payroll-tracking/employee/payslips/${payslipId}`);
    return response.data;
  },

  downloadPayslip: async (payslipId: string, format: string = 'pdf') => {
    const response = await api.get(`/payroll-tracking/employee/payslips/${payslipId}/download`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  getPayslipStatus: async (payslipId: string) => {
    const response = await api.get(`/payroll-tracking/employee/payslips/${payslipId}/status`);
    return response.data;
  },

  getEmployeeSalaryDetails: async (): Promise<SalaryDetails> => {
    const response = await api.get('/payroll-tracking/employee/salary-details');
    return response.data;
  },

  getTaxDocuments: async (year: number) => {
    const response = await api.get(`/payroll-tracking/employee/tax-documents/${year}`);
    return response.data;
  },

  downloadTaxDocuments: async (year: number) => {
    const response = await api.get(`/payroll-tracking/employee/tax-documents/${year}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Disputes
  createDispute: async (data: { payslipId: string; description: string }) => {
    const response = await api.post('/payroll-tracking/employee/disputes', data);
    return response.data;
  },

  getEmployeeDisputes: async (page: number = 1, limit: number = 10) => {
    const response = await api.get('/payroll-tracking/employee/disputes', {
      params: { page, limit },
    });
    return response.data;
  },

  getDisputeStatus: async (disputeId: string) => {
    const response = await api.get(`/payroll-tracking/employee/disputes/${disputeId}`);
    return response.data;
  },

  // Claims
  createClaim: async (data: { description: string; claimType: string; amount: number }) => {
    const response = await api.post('/payroll-tracking/employee/claims', data);
    return response.data;
  },

  getEmployeeClaims: async (page: number = 1, limit: number = 10) => {
    const response = await api.get('/payroll-tracking/employee/claims', {
      params: { page, limit },
    });
    return response.data;
  },

  getClaimStatus: async (claimId: string) => {
    const response = await api.get(`/payroll-tracking/employee/claims/${claimId}`);
    return response.data;
  },

  // Payroll Specialist endpoints
  getDisputesForReview: async (page: number = 1, limit: number = 10) => {
    const response = await api.get('/payroll-tracking/specialist/disputes/pending', {
      params: { page, limit },
    });
    return response.data;
  },

  approveDispute: async (disputeId: string, data: { comment?: string }) => {
    const response = await api.post(`/payroll-tracking/specialist/disputes/${disputeId}/approve`, data);
    return response.data;
  },

  rejectDispute: async (disputeId: string, data: { reason: string }) => {
    const response = await api.post(`/payroll-tracking/specialist/disputes/${disputeId}/reject`, data);
    return response.data;
  },

  getClaimsForReview: async (page: number = 1, limit: number = 10) => {
    const response = await api.get('/payroll-tracking/specialist/claims/pending', {
      params: { page, limit },
    });
    return response.data;
  },

  approveClaim: async (claimId: string, data: { approvedAmount: number; comment?: string }) => {
    const response = await api.post(`/payroll-tracking/specialist/claims/${claimId}/approve`, data);
    return response.data;
  },

  rejectClaim: async (claimId: string, data: { reason: string }) => {
    const response = await api.post(`/payroll-tracking/specialist/claims/${claimId}/reject`, data);
    return response.data;
  },

  getDepartmentReport: async (departmentId: string, filters?: {
    fromDate?: string;
    toDate?: string;
    payrollRunId?: string;
  }) => {
    const response = await api.get('/payroll-tracking/specialist/reports/department', {
      params: { departmentId, ...filters },
    });
    return response.data;
  },

  // Payroll Manager endpoints
  getPendingManagerApprovals: async (page: number = 1, limit: number = 10) => {
    const response = await api.get('/payroll-tracking/manager/approvals/pending', {
      params: { page, limit },
    });
    return response.data;
  },

  confirmDisputeApproval: async (disputeId: string) => {
    const response = await api.post(`/payroll-tracking/manager/disputes/${disputeId}/confirm-approval`);
    return response.data;
  },

  confirmClaimApproval: async (claimId: string) => {
    const response = await api.post(`/payroll-tracking/manager/claims/${claimId}/confirm-approval`);
    return response.data;
  },

  // Finance Staff endpoints
  getApprovedDisputes: async (page: number = 1, limit: number = 10) => {
    const response = await api.get('/payroll-tracking/finance/disputes/approved', {
      params: { page, limit },
    });
    return response.data;
  },

  getApprovedClaims: async (page: number = 1, limit: number = 10) => {
    const response = await api.get('/payroll-tracking/finance/claims/approved', {
      params: { page, limit },
    });
    return response.data;
  },

  createRefundForDispute: async (disputeId: string, data: { amount: number; description?: string }) => {
    const response = await api.post(`/payroll-tracking/finance/refunds/disputes/${disputeId}`, data);
    return response.data;
  },

  createRefundForClaim: async (claimId: string, data: { amount: number; description?: string }) => {
    const response = await api.post(`/payroll-tracking/finance/refunds/claims/${claimId}`, data);
    return response.data;
  },

  getTaxReport: async (filters: {
    fromDate?: string;
    toDate?: string;
    year?: number;
    departmentId?: string;
  }) => {
    const response = await api.get('/payroll-tracking/finance/reports/taxes', { params: filters });
    return response.data;
  },

  getInsuranceReport: async (filters: {
    fromDate?: string;
    toDate?: string;
    departmentId?: string;
  }) => {
    const response = await api.get('/payroll-tracking/finance/reports/insurance', { params: filters });
    return response.data;
  },

  getBenefitsReport: async (filters: {
    fromDate?: string;
    toDate?: string;
    departmentId?: string;
  }) => {
    const response = await api.get('/payroll-tracking/finance/reports/benefits', { params: filters });
    return response.data;
  },

  getMonthEndSummary: async (month: number, year: number) => {
    const response = await api.get(`/payroll-tracking/finance/reports/month-end/${month}/${year}`);
    return response.data;
  },

  getYearEndSummary: async (year: number) => {
    const response = await api.get(`/payroll-tracking/finance/reports/year-end/${year}`);
    return response.data;
  },
};

