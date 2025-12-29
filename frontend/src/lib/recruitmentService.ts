import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests if available
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

// ============ TYPE DEFINITIONS ============

export interface Contract {
  _id: string;
  offerId: string;
  employeeId: string;
  grossSalary: number;
  signingBonus?: number;
  role: string;
  startDate: string;
  benefits: string[];
  employeeSignatureUrl?: string;
  employerSignatureUrl?: string;
  employeeSignedAt?: string;
  employerSignedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
  ownerId?: string;
  applicationId?: string;
  type: 'cv' | 'contract' | 'id' | 'certificate' | 'resignation';
  filePath: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============ API SERVICE OBJECT ============

const recruitmentService = {
  // ============ CONTRACTS ============

  getContracts: async (filters: { offerId?: string; applicationId?: string; contractType?: string } = {}) => {
    try {
      const params: any = {};
      if (filters.offerId) params.offerId = filters.offerId;
      if (filters.applicationId) params.applicationId = filters.applicationId;
      if (filters.contractType) params.contractType = filters.contractType;

      const response = await api.get<Contract[]>('/recruitment/contracts', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching contracts:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getContract: async (id: string) => {
    try {
      const response = await api.get<Contract>(`/recruitment/contracts/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching contract ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  createContract: async (data: {
    offerId: string;
    employeeId: string;
    grossSalary: number;
    signingBonus?: number;
    role: string;
    startDate: string;
    benefits: string[];
  }) => {
    try {
      const response = await api.post<Contract>('/recruitment/contracts', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating contract:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateContract: async (id: string, data: {
    grossSalary?: number;
    signingBonus?: number;
    role?: string;
    startDate?: string;
    benefits?: string[];
  }) => {
    try {
      const response = await api.patch<Contract>(`/recruitment/contracts/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating contract ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  signContract: async (id: string, data: {
    signatureUrl: string;
    signerRole: 'employee' | 'employer';
  }) => {
    try {
      const response = await api.post<Contract>(`/recruitment/contracts/${id}/sign`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error signing contract ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getContractByOffer: async (offerId: string) => {
    try {
      const response = await api.get<Contract>(`/recruitment/offers/${offerId}/contract`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching contract for offer ${offerId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ============ DOCUMENTS ============

  getDocuments: async (filters: { ownerId?: string; applicationId?: string; type?: string } = {}) => {
    try {
      const params: any = {};
      if (filters.ownerId) params.ownerId = filters.ownerId;
      if (filters.applicationId) params.applicationId = filters.applicationId;
      if (filters.type) params.type = filters.type;

      const response = await api.get<Document[]>('/recruitment/documents', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching documents:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getDocument: async (id: string) => {
    try {
      const response = await api.get<Document>(`/recruitment/documents/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching document ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  uploadDocument: async (data: {
    ownerId?: string;
    applicationId?: string;
    type: 'cv' | 'contract' | 'id' | 'certificate' | 'resignation';
    filePath: string;
  }) => {
    try {
      const response = await api.post<Document>('/recruitment/documents', data);
      return response.data;
    } catch (error: any) {
      console.error('Error uploading document:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateDocument: async (id: string, data: {
    type?: 'cv' | 'contract' | 'id' | 'certificate' | 'resignation';
    filePath?: string;
  }) => {
    try {
      const response = await api.patch<Document>(`/recruitment/documents/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating document ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  deleteDocument: async (id: string) => {
    try {
      const response = await api.delete(`/recruitment/documents/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting document ${id}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getUserDocuments: async (userId: string) => {
    try {
      const response = await api.get<Document[]>(`/recruitment/users/${userId}/documents`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching documents for user ${userId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};

export default recruitmentService;
