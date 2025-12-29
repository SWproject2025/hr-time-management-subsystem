import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Contract } from '@/lib/recruitmentService';
import { SignatureUpload } from './SignatureUpload';

interface ContractSigningFormProps {
  contractId: string;
  contract: Contract;
  userRole: 'employee' | 'employer';
  onSubmit: (data: { signatureUrl: string; agreed: boolean }) => void;
  onCancel: () => void;
}

export function ContractSigningForm({
  contractId,
  contract,
  userRole,
  onSubmit,
  onCancel,
}: ContractSigningFormProps) {
  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!signatureUrl) {
      setError('Please upload your signature');
      return;
    }

    if (!agreed) {
      setError('You must agree to the terms to sign the contract');
      return;
    }

    setError(null);
    onSubmit({ signatureUrl, agreed });
  };

  const handleSignatureUpload = (url: string) => {
    setSignatureUrl(url);
    if (error && url) {
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Upload Your Signature
        </h3>
        <SignatureUpload
          onUpload={handleSignatureUpload}
          signatureUrl={signatureUrl}
        />
      </div>

      {/* Terms Agreement */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agree-terms"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (error && e.target.checked) {
                setError(null);
              }
            }}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="agree-terms" className="text-sm text-gray-700 cursor-pointer">
            I have read and agree to the terms and conditions outlined in this employment
            contract. I understand that this is a legally binding agreement and that my
            signature confirms my acceptance of all terms, including salary, benefits,
            start date, and job responsibilities.
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-900 mb-1">
              Important Notice
            </h4>
            <p className="text-sm text-yellow-800">
              Once you sign this contract, you cannot undo this action. Please ensure you
              have reviewed all terms carefully before proceeding.
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!signatureUrl || !agreed}
          className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign Contract
        </button>
      </div>
    </form>
  );
}
