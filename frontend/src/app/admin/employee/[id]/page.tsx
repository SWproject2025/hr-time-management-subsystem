"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authFetch } from '../../../../lib/auth'; // Verify this path matches your structure
import toast from 'react-hot-toast';

// Allowed Roles based on your Database Schema
const AVAILABLE_ROLES = [
  'department employee',
  'department head',
  'HR Admin',
  'System Admin',
  'HR Manager',
  'Payroll Specialist'
];

export default function AdminEditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  
  // State for the SINGLE employee we are editing
  const [employee, setEmployee] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  // 1. Fetch Employee Data & Role (Only for this specific ID)
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        // Fetch the specific employee by the ID in the URL
        const res = await authFetch(`http://localhost:3000/employee-profile/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setEmployee(data);
          
          // Set the current role if it exists
          if (data.role && data.role.roles && data.role.roles.length > 0) {
            setCurrentRole(data.role.roles[0]);
          } else {
            setCurrentRole('department employee');
          }
        } else {
          toast.error("Could not find employee");
        }
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) fetchEmployee();
  }, [params.id]);

  // 2. Handle Role Update
  const handleSaveRole = async () => {
    try {
      const res = await fetch(`http://localhost:3000/employee-profile/${params.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (res.ok) {
        toast.success(`Role updated to: ${selectedRole}`);
        setCurrentRole(selectedRole);
        setShowRoleModal(false);
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to update role");
      }
    } catch (error) {
      toast.error("Connection Error");
    }
  };

  // 3. Fire/Terminate Function
  const handleFire = async () => {
    if (!confirm("Are you sure you want to TERMINATE this employee?")) return;
    try {
      const res = await fetch(`http://localhost:3000/employee-profile/${params.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'TERMINATED' }),
      });
      if (res.ok) {
        toast.success("Employee Terminated Successfully");
        router.push('/admin'); // Redirect back to dashboard
      }
    } catch (err) {
      toast.error("Error connecting to server");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (!employee) return <div className="p-10 text-center text-red-500">Employee not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h1 className="text-xl font-bold text-gray-800">Manage Employee</h1>
          <button onClick={() => router.back()} className="text-sm text-gray-600 hover:text-gray-900 font-medium underline">
            ← Back to Dashboard
          </button>
        </div>

        {/* Info Card */}
        <div className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 border-2 border-white shadow">
              {employee.firstName?.[0]}{employee.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{employee.firstName} {employee.lastName}</h2>
              <p className="text-gray-500">{employee.workEmail}</p>
              <div className="flex gap-2 mt-2">
                 <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                    employee.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                 }`}>
                   {employee.status}
                 </span>
                 <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wide bg-purple-100 text-purple-700">
                   {currentRole || 'No Role'}
                 </span>
              </div>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Promote Button (Triggers Modal) */}
            <div 
                className="border rounded-lg p-5 hover:bg-blue-50 cursor-pointer transition border-gray-200 group"
                onClick={() => { setSelectedRole(currentRole); setShowRoleModal(true); }}
            >
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-blue-100 rounded text-blue-600">⭐</div>
                 <h3 className="font-bold text-gray-800 group-hover:text-blue-700">Promote / Change Role</h3>
              </div>
              <p className="text-sm text-gray-500">Update job title, department, or system access levels.</p>
            </div>

            {/* Terminate Button */}
            <div 
                className="border border-red-200 bg-red-50 rounded-lg p-5 hover:bg-red-100 cursor-pointer transition group"
                onClick={handleFire}
            >
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-red-200 rounded text-red-700">🔥</div>
                 <h3 className="font-bold text-red-800">Terminate Employment</h3>
              </div>
              <p className="text-sm text-red-600 opacity-80">Revoke all access and mark status as TERMINATED.</p>
            </div>
          </div>
        </div>

        {/* --- ROLE SELECTION MODAL --- */}
        {showRoleModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-96 p-6 animate-in fade-in zoom-in duration-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Select New Role</h3>
              
              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {AVAILABLE_ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="role" 
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium capitalize">{role}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowRoleModal(false)}
                  className="w-1/2 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveRole}
                  className="w-1/2 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow"
                >
                  Save Role
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}