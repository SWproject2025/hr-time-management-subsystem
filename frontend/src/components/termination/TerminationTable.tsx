import React from 'react';
import Link from 'next/link';
import TerminationStatusBadge from './TerminationStatusBadge';
import InitiatorBadge from './InitiatorBadge';

export interface TerminationRow {
  _id: string;
  employeeId: string;
  contractId: string;
  initiator: 'employee' | 'hr' | 'manager';
  reason: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  terminationDate?: string;
  createdAt: string;
}

interface Props {
  data: TerminationRow[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const TerminationTable: React.FC<Props> = ({ data, onApprove, onReject }) => {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Employee ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Contract
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Initiator
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Reason
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Termination Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">
                {row.employeeId}
              </td>

              <td className="px-6 py-4 text-sm text-gray-700">
                {row.contractId}
              </td>

              <td className="px-6 py-4">
                <InitiatorBadge initiator={row.initiator} />
              </td>

              <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                {row.reason}
              </td>

              <td className="px-6 py-4">
                <TerminationStatusBadge status={row.status} />
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {row.terminationDate
                  ? new Date(row.terminationDate).toLocaleDateString()
                  : '—'}
              </td>

              <td className="px-6 py-4 text-right space-x-2">
                <Link
                  href={`/termination/${row._id}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  View
                </Link>

                {(row.status === 'PENDING' ||
                  row.status === 'UNDER_REVIEW') && (
                  <>
                    <button
                      onClick={() => onApprove(row._id)}
                      className="text-sm font-medium text-green-600 hover:underline"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(row._id)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-10 text-center text-sm text-gray-500"
              >
                No termination requests found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TerminationTable;
