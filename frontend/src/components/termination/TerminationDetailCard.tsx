import React from 'react';
import InitiatorBadge from './InitiatorBadge';
import TerminationStatusBadge from './TerminationStatusBadge';

interface Props {
  termination: any;
}

export default function TerminationDetailCard({ termination }: Props) {
  return (
    <div className="bg-white border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">Termination Request</h2>
          <p className="text-sm text-gray-500">
            Created on {new Date(termination.createdAt).toLocaleDateString()}
          </p>
        </div>

        <TerminationStatusBadge status={termination.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Employee ID</p>
          <p className="font-medium">{termination.employeeId}</p>
        </div>

        <div>
          <p className="text-gray-500">Contract ID</p>
          <p className="font-medium">{termination.contractId}</p>
        </div>

        <div>
          <p className="text-gray-500">Initiator</p>
          <InitiatorBadge initiator={termination.initiator} />
        </div>

        <div>
          <p className="text-gray-500">Termination Date</p>
          <p className="font-medium">
            {termination.terminationDate
              ? new Date(termination.terminationDate).toLocaleDateString()
              : 'Not set'}
          </p>
        </div>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Reason</p>
        <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">
          {termination.reason}
        </p>
      </div>

      {termination.employeeComments && (
        <div>
          <p className="text-gray-500 text-sm">Employee Comments</p>
          <p className="mt-1 text-sm">{termination.employeeComments}</p>
        </div>
      )}

      {termination.hrComments && (
        <div>
          <p className="text-gray-500 text-sm">HR Comments</p>
          <p className="mt-1 text-sm">{termination.hrComments}</p>
        </div>
      )}
    </div>
  );
}
