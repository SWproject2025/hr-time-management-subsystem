import React from 'react';

export default function ClearanceProgressSummary({ progress }: any) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
      <h4 className="font-medium">Progress Summary</h4>

      <div className="text-sm">
        Departments: {progress.approvedItems}/{progress.totalItems}
      </div>

      <div className="text-sm">
        Equipment: {progress.returnedEquipment}/{progress.totalEquipment}
      </div>

      <div className="text-sm">
        Card Returned: {progress.cardReturned ? 'Yes' : 'No'}
      </div>

      <div className="font-semibold">
        Overall: {progress.isComplete ? 'Complete' : 'Incomplete'}
      </div>
    </div>
  );
}
