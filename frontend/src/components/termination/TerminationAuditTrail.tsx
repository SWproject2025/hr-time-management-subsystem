import React from 'react';

interface Props {
  termination: any;
}

export default function TerminationAuditTrail({ termination }: Props) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-md font-semibold mb-4">Audit Trail</h3>

      <ul className="space-y-3 text-sm">
        <li>
          <strong>Requested:</strong>{' '}
          {new Date(termination.createdAt).toLocaleString()}
        </li>

        {termination.hrComments && (
          <li>
            <strong>HR Reviewed:</strong>{' '}
            {new Date(termination.updatedAt).toLocaleString()}
          </li>
        )}

        {termination.status === 'approved' && (
          <li className="text-green-600 font-medium">
            Termination Approved
          </li>
        )}

        {termination.status === 'rejected' && (
          <li className="text-red-600 font-medium">
            Termination Rejected
          </li>
        )}
      </ul>
    </div>
  );
}
