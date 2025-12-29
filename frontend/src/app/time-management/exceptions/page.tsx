'use client';
import { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function ExceptionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [type, setType] = useState<'OVERTIME'|'PERMISSION'|'WEEKEND'|'OTHER'>('OVERTIME');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);

  async function submitException(e?: any) {
    if (e) e.preventDefault();
    if (!startDate || !endDate) {
      toast({ title: 'Validation', description: 'Please select date range', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const attendanceRecordId = `${startDate}`; // placeholder if backend requires
      const payload: any = {
        employeeId: user?.employeeProfileId,
        type,
        attendanceRecordId,
        assignedTo: '', // could pick manager id
        reason,
      };
      await timeManagementService.createTimeException(payload);
      toast({ title: 'Submitted', description: 'Exception request submitted' });
      // optionally create notification
      await timeManagementService.createNotificationLog({ to: user?.employeeProfileId || '', type: 'EXCEPTION_CREATED', message: `Exception ${type} submitted` });
      // reset
      setType('OVERTIME'); setStartDate(''); setEndDate(''); setStartTime(''); setEndTime(''); setReason(''); setFile(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to submit', variant: 'destructive' });
      setError(err?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER','EMPLOYEE']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Request Time Exception</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <form onSubmit={submitException} className="bg-white p-4 rounded shadow-sm border col-span-2">
            <div className="mb-3">
              <label className="text-sm block">Exception Type</label>
              <select className="input" value={type} onChange={(e)=>setType(e.target.value as any)}>
                <option value="OVERTIME">Overtime</option>
                <option value="PERMISSION">Permission (leave early)</option>
                <option value="WEEKEND">Weekend Work</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-sm block">Start Date</label>
                <input type="date" className="input" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm block">Start Time</label>
                <input type="time" className="input" value={startTime} onChange={(e)=>setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="text-sm block">End Date</label>
                <input type="date" className="input" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm block">End Time</label>
                <input type="time" className="input" value={endTime} onChange={(e)=>setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-sm block">Reason</label>
              <textarea className="w-full border p-2 rounded" rows={4} value={reason} onChange={(e)=>setReason(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="text-sm block">Supporting documents (optional)</label>
              <input type="file" className="input" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
            </div>

            <div className="flex items-center gap-3">
              <button className="btn" type="submit" disabled={loading}>Submit Request</button>
              <button type="button" className="btn" onClick={()=>{ setType('OVERTIME'); setStartDate(''); setEndDate(''); setStartTime(''); setEndTime(''); setReason(''); setFile(null); }}>Reset</button>
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </form>

          <div className="bg-white p-4 rounded shadow-sm border">
            <h3 className="text-lg font-medium mb-3">Guidance</h3>
            <p className="text-sm text-gray-600">Please provide clear justification and attach evidence for overtime/permissions. Managers will review requests and approve or reject.</p>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}


