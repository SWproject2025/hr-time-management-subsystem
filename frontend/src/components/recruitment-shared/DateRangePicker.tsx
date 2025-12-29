import React from 'react';
import { Calendar, X } from 'lucide-react';
import { cn } from '@/lib/calc-draft-utils';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onChange: (startDate: string | undefined, endDate: string | undefined) => void;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className,
  disabled = false,
}: DateRangePickerProps) {
  const [error, setError] = React.useState<string | null>(null);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;

    // Validate: start date should be before or equal to end date
    if (endDate && newStartDate && new Date(newStartDate) > new Date(endDate)) {
      setError('Start date must be before or equal to end date');
      return;
    }

    setError(null);
    onChange(newStartDate || undefined, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;

    // Validate: end date should be after or equal to start date
    if (startDate && newEndDate && new Date(newEndDate) < new Date(startDate)) {
      setError('End date must be after or equal to start date');
      return;
    }

    setError(null);
    onChange(startDate, newEndDate || undefined);
  };

  const handleClear = () => {
    setError(null);
    onChange(undefined, undefined);
  };

  const hasValue = startDate || endDate;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            <input
              type="date"
              id="start-date"
              value={startDate || ''}
              onChange={handleStartDateChange}
              disabled={disabled}
              className={cn(
                'w-full pl-10 pr-3 py-2 text-sm border rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'disabled:bg-gray-100 disabled:cursor-not-allowed',
                error ? 'border-red-300' : 'border-gray-300'
              )}
            />
          </div>
        </div>

        <div className="flex-1">
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            <input
              type="date"
              id="end-date"
              value={endDate || ''}
              onChange={handleEndDateChange}
              disabled={disabled}
              className={cn(
                'w-full pl-10 pr-3 py-2 text-sm border rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'disabled:bg-gray-100 disabled:cursor-not-allowed',
                error ? 'border-red-300' : 'border-gray-300'
              )}
            />
          </div>
        </div>

        {hasValue && !disabled && (
          <button
            onClick={handleClear}
            className="mt-6 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Clear dates"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
