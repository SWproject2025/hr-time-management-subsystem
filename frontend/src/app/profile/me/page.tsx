"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch, logout } from '../../../lib/auth';
import toast from 'react-hot-toast';

export default function EmployeeProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [roleData, setRoleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authFetch('http://localhost:3000/employee-profile/me');
        if (!res.ok) {
           logout();
           router.push('/login');
           return;
        }
        const data = await res.json();
        setProfile(data.profile);
        setRoleData(data.role);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Helper to check if user is Admin
  const isAdmin = roleData?.roles?.some((r: string) => 
    ['ADMIN', 'System Admin', 'HR Admin'].includes(r)
  );

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;
  if (!profile) return <div className="p-10 text-center text-red-500">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-900 text-white p-4 shadow flex justify-between items-center">
        <div className="font-bold text-xl tracking-wide">HR Portal</div>
        <div className="flex items-center gap-4">
           <span className="text-sm opacity-90">Welcome, {profile.firstName}</span>
           <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold transition shadow-sm">
             Logout
           </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex items-center justify-between relative overflow-hidden">
          <div className="bg-blue-600 absolute top-0 left-0 w-full h-2"></div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{profile.firstName} {profile.lastName}</h1>
              <p className="text-gray-500 text-sm">#{profile.employeeNumber} • {profile.personalEmail}</p>
              <div className="mt-2">
                 <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">{profile.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-400 uppercase font-bold">Work Email</label><p className="text-gray-700">{profile.workEmail || 'Not Assigned'}</p></div>
                <div><label className="text-xs text-gray-400 uppercase font-bold">Personal Email</label><p className="text-gray-700">{profile.personalEmail}</p></div>
                <div><label className="text-xs text-gray-400 uppercase font-bold">Mobile</label><p className="text-gray-700">{profile.mobilePhone || '—'}</p></div>
                <div><label className="text-xs text-gray-400 uppercase font-bold">National ID</label><p className="text-gray-700">{profile.nationalId || '—'}</p></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/employee/request')} 
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition shadow font-medium"
                >
                  + Submit Request
                </button>
                
                <button 
                  onClick={() => alert("Edit Profile Coming Soon")} 
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 transition font-medium"
                >
                  Edit My Profile
                </button>

                {/* ADMIN BUTTON: Only shows if user is Admin */}
                {isAdmin && (
                  <button 
                    onClick={() => router.push('/admin')} 
                    className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition shadow font-medium mt-4"
                  >
                    Go to Admin Dashboard →
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-800 mb-2">System Roles</h3>
              {roleData?.roles?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {roleData.roles.map((r: string, idx: number) => (
                    <span key={idx} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold uppercase">{r}</span>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-sm">No specific system roles assigned.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}