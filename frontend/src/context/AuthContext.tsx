"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  employeeProfileId: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
}

// ✅ 1. Update Interface to match your Form
interface RegisterData {
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  password: string;
  middleName?: string;
  mobilePhone?: string;
  gender?: string;
  maritalStatus?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');

        if (storedToken) {
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

          try {
            // Fetch fresh user profile with roles
            const profileResponse = await axios.get(`${API_URL}/employee-profile/me`);
            const profileData = profileResponse.data;

            const userInfo: User = {
              employeeProfileId: profileData.profile?._id || '',
              email: profileData.profile?.workEmail || profileData.profile?.personalEmail || '',
              roles: profileData.role?.roles || [],
              firstName: profileData.profile?.firstName,
              lastName: profileData.profile?.lastName,
            };

            setUser(userInfo);
            localStorage.setItem('user', JSON.stringify(userInfo));
          } catch (error: any) {
            // Handle 401 errors gracefully - token might be expired
            if (error?.response?.status === 401) {
              console.log('Token expired or invalid, clearing stored auth data');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
              return;
            }

            console.error('Error fetching user profile:', error);
            // If profile fetch fails, try to use stored user data as fallback
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser));
              } catch (e) {
                console.error('Error parsing stored user:', e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setToken(null);
              }
            }
          }
        }
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { access_token } = response.data;

      if (!access_token) {
        throw new Error('No access token received');
      }

      // Set token first so subsequent requests are authenticated
      setToken(access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Fetch user profile with roles
      const profileResponse = await axios.get(`${API_URL}/employee-profile/me`);
      const profileData = profileResponse.data;

      const userInfo: User = {
        employeeProfileId: profileData.profile?._id || '',
        email: profileData.profile?.workEmail || profileData.profile?.personalEmail || email,
        roles: profileData.role?.roles || [],
        firstName: profileData.profile?.firstName,
        lastName: profileData.profile?.lastName,
      };

      setUser(userInfo);

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userInfo));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  // ✅ 2. Fix Register Function to use Dynamic Data
  const register = async (data: RegisterData) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        nationalId: data.nationalId,
        workEmail: data.email, 
        personalEmail: data.email, 
        password: data.password,
        // Only include if they exist
        ...(data.middleName && { middleName: data.middleName }),
        ...(data.mobilePhone && { mobilePhone: data.mobilePhone }),
        ...(data.gender && { gender: data.gender }),
        ...(data.maritalStatus && { maritalStatus: data.maritalStatus }),
      };

      await axios.post(`${API_URL}/auth/register`, payload);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      // Pass the specific backend error message back to the UI
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
        isLoading,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}