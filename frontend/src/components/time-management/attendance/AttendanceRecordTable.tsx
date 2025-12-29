'use client';
import React from 'react';
import { Card } from '@/components/employee-profile-ui/card';
import { formatEmployeeName } from '@/services/timeManagementService';

interface Punch {
  type: string;
  time: string;
}

interface AttendanceRecord {
  _id: string;
  employeeId: string | any; // Can be string or populated employee object
  punches?: Punch[];
  totalWorkMinutes?: number;
  createdAt?: string;
}

interface Props {
  records: AttendanceRecord[];
}

export default function AttendanceRecordTable({ records }: Props) {
  return (
    <Card>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-2">Employee</th>
            <th className="text-left p-2">Punches</th>
            <th className="text-left p-2">Total mins</th>
            <th className="text-left p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r._id} className="border-t">
              <td className="p-2">{formatEmployeeName(r.employeeId)}</td>
              <td className="p-2">{r.punches?.map(p=>`${p.type}@${new Date(p.time).toLocaleTimeString()}`).join(', ')}</td>
              <td className="p-2">{r.totalWorkMinutes ?? '—'}</td>
              <td className="p-2">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
