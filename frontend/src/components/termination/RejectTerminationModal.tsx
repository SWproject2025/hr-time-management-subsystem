import React, { useState } from 'react';
import { offboardingService } from '@/lib/offboardingService';

interface Props {
  open: boolean;
  termination: any;
  onClose: () => void;
}

export default function RejectTerminationModal({
  open,
  termination,
  onClose,
}: Props) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const valid = reason.trim().length >= 20;

  const reject = async () => {
    setLoading(true);
    try {
      await offboardingService.rejectTermination(termination._id, {
        hrComments: reason,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 space-y-5">
        <h3 className="text-lg font-semibold text-red-600">
          Reject Termination Request
        </h3>

        <div className="text-sm text-gray-600">
          <p>
            <strong>Employee:</strong> {termination.employeeId}
          </p>
          <p>
            <strong>Reason:</strong> {termination.reason}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Rejection Reason *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full border rounded-md px-3 py-2 text-sm"
            placeholder="Minimum 20 characters"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm"
          >
            Cancel
          </button>

          <button
            disabled={!valid || loading}
            onClick={reject}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
