'use client';
import React from 'react';

interface Props {
  shiftName?: string;
  expiresInDays?: number;
}

export default function ShiftExpiryAlert({ shiftName='Shift', expiresInDays=7 }: Props) {
  const warn = expiresInDays <= 3;
  const klass = warn ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800';
  return (
    <div className={`p-3 border rounded ${klass}`}>
      <div className="font-semibold">{shiftName} expires in {expiresInDays} days</div>
      <div className="text-sm">Please review assignment or extend schedule.</div>
    </div>
  );
}


