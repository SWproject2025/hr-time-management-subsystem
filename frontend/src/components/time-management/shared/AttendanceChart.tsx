'use client';
import React from 'react';
import { Card } from '@/components/employee-profile-ui/card';

interface Props {
  data?: { date: string; value: number }[];
}

export default function AttendanceChart({ data = [] }: Props) {
  return (
    <Card>
      <div className="text-sm text-gray-500">Attendance chart placeholder</div>
      <div className="mt-3">
        {data.slice(0,7).map(d => (
          <div key={d.date} className="flex items-center justify-between">
            <div>{d.date}</div>
            <div>{d.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}


