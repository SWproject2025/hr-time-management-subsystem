'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import recruitmentService from '@/lib/recruitmentService';
import { showSuccessToast, showErrorToast } from '@/components/recruitment-shared';
import { ContractForm } from '@/components/contracts/ContractForm';

export default function CreateContractPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const newContract = await recruitmentService.createContract(data);
      showSuccessToast('Contract created successfully');
      router.push(`/contracts/${newContract._id}`);
    } catch (error: any) {
      console.error('Error creating contract:', error);
      showErrorToast(error.message || 'Failed to create contract');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/contracts');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contracts
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Contract</h1>
          <p className="text-sm text-gray-600 mt-1">
            Fill in the details below to create a new employment contract
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <ContractForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
