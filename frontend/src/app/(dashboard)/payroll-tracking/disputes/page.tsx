"use client";
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { payrollTrackingService, Dispute, Payslip } from '@/lib/payrollTrackingService';
import { AlertCircle, Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDispute, setNewDispute] = useState({ payslipId: '', description: '' });
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loadingPayslips, setLoadingPayslips] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, page: 1 });

  useEffect(() => {
    fetchDisputes();
  }, [pagination.page]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await payrollTrackingService.getEmployeeDisputes(pagination.page, 10);
      setDisputes(response.disputes || []);
      setPagination(response.pagination || { total: 0, totalPages: 0, page: pagination.page });
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate payslipId is a valid MongoDB ObjectId (24 hex characters)
    if (!newDispute.payslipId || !/^[0-9a-fA-F]{24}$/.test(newDispute.payslipId)) {
      toast.error('Please select a valid payslip');
      return;
    }
    
    try {
      await payrollTrackingService.createDispute(newDispute);
      toast.success('Dispute created successfully');
      setShowCreateModal(false);
      setNewDispute({ payslipId: '', description: '' });
      fetchDisputes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create dispute');
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const fetchPayslips = async () => {
    try {
      setLoadingPayslips(true);
      const response = await payrollTrackingService.getPayslipHistory({ limit: 100 });
      setPayslips(response.payslips || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch payslips');
    } finally {
      setLoadingPayslips(false);
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    fetchPayslips();
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Disputes</h1>
            <p className="text-gray-600">View and manage your payslip disputes</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Create Dispute
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading disputes...</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes found</h3>
            <p className="text-gray-600">You haven't created any disputes yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div key={dispute._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(dispute.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dispute {dispute.disputeId}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Submitted on {formatDate(dispute.submittedAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      dispute.status
                    )}`}
                  >
                    {dispute.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{dispute.description}</p>

                {dispute.resolutionComment && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">Resolution Comment</p>
                    <p className="text-sm text-blue-800">{dispute.resolutionComment}</p>
                  </div>
                )}

                {dispute.rejectionReason && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-800">{dispute.rejectionReason}</p>
                  </div>
                )}

                {dispute.approvalHistory && dispute.approvalHistory.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Approval History</p>
                    <div className="space-y-2">
                      {dispute.approvalHistory.map((entry: any, index: number) => (
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

        {/* Create Dispute Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Dispute</h2>
              <form onSubmit={handleCreateDispute}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Payslip
                  </label>
                  {loadingPayslips ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-gray-500">
                      Loading payslips...
                    </div>
                  ) : payslips.length === 0 ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-gray-500">
                      No payslips available
                    </div>
                  ) : (
                    <select
                      value={newDispute.payslipId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        // Ensure we're using a valid ObjectId
                        if (selectedId && /^[0-9a-fA-F]{24}$/.test(selectedId)) {
                          setNewDispute({ ...newDispute, payslipId: selectedId });
                        } else {
                          toast.error('Invalid payslip ID selected');
                        }
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                      <option value="">-- Select a payslip --</option>
                      {payslips
                        .filter((payslip) => payslip._id && /^[0-9a-fA-F]{24}$/.test(payslip._id))
                        .map((payslip) => {
                          const period = payslip.payrollRunId?.payrollPeriod
                            ? formatDate(payslip.payrollRunId.payrollPeriod)
                            : formatDate(payslip.createdAt);
                          const payslipId = payslip.payslipId || payslip._id.slice(-8);
                          const netPay = formatCurrency(payslip.netPay || 0);
                          return (
                            <option key={payslip._id} value={payslip._id}>
                              {payslipId} - {period} - {netPay}
                            </option>
                          );
                        })}
                    </select>
                  )}
                  {newDispute.payslipId && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                      {(() => {
                        const selectedPayslip = payslips.find(p => p._id === newDispute.payslipId);
                        if (selectedPayslip) {
                          const period = selectedPayslip.payrollRunId?.payrollPeriod
                            ? formatDate(selectedPayslip.payrollRunId.payrollPeriod)
                            : formatDate(selectedPayslip.createdAt);
                          return (
                            <div>
                              <p><strong>Period:</strong> {period}</p>
                              <p><strong>Net Pay:</strong> {formatCurrency(selectedPayslip.netPay || 0)}</p>
                              <p><strong>Status:</strong> {(selectedPayslip.paymentStatus || 'pending').toUpperCase()}</p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newDispute.description}
                    onChange={(e) => setNewDispute({ ...newDispute, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Describe the issue with your payslip"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={!newDispute.payslipId || loadingPayslips}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Dispute
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewDispute({ payslipId: '', description: '' });
                    }}
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

