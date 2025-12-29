import React, { useState } from 'react';
import { offboardingService } from '@/lib/offboardingService';
import { useRouter } from 'next/navigation';

interface Props {
  open: boolean;
  termination: any;
  onClose: () => void;
}

export default function ApproveTerminationModal({
  open,
  termination,
  onClose,
}: Props) {
  const router = useRouter();
  const [hrComments, setHrComments] = useState('');
  const [terminationDate, setTerminationDate] = useState(
    termination?.terminationDate || '',
  );
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const valid =
    terminationDate &&
    new Date(terminationDate) >= new Date(new Date().toDateString());

  const approve = async () => {
    setLoading(true);
    try {
      await offboardingService.approveTermination(termination._id, {
        hrComments,
        terminationDate,
      });

      // backend auto-creates clearance
      router.push(`/termination/${termination._id}/clearance`);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 space-y-5">
        <h3 className="text-lg font-semibold">
          Approve Termination Request
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
            HR Comments
          </label>
          <textarea
            value={hrComments}
            onChange={(e) => setHrComments(e.target.value)}
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-sm"
            placeholder="Optional but recommended"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Termination Date *
          </label>
          <input
            type="date"
            value={terminationDate}
            onChange={(e) => setTerminationDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
          A clearance checklist will be created automatically.
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
            onClick={approve}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
