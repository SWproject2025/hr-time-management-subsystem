'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import leavesService from '@/lib/leavesService';
import LeaveBalanceCard from '@/components/LeaveBalanceCard';
import LeaveHistoryTable from '@/components/LeaveHistoryTable';

export default function MyLeavesPage() {
  const router = useRouter();
  const [balances, setBalances] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceData, requestsData] = await Promise.all([
        leavesService.getLeaveBalance(),
        leavesService.getMyLeaveRequests(statusFilter || undefined),
      ]);
      setBalances(balanceData);
      setRequests(requestsData.requests);
    } catch (error) {
      console.error('Error loading leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      await leavesService.cancelLeaveRequest(requestId);
      loadData(); // Refresh list
    } catch (error: any) {
      alert(error.message || 'Failed to cancel request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leaves</h1>
          <p className="text-gray-600 mt-1">Manage your leave balances and requests</p>
        </div>
        <button
          onClick={() => router.push('/leaves/request')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow"
        >
          + Request New Leave
        </button>
      </div>

      {/* Leave Balances */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Leave Balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {balances.map((balance, index) => (
            <LeaveBalanceCard key={index} balance={balance} />
          ))}
        </div>
      </div>

      {/* Leave History */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Leave History</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <LeaveHistoryTable 
          requests={requests} 
          onUpdate={loadData} 
          onCancel={handleCancelRequest}
        />
      </div>
    </div>
  );
}
