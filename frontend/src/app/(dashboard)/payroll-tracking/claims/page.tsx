"use client";
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { payrollTrackingService, Claim } from '@/lib/payrollTrackingService';
import { Plus, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClaim, setNewClaim] = useState({ description: '', claimType: '', amount: 0 });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, page: 1 });

  useEffect(() => {
    fetchClaims();
  }, [pagination.page]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await payrollTrackingService.getEmployeeClaims(pagination.page, 10);
      setClaims(response.claims || []);
      setPagination(response.pagination || { total: 0, totalPages: 0, page: pagination.page });
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await payrollTrackingService.createClaim(newClaim);
      toast.success('Claim created successfully');
      setShowCreateModal(false);
      setNewClaim({ description: '', claimType: '', amount: 0 });
      fetchClaims();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create claim');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING_MANAGER_APPROVAL':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Claims</h1>
            <p className="text-gray-600">View and manage your expense claims</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Create Claim
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
            <p className="text-gray-600">You haven't created any claims yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(claim.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Claim {claim.claimId}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {claim.claimType} • Submitted on {formatDate(claim.submittedAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      claim.status
                    )}`}
                  >
                    {claim.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Claimed Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(claim.amount)}
                    </p>
                  </div>
                  {claim.approvedAmount && (
                    <div>
                      <p className="text-sm text-gray-500">Approved Amount</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(claim.approvedAmount)}
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 mb-4">{claim.description}</p>

                {claim.resolutionComment && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">Resolution Comment</p>
                    <p className="text-sm text-blue-800">{claim.resolutionComment}</p>
                  </div>
                )}

                {claim.rejectionReason && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-800">{claim.rejectionReason}</p>
                  </div>
                )}

                {claim.approvalHistory && claim.approvalHistory.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Approval History</p>
                    <div className="space-y-2">
                      {claim.approvalHistory.map((entry: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          <span className="font-medium">{entry.action}</span> by {entry.role} on{' '}
                          {formatDate(entry.timestamp)}
                          {entry.comment && <span className="text-gray-500"> - {entry.comment}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

        {/* Create Claim Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Claim</h2>
              <form onSubmit={handleCreateClaim}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claim Type
                  </label>
                  <select
                    value={newClaim.claimType}
                    onChange={(e) => setNewClaim({ ...newClaim, claimType: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select type</option>
                    <option value="TRAVEL">Travel</option>
                    <option value="MEAL">Meal</option>
                    <option value="ACCOMMODATION">Accommodation</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newClaim.amount}
                    onChange={(e) => setNewClaim({ ...newClaim, amount: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newClaim.description}
                    onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Describe your expense claim"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

