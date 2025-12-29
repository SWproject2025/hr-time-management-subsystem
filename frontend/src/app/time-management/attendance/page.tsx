'use client';
import { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useAuth } from '@/context/AuthContext';

export default function AttendancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState(String(user?.employeeProfileId || ''));

  // Update employeeId when user changes
  useEffect(() => {
    setEmployeeId(String(user?.employeeProfileId || ''));
  }, [user?.employeeProfileId]);

  async function handleClockIn() {
    console.log('Attendance Page: Attempting clock in with employeeId:', employeeId);

    if (!employeeId || employeeId === '') {
      const errorMsg = 'Employee ID is not set. Please check your profile.';
      console.error('Attendance Page:', errorMsg);
      setError(errorMsg);
      return;
    }

    setLoading(true); setError(null); setMessage(null);
    try {
      await timeManagementService.clockIn(employeeId);
      setMessage('Clocked in');
    } catch (err: any) {
      console.error('Attendance Page: Clock in failed:', err);
      setError(err?.message || 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  }

  async function handleClockOut() {
    console.log('Attendance Page: Attempting clock out with employeeId:', employeeId);

    if (!employeeId || employeeId === '') {
      const errorMsg = 'Employee ID is not set. Please check your profile.';
      console.error('Attendance Page:', errorMsg);
      setError(errorMsg);
      return;
    }

    setLoading(true); setError(null); setMessage(null);
    try {
      await timeManagementService.clockOut(employeeId);
      setMessage('Clocked out');
    } catch (err: any) {
      console.error('Attendance Page: Clock out failed:', err);
      setError(err?.message || 'Failed to clock out');
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Attendance</h1>
        <div className="space-y-3 max-w-md">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Logged in as: <strong>{user?.firstName} {user?.lastName}</strong></p>
            <p className="text-sm text-gray-600">Employee ID: <strong>{employeeId || 'Not set'}</strong></p>
          </div>

          {!employeeId && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <p className="text-sm text-yellow-800">Employee ID not found. Please update your profile.</p>
            </div>
          )}

          <div className="space-x-2">
            <button
              className="btn"
              onClick={handleClockIn}
              disabled={loading || !employeeId}
            >
              Clock In
            </button>
            <button
              className="btn"
              onClick={handleClockOut}
              disabled={loading || !employeeId}
            >
              Clock Out
            </button>
          </div>
          {message && <p className="text-green-600">{message}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </div>
      </div>
    </RoleGuard>
  );
}


