"use client"
import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Eye, Calendar, X, Building2, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Mock payrollService
const payrollService = {
  getAllPayrollRuns: async (filters: any) => {
    const response = await fetch(`http://localhost:3000/payroll-execution/payroll-runs?${new URLSearchParams(filters)}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  },
  createPayrollRun: async (data: any) => {
    const response = await fetch('http://localhost:3000/payroll-execution/payroll-runs/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create');
    }
    return response.json();
  },
  deletePayrollRun: async (id: string) => {
    const response = await fetch(`http://localhost:3000/payroll-execution/payroll-runs/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete');
    return response.json();
  }
};

const CreateRunModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    runId: `PR-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`,
    payrollPeriod: '',
    payrollSpecialistId: '',
    entity: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateNewRunId = () => {
    setFormData({
      ...formData,
      runId: `PR-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.runId || !formData.payrollPeriod || !formData.entity || !formData.payrollSpecialistId) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await payrollService.createPayrollRun({
        ...formData,
        payrollPeriod: new Date(formData.payrollPeriod).toISOString()
      });

      onSuccess();
    } catch (err: any) {
      console.error('Error creating payroll run:', err);
      setError(err.message || 'Failed to create payroll run. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Payroll Run</h2>
            <p className="text-gray-600 text-sm mt-1">Initialize a new payroll processing cycle</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {/* Run ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Run ID *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.runId}
                onChange={(e) => setFormData({ ...formData, runId: e.target.value })}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="PR-2024-1234"
              />
              <button
                type="button"
                onClick={generateNewRunId}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Unique identifier for this payroll run</p>
          </div>

          {/* Payroll Period */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="inline mr-1" size={16} />
              Payroll Period *
            </label>
            <input
              type="date"
              value={formData.payrollPeriod}
              onChange={(e) => setFormData({ ...formData, payrollPeriod: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">End date of the payroll period</p>
          </div>

          {/* Entity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Building2 className="inline mr-1" size={16} />
              Entity/Company *
            </label>
            <input
              type="text"
              value={formData.entity}
              onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Acme Corporation"
            />
            <p className="text-xs text-gray-500 mt-1">Legal entity or company name</p>
          </div>

          {/* Payroll Specialist ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="inline mr-1" size={16} />
              Payroll Specialist ID *
            </label>
            <input
              type="text"
              value={formData.payrollSpecialistId}
              onChange={(e) => setFormData({ ...formData, payrollSpecialistId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="675c8e9a1b2c3d4e5f6a7b8c"
            />
            <p className="text-xs text-gray-500 mt-1">
              MongoDB ObjectId of the employee (24-character hex string)
            </p>
          </div>

          {/* Help Sections */}
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 text-sm mb-2">📋 Prerequisites</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Ensure you have active employees in the database</li>
                <li>• All pending signing bonuses must be approved</li>
                <li>• All termination benefits must be approved</li>
                <li>• No overlapping payroll runs for the same period</li>
              </ul>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-semibold text-amber-900 text-sm mb-2">💡 Quick Tip</h3>
              <p className="text-xs text-amber-800">
                To get an employee's ObjectId, run this in MongoDB:
                <code className="block mt-1 p-2 bg-white rounded font-mono text-xs">
                  db.employee_profiles.findOne({'{'}employeeNumber: "EMP001"{'}'})._id
                </code>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-medium transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating...
                </>
              ) : (
                'Create Payroll Run'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllRunsPage = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    entity: '',
    searchTerm: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);

  useEffect(() => {
    fetchPayrollRuns();
  }, [filters.status, filters.entity]);

  const showNotification = (message: string, type: string = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchPayrollRuns = async () => {
    try {
      setLoading(true);
      const data = await payrollService.getAllPayrollRuns({
        status: filters.status,
        entity: filters.entity
      });
      
      let filteredData = data;
      if (filters.searchTerm) {
        filteredData = data.filter((run: any) =>
          run.runId.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }
      
      setRuns(filteredData);
    } catch (error: any) {
      console.error('Error fetching payroll runs:', error);
      showNotification('Failed to fetch payroll runs: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRun = async (runId: string) => {
    if (!window.confirm('Are you sure you want to delete this payroll run?')) return;

    try {
      await payrollService.deletePayrollRun(runId);
      showNotification('Payroll run deleted successfully');
      fetchPayrollRuns();
    } catch (error: any) {
      console.error('Error deleting run:', error);
      showNotification(error.message || 'Failed to delete payroll run', 'error');
    }
  };

  const handleViewPreRun = (runId: string) => {
    window.location.href = `/all-runs/runs/${runId}/pre-runs`;
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      'draft': 'bg-gray-200 text-gray-800',
      'under review': 'bg-yellow-200 text-yellow-800',
      'pending finance approval': 'bg-orange-200 text-orange-800',
      'approved': 'bg-green-200 text-green-800',
      'rejected': 'bg-red-200 text-red-800',
      'locked': 'bg-purple-200 text-purple-800',
      'unlocked': 'bg-blue-200 text-blue-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-200 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="text-green-600" size={20} />
            ) : (
              <AlertCircle className="text-red-600" size={20} />
            )}
            <p className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-900' : 'text-red-900'
            }`}>
              {notification.message}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">All Payroll Runs</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Create New Run
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="under review">Under Review</option>
                <option value="pending finance approval">Pending Finance</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="locked">Locked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
              <input
                type="text"
                value={filters.entity}
                onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
                placeholder="Filter by entity..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  placeholder="Search by Run ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Loading payroll runs...</p>
            </div>
          ) : runs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No payroll runs found</p>
              <p className="text-sm mt-2">Try adjusting your filters or create a new run</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Run ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exceptions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {runs.map((run) => (
                    <tr key={run._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{run.runId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={16} />
                          {new Date(run.payrollPeriod).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{run.entity}</td>
                      <td className="px-6 py-4">{getStatusBadge(run.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{run.employees}</td>
                      <td className="px-6 py-4 text-sm">
                        {run.exceptions > 0 ? (
                          <span className="font-semibold text-red-600">{run.exceptions}</span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${run.totalnetpay.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewPreRun(run._id)}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                            title="View Pre-Run"
                          >
                            <Eye size={18} />
                          </button>
                          {(run.status === 'draft' || run.status === 'rejected') && (
                            <button
                              onClick={() => handleDeleteRun(run._id)}
                              className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateRunModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            showNotification('Payroll run created successfully!');
            fetchPayrollRuns();
          }}
        />
      )}
    </div>
  );
};

export default AllRunsPage;