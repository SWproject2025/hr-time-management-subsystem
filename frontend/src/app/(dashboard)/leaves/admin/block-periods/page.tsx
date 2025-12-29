'use client';

import { useState, useEffect } from 'react';
import leavesService from '@/lib/leavesService';

interface BlockPeriod {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
  exemptLeaveTypes: string[];
  isActive: boolean;
}

interface LeaveType {
  _id: string;
  code: string;
  name: string;
}

export default function BlockPeriodsPage() {
  const [blockPeriods, setBlockPeriods] = useState<BlockPeriod[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    reason: '',
    exemptLeaveTypes: [] as string[],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [periodsData, typesData] = await Promise.all([
        leavesService.getBlockPeriods(),
        leavesService.getLeaveTypes(),
      ]);
      setBlockPeriods((periodsData as any) || []);
      setLeaveTypes(typesData.leaveTypes || []);
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

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Start date must be before end date');
      return;
    }

    try {
      await leavesService.createBlockPeriod({
        name: formData.name,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        reason: formData.reason,
        exemptLeaveTypes: formData.exemptLeaveTypes,
      });
      setSuccess('Block period created successfully');
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create block period');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this block period?')) return;

    try {
      await leavesService.deleteBlockPeriod(id);
      setSuccess('Block period deleted');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete block period');
    }
  };

  const handleExemptTypeToggle = (typeCode: string) => {
    setFormData((prev) => ({
      ...prev,
      exemptLeaveTypes: prev.exemptLeaveTypes.includes(typeCode)
        ? prev.exemptLeaveTypes.filter((c) => c !== typeCode)
        : [...prev.exemptLeaveTypes, typeCode],
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      reason: '',
      exemptLeaveTypes: [],
    });
    setShowForm(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isActive = (period: BlockPeriod) => {
    const now = new Date();
    return new Date(period.startDate) <= now && new Date(period.endDate) >= now;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Block Periods</h1>
            <p className="text-gray-600 mt-2">
              Manage periods when leave requests are restricted (BR 55)
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Block Period'}
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
            <h2 className="text-xl font-bold mb-4">Create Block Period</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Year-End Freeze"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason *
                  </label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="e.g., Critical business period"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exempt Leave Types (these types can still be requested)
                </label>
                <div className="flex flex-wrap gap-2">
                  {leaveTypes.map((type) => (
                    <label
                      key={type._id}
                      className={`flex items-center px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        formData.exemptLeaveTypes.includes(type.code)
                          ? 'bg-blue-100 border-blue-500 text-blue-800'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.exemptLeaveTypes.includes(type.code)}
                        onChange={() => handleExemptTypeToggle(type.code)}
                        className="hidden"
                      />
                      <span className="text-sm">{type.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create Block Period
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

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : blockPeriods.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Block Periods</h3>
            <p className="text-gray-500">
              Create a block period to restrict leave requests during specific dates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blockPeriods.map((period) => (
              <div
                key={period._id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden border-l-4 ${
                  isActive(period) ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{period.name}</h3>
                    {isActive(period) && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{period.reason}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="font-medium">{formatDate(period.startDate)}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium">{formatDate(period.endDate)}</span>
                  </div>
                  {period.exemptLeaveTypes && period.exemptLeaveTypes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Exempt types:</p>
                      <div className="flex flex-wrap gap-1">
                        {period.exemptLeaveTypes.map((code) => (
                          <span
                            key={code}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(period._id)}
                    className="w-full mt-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
