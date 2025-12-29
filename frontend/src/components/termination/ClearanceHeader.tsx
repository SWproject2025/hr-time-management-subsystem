import React from 'react';

export default function ClearanceHeader({ progress }: any) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold">Clearance Checklist</h2>
        <p className="text-sm text-gray-500">
          Overall completion: {progress.progress.items}% items /{' '}
          {progress.progress.equipment}% equipment
        </p>
      </div>

      <span
        className={`px-4 py-1 rounded-full text-sm font-medium ${
          progress.isComplete
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}
      >
        {progress.isComplete ? 'Complete' : 'In Progress'}
      </span>
    </div>
  );
}
