'use client';
import React, { useState } from 'react';
import { Input } from '@/components/employee-profile-ui/input';
import { Button } from '@/components/employee-profile-ui/button';
import timeManagementService from '@/services/timeManagementService';

interface Props {
  initial?: {
    name?: string;
    kind?: string;
    startTime?: string;
    endTime?: string;
    breakMinutes?: number;
  };
  onSaved?: () => void;
}

export default function ShiftTypeForm({ initial, onSaved }: Props) {
  const [name, setName] = useState(initial?.name || '');
  const [kind, setKind] = useState(initial?.kind || 'NORMAL');
  const [startTime, setStartTime] = useState(initial?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initial?.endTime || '17:00');
  const [breakMinutes, setBreakMinutes] = useState(initial?.breakMinutes || 60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const shiftData = {
        name,
        kind,
        startTime,
        endTime,
        breakMinutes: Number(breakMinutes)
      };
      await timeManagementService.createShiftType(shiftData);
      if (onSaved) onSaved();
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Shift Name *
        </label>
        <Input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="e.g., Morning Shift, Night Shift"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Shift Type
        </label>
        <select
          value={kind}
          onChange={(e)=>setKind(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="NORMAL">Normal</option>
          <option value="SPLIT">Split</option>
          <option value="OVERNIGHT">Overnight</option>
          <option value="ROTATIONAL">Rotational</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <Input
            type="time"
            value={startTime}
            onChange={(e)=>setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <Input
            type="time"
            value={endTime}
            onChange={(e)=>setEndTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Break Duration (minutes)
        </label>
        <Input
          type="number"
          value={breakMinutes}
          onChange={(e)=>setBreakMinutes(Number(e.target.value))}
          placeholder="60"
          min="0"
          max="480"
        />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={() => onSaved?.()}>
          Cancel
        </Button>
        <Button disabled={loading || !name.trim()}>
          {loading ? 'Saving...' : 'Save Shift Type'}
        </Button>
      </div>
    </form>
  );
}


