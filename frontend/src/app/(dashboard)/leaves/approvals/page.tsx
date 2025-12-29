'use client';

import { useState, useEffect } from 'react';
import leavesService from '@/lib/leavesService';
import RoleGuard from '@/components/RoleGuard';
import { ROLES } from '@/lib/roles';

function LeaveApprovalsContent() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const data = await leavesService.getPendingLeaveRequests();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      setError('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      if (actionType === 'approve') {
        await leavesService.approveLeaveRequestByManager(selectedRequest._id);
      } else {
        if (!reason.trim()) {
          setError('Please provide a reason for rejection');
          return;
        }
        await leavesService.rejectLeaveRequestByManager(selectedRequest._id, reason);
      }

      setShowModal(false);
      setSelectedRequest(null);
      setActionType(null);
      setReason('');
      loadPendingRequests();
    } catch (error: any) {
      setError(error.message || `Failed to ${actionType} request`);
    }
  };

  const getUrgencyBadge = (createdAt: string) => {
    const hoursSince = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSince > 48) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">Urgent (&gt;48h)</span>;
    } else if (hoursSince > 24) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">High (&gt;24h)</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">Normal</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leave Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve team leave requests</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-lg text-gray-500">No pending approvals</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.employeeId?.firstName} {request.employeeId?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {request.employeeId?.employeeNumber} • {request.leaveTypeId?.name}
                  </p>
                </div>
                {getUrgencyBadge(request.createdAt)}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">From:</span>
                  <span className="ml-2 font-medium">
                    {new Date(request.dates.from).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">To:</span>
                  <span className="ml-2 font-medium">
                    {new Date(request.dates.to).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2 font-medium">{request.durationDays} days</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Justification:</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">{request.justification}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedRequest(request);
                    setActionType('approve');
                    setShowModal(true);
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setSelectedRequest(request);  
                    setActionType('reject');
                    setShowModal(true);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </h2>
            
            <div className="mb-4 bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">
                Employee: <span className="font-medium">{selectedRequest.employeeId?.firstName} {selectedRequest.employeeId?.lastName}</span>
              </p>
              <p className="text-sm text-gray-600">
                Leave Type: <span className="font-medium">{selectedRequest.leaveTypeId?.name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Duration: <span className="font-medium">{selectedRequest.durationDays} days</span>
              </p>
            </div>

            {actionType === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide a reason..."
                  required
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                  setActionType(null);
                  setReason('');
                  setError('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 px-4 py-2 rounded-lg transition font-medium ${
                  actionType === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export wrapped with RoleGuard
export default function LeaveApprovalsPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.DEPARTMENT_HEAD, ROLES.HR_ADMIN, ROLES.HR_MANAGER]}>
      <LeaveApprovalsContent />
    </RoleGuard>
  );
}
