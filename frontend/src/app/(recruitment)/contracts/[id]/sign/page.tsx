'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileSignature } from 'lucide-react';
import recruitmentService, { Contract } from '@/lib/recruitmentService';
import { LoadingSpinner, showSuccessToast, showErrorToast, ConfirmDialog } from '@/components/recruitment-shared';
import { ContractSigningForm } from '@/components/contracts/ContractSigningForm';

export default function SignContractPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [signingData, setSigningData] = useState<any>(null);

  // TODO: Get actual user role from auth context
  // For now, defaulting to 'employee' but can be changed for testing
  const [userRole, setUserRole] = useState<'employee' | 'employer'>('employee');

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

      // Check if already signed by this role
      if (userRole === 'employee' && data.employeeSignedAt) {
        showErrorToast('You have already signed this contract');
        router.push(`/contracts/${contractId}`);
        return;
      }
      if (userRole === 'employer' && data.employerSignedAt) {
        showErrorToast('This contract has already been signed by employer');
        router.push(`/contracts/${contractId}`);
        return;
      }
    } catch (err: any) {
      console.error('Error fetching contract:', err);
      setError(err.message || 'Failed to load contract');
      showErrorToast('Failed to load contract details');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (data: { signatureUrl: string; agreed: boolean }) => {
    setSigningData(data);
    setShowConfirm(true);
  };

  const handleConfirmSign = async () => {
    if (!signingData) return;

    try {
      await recruitmentService.signContract(contractId, {
        signatureUrl: signingData.signatureUrl,
        signerRole: userRole,
      });

      showSuccessToast('Contract signed successfully');
      router.push(`/contracts/${contractId}`);
    } catch (error: any) {
      console.error('Error signing contract:', error);
      showErrorToast(error.message || 'Failed to sign contract');
    } finally {
      setShowConfirm(false);
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
    <>
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

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileSignature className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sign Contract</h1>
              <p className="text-sm text-gray-600 mt-1">
                Review and sign as {userRole === 'employee' ? 'Employee' : 'Employer'}
              </p>
            </div>
          </div>
        </div>

        {/* Contract Summary Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-500 font-medium">Role</label>
              <p className="mt-1 text-gray-900">{contract.role}</p>
            </div>
            <div>
              <label className="block text-gray-500 font-medium">Gross Salary</label>
              <p className="mt-1 text-gray-900 font-semibold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(contract.grossSalary)}
              </p>
            </div>
            {contract.signingBonus && (
              <div>
                <label className="block text-gray-500 font-medium">Signing Bonus</label>
                <p className="mt-1 text-gray-900 font-semibold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(contract.signingBonus)}
                </p>
              </div>
            )}
            <div>
              <label className="block text-gray-500 font-medium">Start Date</label>
              <p className="mt-1 text-gray-900">
                {new Date(contract.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {contract.benefits && contract.benefits.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-gray-500 font-medium text-sm mb-2">Benefits</label>
              <div className="flex flex-wrap gap-2">
                {contract.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Signing Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <ContractSigningForm
            contractId={contractId}
            contract={contract}
            userRole={userRole}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSign}
        title="Confirm Contract Signature"
        message="Are you sure you want to sign this contract? This action cannot be undone."
        confirmText="Sign Contract"
        cancelText="Cancel"
        variant="default"
      />
    </>
  );
}
