import React from 'react';
import { FileUpload } from '@/components/recruitment-shared';
import { showErrorToast } from '@/components/recruitment-shared';

interface SignatureUploadProps {
  onUpload: (url: string) => void;
  signatureUrl?: string;
}

export function SignatureUpload({ onUpload, signatureUrl }: SignatureUploadProps) {
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      showErrorToast('Please upload an image file');
      return;
    }

    // Convert file to base64 data URL for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onUpload(base64String);
    };
    reader.onerror = () => {
      showErrorToast('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <FileUpload
        onUpload={handleFileUpload}
        accept="image/png, image/jpeg, image/jpg"
        maxSize={2}
        multiple={false}
      />

      {signatureUrl && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Signature Preview:
          </label>
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <img
              src={signatureUrl}
              alt="Signature preview"
              className="max-w-full h-auto max-h-32 mx-auto"
            />
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p className="font-medium mb-1">Guidelines:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Upload a clear image of your signature</li>
          <li>Accepted formats: PNG, JPEG, JPG</li>
          <li>Maximum file size: 2MB</li>
          <li>Signature should be on a white or transparent background</li>
        </ul>
      </div>
    </div>
  );
}
