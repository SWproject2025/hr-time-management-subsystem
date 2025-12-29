import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/calc-draft-utils';

interface SignatureStatusBadgeProps {
  employeeSignedAt?: string;
  employerSignedAt?: string;
  className?: string;
}

export function SignatureStatusBadge({
  employeeSignedAt,
  employerSignedAt,
  className,
}: SignatureStatusBadgeProps) {
  const bothSigned = employeeSignedAt && employerSignedAt;
  const employeeOnly = employeeSignedAt && !employerSignedAt;
  const employerOnly = !employeeSignedAt && employerSignedAt;
  const notSigned = !employeeSignedAt && !employerSignedAt;

  if (bothSigned) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium',
          'bg-green-100 text-green-800 border border-green-300',
          className
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Both Signed
      </span>
    );
  }

  if (employeeOnly) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium',
          'bg-yellow-100 text-yellow-800 border border-yellow-300',
          className
        )}
      >
        <Clock className="h-3.5 w-3.5" />
        Pending Employer
      </span>
    );
  }

  if (employerOnly) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium',
          'bg-yellow-100 text-yellow-800 border border-yellow-300',
          className
        )}
      >
        <Clock className="h-3.5 w-3.5" />
        Pending Employee
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium',
        'bg-gray-100 text-gray-800 border border-gray-300',
        className
      )}
    >
      <XCircle className="h-3.5 w-3.5" />
      Not Signed
    </span>
  );
}
