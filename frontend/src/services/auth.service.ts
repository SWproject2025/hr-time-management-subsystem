import axios from 'axios';

// 1. Point to Port 3001 (Backend)
// 2. Do NOT include '/auth' here to avoid confusion/doubling
const API_BASE_URL = 'http://localhost:3000'; 

export const AuthService = {
  login: async (credentials: any) => {
    // URL becomes: http://localhost:3001/auth/login
    console.log(`Sending Login to: ${API_BASE_URL}/auth/login`); 
    
    const { data } = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    return data;
  },

  register: async (userData: any) => {
    // URL becomes: http://localhost:3001/auth/register
    console.log(`Sending Register to: ${API_BASE_URL}/auth/register`);

    const { data } = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
};