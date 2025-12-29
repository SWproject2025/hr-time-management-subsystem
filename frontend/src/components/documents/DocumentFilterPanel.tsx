import React from 'react';
import { Filter, X } from 'lucide-react';

interface DocumentFilterPanelProps {
  filters: {
    ownerId: string;
    applicationId: string;
    type: string;
  };
  onFilterChange: (filters: DocumentFilterPanelProps['filters']) => void;
  onClearFilters: () => void;
}

const DOCUMENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'cv', label: 'CV/Resume' },
  { value: 'contract', label: 'Contract' },
  { value: 'id', label: 'ID Document' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'resignation', label: 'Resignation Letter' },
];

export function DocumentFilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
}: DocumentFilterPanelProps) {
  const handleInputChange = (field: keyof typeof filters, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters = filters.ownerId || filters.applicationId || filters.type;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-1">
            Owner ID
          </label>
          <input
            type="text"
            id="ownerId"
            value={filters.ownerId}
            onChange={(e) => handleInputChange('ownerId', e.target.value)}
            placeholder="Enter owner ID..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="applicationId" className="block text-sm font-medium text-gray-700 mb-1">
            Application ID
          </label>
          <input
            type="text"
            id="applicationId"
            value={filters.applicationId}
            onChange={(e) => handleInputChange('applicationId', e.target.value)}
            placeholder="Enter application ID..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
