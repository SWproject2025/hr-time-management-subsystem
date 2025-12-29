'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import leavesService from '@/lib/leavesService';

export default function LeaveDelegationPage() {
  const { user } = useAuth();
  const [delegations, setDelegations] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    delegateId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    if (user?.employeeProfileId) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [delegationData, teamData] = await Promise.all([
        leavesService.getActiveDelegations(),
        leavesService.getTeamMembers(user!.employeeProfileId),
      ]);
      setDelegations(delegationData || []);
      setTeamMembers(teamData || []);
    } catch (err: any) {
      console.error('Error loading delegation data:', err);
      setError('Failed to load delegation data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
        if (!formData.delegateId) throw new Error('Please select a delegate');
        if (!formData.startDate) throw new Error('Start date is required');
        if (!formData.endDate) throw new Error('End date is required');

        await leavesService.setDelegation({
            delegateId: formData.delegateId,
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: formData.reason
        });

        setSuccess('Delegation set successfully');
        setShowModal(false);
        setFormData({ delegateId: '', startDate: '', endDate: '', reason: '' });
        loadData();
    } catch (err: any) {
        setError(err.message || 'Failed to set delegation');
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delegate Approval</h1>
          <p className="text-gray-600 mt-1">Assign a temporary delegate for leave approvals</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow"
        >
          + Add Delegation
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Active Delegations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Active Delegations</h2>
        </div>
        {delegations.length === 0 ? (
           <div className="p-6 text-center text-gray-500">
             No active delegations found.
           </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delegate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {delegations.map((d) => (
                <tr key={d._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {d.delegateId?.firstName} {d.delegateId?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(d.startDate).toLocaleDateString()} - {new Date(d.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{d.reason || '-'}</td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Set Delegation</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delegate To *</label>
                <select
                  value={formData.delegateId}
                  onChange={(e) => setFormData({...formData, delegateId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                    <option value="">Select an employee</option>
                    {teamMembers.map(member => (
                        <option key={member._id} value={member._id}>
                            {member.firstName} {member.lastName}
                        </option>
                    ))}
                    {teamMembers.length === 0 && <option disabled>No team members found</option>}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select a team member to delegate approval authority to.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Annual Leave, Business Trip"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Save Delegation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
