'use client';
import React, { useState } from 'react';
import { Input } from '@/components/employee-profile-ui/input';
import { Button } from '@/components/employee-profile-ui/button';
import timeManagementService from '@/services/timeManagementService';

interface Props {
  employeeId?: string;
  onSubmitted?: ()=>void;
}

export default function TimeExceptionForm({ employeeId='', onSubmitted }: Props) {
  const [type, setType] = useState('CORRECTION');
  const [attendanceRecordId, setAttendanceRecordId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await timeManagementService.createTimeException({ employeeId, type, attendanceRecordId, assignedTo, reason });
      if (onSubmitted) onSubmitted();
      setType('CORRECTION'); setAttendanceRecordId(''); setAssignedTo(''); setReason('');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit exception');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input value={attendanceRecordId} onChange={(e)=>setAttendanceRecordId(e.target.value)} placeholder="Attendance record ID" />
      <Input value={assignedTo} onChange={(e)=>setAssignedTo(e.target.value)} placeholder="Assign to (manager id)" />
      <Input value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Reason" />
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <Button disabled={loading}>{loading ? 'Submitting...' : 'Submit Exception'}</Button>
      </div>
    </form>
  );
}


