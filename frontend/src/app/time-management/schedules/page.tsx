'use client';
import { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService, { formatEmployeeName } from '@/services/timeManagementService';

export default function SchedulesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const a = await timeManagementService.getAllShiftAssignments();
        if (!mounted) return;
        setAssignments(a || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load schedules');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Schedules</h1>
        {loading && <p>Loading calendar...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <div>
            <p>Calendar placeholder (implement calendar component)</p>
            <ul className="mt-4">
              {assignments.slice(0, 20).map(a => (
                <li key={a._id}>{formatEmployeeName(a.employeeId) || 'Dept'} — {a.startDate}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}


