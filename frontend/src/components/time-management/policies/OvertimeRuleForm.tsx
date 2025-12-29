'use client';
import React, { useState } from 'react';
import { Input } from '@/components/employee-profile-ui/input';
import { Button } from '@/components/employee-profile-ui/button';
import timeManagementService from '@/services/timeManagementService';

interface Props {
  initial?: { name?: string; multiplier?: number };
  onSaved?: ()=>void;
}

export default function OvertimeRuleForm({ initial, onSaved }: Props) {
  const [name, setName] = useState(initial?.name || '');
  const [multiplier, setMultiplier] = useState(initial?.multiplier?.toString() || '1.5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await timeManagementService.createOvertimeRule({ name, multiplier: Number(multiplier) });
      if (onSaved) onSaved();
    } catch (err: any) {
      setError(err?.message || 'Failed to save overtime rule');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Rule name" />
      <Input value={multiplier} onChange={(e)=>setMultiplier(e.target.value)} placeholder="Multiplier (e.g. 1.5)" />
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <Button disabled={loading}>{loading ? 'Saving...' : 'Save Overtime Rule'}</Button>
      </div>
    </form>
  );
}


