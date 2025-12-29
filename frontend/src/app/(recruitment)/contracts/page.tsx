'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import recruitmentService, { Contract } from '@/lib/recruitmentService';
import { LoadingSpinner, EmptyState, showSuccessToast, showErrorToast } from '@/components/recruitment-shared';
import { ContractsTable } from '@/components/contracts/ContractsTable';
import { ContractFilterPanel } from '@/components/contracts/ContractFilterPanel';

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    offerId: '',
    applicationId: '',
    contractType: '',
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [contracts, searchTerm, filters]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recruitmentService.getContracts();
      setContracts(data);
    } catch (err: any) {
      console.error('Error fetching contracts:', err);
      setError(err.message || 'Failed to load contracts');
      showErrorToast('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...contracts];

    // Apply filters
    if (filters.offerId) {
      filtered = filtered.filter(c => c.offerId === filters.offerId);
    }
    if (filters.contractType) {
      filtered = filtered.filter(c => c.role.toLowerCase().includes(filters.contractType.toLowerCase()));
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContracts(filtered);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      offerId: '',
      applicationId: '',
      contractType: '',
    });
    setSearchTerm('');
  };

  const handleView = (contractId: string) => {
    router.push(`/contracts/${contractId}`);
  };

  const handleEdit = (contractId: string) => {
    router.push(`/contracts/${contractId}/edit`);
  };

  const handleSign = (contractId: string) => {
    router.push(`/contracts/${contractId}/sign`);
  };

  const handleCreateNew = () => {
    router.push('/contracts/create');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading contracts..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchContracts}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage employment contracts and signatures
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create New Contract
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by Contract ID, Employee ID, or Role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <ContractFilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Contracts Table */}
      {filteredContracts.length === 0 ? (
        <EmptyState
          title="No contracts found"
          message={
            searchTerm || filters.offerId || filters.contractType
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first contract'
          }
          actionButton={
            !searchTerm && !filters.offerId && !filters.contractType ? (
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create First Contract
              </button>
            ) : undefined
          }
        />
      ) : (
        <ContractsTable
          contracts={filteredContracts}
          onView={handleView}
          onEdit={handleEdit}
          onSign={handleSign}
        />
      )}
    </div>
  );
}
