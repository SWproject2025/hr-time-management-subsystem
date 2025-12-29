import React, { useState } from 'react';
import { Calendar, Building2, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const PayrollRunCreator = () => {
  const [formData, setFormData] = useState({
    runId: `PR-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`,
    payrollPeriod: '',
    payrollSpecialistId: '', // You'll need to get this from your employee records
    entity: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.runId || !formData.payrollPeriod || !formData.entity || !formData.payrollSpecialistId) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('http://localhost:3000/payroll-execution/payroll-runs/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          payrollPeriod: new Date(formData.payrollPeriod).toISOString()
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payroll run');
      }
      
      setResult(data);
      
      // Reset form
      setFormData({
        runId: `PR-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`,
        payrollPeriod: '',
        payrollSpecialistId: formData.payrollSpecialistId, // Keep specialist ID
        entity: formData.entity // Keep entity
      });
      
    } catch (err: any) {
      console.error('Error creating payroll run:', err);
      setError(err.message || 'Failed to create payroll run. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const generateNewRunId = () => {
    setFormData({
      ...formData,
      runId: `PR-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Payroll Run</h1>
            <p className="text-gray-600">Initialize a new payroll processing cycle</p>
          </div>

          {/* Success Message */}
          {result && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-green-900">Payroll run created successfully!</p>
                <p className="text-sm text-green-700 mt-1">
                  Run ID: {result.runId} | Status: {result.status}
                </p>
                {result.employees !== undefined && (
                  <p className="text-sm text-green-700">
                    Employees: {result.employees} | Exceptions: {result.exceptions || 0}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="PR-2024-1234"
                  required
                />
                <button
                  type="button"
                  onClick={generateNewRunId}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Generate
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Unique identifier for this payroll run</p>
            </div>

            {/* Payroll Period */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Payroll Period *
              </label>
              <input
                type="date"
                value={formData.payrollPeriod}
                onChange={(e) => setFormData({ ...formData, payrollPeriod: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">End date of the payroll period</p>
            </div>

            {/* Entity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Building2 className="inline mr-2" size={16} />
                Entity/Company *
              </label>
              <input
                type="text"
                value={formData.entity}
                onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Acme Corporation"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Legal entity or company name</p>
            </div>

            {/* Payroll Specialist ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="inline mr-2" size={16} />
                Payroll Specialist ID *
              </label>
              <input
                type="text"
                value={formData.payrollSpecialistId}
                onChange={(e) => setFormData({ ...formData, payrollSpecialistId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="675c8e9a1b2c3d4e5f6a7b8c"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                MongoDB ObjectId of the employee initiating this run (24-character hex string)
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating Payroll Run...
                  </>
                ) : (
                  'Create Payroll Run'
                )}
              </button>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Prerequisites</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ensure you have active employees in the database</li>
              <li>• All pending signing bonuses must be approved</li>
              <li>• All termination benefits must be approved</li>
              <li>• No overlapping payroll runs for the same period</li>
            </ul>
          </div>

          {/* Quick Tips */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-2">💡 Quick Tips</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Use EMP001's ObjectId as payroll specialist for testing</li>
              <li>• The system will automatically calculate employee payslips</li>
              <li>• Check the browser console for detailed error messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollRunCreator;