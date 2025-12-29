'use client';
import React from 'react';
import { Card } from '@/components/employee-profile-ui/card';

interface Props {
  shifts?: number;
  assignments?: number;
  records?: number;
}

export default function TimeManagementStats({ shifts=0, assignments=0, records=0 }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card><div className="font-semibold">Shift types</div><div className="text-2xl">{shifts}</div></Card>
      <Card><div className="font-semibold">Assignments</div><div className="text-2xl">{assignments}</div></Card>
      <Card><div className="font-semibold">Records</div><div className="text-2xl">{records}</div></Card>
    </div>
  );
}
