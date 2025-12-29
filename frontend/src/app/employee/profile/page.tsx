"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { LayoutDashboard, Clock } from 'lucide-react'; // Added icons

export default function EmployeeProfilePage() {
  const router = useRouter();
  const { token, logout, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [roleData, setRoleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      router.push('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await axios.get('http://localhost:3000/employee-profile/me');
        setProfile(res.data.profile || res.data);
        setRoleData(res.data.role);
      } catch (error: any) {
        console.error("Profile Fetch Error:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
           logout();
           router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router, token, authLoading, logout]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Helper to check if user should see Admin button
  const isAdminOrManager = () => {
    if (!profile && !roleData) return false;

    // Check direct role on profile (from your manual MongoDB insert)
    if (profile?.role === 'ADMIN') return true;

    // Check system roles (from Seed script)
    if (roleData?.roles) {
      return roleData.roles.some((r: string) => {
        const roleLower = r.toLowerCase();
        return roleLower.includes('admin') || roleLower.includes('manager') || roleLower.includes('specialist') ||
               r === 'SYSTEM_ADMIN' || r === 'HR_ADMIN' || r === 'HR_MANAGER';
      });
    }
    return false;
  };

  // Helper to check if user should see Time Management button
  const hasTimeManagementAccess = () => {
    if (!profile && !roleData) return false;

    // SYSTEM_ADMIN should have access to everything
    if (roleData?.roles?.includes('SYSTEM_ADMIN')) return true;

    // Check system roles for time management access
    if (roleData?.roles) {
      return roleData.roles.some((r: string) => {
        const roleLower = r.toLowerCase();
        return roleLower.includes('admin') || roleLower.includes('hr') ||
               roleLower.includes('time_manager') || roleLower.includes('manager') ||
               r === 'SYSTEM_ADMIN' || r === 'HR_ADMIN' || r === 'TIME_MANAGER';
      });
    }
    return false;
  };

  if (authLoading || loading) return (
    <div className="flex items-center justify-center min-h-screen text-blue-600 font-medium">
       Loading Profile...
    </div>
  );

  if (!profile) return <div className="p-10 text-center text-red-500">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-900 text-white p-4 shadow flex justify-between items-center">
        <div className="font-bold text-xl tracking-wide">HR Portal</div>
        <div className="flex items-center gap-4">
           <span className="text-sm opacity-90 hidden sm:block">Welcome, {profile.firstName}</span>
           <button 
             onClick={handleLogout} 
             className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold transition shadow-sm"
           >
             Logout
           </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex items-center justify-between relative overflow-hidden">
          <div className="bg-blue-600 absolute top-0 left-0 w-full h-2"></div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500 uppercase">
              {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{profile.firstName} {profile.lastName}</h1>
              <p className="text-gray-500 text-sm">#{profile.employeeNumber} • {profile.personalEmail}</p>
              <div className="mt-2">
                 <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">
                   {profile.status}
                 </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold">Work Email</label>
                  <p className="text-gray-700 break-words">{profile.workEmail || 'Not Assigned'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold">Personal Email</label>
                  <p className="text-gray-700 break-words">{profile.personalEmail}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold">Mobile</label>
                  <p className="text-gray-700">{profile.mobilePhone || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold">National ID</label>
                  <p className="text-gray-700">{profile.nationalId || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Roles */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                
                {/* 👇 ADMIN DASHBOARD BUTTON (Only shows if Admin/Manager) */}
                {isAdminOrManager() && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition shadow font-medium flex items-center justify-center gap-2 mb-2"
                  >
                    <LayoutDashboard size={18} />
                    Go to Admin Dashboard
                  </button>
                )}

                {/* 👇 TIME MANAGEMENT BUTTON (Shows for users with time management access) */}
                {hasTimeManagementAccess() && (
                  <button
                    onClick={() => router.push('/time-management')}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition shadow font-medium flex items-center justify-center gap-2 mb-2"
                  >
                    <Clock size={18} />
                    Time Management
                  </button>
                )}

                <button
                  onClick={() => router.push('/employee/request')}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition shadow font-medium"
                >
                  + Submit Leave Request
                </button>
                <button 
                 onClick={() => router.push('/employee/edit')} 
                 className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 transition font-medium"
                >
                 Edit My Profile
              </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-800 mb-2">System Roles</h3>
              {roleData?.roles && roleData.roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {roleData.roles.map((r: string, idx: number) => (
                    <span key={idx} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold uppercase">
                      {r}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No specific system roles assigned.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}