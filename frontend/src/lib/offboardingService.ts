import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with proper configuration
function createClient(): AxiosInstance {
  const baseURL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:3000';

  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}

const api = createClient();

export const offboardingService = {
  // TERMINATION
  createTermination: (data: any) =>
    api.post('/recruitment/termination', data),

  getTerminations: (params?: any) =>
    api.get('/recruitment/termination', { params }),

  getTerminationById: (id: string) =>
    api.get(`/recruitment/termination/${id}`),

  updateTermination: (id: string, data: any) =>
    api.patch(`/recruitment/termination/${id}`, data),

  approveTermination: (id: string, data: any) =>
    api.post(`/recruitment/termination/${id}/approve`, data),

  rejectTermination: (id: string, data: any) =>
    api.post(`/recruitment/termination/${id}/reject`, data),

  // CLEARANCE
  getClearance: (terminationId: string) =>
    api.get(`/recruitment/termination/${terminationId}/clearance`),

  getClearanceProgress: (clearanceId: string) =>
    api.get(`/recruitment/clearance/${clearanceId}/progress`),

  updateClearanceItem: (clearanceId: string, itemId: string, data: any) =>
    api.patch(`/recruitment/clearance/${clearanceId}/items/${itemId}`, data),

  approveClearanceItem: (clearanceId: string, itemId: string, data: any) =>
    api.post(
      `/recruitment/clearance/${clearanceId}/items/${itemId}/approve`,
      data,
    ),
};
