"use client";
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { payrollTrackingService, Dispute } from '@/lib/payrollTrackingService';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, page: 1 });

  useEffect(() => {
    fetchDisputes();
  }, [pagination.page]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await payrollTrackingService.getDisputesForReview(pagination.page, 10);
      setDisputes(response.disputes || []);
      setPagination(response.pagination || { total: 0, totalPages: 0, page: pagination.page });
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedDispute) return;
    try {
      await payrollTrackingService.approveDispute(selectedDispute.disputeId, { comment });
      toast.success('Dispute approved successfully');
      setAction(null);
      setSelectedDispute(null);
      setComment('');
      fetchDisputes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve dispute');
    }
  };

  const handleReject = async () => {
    if (!selectedDispute || !comment) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await payrollTrackingService.rejectDispute(selectedDispute.disputeId, { reason: comment });
      toast.success('Dispute rejected');
      setAction(null);
      setSelectedDispute(null);
      setComment('');
      fetchDisputes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject dispute');
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Disputes</h1>
          <p className="text-gray-600">Review and approve or reject employee disputes</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading disputes...</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes to review</h3>
            <p className="text-gray-600">All disputes have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div key={dispute._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dispute {dispute.disputeId}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Employee: {dispute.employeeId?.firstName} {dispute.employeeId?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted on {formatDate(dispute.submittedAt)}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {dispute.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{dispute.description}</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedDispute(dispute);
                      setAction('approve');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDispute(dispute);
                      setAction('reject');
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Modal */}
        {action && selectedDispute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {action === 'approve' ? 'Approve' : 'Reject'} Dispute {selectedDispute.disputeId}
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {action === 'approve' ? 'Comment (optional)' : 'Rejection Reason (required)'}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required={action === 'reject'}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                  placeholder={action === 'approve' ? 'Add a comment...' : 'Enter rejection reason...'}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={action === 'approve' ? handleApprove : handleReject}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
                </button>
                <button
                  onClick={() => {
                    setAction(null);
                    setSelectedDispute(null);
                    setComment('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

