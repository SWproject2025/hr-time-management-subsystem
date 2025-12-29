import React from 'react';

interface ClearanceProgressTrackerProps {
  progress: {
    totalItems: number;
    completedItems: number;
    pendingItems: number;
    percentComplete: number;
  };
}

export default function ClearanceProgressTracker({ progress }: ClearanceProgressTrackerProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Clearance Progress</h3>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-semibold text-blue-600">{progress.percentComplete}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentComplete}%` }}
            ></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{progress.totalItems}</div>
            <div className="text-xs text-gray-500 mt-1">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{progress.completedItems}</div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{progress.pendingItems}</div>
            <div className="text-xs text-gray-500 mt-1">Pending</div>
          </div>
        </div>

        {/* Status Message */}
        <div className="pt-4 border-t border-gray-200">
          {progress.percentComplete === 100 ? (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">All items completed!</span>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              {progress.pendingItems} item{progress.pendingItems !== 1 ? 's' : ''} remaining
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
