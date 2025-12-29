import React from 'react';
import { offboardingService } from '@/lib/offboardingService';

export default function AccessCardToggle({ checklist, reload }: any) {
  const toggle = async () => {
    await offboardingService.updateClearanceItem(checklist._id, '', {
      cardReturned: !checklist.cardReturned,
    });
    reload();
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
      <span className="font-medium">Access Card Returned</span>
      <button
        onClick={toggle}
        className={`px-4 py-1 rounded-full text-sm ${
          checklist.cardReturned
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-200'
        }`}
      >
        {checklist.cardReturned ? 'Yes' : 'No'}
      </button>
    </div>
  );
}
