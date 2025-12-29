import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/calc-draft-utils';

interface SignatureDisplayProps {
  signatureUrl?: string;
  signedAt?: string;
  signerRole: 'employee' | 'employer';
  className?: string;
}

export function SignatureDisplay({
  signatureUrl,
  signedAt,
  signerRole,
  className,
}: SignatureDisplayProps) {
  const isSigned = Boolean(signatureUrl && signedAt);
  const roleLabel = signerRole === 'employee' ? 'Employee' : 'Employer';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={cn(
        'bg-white border rounded-lg overflow-hidden',
        isSigned ? 'border-green-200' : 'border-gray-200',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'px-4 py-3 flex items-center justify-between',
          isSigned ? 'bg-green-50' : 'bg-gray-50'
        )}
      >
        <h3 className="text-sm font-semibold text-gray-900">{roleLabel} Signature</h3>
        {isSigned ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <Clock className="h-5 w-5 text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {isSigned ? (
          <div className="space-y-3">
            {/* Signature Image */}
            {signatureUrl && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <img
                  src={signatureUrl}
                  alt={`${roleLabel} signature`}
                  className="max-w-full h-auto max-h-24 mx-auto"
                />
              </div>
            )}

            {/* Signed Date */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                Signed On
              </label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(signedAt!)}</p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 pt-2">
              <div className="flex-1 h-px bg-green-200" />
              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                Signed
              </span>
              <div className="flex-1 h-px bg-green-200" />
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">Signature Pending</p>
            <p className="text-xs text-gray-400 mt-1">
              Awaiting {roleLabel.toLowerCase()} signature
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
