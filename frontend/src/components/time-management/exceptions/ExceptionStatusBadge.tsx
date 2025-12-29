'use client';
import React from 'react';

export type ExceptionStatus = 'OPEN' | 'RESOLVED' | 'REJECTED';

interface Props {
  status?: ExceptionStatus;
}

export default function ExceptionStatusBadge({ status = 'OPEN' }: Props) {
  const klass = status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' : status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  return <span className={`px-2 py-1 rounded text-sm ${klass}`}>{status}</span>;
}


