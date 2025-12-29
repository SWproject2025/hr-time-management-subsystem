"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authFetch } from '../../../lib/auth';
import toast from 'react-hot-toast';

export default function AdminEditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await authFetch(`http://localhost:3000/employee-profile/${params.id}`);
        if (res.ok) setEmployee(await res.json());
      } catch (err) {
        toast.error("Failed to load employee");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [params.id]);

  const handleFire = async () => {
    if (!confirm("Are you sure you want to TERMINATE this employee? This action is serious.")) return;
    try {
      const res = await fetch(`http://localhost:3000/employee-profile/${params.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'TERMINATED' }),
      });
      if (res.ok) {
        toast.success("Employee Terminated.");
        router.push('/admin');
      }
    } catch (err) {
      toast.error("Error terminating employee");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!employee) return <div className="p-10 text-center">Employee not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Employee</h1>
          <button onClick={() => router.back()} className="text-gray-500 hover:underline">Back</button>
        </div>

        <div className="flex items-center gap-4 mb-8 border-b pb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
            {employee.firstName[0]}{employee.lastName[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold">{employee.firstName} {employee.lastName}</h2>
            <p className="text-gray-500">{employee.workEmail}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${employee.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {employee.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded hover:shadow-md transition cursor-pointer" onClick={() => router.push(`/time-management?employee=${params.id}`)}>
            <h3 className="font-bold text-green-600 mb-2">⏰ Time Management</h3>
            <p className="text-sm text-gray-500">View attendance, shifts, and time-related activities.</p>
          </div>

          <div className="p-4 border rounded hover:shadow-md transition cursor-pointer" onClick={() => toast("Promotion Feature Coming Soon!")}>
            <h3 className="font-bold text-blue-600 mb-2">⭐ Promote Employee</h3>
            <p className="text-sm text-gray-500">Change job title, department, or system role.</p>
          </div>

          <div className="p-4 border border-red-200 bg-red-50 rounded hover:shadow-md transition cursor-pointer" onClick={handleFire}>
            <h3 className="font-bold text-red-600 mb-2">🔥 Fire / Terminate</h3>
            <p className="text-sm text-gray-500">Revoke access and mark status as Terminated.</p>
          </div>
        </div>
      </div>
    </div>
  );
}