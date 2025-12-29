'use client';

import { useState, useEffect } from 'react';
import leavesService from '@/lib/leavesService';

interface LeaveRequest {
  _id: string;
  leaveTypeId: { _id: string; code: string; name: string };
  dates: { from: string; to: string };
  durationDays: number;
  justification: string;
  status: string;
  createdAt: string;
  approvalFlow: Array<{
    role: string;
    status: string;
    decidedAt?: string;
  }>;
}

interface LeaveType {
  _id: string;
  code: string;
  name: string;
}

export default function LeaveHistoryPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [page, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsData, typesData] = await Promise.all([
        leavesService.getMyLeaveRequests(statusFilter || undefined, page, 10),
        leavesService.getLeaveTypes(),
      ]);
      setRequests(requestsData.requests || []);
      setTotalPages(requestsData.pagination?.totalPages || 1);
      setLeaveTypes(typesData.leaveTypes || []);
    } catch (err: any) {
      setError('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredRequests = typeFilter
    ? requests.filter((r) => r.leaveTypeId?._id === typeFilter)
    : requests;

  // Group requests by year for timeline view
  const groupedByYear = filteredRequests.reduce((acc, req) => {
    const year = new Date(req.dates.from).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(req);
    return acc;
  }, {} as Record<number, LeaveRequest[]>);

  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Leave History</h1>
          <p className="text-gray-600 mt-2">View your complete leave request history</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {leaveTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Leave History</h3>
            <p className="text-gray-500">
              {statusFilter || typeFilter
                ? 'No requests match your filters.'
                : "You haven't submitted any leave requests yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {years.map((year) => (
              <div key={year}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm mr-3">
                    {year}
                  </span>
                  <span className="text-gray-400 text-sm font-normal">
                    {groupedByYear[year].length} request(s)
                  </span>
                </h2>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="space-y-4">
                    {groupedByYear[year].map((request, idx) => (
                      <div key={request._id} className="relative pl-14">
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-4 w-5 h-5 rounded-full border-4 bg-white ${
                            request.status === 'APPROVED'
                              ? 'border-green-500'
                              : request.status === 'REJECTED'
                              ? 'border-red-500'
                              : request.status === 'PENDING'
                              ? 'border-yellow-500'
                              : 'border-gray-400'
                          }`}
                        ></div>

                        <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {request.leaveTypeId?.name || 'Leave Request'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Submitted on {formatDate(request.createdAt)}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                request.status
                              )}`}
                            >
                              {request.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500 uppercase">From</p>
                              <p className="font-medium">{formatDate(request.dates.from)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">To</p>
                              <p className="font-medium">{formatDate(request.dates.to)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Duration</p>
                              <p className="font-medium">{request.durationDays} day(s)</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Type Code</p>
                              <p className="font-medium text-blue-600">
                                {request.leaveTypeId?.code}
                              </p>
                            </div>
                          </div>

                          {request.justification && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Reason:</span>{' '}
                                {request.justification}
                              </p>
                            </div>
                          )}

                          {/* Approval Flow */}
                          {request.approvalFlow && request.approvalFlow.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 uppercase mb-2">
                                Approval Flow
                              </p>
                              <div className="flex gap-2">
                                {request.approvalFlow.map((step, i) => (
                                  <div
                                    key={i}
                                    className={`flex items-center px-2 py-1 rounded text-xs ${
                                      step.status === 'APPROVED'
                                        ? 'bg-green-100 text-green-700'
                                        : step.status === 'REJECTED'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    <span className="capitalize">
                                      {step.role.replace('_', ' ')}
                                    </span>
                                    <span className="ml-1">
                                      {step.status === 'APPROVED'
                                        ? '✓'
                                        : step.status === 'REJECTED'
                                        ? '✗'
                                        : '○'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
