import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/calc-draft-utils';

interface BenefitsMultiSelectProps {
  value: string[];
  onChange: (benefits: string[]) => void;
  className?: string;
}

const COMMON_BENEFITS = [
  'Health Insurance',
  'Dental Insurance',
  'Vision Insurance',
  '401(k) Matching',
  'Paid Time Off',
  'Sick Leave',
  'Life Insurance',
  'Disability Insurance',
  'Flexible Schedule',
  'Remote Work',
  'Professional Development',
  'Gym Membership',
  'Commuter Benefits',
  'Stock Options',
];

export function BenefitsMultiSelect({
  value,
  onChange,
  className,
}: BenefitsMultiSelectProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customBenefit, setCustomBenefit] = useState('');

  const handleToggleBenefit = (benefit: string) => {
    if (value.includes(benefit)) {
      onChange(value.filter((b) => b !== benefit));
    } else {
      onChange([...value, benefit]);
    }
  };

  const handleAddCustomBenefit = () => {
    if (customBenefit.trim() && !value.includes(customBenefit.trim())) {
      onChange([...value, customBenefit.trim()]);
      setCustomBenefit('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveBenefit = (benefit: string) => {
    onChange(value.filter((b) => b !== benefit));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomBenefit();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Selected Benefits */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((benefit) => (
            <span
              key={benefit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-300"
            >
              {benefit}
              <button
                type="button"
                onClick={() => handleRemoveBenefit(benefit)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Common Benefits Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select from common benefits:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {COMMON_BENEFITS.map((benefit) => (
            <button
              key={benefit}
              type="button"
              onClick={() => handleToggleBenefit(benefit)}
              className={cn(
                'px-3 py-2 text-sm rounded-md border transition-colors text-left',
                value.includes(benefit)
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {benefit}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Benefit Input */}
      <div>
        {!showCustomInput ? (
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="h-4 w-4" />
            Add custom benefit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customBenefit}
              onChange={(e) => setCustomBenefit(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter custom benefit..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddCustomBenefit}
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              disabled={!customBenefit.trim()}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setCustomBenefit('');
              }}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
