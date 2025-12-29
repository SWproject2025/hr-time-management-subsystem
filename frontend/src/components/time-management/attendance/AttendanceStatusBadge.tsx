'use client';
import React from 'react';

export type ValidationState = 'VALID' | 'FLAGGED' | 'PENDING_REVIEW';

interface Props {
  state?: ValidationState;
}

export default function AttendanceStatusBadge({ state = 'PENDING_REVIEW' }: Props) {
  const klass = state === 'VALID' ? 'bg-green-100 text-green-800' : state === 'FLAGGED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
  return <span className={`px-2 py-1 rounded text-sm ${klass}`}>{state.replace('_',' ')}</span>;
}
