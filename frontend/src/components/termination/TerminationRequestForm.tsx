import React, { useState } from 'react';
import InitiatorSelector from './InitiatorSelector';
import ConfirmSubmitModal from './ConfirmSubmitModal';

interface Props {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
}

export default function TerminationRequestForm({
  initialData,
  onSubmit,
}: Props) {
  const [employeeId, setEmployeeId] = useState(initialData?.employeeId || '');
  const [contractId, setContractId] = useState(initialData?.contractId || '');
  const [initiator, setInitiator] = useState<
    'employee' | 'hr' | 'manager'
  >(initialData?.initiator || 'hr');
  const [reason, setReason] = useState(initialData?.reason || '');
  const [employeeComments, setEmployeeComments] = useState(
    initialData?.employeeComments || '',
  );
  const [terminationDate, setTerminationDate] = useState(
    initialData?.terminationDate || '',
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const valid =
    employeeId &&
    contractId &&
    reason.trim().length >= 50 &&
    (!terminationDate ||
      new Date(terminationDate) >= new Date(new Date().toDateString()));

  const submit = async () => {
    await onSubmit({
      employeeId,
      contractId,
      initiator,
      reason,
      employeeComments:
        initiator === 'employee' ? employeeComments : undefined,
      terminationDate: terminationDate || undefined,
    });
  };

  return (
    <>
      <div className="bg-white border rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Employee ID *
          </label>
          <input
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Contract ID *
          </label>
          <input
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Initiator
          </label>
          <InitiatorSelector value={initiator} onChange={setInitiator} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Termination Reason *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-500">
            Minimum 50 characters
          </p>
        </div>

        {initiator === 'employee' && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Employee Comments
            </label>
            <textarea
              value={employeeComments}
              onChange={(e) => setEmployeeComments(e.target.value)}
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Termination Date
          </label>
          <input
            type="date"
            value={terminationDate}
            onChange={(e) => setTerminationDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => history.back()}
            className="px-4 py-2 border rounded-md text-sm"
          >
            Cancel
          </button>

          <button
            disabled={!valid}
            onClick={() => setConfirmOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>

      <ConfirmSubmitModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submit}
      />
    </>
  );
}
