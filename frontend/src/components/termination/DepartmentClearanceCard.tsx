import React, { useState } from 'react';
import { offboardingService } from '@/lib/offboardingService';

export default function DepartmentClearanceCard({
  item,
  checklistId,
  reload,
}: any) {
  const [comments, setComments] = useState(item.comments || '');
  const [status, setStatus] = useState(item.status);

  const update = async () => {
    await offboardingService.updateClearanceItem(
      checklistId,
      item._id,
      {
        status,
        comments,
        updatedBy: 'system',
      },
    );
    reload();
  };

  const approve = async () => {
    await offboardingService.approveClearanceItem(
      checklistId,
      item._id,
      { updatedBy: 'system' },
    );
    reload();
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{item.department}</h4>
        <span className="text-xs capitalize">{item.status}</span>
      </div>

      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Comments"
        className="w-full border rounded-md p-2 text-sm"
      />

      <div className="flex justify-between">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-md p-1 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={update}
            className="px-3 py-1 text-sm border rounded-md"
          >
            Update
          </button>
          <button
            onClick={approve}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
