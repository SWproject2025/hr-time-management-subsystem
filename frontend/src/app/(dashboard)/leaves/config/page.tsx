'use client';

import { useState, useEffect } from 'react';
import leavesService from '@/lib/leavesService';

export default function LeaveConfigPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'policies' | 'blocks'>('categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [blockPeriods, setBlockPeriods] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [categoryForm, setCategoryForm] = useState({ code: '', name: '', description: '' });
  const [blockForm, setBlockForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    reason: '',
    exemptLeaveTypes: [] as string[],
  });
  const [policyForm, setPolicyForm] = useState({
      leaveTypeId: '',
      accrualMethod: 'MONTHLY',
      monthlyRate: 0,
      yearlyRate: 0,
      carryForwardAllowed: false,
      maxCarryForward: 0
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'categories') {
        const data = await leavesService.getLeaveCategories();
        setCategories(data || []);
      } else if (activeTab === 'blocks') {
        const data = await leavesService.getBlockPeriods();
        setBlockPeriods(data || []);
      } else if (activeTab === 'policies') {
          const [policiesData, typesData] = await Promise.all([
              leavesService.getLeavePolicies(),
              leavesService.getLeaveTypes()
          ]);
          setPolicies(policiesData || []);
          console.log(typesData); 
          setLeaveTypes(typesData.leaveTypes || []); 
          // typesData structure depends on backend. service says: { leaveTypes: any[] }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      await leavesService.createLeaveCategory(categoryForm);
      setNotification({ message: 'Category added successfully', type: 'success' });
      setShowAddModal(false);
      setCategoryForm({ code: '', name: '', description: '' });
      loadData();
    } catch (error: any) {
      setNotification({ message: error.message, type: 'error' });
    }
  };

  const handleAddBlockPeriod = async () => {
    try {
      await leavesService.createBlockPeriod({
          ...blockForm,
          startDate: new Date(blockForm.startDate),
          endDate: new Date(blockForm.endDate)
      });
      setNotification({ message: 'Block period added successfully', type: 'success' });
      setShowAddModal(false);
      setBlockForm({ name: '', startDate: '', endDate: '', reason: '', exemptLeaveTypes: [] });
      loadData();
    } catch (error: any) {
      setNotification({ message: error.message, type: 'error' });
    }
  };

  const handleSavePolicy = async () => {
      try {
          await leavesService.createLeavePolicy(policyForm);
          setNotification({ message: 'Policy saved successfully', type: 'success' });
          setShowAddModal(false);
          setPolicyForm({
            leaveTypeId: '',
            accrualMethod: 'MONTHLY',
            monthlyRate: 0,
            yearlyRate: 0,
            carryForwardAllowed: false,
            maxCarryForward: 0
          });
          loadData();
      } catch (error: any) {
          setNotification({ message: error.message, type: 'error' });
      }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await leavesService.deleteLeaveCategory(id);
      setNotification({ message: 'Category deleted successfully', type: 'success' });
      loadData();
    } catch (error: any) {
      setNotification({ message: error.message, type: 'error' });
    }
  };

  const handleDeleteBlockPeriod = async (id: string) => {
    if (!confirm('Are you sure you want to delete this block period?')) return;
    try {
      await leavesService.deleteBlockPeriod(id);
      setNotification({ message: 'Block period deleted successfully', type: 'success' });
      loadData();
    } catch (error: any) {
      setNotification({ message: error.message, type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Configuration</h1>
          <p className="text-gray-600 mt-1">Manage leave policies, categories, and restrictions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow"
        >
          + Add {activeTab === 'categories' ? 'Category' : activeTab === 'blocks' ? 'Block Period' : 'Policy'}
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg ${
            notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            {['categories', 'policies', 'blocks'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-4 font-medium transition capitalize ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'policies' ? 'Leave Policies' : tab === 'blocks' ? 'Block Periods' : tab}
                  </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : activeTab === 'categories' ? (
            <CategoriesTab categories={categories} onDelete={handleDeleteCategory} />
          ) : activeTab === 'blocks' ? (
            <BlockPeriodsTab blockPeriods={blockPeriods} onDelete={handleDeleteBlockPeriod} />
          ) : (
            <PoliciesTab policies={policies} />
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {activeTab === 'categories' ? 'Add Category' : activeTab === 'blocks' ? 'Add Block Period' : 'Configure Policy'}
            </h2>

            {activeTab === 'categories' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                  <input
                    type="text"
                    value={categoryForm.code}
                    onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="e.g., PAID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="e.g., Paid Leave"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                   <textarea
                     value={categoryForm.description}
                     onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                     rows={2}
                     className="w-full border border-gray-300 rounded-lg px-4 py-2"
                   />
                </div>
              </div>
            )}

            {activeTab === 'blocks' && (
              <div className="space-y-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input type="text" value={blockForm.name} onChange={e => setBlockForm({...blockForm, name: e.target.value})} className="w-full border px-4 py-2 rounded-lg" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <input type="date" value={blockForm.startDate} onChange={e => setBlockForm({...blockForm, startDate: e.target.value})} className="w-full border px-4 py-2 rounded-lg" />
                    <input type="date" value={blockForm.endDate} onChange={e => setBlockForm({...blockForm, endDate: e.target.value})} className="w-full border px-4 py-2 rounded-lg" />
                 </div>
                 <textarea value={blockForm.reason} onChange={e => setBlockForm({...blockForm, reason: e.target.value})} className="w-full border px-4 py-2 rounded-lg" placeholder="Reason" />
              </div>
            )}

            {activeTab === 'policies' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type *</label>
                        <select
                            value={policyForm.leaveTypeId}
                            onChange={e => setPolicyForm({...policyForm, leaveTypeId: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        >
                            <option value="">Select Leave Type</option>
                            {leaveTypes.map(lt => (
                                <option key={lt._id} value={lt._id}>{lt.name} ({lt.code})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Accrual Method</label>
                        <select
                            value={policyForm.accrualMethod}
                            onChange={e => setPolicyForm({...policyForm, accrualMethod: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        >
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                            <option value="NO_ACCRUAL">No Accrual</option>
                        </select>
                    </div>
                    {policyForm.accrualMethod === 'MONTHLY' && (
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rate</label>
                             <input type="number" step="0.1" value={policyForm.monthlyRate} onChange={e => setPolicyForm({...policyForm, monthlyRate: parseFloat(e.target.value)})} className="w-full border px-4 py-2 rounded-lg" />
                        </div>
                    )}
                    {policyForm.accrualMethod === 'YEARLY' && (
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Yearly Rate</label>
                             <input type="number" step="0.5" value={policyForm.yearlyRate} onChange={e => setPolicyForm({...policyForm, yearlyRate: parseFloat(e.target.value)})} className="w-full border px-4 py-2 rounded-lg" />
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={policyForm.carryForwardAllowed} onChange={e => setPolicyForm({...policyForm, carryForwardAllowed: e.target.checked})} id="carryForward" />
                        <label htmlFor="carryForward" className="text-sm font-medium text-gray-700">Allow Carry Forward</label>
                    </div>
                    {policyForm.carryForwardAllowed && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Carry Forward</label>
                            <input type="number" value={policyForm.maxCarryForward} onChange={e => setPolicyForm({...policyForm, maxCarryForward: parseFloat(e.target.value)})} className="w-full border px-4 py-2 rounded-lg" />
                        </div>
                    )}
                </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={activeTab === 'categories' ? handleAddCategory : activeTab === 'blocks' ? handleAddBlockPeriod : handleSavePolicy}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoriesTab({ categories, onDelete }: any) {
    if (categories.length === 0) return <div className="text-center py-12 text-gray-500">No categories.</div>;
    return (
        <table className="w-full">
            <thead className="bg-gray-50 border-b">
                <tr><th>Code</th><th>Name</th><th>Action</th></tr>
            </thead>
            <tbody>
                {categories.map((c: any) => (
                    <tr key={c._id} className="border-b"><td className="p-4">{c.code}</td><td className="p-4">{c.name}</td><td className="p-4"><button onClick={() => onDelete(c._id)} className="text-red-500">Delete</button></td></tr>
                ))}
            </tbody>
        </table>
    );
}

function BlockPeriodsTab({ blockPeriods, onDelete }: any) {
    if (blockPeriods.length === 0) return <div className="text-center py-12 text-gray-500">No block periods.</div>;
    return (
      <div className="space-y-4">
        {blockPeriods.map((p: any) => (
            <div key={p._id} className="border p-4 rounded flex justify-between">
                <div>
                   <h3 className="font-bold">{p.name}</h3>
                   <p className="text-sm text-gray-500">{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</p>
                </div>
                <button onClick={() => onDelete(p._id)} className="text-red-500">Delete</button>
            </div>
        ))}
      </div>
    );
}

function PoliciesTab({ policies }: any) {
    if (policies.length === 0) return <div className="text-center py-12 text-gray-500">No policies configured. Add one to start.</div>;
    return (
        <table className="w-full">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="px-6 py-3 text-left">Leave Type</th>
                    <th className="px-6 py-3 text-left">Accrual Method</th>
                    <th className="px-6 py-3 text-left">Rate</th>
                    <th className="px-6 py-3 text-left">Carry Forward</th>
                </tr>
            </thead>
            <tbody>
                {policies.map((p: any) => (
                    <tr key={p._id} className="hover:bg-gray-50 border-b">
                        <td className="px-6 py-4 font-medium">{p.leaveTypeId?.name} ({p.leaveTypeId?.code})</td>
                        <td className="px-6 py-4">{p.accrualMethod}</td>
                        <td className="px-6 py-4">
                            {p.accrualMethod === 'MONTHLY' ? `${p.monthlyRate}/month` : 
                             p.accrualMethod === 'YEARLY' ? `${p.yearlyRate}/year` : '-'}
                        </td>
                        <td className="px-6 py-4">
                            {p.carryForwardAllowed ? `Yes (Max: ${p.maxCarryForward})` : 'No'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
