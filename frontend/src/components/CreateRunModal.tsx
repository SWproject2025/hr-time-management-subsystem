// Create Run Modal Component - CORRECTED VERSION WITH AXIOS
import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Calendar, Building2, User, Loader2, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const CreateRunModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    runId: `PR-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`,
    payrollPeriod: '',
    payrollSpecialistId: '',
    entity: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preRunCheck, setPreRunCheck] = useState(null);

  useEffect(() => {
    checkPreRunApprovals();
  }, []);

  const checkPreRunApprovals = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/payroll-execution/pre-run-check`);
      setPreRunCheck(data);
    } catch (err) {
      console.error('Error checking pre-run approvals:', err);
    }
  };

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

    if (preRunCheck && !preRunCheck.allApprovalsComplete) {
      setError('Cannot create payroll run. Please complete all pre-run approvals first.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📤 Sending payroll run creation request...');
      
      const { data: newRun } = await axios.post(
        `${API_URL}/payroll-execution/payroll-runs/start`,
        {
          ...formData,
          payrollPeriod: new Date(formData.payrollPeriod).toISOString()
        }
      );

      console.log('✅ Payroll run created successfully:', newRun);
      
      onSuccess(newRun._id);
      
    } catch (err) {
      console.error('❌ Error creating payroll run:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create payroll run';
      setError(errorMessage);
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        {/* Pre-Run Check Warning */}
        {preRunCheck && !preRunCheck.allApprovalsComplete && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="font-semibold text-orange-900">Pre-Run Approvals Required</p>
                <ul className="text-sm text-orange-800 mt-2 space-y-1">
                  {preRunCheck.blockers && preRunCheck.blockers.map((blocker, idx) => (
                    <li key={idx}>• {blocker}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Run ID *</label>
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
              Get an employee ID from your database to test
            </p>
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
              disabled={loading || (preRunCheck && !preRunCheck.allApprovalsComplete)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating Run...
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

export default CreateRunModal;