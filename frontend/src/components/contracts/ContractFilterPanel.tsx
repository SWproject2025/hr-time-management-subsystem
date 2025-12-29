import React from 'react';
import { Filter, X } from 'lucide-react';

interface ContractFilterPanelProps {
  filters: {
    offerId: string;
    applicationId: string;
    contractType: string;
  };
  onFilterChange: (filters: ContractFilterPanelProps['filters']) => void;
  onClearFilters: () => void;
}

export function ContractFilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
}: ContractFilterPanelProps) {
  const handleInputChange = (field: keyof typeof filters, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters = filters.offerId || filters.applicationId || filters.contractType;

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
          <label htmlFor="offerId" className="block text-sm font-medium text-gray-700 mb-1">
            Offer ID
          </label>
          <input
            type="text"
            id="offerId"
            value={filters.offerId}
            onChange={(e) => handleInputChange('offerId', e.target.value)}
            placeholder="Enter offer ID..."
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
          <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-1">
            Role/Position
          </label>
          <input
            type="text"
            id="contractType"
            value={filters.contractType}
            onChange={(e) => handleInputChange('contractType', e.target.value)}
            placeholder="Enter role..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
