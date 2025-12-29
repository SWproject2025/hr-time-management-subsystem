import React from 'react';

type Initiator = 'employee' | 'hr' | 'manager';

const styles: Record<Initiator, string> = {
  employee: 'bg-purple-100 text-purple-800 border-purple-200',
  hr: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  manager: 'bg-teal-100 text-teal-800 border-teal-200',
};

const labels: Record<Initiator, string> = {
  employee: 'Employee',
  hr: 'HR',
  manager: 'Manager',
};

export default function InitiatorBadge({
  initiator,
}: {
  initiator: Initiator;
}) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
        styles[initiator]
      }`}
    >
      {labels[initiator]}
    </span>
  );
}
