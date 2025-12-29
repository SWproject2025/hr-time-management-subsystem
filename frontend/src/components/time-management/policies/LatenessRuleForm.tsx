'use client';
import React, { useState } from 'react';
import { Input } from '@/components/employee-profile-ui/input';
import { Button } from '@/components/employee-profile-ui/button';
import timeManagementService from '@/services/timeManagementService';

interface Props {
  initial?: { name?: string; gracePeriodMinutes?: number };
  onSaved?: ()=>void;
}

export default function LatenessRuleForm({ initial, onSaved }: Props) {
  const [name, setName] = useState(initial?.name || '');
  const [grace, setGrace] = useState(initial?.gracePeriodMinutes?.toString() || '0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await timeManagementService.createLatenessRule({ name, gracePeriodMinutes: Number(grace) });
      if (onSaved) onSaved();
    } catch (err: any) {
      setError(err?.message || 'Failed to save lateness rule');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Rule name" />
      <Input value={grace} onChange={(e)=>setGrace(e.target.value)} placeholder="Grace period (minutes)" />
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <Button disabled={loading}>{loading ? 'Saving...' : 'Save Lateness Rule'}</Button>
      </div>
    </form>
  );
}


