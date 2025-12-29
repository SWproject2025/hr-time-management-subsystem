import React from 'react';

type Status = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

const styles: Record<Status, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800 border-blue-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

export default function TerminationStatusBadge({ status }: { status: Status }) {
  const cls =
    styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';

  const label = status.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      {label}
    </span>
  );
}
