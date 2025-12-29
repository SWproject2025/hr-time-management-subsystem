import axios from 'axios';
import { EmployeeProfile, MeResponse, UpdateContactDto, ChangeRequestDto } from '@/types/employee';

// Helper to get token (assuming you store it in localStorage)
const getAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

const api = axios.create({
  baseURL: 'http://localhost:3000', // Ensure this matches your NestJS port
});

// Add token to every request
api.interceptors.request.use((config) => {
  const headers = getAuthHeader();
  if (headers.Authorization) {
    config.headers.Authorization = headers.Authorization;
  }
  return config;
});

export const EmployeeService = {
  getMe: async () => {
    // Now this will hit http://localhost:3000/employee-profile/me
    const { data } = await api.get('/employee-profile/me');
    return data;
  },

  // Update Contact Info (Self-Service)
  updateContact: async (id: string, dto: UpdateContactDto) => {
    const { data } = await api.put<EmployeeProfile>(`/employee-profile/${id}/contact`, dto);
    return data;
  },

  // Submit Change Request (For locked fields)
  submitChangeRequest: async (id: string, dto: ChangeRequestDto) => {
    const { data } = await api.post(`/employee-profile/${id}/change-request`, dto);
    return data;
  },

  // Upload Profile Picture
  uploadPhoto: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post<EmployeeProfile>(
      `/employee-profile/${id}/upload-photo`, 
      formData, 
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  // Manager: Get Team
  getTeam: async (managerId: string) => {
    const { data } = await api.get<EmployeeProfile[]>(`/employee-profile/team/${managerId}`);
    return data;
  },

  // Admin: Search
  search: async (query: string) => {
    const { data } = await api.get<EmployeeProfile[]>(`/employee-profile/search?q=${query}`);
    return data;
  }
};