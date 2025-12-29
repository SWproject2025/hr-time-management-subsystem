'use client';
import React, { useState } from 'react';
import Dialog from '@/components/employee-profile-ui/card';
import { Input } from '@/components/employee-profile-ui/input';
import { Button } from '@/components/employee-profile-ui/button';
import timeManagementService from '@/services/timeManagementService';

interface Props {
  onClose?: ()=>void;
  onAssigned?: ()=>void;
}

export default function ShiftAssignmentModal({ onClose, onAssigned }: Props) {
  const [shiftId, setShiftId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await timeManagementService.createShiftAssignment({ shiftId, employeeId, startDate });
      if (onAssigned) onAssigned();
      if (onClose) onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to assign shift');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={handleAssign} className="space-y-3">
        <Input value={shiftId} onChange={(e)=>setShiftId(e.target.value)} placeholder="Shift ID" />
        <Input value={employeeId} onChange={(e)=>setEmployeeId(e.target.value)} placeholder="Employee ID" />
        <Input value={startDate} onChange={(e)=>setStartDate(e.target.value)} placeholder="Start Date" />
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <Button disabled={loading}>{loading ? 'Assigning...' : 'Assign Shift'}</Button>
          <button type="button" className="ml-2 btn" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}


