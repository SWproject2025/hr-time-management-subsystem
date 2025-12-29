'use client';
import { useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';

export default function BulkAssignPage() {
  const [payload, setPayload] = useState('[\n  { "shiftId": "", "employeeId": "", "startDate": "" }\n]');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const assignments = JSON.parse(payload);
      await timeManagementService.bulkAssignShifts(assignments);
      setSuccess('Bulk assign submitted');
    } catch (err: any) {
      setError(err?.message || 'Failed to bulk assign');
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Bulk Shift Assignment</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea className="w-full h-40 border p-2" value={payload} onChange={(e)=>setPayload(e.target.value)} />
          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-green-600">{success}</p>}
          <div>
            <button className="btn" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}


