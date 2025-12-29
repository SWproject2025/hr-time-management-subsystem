'use client';

import { useState, useEffect } from 'react';
import leavesService from '@/lib/leavesService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface LeaveCategory {
  _id: string;
  code: string;
  name: string;
}

interface LeaveType {
  _id: string;
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  paid: boolean;
  deductible: boolean;
  requiresAttachment: boolean;
  attachmentType?: string;
  minTenureMonths?: number;
  maxDurationDays?: number;
  isActive: boolean;
}

export default function LeaveTypesPage() {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [categories, setCategories] = useState<LeaveCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    description: '',
    paid: true,
    deductible: true,
    requiresAttachment: false,
    attachmentType: '',
    minTenureMonths: '',
    maxDurationDays: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [typesData, categoriesData] = await Promise.all([
        leavesService.getLeaveTypes(),
        leavesService.getLeaveCategories(),
      ]);
      setTypes(typesData.leaveTypes || []);
      setCategories((categoriesData as any) || []);
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

    const payload = {
      ...formData,
      minTenureMonths: formData.minTenureMonths ? parseInt(formData.minTenureMonths) : undefined,
      maxDurationDays: formData.maxDurationDays ? parseInt(formData.maxDurationDays) : undefined,
      attachmentType: formData.requiresAttachment ? formData.attachmentType : undefined,
    };

    try {
      if (editingId) {
        await leavesService.updateLeaveType(editingId, payload);
        setSuccess('Leave type updated successfully');
      } else {
        await leavesService.createLeaveType(payload);
        setSuccess('Leave type created successfully');
      }
      fetchData();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleEdit = (type: LeaveType) => {
    setFormData({
      code: type.code,
      name: type.name,
      categoryId: type.categoryId,
      description: type.description || '',
      paid: type.paid,
      deductible: type.deductible,
      requiresAttachment: type.requiresAttachment,
      attachmentType: type.attachmentType || '',
      minTenureMonths: type.minTenureMonths?.toString() || '',
      maxDurationDays: type.maxDurationDays?.toString() || '',
      isActive: type.isActive,
    });
    setEditingId(type._id);
    setShowForm(true);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      // Re-using updateLeaveType for status toggle
      await leavesService.updateLeaveType(id, { isActive: !isActive });
      setSuccess('Status updated');
      fetchData();
    } catch (err: any) {
      setError('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      categoryId: '',
      description: '',
      paid: true,
      deductible: true,
      requiresAttachment: false,
      attachmentType: '',
      minTenureMonths: '',
      maxDurationDays: '',
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Types</h1>
            <p className="text-gray-600 mt-2">Manage leave type configurations</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ New Leave Type'}
          </button>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800">{success}</div>}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Leave Type' : 'New Leave Type'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name} ({cat.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Min Tenure (months)</label>
                  <input
                    type="number"
                    value={formData.minTenureMonths}
                    onChange={(e) => setFormData({ ...formData, minTenureMonths: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Duration (days)</label>
                  <input
                    type="number"
                    value={formData.maxDurationDays}
                    onChange={(e) => setFormData({ ...formData, maxDurationDays: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.paid}
                    onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Paid Leave</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.deductible}
                    onChange={(e) => setFormData({ ...formData, deductible: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Deductible</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requiresAttachment}
                    onChange={(e) => setFormData({ ...formData, requiresAttachment: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Requires Attachment</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>

              {formData.requiresAttachment && (
                <div>
                  <label className="block text-sm font-medium mb-2">Attachment Type</label>
                  <select
                    value={formData.attachmentType}
                    onChange={(e) => setFormData({ ...formData, attachmentType: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select type</option>
                    <option value="MEDICAL_CERTIFICATE">Medical Certificate</option>
                    <option value="SUPPORTING_DOCUMENT">Supporting Document</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              )}

              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
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
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attachment</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {types.map((type) => (
                  <tr key={type._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{type.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{type.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {categories.find((c) => c._id === type.categoryId)?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {type.paid ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Yes</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {type.requiresAttachment ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Required</span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(type._id, type.isActive)}
                        className={`px-2 py-1 text-xs rounded ${
                          type.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {type.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button onClick={() => handleEdit(type)} className="text-blue-600 hover:text-blue-800">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
