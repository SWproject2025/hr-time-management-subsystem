"use client";
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { payrollTrackingService, Claim } from '@/lib/payrollTrackingService';
import { CheckCircle, XCircle, DollarSign, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [comment, setComment] = useState('');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, page: 1 });

  useEffect(() => {
    fetchClaims();
  }, [pagination.page]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await payrollTrackingService.getClaimsForReview(pagination.page, 10);
      setClaims(response.claims || []);
      setPagination(response.pagination || { total: 0, totalPages: 0, page: pagination.page });
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedClaim) return;
    if (approvedAmount > selectedClaim.amount) {
      toast.error('Approved amount cannot exceed claimed amount');
      return;
    }
    try {
      await payrollTrackingService.approveClaim(selectedClaim.claimId, {
        approvedAmount,
        comment,
      });
      toast.success('Claim approved successfully');
      setAction(null);
      setSelectedClaim(null);
      setApprovedAmount(0);
      setComment('');
      fetchClaims();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve claim');
    }
  };

  const handleReject = async () => {
    if (!selectedClaim || !comment) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await payrollTrackingService.rejectClaim(selectedClaim.claimId, { reason: comment });
      toast.success('Claim rejected');
      setAction(null);
      setSelectedClaim(null);
      setComment('');
      fetchClaims();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject claim');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Claims</h1>
          <p className="text-gray-600">Review and approve or reject employee expense claims</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No claims to review</h3>
            <p className="text-gray-600">All claims have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Claim {claim.claimId}</h3>
                    <p className="text-sm text-gray-500">
                      Employee: {claim.employeeId?.firstName} {claim.employeeId?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Type: {claim.claimType} • Amount: {formatCurrency(claim.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted on {formatDate(claim.submittedAt)}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {claim.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{claim.description}</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedClaim(claim);
                      setApprovedAmount(claim.amount);
                      setAction('approve');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClaim(claim);
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
        {action && selectedClaim && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {action === 'approve' ? 'Approve' : 'Reject'} Claim {selectedClaim.claimId}
              </h2>
              {action === 'approve' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approved Amount (max: {formatCurrency(selectedClaim.amount)})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedClaim.amount}
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                  />
                </div>
              )}
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
                    setSelectedClaim(null);
                    setApprovedAmount(0);
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

