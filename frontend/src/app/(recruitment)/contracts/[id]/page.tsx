'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, FileSignature, Download } from 'lucide-react';
import recruitmentService, { Contract } from '@/lib/recruitmentService';
import { LoadingSpinner, showErrorToast } from '@/components/recruitment-shared';
import { ContractDetailCard } from '@/components/contracts/ContractDetailCard';
import { SignatureDisplay } from '@/components/contracts/SignatureDisplay';

export default function ContractDetailPage() {
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

  const handleEdit = () => {
    router.push(`/contracts/${contractId}/edit`);
  };

  const handleSign = () => {
    router.push(`/contracts/${contractId}/sign`);
  };

  const handleDownload = () => {
    // TODO: Implement contract download functionality
    showErrorToast('Download functionality coming soon');
  };

  const handleBack = () => {
    router.push('/contracts');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading contract details..." />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Contract not found'}</p>
          <button
            onClick={handleBack}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  const canSign = !contract.employeeSignedAt || !contract.employerSignedAt;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contracts
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contract Details</h1>
            <p className="text-sm text-gray-600 mt-1">
              Contract ID: <span className="font-mono">{contract._id}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Contract
            </button>
            {canSign && (
              <button
                onClick={handleSign}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FileSignature className="h-4 w-4" />
                Sign Contract
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contract Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContractDetailCard contract={contract} />
        </div>

        {/* Signatures Section */}
        <div className="space-y-6">
          <SignatureDisplay
            signatureUrl={contract.employeeSignatureUrl}
            signedAt={contract.employeeSignedAt}
            signerRole="employee"
          />
          <SignatureDisplay
            signatureUrl={contract.employerSignatureUrl}
            signedAt={contract.employerSignedAt}
            signerRole="employer"
          />
        </div>
      </div>
    </div>
  );
}
