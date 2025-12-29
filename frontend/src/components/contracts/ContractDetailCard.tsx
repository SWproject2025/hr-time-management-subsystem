import React from 'react';
import { Briefcase, DollarSign, Calendar, Award } from 'lucide-react';
import { Contract } from '@/lib/recruitmentService';
import { SignatureStatusBadge } from './SignatureStatusBadge';

interface ContractDetailCardProps {
  contract: Contract;
}

export function ContractDetailCard({ contract }: ContractDetailCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">Contract Information</h2>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Offer ID</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">{contract.offerId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee ID</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">{contract.employeeId}</p>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Employment Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-base text-gray-900 font-medium">{contract.role}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(contract.startDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Financial Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Gross Salary</label>
                <p className="mt-1 text-2xl text-gray-900 font-bold">
                  {formatCurrency(contract.grossSalary)}
                </p>
              </div>
            </div>

            {contract.signingBonus && (
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Signing Bonus</label>
                  <p className="mt-1 text-xl text-gray-900 font-semibold">
                    {formatCurrency(contract.signingBonus)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benefits */}
        {contract.benefits && contract.benefits.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Benefits
            </h3>
            <div className="flex flex-wrap gap-2">
              {contract.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Signature Status */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Signature Status
          </h3>
          <SignatureStatusBadge
            employeeSignedAt={contract.employeeSignedAt}
            employerSignedAt={contract.employerSignedAt}
          />
        </div>

        {/* Metadata */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Metadata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-700 font-medium">Created At</label>
              <p className="mt-1 text-gray-600">{formatDate(contract.createdAt)}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Last Updated</label>
              <p className="mt-1 text-gray-600">{formatDate(contract.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
