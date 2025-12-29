"use client";
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { payrollTrackingService, Claim } from '@/lib/payrollTrackingService';
import { Plus, FileText, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApprovedClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundDescription, setRefundDescription] = useState('');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, page: 1 });

  useEffect(() => {
    fetchClaims();
  }, [pagination.page]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await payrollTrackingService.getApprovedClaims(pagination.page, 10);
      setClaims(response.claims || []);
      setPagination(response.pagination || { total: 0, totalPages: 0, page: pagination.page });
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch approved claims');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRefund = async () => {
    if (!selectedClaim) {
      toast.error('Please select a claim');
      return;
    }
    // Use approved amount or original amount
    const amount = selectedClaim.approvedAmount || selectedClaim.amount;
    try {
      await payrollTrackingService.createRefundForClaim(selectedClaim.claimId, {
        amount: refundAmount || amount,
        description: refundDescription,
      });
      toast.success('Refund created successfully');
      setShowRefundModal(false);
      setSelectedClaim(null);
      setRefundAmount(0);
      setRefundDescription('');
      fetchClaims();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create refund');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Approved Claims</h1>
          <p className="text-gray-600">View approved claims and create refunds</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No approved claims</h3>
            <p className="text-gray-600">There are no approved claims at this time.</p>
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
                      Type: {claim.claimType} • Claimed: {formatCurrency(claim.amount)}
                    </p>
                    {claim.approvedAmount && (
                      <p className="text-sm text-green-600">
                        Approved: {formatCurrency(claim.approvedAmount)}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Approved on {claim.resolvedAt ? formatDate(claim.resolvedAt) : 'N/A'}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    APPROVED
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{claim.description}</p>

                {claim.resolutionComment && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-sm text-blue-800">{claim.resolutionComment}</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedClaim(claim);
                    setRefundAmount(claim.approvedAmount || claim.amount);
                    setShowRefundModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create Refund
                </button>
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

        {/* Refund Modal */}
        {showRefundModal && selectedClaim && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Create Refund for Claim {selectedClaim.claimId}
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Amount (default: {formatCurrency(selectedClaim.approvedAmount || selectedClaim.amount)})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="0.00"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={refundDescription}
                  onChange={(e) => setRefundDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Refund description..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateRefund}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Refund
                </button>
                <button
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedClaim(null);
                    setRefundAmount(0);
                    setRefundDescription('');
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

