'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import recruitmentService, { Contract } from '@/lib/recruitmentService';
import { LoadingSpinner, showSuccessToast, showErrorToast } from '@/components/recruitment-shared';
import { ContractForm } from '@/components/contracts/ContractForm';

export default function EditContractPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recruitmentService.getContract(contractId);
      setContract(data);
    } catch (err: any) {
      console.error('Error fetching contract:', err);
      setError(err.message || 'Failed to load contract');
      showErrorToast('Failed to load contract details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const updatedContract = await recruitmentService.updateContract(contractId, data);
      showSuccessToast('Contract updated successfully');
      router.push(`/contracts/${contractId}`);
    } catch (error: any) {
      console.error('Error updating contract:', error);
      showErrorToast(error.message || 'Failed to update contract');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push(`/contracts/${contractId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading contract..." />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Contract not found'}</p>
          <button
            onClick={() => router.push('/contracts')}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contract Details
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Contract</h1>
          <p className="text-sm text-gray-600 mt-1">
            Contract ID: <span className="font-mono">{contract._id}</span>
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <ContractForm
          initialData={contract}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
