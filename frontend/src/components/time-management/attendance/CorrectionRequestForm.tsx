'use client';
import React, { useState } from 'react';
import { Button } from '@/components/employee-profile-ui/button';
import { Input } from '@/components/employee-profile-ui/input';
import timeManagementService from '@/services/timeManagementService';

interface Props {
  employeeId?: string;
  attendanceRecordId?: string;
  onSuccess?: () => void;
}

export default function CorrectionRequestForm({ employeeId='', attendanceRecordId='', onSuccess }: Props) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await timeManagementService.createCorrectionRequest({ employeeId, attendanceRecord: attendanceRecordId, reason });
      if (onSuccess) onSuccess();
      setReason('');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit correction request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Reason for correction" />
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <Button disabled={loading}>{loading ? 'Submitting...' : 'Request Correction'}</Button>
      </div>
    </form>
  );
}


