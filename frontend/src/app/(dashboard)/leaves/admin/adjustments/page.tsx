'use client';

import { useState, useEffect } from 'react';
import leavesService from '@/lib/leavesService';

interface Adjustment {
  _id: string;
  employeeId: { _id: string; firstName: string; lastName: string; employeeNumber: string };
  leaveTypeId: { _id: string; code: string; name: string };
  adjustmentType: 'ADD' | 'DEDUCT';
  amount: number;
  reason: string;
  hrUserId: { _id: string; firstName: string; lastName: string };
  createdAt: string;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
}

interface LeaveType {
  _id: string;
  code: string;
  name: string;
}

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveTypeId: '',
    adjustmentType: 'ADD' as 'ADD' | 'DEDUCT',
    amount: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [typesData, employeesRes] = await Promise.all([
        leavesService.getLeaveTypes(),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/employee-profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }).then((res) => res.json()),
      ]);
      setLeaveTypes(typesData.leaveTypes || []);
      setEmployees(employeesRes?.profiles || employeesRes || []);
      
      // Fetch recent adjustments
      try {
        const adjustmentsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/leaves/admin/adjustments`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (adjustmentsRes.ok) {
          const adjustmentsData = await adjustmentsRes.json();
          setAdjustments(adjustmentsData || []);
        }
      } catch {
        // Adjustments list endpoint may not exist yet
      }
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.employeeId || !formData.leaveTypeId || !formData.amount || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    setSubmitting(true);
    try {
      await leavesService.createLeaveAdjustment({
        employeeId: formData.employeeId,
        leaveTypeId: formData.leaveTypeId,
        adjustmentType: formData.adjustmentType,
        amount,
        reason: formData.reason,
      });
      setSuccess('Leave adjustment created successfully');
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      leaveTypeId: '',
      adjustmentType: 'ADD',
      amount: '',
      reason: '',
    });
    setShowForm(false);
    setSearchTerm('');
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEmployee = employees.find((e) => e._id === formData.employeeId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Adjustments</h1>
            <p className="text-gray-600 mt-2">
              Manually adjust employee leave balances (REQ-013)
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Adjustment'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Create Leave Adjustment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee *
                </label>
                {selectedEmployee ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <span className="font-medium">
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                      </span>
                      <span className="text-gray-500 ml-2">
                        ({selectedEmployee.employeeNumber})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, employeeId: '' })}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or employee number..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchTerm && (
                      <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredEmployees.length === 0 ? (
                          <p className="p-3 text-gray-500 text-sm">No employees found</p>
                        ) : (
                          filteredEmployees.slice(0, 10).map((emp) => (
                            <button
                              key={emp._id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, employeeId: emp._id });
                                setSearchTerm('');
                              }}
                              className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                            >
                              <span className="font-medium">
                                {emp.firstName} {emp.lastName}
                              </span>
                              <span className="text-gray-500 ml-2 text-sm">
                                ({emp.employeeNumber})
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type *
                  </label>
                  <select
                    value={formData.leaveTypeId}
                    onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name} ({type.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Type *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, adjustmentType: 'ADD' })}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                        formData.adjustmentType === 'ADD'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      + Add Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, adjustmentType: 'DEDUCT' })}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                        formData.adjustmentType === 'DEDUCT'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      - Deduct Days
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (Days) *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    min="0.5"
                    step="0.5"
                    placeholder="e.g., 2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason * (will be recorded in audit trail)
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  placeholder="Provide a detailed reason for this adjustment..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    formData.adjustmentType === 'ADD'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {submitting
                    ? 'Processing...'
                    : formData.adjustmentType === 'ADD'
                    ? `Add ${formData.amount || '0'} Days`
                    : `Deduct ${formData.amount || '0'} Days`}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Adjustments */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Recent Adjustments</h2>
            <p className="text-gray-600 text-sm">Audit trail of all manual adjustments</p>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : adjustments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Adjustments Yet</h3>
              <p className="text-gray-500">
                Manual adjustments will appear here with full audit trail.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Adjustment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adjustments.map((adj) => (
                  <tr key={adj._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(adj.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="font-medium">
                        {adj.employeeId?.firstName} {adj.employeeId?.lastName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {adj.leaveTypeId?.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          adj.adjustmentType === 'ADD'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {adj.adjustmentType === 'ADD' ? '+' : '-'}{adj.amount} days
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {adj.reason}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {adj.hrUserId?.firstName} {adj.hrUserId?.lastName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
