import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload } from 'lucide-react';
import { FileUpload } from '@/components/recruitment-shared';
import { cn } from '@/lib/calc-draft-utils';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: {
    type: string;
    filePath: string;
    ownerId?: string;
    applicationId?: string;
  }) => Promise<void>;
}

const DOCUMENT_TYPES = [
  { value: 'cv', label: 'CV/Resume' },
  { value: 'contract', label: 'Contract' },
  { value: 'id', label: 'ID Document' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'resignation', label: 'Resignation Letter' },
];

export function DocumentUploadModal({ isOpen, onClose, onUpload }: DocumentUploadModalProps) {
  const [formData, setFormData] = useState({
    type: 'cv',
    ownerId: '',
    applicationId: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setUploadedFile(files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!formData.type) {
      setError('Please select a document type');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // In a real implementation, you would upload the file to a server
      // For now, we'll just use the filename as the filePath
      const filePath = `uploads/${uploadedFile.name}`;

      await onUpload({
        type: formData.type,
        filePath,
        ownerId: formData.ownerId || undefined,
        applicationId: formData.applicationId || undefined,
      });

      // Reset form
      setFormData({ type: 'cv', ownerId: '', applicationId: '' });
      setUploadedFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFormData({ type: 'cv', ownerId: '', applicationId: '' });
      setUploadedFile(null);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  Upload Document
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-600">
                  Upload a new document to the system
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none"
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Document Type */}
            <div>
              <label htmlFor="doc-type" className="block text-sm font-medium text-gray-700 mb-1">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                id="doc-type"
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={uploading}
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File <span className="text-red-500">*</span>
              </label>
              <FileUpload
                onUpload={handleFileUpload}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                maxSize={10}
                multiple={false}
              />
            </div>

            {/* Owner ID (Optional) */}
            <div>
              <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-1">
                Owner ID (Optional)
              </label>
              <input
                type="text"
                id="ownerId"
                value={formData.ownerId}
                onChange={(e) => setFormData((prev) => ({ ...prev, ownerId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter owner ID..."
                disabled={uploading}
              />
            </div>

            {/* Application ID (Optional) */}
            <div>
              <label htmlFor="applicationId" className="block text-sm font-medium text-gray-700 mb-1">
                Application ID (Optional)
              </label>
              <input
                type="text"
                id="applicationId"
                value={formData.applicationId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, applicationId: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter application ID..."
                disabled={uploading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading || !uploadedFile}
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
