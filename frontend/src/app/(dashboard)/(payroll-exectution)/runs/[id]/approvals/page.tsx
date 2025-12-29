"use client"
import React, { useState, useEffect } from 'react';
import { Check, X, Lock, Send, FileText, AlertCircle, CheckCircle, Unlock } from 'lucide-react';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"


const ApprovalsExecutionPage = () => {
  const [payrollRun, setPayrollRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'freeze' | 'unfreeze'>('approve');
  const [reason, setReason] = useState('');
  const [currentRole, setCurrentRole] = useState<'specialist' | 'manager' | 'finance'>('specialist');
  const  runId = useParams().id

  useEffect(() => {
    if (runId) {
      fetchData();
    }
  }, [runId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch payroll run' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPayrollRun(data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const makeRequest = async (url: string, method: string = 'PATCH', body?: any) => {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed: ${response.status}`);
    }

    return response.json();
  };

  const handlePublish = async () => {
    try {
      await makeRequest(`${API_URL}/payroll-execution/payroll-runs/${runId}/publish`);
      alert('Payroll published for approval');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to publish');
    }
  };

  const handleManagerApprove = async () => {
    try {
      await makeRequest(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/manager-approve`,
        'PATCH',
        { approverId: 'demo-manager-id' }
      );
      alert('Manager approved successfully');
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Action failed');
    }
  };

  const handleManagerReject = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      await makeRequest(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/manager-reject`,
        'PATCH',
        { reason, approverId: 'demo-manager-id' }
      );
      alert('Manager rejected successfully');
      setShowModal(false);
      setReason('');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Action failed');
    }
  };

  const handleFinanceApprove = async () => {
    try {
      await makeRequest(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/finance-approve`,
        'PATCH',
        { approverId: 'demo-finance-id' }
      );
      alert('Finance approved successfully');
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Action failed');
    }
  };

  const handleFinanceReject = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      await makeRequest(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/finance-reject`,
        'PATCH',
        { reason, approverId: 'demo-finance-id' }
      );
      alert('Finance rejected successfully');
      setShowModal(false);
      setReason('');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Action failed');
    }
  };

  const handleFreeze = async () => {
    try {
      await makeRequest(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/freeze`,
        'PATCH',
        { reason: reason || undefined }
      );
      alert('Payroll frozen successfully');
      setShowModal(false);
      setReason('');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to freeze');
    }
  };

  const handleUnfreeze = async () => {
    try {
      await makeRequest(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/unfreeze`,
        'PATCH',
        { unlockReason: reason || undefined }
      );
      alert('Payroll unfrozen successfully');
      setShowModal(false);
      setReason('');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to unfreeze');
    }
  };

  const handleGeneratePayslips = async () => {
    if (!confirm('Generate payslips for this payroll run?')) return;
    try {
      const data = await makeRequest(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/payslips/generate`,
        'POST'
      );
      alert(`Generated ${data.count || 0} payslips successfully`);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to generate payslips');
    }
  };

  const handleDistributePayslips = async () => {
    if (!confirm('Distribute payslips to employees?')) return;
    try {
      const data = await makeRequest(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/payslips/distribute`
      );
      alert(`Distributed payslips successfully (${data.modifiedCount || 0} updated)`);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to distribute payslips');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!confirm('Mark all payslips as paid? This action indicates payment has been processed.')) return;
    try {
      const data = await makeRequest(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/mark-paid`
      );
      alert(`Marked ${data.modifiedCount || 0} payslips as paid`);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to mark as paid');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  if (error || !payrollRun) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <p className="text-lg text-red-600 font-medium">{error || 'Payroll run not found'}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const normalizeStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'DRAFT': 'draft',
      'UNDER_REVIEW': 'under_review',
      'PENDING_FINANCE_APPROVAL': 'pending_finance_approval',
      'APPROVED': 'approved',
      'LOCKED': 'locked',
      'UNLOCKED': 'unlocked',
      'REJECTED': 'rejected'
    };
    return statusMap[status] || status?.toLowerCase();
  };

  const currentStatus = normalizeStatus(payrollRun.status);

  const getStepStatus = (status: string) => {
    const statusMap: Record<string, number> = {
      'draft': 0,
      'under_review': 1,
      'pending_finance_approval': 2,
      'approved': 3,
      'locked': 4,
      'unlocked': 3,
      'rejected': -1
    };
    return statusMap[status] || 0;
  };

  const currentStep = getStepStatus(currentStatus);

  const steps = [
    { label: 'Draft', icon: FileText, status: 'draft' },
    { label: 'Manager Review', icon: Check, status: 'under_review' },
    { label: 'Finance Review', icon: CheckCircle, status: 'pending_finance_approval' },
    { label: 'Approved', icon: CheckCircle, status: 'approved' },
    { label: 'Locked', icon: Lock, status: 'locked' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Approvals & Execution</h1>
          <p className="text-gray-500 mt-1">Run ID: {payrollRun.runId || payrollRun._id || runId}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              currentStatus === 'approved' ? 'bg-green-200 text-green-800' :
              currentStatus === 'rejected' ? 'bg-red-200 text-red-800' :
              currentStatus === 'locked' ? 'bg-purple-200 text-purple-800' :
              currentStatus === 'pending_finance_approval' ? 'bg-blue-200 text-blue-800' :
              'bg-yellow-200 text-yellow-800'
            }`}>
              {payrollRun.status?.replace(/_/g, ' ')}
            </span>
            {payrollRun.payrollPeriod && (
              <span className="text-sm text-gray-600">
                Period: {new Date(payrollRun.payrollPeriod).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Role Selector */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">Current Role (Demo):</p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentRole('specialist')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currentRole === 'specialist'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 border border-blue-300'
              }`}
            >
              Payroll Specialist
            </button>
            <button
              onClick={() => setCurrentRole('manager')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currentRole === 'manager'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-green-600 border border-green-300'
              }`}
            >
              Payroll Manager
            </button>
            <button
              onClick={() => setCurrentRole('finance')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currentRole === 'finance'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-purple-600 border border-purple-300'
              }`}
            >
              Finance Staff
            </button>
          </div>
        </div>

        {/* Approval Progress Stepper */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Approval Progress</h2>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isRejected = currentStatus === 'rejected';
              
              return (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                        isRejected && isCurrent
                          ? 'bg-red-500 text-white'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isRejected && isCurrent ? <X size={20} /> : <Icon size={20} />}
                    </div>
                    <p className="text-xs mt-2 text-center font-medium max-w-[80px]">{step.label}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition ${
                        index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Total Employees</p>
            <p className="text-2xl font-bold">{payrollRun.employees || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Exceptions</p>
            <p className="text-2xl font-bold text-orange-600">{payrollRun.exceptions || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Total Net Pay</p>
            <p className="text-2xl font-bold text-green-600">${(payrollRun.totalnetpay || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Role-Based Action Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Specialist Panel */}
          <div className={`bg-white rounded-lg shadow-md p-6 transition ${
            currentRole === 'specialist' ? 'ring-2 ring-blue-500' : ''
          }`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Payroll Specialist
            </h3>
            {currentStatus === 'draft' && (
              <button
                onClick={handlePublish}
                disabled={currentRole !== 'specialist'}
                className={`w-full py-2 px-4 rounded-lg transition ${
                  currentRole === 'specialist'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Publish for Approval
              </button>
            )}
            {currentStatus !== 'draft' && (
              <p className="text-sm text-gray-500">Draft already published</p>
            )}
          </div>

          {/* Manager Panel */}
          <div className={`bg-white rounded-lg shadow-md p-6 transition ${
            currentRole === 'manager' ? 'ring-2 ring-green-500' : ''
          }`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Check size={20} className="text-green-600" />
              Payroll Manager
            </h3>
            {currentStatus === 'under_review' && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setModalType('approve');
                    setShowModal(true);
                  }}
                  disabled={currentRole !== 'manager'}
                  className={`w-full py-2 px-4 rounded-lg transition ${
                    currentRole === 'manager'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setModalType('reject');
                    setShowModal(true);
                  }}
                  disabled={currentRole !== 'manager'}
                  className={`w-full py-2 px-4 rounded-lg transition ${
                    currentRole === 'manager'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Reject
                </button>
              </div>
            )}
            {(currentStatus === 'pending_finance_approval' || currentStatus === 'approved') && (
              <button
                onClick={() => {
                  setModalType('freeze');
                  setShowModal(true);
                }}
                disabled={currentRole !== 'manager'}
                className={`w-full py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 ${
                  currentRole === 'manager'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Lock size={18} />
                Freeze Payroll
              </button>
            )}
            {currentStatus === 'locked' && (
              <button
                onClick={() => {
                  setModalType('unfreeze');
                  setShowModal(true);
                }}
                disabled={currentRole !== 'manager'}
                className={`w-full py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 ${
                  currentRole === 'manager'
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Unlock size={18} />
                Unfreeze Payroll
              </button>
            )}
            {currentStatus !== 'under_review' && 
             currentStatus !== 'pending_finance_approval' && 
             currentStatus !== 'approved' &&
             currentStatus !== 'locked' && (
              <p className="text-sm text-gray-500">No pending manager actions</p>
            )}
          </div>

          {/* Finance Panel */}
          <div className={`bg-white rounded-lg shadow-md p-6 transition ${
            currentRole === 'finance' ? 'ring-2 ring-purple-500' : ''
          }`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-purple-600" />
              Finance Staff
            </h3>
            {currentStatus === 'pending_finance_approval' && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setModalType('approve');
                    setShowModal(true);
                  }}
                  disabled={currentRole !== 'finance'}
                  className={`w-full py-2 px-4 rounded-lg transition ${
                    currentRole === 'finance'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setModalType('reject');
                    setShowModal(true);
                  }}
                  disabled={currentRole !== 'finance'}
                  className={`w-full py-2 px-4 rounded-lg transition ${
                    currentRole === 'finance'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Reject
                </button>
              </div>
            )}
            {currentStatus !== 'pending_finance_approval' && (
              <p className="text-sm text-gray-500">No pending finance actions</p>
            )}
          </div>
        </div>

        {/* Execution Panel */}
        {(currentStatus === 'approved' || currentStatus === 'locked') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Execution Actions</h2>
            <p className="text-sm text-gray-600 mb-4">
              Execute payroll operations after approval. These actions generate and distribute payslips.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleGeneratePayslips}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                Generate Payslips
              </button>
              <button
                onClick={handleDistributePayslips}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Distribute Payslips
              </button>
              <button
                onClick={handleMarkAsPaid}
                className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Mark as Paid
              </button>
            </div>
          </div>
        )}

        {/* Approval Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Approval Details</h2>
          <div className="space-y-3">
            {payrollRun.managerApprovalDate && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Manager Approved</p>
                  <p className="text-sm text-gray-600">
                    {new Date(payrollRun.managerApprovalDate).toLocaleString()}
                  </p>
                  {payrollRun.payrollManagerId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Approver ID: {payrollRun.payrollManagerId}
                    </p>
                  )}
                </div>
              </div>
            )}
            {payrollRun.financeApprovalDate && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Finance Approved</p>
                  <p className="text-sm text-gray-600">
                    {new Date(payrollRun.financeApprovalDate).toLocaleString()}
                  </p>
                  {payrollRun.financeStaffId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Approver ID: {payrollRun.financeStaffId}
                    </p>
                  )}
                </div>
              </div>
            )}
            {payrollRun.rejectionReason && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <X size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Rejection Reason</p>
                  <p className="text-sm text-gray-700 mt-1">{payrollRun.rejectionReason}</p>
                </div>
              </div>
            )}
            {payrollRun.unlockReason && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Unlock size={20} className="text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">Unlock Reason</p>
                  <p className="text-sm text-gray-700 mt-1">{payrollRun.unlockReason}</p>
                </div>
              </div>
            )}
            {!payrollRun.managerApprovalDate && 
             !payrollRun.financeApprovalDate && 
             !payrollRun.rejectionReason && 
             !payrollRun.unlockReason && (
              <p className="text-sm text-gray-500 text-center py-4">No approval history yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {modalType === 'approve' ? 'Confirm Approval' :
               modalType === 'reject' ? 'Confirm Rejection' :
               modalType === 'freeze' ? 'Freeze Payroll' :
               'Unfreeze Payroll'}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {modalType === 'approve' && 'Are you sure you want to approve this payroll run?'}
              {modalType === 'reject' && 'Please provide a reason for rejecting this payroll run.'}
              {modalType === 'freeze' && 'Freezing will lock the payroll run. Provide a reason (optional).'}
              {modalType === 'unfreeze' && 'Unfreezing will unlock the payroll run. Provide a reason (optional).'}
            </p>
            
            {(modalType === 'reject' || modalType === 'freeze' || modalType === 'unfreeze') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason {modalType === 'reject' ? '(required)' : '(optional)'}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter reason..."
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (currentStatus === 'under_review') {
                    if (modalType === 'approve') handleManagerApprove();
                    else if (modalType === 'reject') handleManagerReject();
                  } else if (currentStatus === 'pending_finance_approval') {
                    if (modalType === 'approve') handleFinanceApprove();
                    else if (modalType === 'reject') handleFinanceReject();
                  }
                  
                  if (modalType === 'freeze') handleFreeze();
                  if (modalType === 'unfreeze') handleUnfreeze();
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition ${
                  modalType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  modalType === 'freeze' ? 'bg-purple-600 hover:bg-purple-700' :
                  modalType === 'unfreeze' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsExecutionPage;