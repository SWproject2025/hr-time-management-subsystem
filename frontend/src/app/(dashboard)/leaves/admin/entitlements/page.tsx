'use client';

import { useState, useEffect } from 'react';
import leavesService from '@/lib/leavesService';

interface Entitlement {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
  leaveTypeId: {
    _id: string;
    name: string;
    code: string;
  };
  yearlyEntitlement: number;
  carryForward: number;
  remaining: number;
  taken: number;
  pending: number;
}

export default function EntitlementsManagementPage() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ employeeId: '', leaveTypeId: '' });
  const [selectedEnt, setSelectedEnt] = useState<Entitlement | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ yearlyEntitlement: 0, carryForward: 0 });

  useEffect(() => {
    fetchEntitlements();
  }, [page, filter]);

  const fetchEntitlements = async () => {
    try {
      setLoading(true);
      const response = await leavesService.getAllEntitlements(
        filter.employeeId,
        filter.leaveTypeId,
        page,
        20
      );
      setEntitlements(response.entitlements || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Failed to load entitlements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ent: Entitlement) => {
    setSelectedEnt(ent);
    setEditForm({
      yearlyEntitlement: ent.yearlyEntitlement,
      carryForward: ent.carryForward,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedEnt) return;

    try {
      await leavesService.updateEntitlement(selectedEnt._id, editForm);
      alert('Entitlement updated successfully');
      setShowEditModal(false);
      fetchEntitlements();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Entitlements Management</h1>
          <p className="text-gray-600 mt-2">View and manage employee leave entitlements</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Employee ID</label>
              <input
                type="text"
                value={filter.employeeId}
                onChange={(e) => setFilter({ ...filter, employeeId: e.target.value })}
                placeholder="Enter employee ID"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Leave Type ID</label>
              <input
                type="text"
                value={filter.leaveTypeId}
                onChange={(e) => setFilter({ ...filter, leaveTypeId: e.target.value })}
                placeholder="Enter leave type ID"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setFilter({ employeeId: '', leaveTypeId: '' }); setPage(1); }}
                className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : entitlements.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No entitlements found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entitlement
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Carry Forward
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remaining
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taken
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pending
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entitlements.map((ent) => (
                      <tr key={ent._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {ent.employeeId.firstName} {ent.employeeId.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{ent.employeeId.employeeNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{ent.leaveTypeId.name}</div>
                          <div className="text-sm text-gray-500">{ent.leaveTypeId.code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {ent.yearlyEntitlement}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {ent.carryForward}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                          {ent.remaining}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                          {ent.taken}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-orange-600">
                          {ent.pending}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleEdit(ent)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedEnt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Edit Entitlement</h2>
              
              <div className="mb-4 bg-gray-50 p-4 rounded">
                <p className="text-sm">
                  <span className="font-medium">Employee:</span> {selectedEnt.employeeId.firstName} {selectedEnt.employeeId.lastName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Leave Type:</span> {selectedEnt.leaveTypeId.name}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Yearly Entitlement</label>
                  <input
                    type="number"
                    value={editForm.yearlyEntitlement}
                    onChange={(e) => setEditForm({ ...editForm, yearlyEntitlement: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Carry Forward</label>
                  <input
                    type="number"
                    value={editForm.carryForward}
                    onChange={(e) => setEditForm({ ...editForm, carryForward: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
