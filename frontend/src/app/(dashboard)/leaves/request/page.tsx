'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import leavesService from '@/lib/leavesService';

export default function SubmitLeaveRequestPage() {
  const router = useRouter();
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    justification: '',
    attachmentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [typesData, balanceData] = await Promise.all([
        leavesService.getLeaveTypes(),
        leavesService.getLeaveBalance(),
      ]);
      setLeaveTypes(typesData.leaveTypes);
      setBalances(balanceData);
    } catch (error) {
      setError('Failed to load leave types');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leaves/attachments/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, attachmentId: data._id }));
    } catch (error) {
      setError('File upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.leaveTypeId || !formData.fromDate || !formData.toDate || !formData.justification) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await leavesService.createLeaveRequest(formData);
      router.push('/leaves/my-leaves');
    } catch (error: any) {
      setError(error.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const selectedBalance = balances.find(
    b => b.leaveType._id === formData.leaveTypeId
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Request New Leave</h1>
        <p className="text-gray-600 mt-1">Submit a new leave request for approval</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Leave Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leave Type *
          </label>
          <select
            value={formData.leaveTypeId}
            onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select leave type</option>
            {leaveTypes.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name} ({type.code})
              </option>
            ))}
          </select>
        </div>

        {/* Balance Display */}
        {selectedBalance && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Remaining:</span>
                <span className="ml-2 font-semibold text-blue-700">
                  {selectedBalance.remaining} days
                </span>
              </div>
              <div>
                <span className="text-gray-600">Pending:</span>
                <span className="ml-2 font-semibold text-orange-600">
                  {selectedBalance.pending} days
                </span>
              </div>
              <div>
                <span className="text-gray-600">Available:</span>
                <span className="ml-2 font-semibold text-green-600">
                  {selectedBalance.remaining - selectedBalance.pending} days
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date *
            </label>
            <input
              type="date"
              value={formData.fromDate}
              onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date *
            </label>
            <input
              type="date"
              value={formData.toDate}
              onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
              min={formData.fromDate}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Justification */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Justification *
          </label>
          <textarea
            value={formData.justification}
            onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Please provide a reason for this leave request..."
            required
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supporting Document (Optional)
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            disabled={uploadingFile}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {uploadingFile && (
            <p className="text-sm text-gray-600 mt-2">Uploading...</p>
          )}
          {formData.attachmentId && (
            <p className="text-sm text-green-600 mt-2">✓ File uploaded successfully</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-300"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
