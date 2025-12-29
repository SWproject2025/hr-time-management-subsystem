"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Edit2, X } from 'lucide-react';
const payrollService = {
  getPendingSigningBonuses: async () => {
    const response = await fetch('http://localhost:3000/payroll-execution/signing-bonuses/pending');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  },
  
  getPendingBenefits: async () => {
    const response = await fetch('http://localhost:3000/payroll-execution/benefits/pending');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  },
  
  approveSigningBonus: async (id: string) => {
    const response = await fetch(`http://localhost:3000/payroll-execution/signing-bonuses/${id}/approve`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to approve');
    return response.json();
  },
  
  rejectSigningBonus: async (id: string) => {
    const response = await fetch(`http://localhost:3000/payroll-execution/signing-bonuses/${id}/reject`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to reject');
    return response.json();
  },
  
  editSigningBonus: async (id: string, givenAmount: number, paymentDate?: string) => {
    const response = await fetch(`http://localhost:3000/payroll-execution/signing-bonuses/${id}/edit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ givenAmount, paymentDate })
    });
    if (!response.ok) throw new Error('Failed to edit');
    return response.json();
  },
  
  approveBenefit: async (id: string) => {
    const response = await fetch(`http://localhost:3000/payroll-execution/benefits/${id}/approve`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to approve');
    return response.json();
  },
  
  rejectBenefit: async (id: string) => {
    const response = await fetch(`http://localhost:3000/payroll-execution/benefits/${id}/reject`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to reject');
    return response.json();
  },
  
  editBenefit: async (id: string, givenAmount: number) => {
    const response = await fetch(`http://localhost:3000/payroll-execution/benefits/${id}/edit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ givenAmount })
    });
    if (!response.ok) throw new Error('Failed to edit');
    return response.json();
  }
};

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Bonus {
  _id: string;
  employeeId: Employee;
  givenAmount: number;
  paymentDate?: string;
  status: string;
}

interface Benefit {
  _id: string;
  employeeId: Employee;
  givenAmount: number;
  benefitType?: string;
  status: string;
}

const PreRunApprovalsPage = () => {
  const [activeTab, setActiveTab] = useState('bonuses');
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Bonus | Benefit | null>(null);
  const [editType, setEditType] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const showToast = (message: string, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      const [bonusesData, benefitsData] = await Promise.all([
        payrollService.getPendingSigningBonuses(),
        payrollService.getPendingBenefits()
      ]);
      setBonuses(bonusesData);
      setBenefits(benefitsData);
    } catch (error) {
      console.error('Error fetching pending items:', error);
      showToast('Failed to fetch pending approvals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, type: string) => {
    try {
      if (type === 'bonus') {
        await payrollService.approveSigningBonus(id);
      } else {
        await payrollService.approveBenefit(id);
      }
      showToast('Approved successfully');
      setSelectedItems([]);
      fetchPendingItems();
    } catch (error: any) {
      showToast(error.message || 'Failed to approve', 'error');
    }
  };

  const handleReject = async (id: string, type: string) => {
    try {
      if (type === 'bonus') {
        await payrollService.rejectSigningBonus(id);
      } else {
        await payrollService.rejectBenefit(id);
      }
      showToast('Rejected successfully');
      setSelectedItems([]);
      fetchPendingItems();
    } catch (error: any) {
      showToast(error.message || 'Failed to reject', 'error');
    }
  };

  const openEditModal = (item: Bonus | Benefit, type: string) => {
    setEditingItem(item);
    setEditType(type);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingItem(null);
    setEditType('');
  };

  const handleSaveEdit = async (updatedData: any) => {
    try {
      if (editType === 'bonus') {
        await payrollService.editSigningBonus(
          editingItem!._id,
          updatedData.givenAmount,
          updatedData.paymentDate
        );
      } else {
        await payrollService.editBenefit(editingItem!._id, updatedData.givenAmount);
      }
      showToast('Updated successfully');
      closeEditModal();
      fetchPendingItems();
    } catch (error: any) {
      showToast(error.message || 'Failed to update', 'error');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      showToast('Please select items first', 'error');
      return;
    }

    const type = activeTab === 'bonuses' ? 'bonus' : 'benefit';
    const confirmMsg = `Are you sure you want to ${action} ${selectedItems.length} item(s)?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await Promise.all(
        selectedItems.map(id => 
          action === 'approve' ? handleApprove(id, type) : handleReject(id, type)
        )
      );
      showToast(`Bulk ${action} completed successfully`);
      setSelectedItems([]);
      fetchPendingItems();
    } catch (error) {
      showToast(`Some items failed to ${action}`, 'error');
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const items = activeTab === 'bonuses' ? bonuses : benefits;
    if (selectedItems.length === items.length && items.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {toast.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Pre-Run Approvals</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => {
                  setActiveTab('bonuses');
                  setSelectedItems([]);
                }}
                className={`px-6 py-4 font-medium transition ${
                  activeTab === 'bonuses'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Signing Bonuses ({bonuses.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('benefits');
                  setSelectedItems([]);
                }}
                className={`px-6 py-4 font-medium transition ${
                  activeTab === 'benefits'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Termination/Resignation Benefits ({benefits.length})
              </button>
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="p-4 bg-blue-50 flex items-center justify-between border-b">
              <span className="text-sm font-medium text-gray-700">
                {selectedItems.length} item(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition"
                >
                  <CheckCircle size={16} />
                  Bulk Approve
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition"
                >
                  <XCircle size={16} />
                  Bulk Reject
                </button>
              </div>
            </div>
          )}

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4">Loading pending items...</p>
              </div>
            ) : activeTab === 'bonuses' ? (
              <BonusesTable
                bonuses={bonuses}
                selectedItems={selectedItems}
                onToggleSelect={toggleSelectItem}
                onSelectAll={selectAll}
                onApprove={(id: string) => handleApprove(id, 'bonus')}
                onReject={(id: string) => handleReject(id, 'bonus')}
                onEdit={(item) => openEditModal(item, 'bonus')}
              />
            ) : (
              <BenefitsTable
                benefits={benefits}
                selectedItems={selectedItems}
                onToggleSelect={toggleSelectItem}
                onSelectAll={selectAll}
                onApprove={(id: string) => handleApprove(id, 'benefit')}
                onReject={(id: string) => handleReject(id, 'benefit')}
                onEdit={(item) => openEditModal(item, 'benefit')}
              />
            )}
          </div>
        </div>
      </div>

      {editModalOpen && (
        <EditModal
          item={editingItem}
          type={editType}
          onClose={closeEditModal}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

const EditModal = ({ item, type, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    givenAmount: item?.givenAmount || 0,
    paymentDate: item?.paymentDate ? new Date(item.paymentDate).toISOString().split('T')[0] : ''
  });

  const handleSubmit = () => {
    if (formData.givenAmount > 0) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit {type === 'bonus' ? 'Signing Bonus' : 'Benefit'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee
            </label>
            <div className="text-sm text-gray-600">
              {item?.employeeId?.firstName} {item?.employeeId?.lastName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              value={formData.givenAmount}
              onChange={(e) => setFormData({ ...formData, givenAmount: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>

          {type === 'bonus' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BonusesTable = ({ bonuses, selectedItems, onToggleSelect, onSelectAll, onApprove, onReject, onEdit }: any) => {
  if (bonuses.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-lg text-gray-500">No pending signing bonuses</p>
        <p className="text-sm text-gray-400 mt-2">All bonuses have been processed</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedItems.length === bonuses.length && bonuses.length > 0}
                onChange={onSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {bonuses.map((bonus: Bonus) => (
            <tr key={bonus._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(bonus._id)}
                  onChange={() => onToggleSelect(bonus._id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {bonus.employeeId?.firstName} {bonus.employeeId?.lastName}
                </div>
                <div className="text-xs text-gray-500">{bonus.employeeId?.email}</div>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                ${bonus.givenAmount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {bonus.paymentDate ? new Date(bonus.paymentDate).toLocaleDateString() : 'Not set'}
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-200 text-yellow-800">
                  {bonus.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(bonus)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onApprove(bonus._id)}
                    className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition"
                    title="Approve"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button
                    onClick={() => onReject(bonus._id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                    title="Reject"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const BenefitsTable = ({ benefits, selectedItems, onToggleSelect, onSelectAll, onApprove, onReject, onEdit }: any) => {
  if (benefits.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-lg text-gray-500">No pending termination/resignation benefits</p>
        <p className="text-sm text-gray-400 mt-2">All benefits have been processed</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedItems.length === benefits.length && benefits.length > 0}
                onChange={onSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {benefits.map((benefit: Benefit) => (
            <tr key={benefit._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(benefit._id)}
                  onChange={() => onToggleSelect(benefit._id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {benefit.employeeId?.firstName} {benefit.employeeId?.lastName}
                </div>
                <div className="text-xs text-gray-500">{benefit.employeeId?.email}</div>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                ${benefit.givenAmount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {benefit.benefitType || 'Termination Benefit'}
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-200 text-yellow-800">
                  {benefit.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(benefit)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onApprove(benefit._id)}
                    className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition"
                    title="Approve"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button
                    onClick={() => onReject(benefit._id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                    title="Reject"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PreRunApprovalsPage;