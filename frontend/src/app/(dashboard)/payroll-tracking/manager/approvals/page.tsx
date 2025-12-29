"use client";
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { payrollTrackingService } from '@/lib/payrollTrackingService';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManagerApprovalsPage() {
  const [pendingItems, setPendingItems] = useState<any>({ disputes: [], claims: [] });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState<'dispute' | 'claim' | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await payrollTrackingService.getPendingManagerApprovals(1, 50);
      setPendingItems({
        disputes: response.disputes || [],
        claims: response.claims || [],
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmApproval = async () => {
    if (!selectedItem || !itemType) return;
    try {
      if (itemType === 'dispute') {
        await payrollTrackingService.confirmDisputeApproval(selectedItem.disputeId);
      } else {
        await payrollTrackingService.confirmClaimApproval(selectedItem.claimId);
      }
      toast.success(`${itemType === 'dispute' ? 'Dispute' : 'Claim'} approved successfully`);
      setAction(null);
      setSelectedItem(null);
      setItemType(null);
      setReason('');
      fetchPendingApprovals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm approval');
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalPending = (pendingItems.disputes?.length || 0) + (pendingItems.claims?.length || 0);

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Manager Approvals</h1>
          <p className="text-gray-600">
            Review and approve items pending your approval ({totalPending} pending)
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pending approvals...</p>
          </div>
        ) : totalPending === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
            <p className="text-gray-600">All items have been processed.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Disputes Section */}
            {pendingItems.disputes && pendingItems.disputes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Disputes</h2>
                <div className="space-y-4">
                  {pendingItems.disputes.map((dispute: any) => (
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
                            Reviewed by: {dispute.payrollSpecialistId?.firstName}{' '}
                            {dispute.payrollSpecialistId?.lastName}
                          </p>
                        </div>
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{dispute.description}</p>
                      {dispute.resolutionComment && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                          <p className="text-sm text-blue-800">{dispute.resolutionComment}</p>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedItem(dispute);
                          setItemType('dispute');
                          setAction('approve');
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Confirm Approval
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Claims Section */}
            {pendingItems.claims && pendingItems.claims.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Claims</h2>
                <div className="space-y-4">
                  {pendingItems.claims.map((claim: any) => (
                    <div key={claim._id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Claim {claim.claimId}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Employee: {claim.employeeId?.firstName} {claim.employeeId?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Type: {claim.claimType} • Amount: {formatCurrency(claim.amount)}
                          </p>
                          {claim.approvedAmount && (
                            <p className="text-sm text-green-600">
                              Approved Amount: {formatCurrency(claim.approvedAmount)}
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Pending Approval
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
                          setSelectedItem(claim);
                          setItemType('claim');
                          setAction('approve');
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Confirm Approval
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {action && selectedItem && itemType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Confirm {itemType === 'dispute' ? 'Dispute' : 'Claim'} Approval
              </h2>
              <p className="text-gray-700 mb-4">
                Are you sure you want to approve this {itemType}? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmApproval}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Confirm Approval
                </button>
                <button
                  onClick={() => {
                    setAction(null);
                    setSelectedItem(null);
                    setItemType(null);
                    setReason('');
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

