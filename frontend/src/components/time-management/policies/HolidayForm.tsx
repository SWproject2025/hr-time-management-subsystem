'use client';
import React, { useState } from 'react';
import { Input } from '@/components/employee-profile-ui/input';
import { Button } from '@/components/employee-profile-ui/button';
import timeManagementService from '@/services/timeManagementService';

interface Props {
  initial?: { name?: string; startDate?: string; endDate?: string; type?: string };
  onSaved?: ()=>void;
}

export default function HolidayForm({ initial, onSaved }: Props) {
  const [name, setName] = useState(initial?.name || '');
  const [startDate, setStartDate] = useState(initial?.startDate || '');
  const [endDate, setEndDate] = useState(initial?.endDate || '');
  const [type, setType] = useState(initial?.type || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await timeManagementService.createHoliday({ name, startDate, endDate, type });
      if (onSaved) onSaved();
    } catch (err: any) {
      setError(err?.message || 'Failed to save holiday');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Holiday name" />
      <Input value={startDate} onChange={(e)=>setStartDate(e.target.value)} type="date" />
      <Input value={endDate} onChange={(e)=>setEndDate(e.target.value)} type="date" />
      <Input value={type} onChange={(e)=>setType(e.target.value)} placeholder="Type (PUBLIC/REGIONAL/OPTIONAL)" />
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <Button disabled={loading}>{loading ? 'Saving...' : 'Save Holiday'}</Button>
      </div>
    </form>
  );
}


