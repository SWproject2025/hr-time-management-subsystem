'use client';
import React from 'react';
import { Card } from '@/components/employee-profile-ui/card';
import { formatEmployeeName } from '@/services/timeManagementService';

interface Props {
  assignments?: any[];
}

export default function ShiftCalendarView({ assignments = [] }: Props) {
  return (
    <Card>
      <div>
        <p className="text-sm text-gray-500">Calendar placeholder — integrate full calendar component as needed</p>
        <ul className="mt-3">
          {assignments.slice(0,10).map(a => (
            <li key={a._id}>{formatEmployeeName(a.employeeId) || 'Dept'} — {a.startDate}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}


