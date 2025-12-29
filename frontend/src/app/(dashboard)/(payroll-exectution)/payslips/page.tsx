"use client";
import React, { useState, useEffect } from 'react';
import { Search, Download, Send, Eye, Printer, Mail, X, FileText, AlertTriangle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const FinalizedPayslipsPage = () => {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    runId: '',
    employeeName: '',
    department: ''
  });
  const [selectedPayslips, setSelectedPayslips] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.runId) params.append('runId', filters.runId);
      if (filters.employeeName) params.append('employeeName', filters.employeeName);
      if (filters.department) params.append('department', filters.department);
      
      const url = `${API_URL}/payroll-execution/payslips${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch payslips: ${response.status}`);
      }
      
      const data = await response.json();
      setPayslips(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching payslips:', err);
      setError(err.message || 'Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPayslip = (id: string) => {
    setSelectedPayslips(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayslips.length === payslips.length) {
      setSelectedPayslips([]);
    } else {
      setSelectedPayslips(payslips.map(p => p._id));
    }
  };

  const handleViewDetail = async (payslip: any) => {
    try {
      setDetailLoading(true);
      setShowDetailModal(true);
      
      const response = await fetch(`${API_URL}/payroll-execution/payslips/${payslip._id}`);
      if (!response.ok) throw new Error('Failed to fetch payslip details');
      
      const fullPayslip = await response.json();
      
      setSelectedPayslip({
        ...payslip,
        earningsDetails: fullPayslip.earningsDetails,
        deductionsDetails: fullPayslip.deductionsDetails,
        totalGrossSalary: fullPayslip.totalGrossSalary,
        totaDeductions: fullPayslip.totaDeductions,
        netPay: fullPayslip.netPay,
        paymentStatus: fullPayslip.paymentStatus
      });
    } catch (err: any) {
      console.error('Error fetching payslip details:', err);
      setError('Failed to load payslip details: ' + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownload = async (payslipId: string) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`${API_URL}/payroll-execution/payslips/${payslipId}/download`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('PDF generation endpoint not available');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip_${payslipId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('PDF download is not yet implemented.\n\nThis feature requires backend support for PDF generation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedPayslips.length === 0) {
      alert('Please select payslips first');
      return;
    }
    
    try {
      setActionLoading(true);
      
      const response = await fetch(`${API_URL}/payroll-execution/payslips/bulk-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payslipIds: selectedPayslips })
      });
      
      if (!response.ok) {
        throw new Error('Bulk download endpoint not available');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslips_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSelectedPayslips([]);
    } catch (err: any) {
      alert('Bulk download is not yet implemented.\n\nThis feature requires backend support for ZIP generation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkResend = async () => {
    if (selectedPayslips.length === 0) {
      alert('Please select payslips first');
      return;
    }
    
    try {
      setActionLoading(true);
      
      const response = await fetch(`${API_URL}/payroll-execution/payslips/bulk-resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payslipIds: selectedPayslips })
      });
      
      if (!response.ok) {
        throw new Error('Bulk resend endpoint not available');
      }
      
      const result = await response.json();
      alert(`Successfully sent ${result.sent} payslips via email`);
      setSelectedPayslips([]);
    } catch (err: any) {
      alert('Email distribution is not yet implemented.\n\nThis feature requires backend email integration (SendGrid/AWS SES).');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailPayslip = async (payslipId: string) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`${API_URL}/payroll-execution/payslips/${payslipId}/send-email`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Email endpoint not available');
      }
      
      alert('Payslip sent successfully via email');
    } catch (err: any) {
      alert('Email functionality is not yet implemented.\n\nBackend needs email integration with SendGrid or AWS SES.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      'PENDING': { class: 'bg-yellow-200 text-yellow-800', label: 'Pending' },
      'PAID': { class: 'bg-green-200 text-green-800', label: 'Paid' },
      'pending': { class: 'bg-yellow-200 text-yellow-800', label: 'Pending' },
      'paid': { class: 'bg-green-200 text-green-800', label: 'Paid' },
    };
    
    const config = statusMap[status] || { class: 'bg-gray-200 text-gray-800', label: status };
    return config;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Finalized Payslips</h1>
            <p className="text-gray-500 mt-1">View and manage all employee payslips</p>
          </div>
          {selectedPayslips.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleBulkDownload}
                disabled={actionLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                Download Selected ({selectedPayslips.length})
              </button>
              <button
                onClick={handleBulkResend}
                disabled={actionLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Resend Selected
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Employee</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  value={filters.employeeName}
                  onChange={(e) => setFilters({ ...filters, employeeName: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && fetchPayslips()}
                  placeholder="Employee name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Run ID</label>
              <input
                type="text"
                value={filters.runId}
                onChange={(e) => setFilters({ ...filters, runId: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchPayslips()}
                placeholder="Payroll run ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2 justify-end">
            <button
              onClick={() => {
                setFilters({ runId: '', employeeName: '', department: '' });
                setTimeout(fetchPayslips, 100);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Clear Filters
            </button>
            <button
              onClick={fetchPayslips}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payslips...</p>
            </div>
          ) : payslips.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No payslips found</p>
              <p className="text-sm mt-2">Try adjusting your filters or check if payslips have been generated</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedPayslips.length === payslips.length && payslips.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payslips.map((payslip) => {
                    const statusBadge = getStatusBadge(payslip.status);
                    return (
                      <tr key={payslip._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedPayslips.includes(payslip._id)}
                            onChange={() => handleSelectPayslip(payslip._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{payslip.employeeName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{payslip.employeeCode || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{payslip.department || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {payslip.runPeriod ? new Date(payslip.runPeriod).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          ${(payslip.grossSalary || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600">
                          -${(payslip.deductions || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-green-600">
                          ${(payslip.netPay || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.class}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetail(payslip)}
                              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition"
                              title="View Details"
                              disabled={actionLoading}
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDownload(payslip._id)}
                              className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition"
                              title="Download PDF"
                              disabled={actionLoading}
                            >
                              <Download size={18} />
                            </button>
                            <button
                              onClick={() => handleEmailPayslip(payslip._id)}
                              className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded transition"
                              title="Send Email"
                              disabled={actionLoading}
                            >
                              <Send size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {showDetailModal && selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payslip Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedPayslip(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading details...</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="text-center border-b pb-4">
                  <h3 className="text-xl font-bold text-gray-800">Company Name</h3>
                  <p className="text-sm text-gray-500">123 Business St, City, Country</p>
                  <p className="text-sm text-gray-500">Tel: +123 456 7890</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Employee Name</p>
                    <p className="font-semibold">{selectedPayslip.employeeName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Employee Code</p>
                    <p className="font-semibold">{selectedPayslip.employeeCode || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Department</p>
                    <p className="font-semibold">{selectedPayslip.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Pay Period</p>
                    <p className="font-semibold">
                      {selectedPayslip.runPeriod ? new Date(selectedPayslip.runPeriod).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3 text-green-700">Earnings</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Base Salary</span>
                      <span className="font-semibold">
                        ${(selectedPayslip.earningsDetails?.baseSalary || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Allowances</span>
                      <span className="font-semibold">
                        ${(selectedPayslip.earnings?.allowances || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Bonuses</span>
                      <span className="font-semibold">
                        ${(selectedPayslip.earnings?.bonuses || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Benefits</span>
                      <span className="font-semibold">
                        ${(selectedPayslip.earnings?.benefits || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 font-bold text-lg bg-green-50 px-2 rounded">
                      <span>Total Gross</span>
                      <span className="text-green-600">
                        ${(selectedPayslip.totalGrossSalary || selectedPayslip.grossSalary || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3 text-red-700">Deductions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Taxes</span>
                      <span className="font-semibold text-red-600">
                        -${(selectedPayslip.deductionsBreakdown?.taxes || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Insurance</span>
                      <span className="font-semibold text-red-600">
                        -${(selectedPayslip.deductionsBreakdown?.insurance || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Penalties</span>
                      <span className="font-semibold text-red-600">
                        -${(selectedPayslip.deductionsBreakdown?.penalties || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 font-bold text-lg bg-red-50 px-2 rounded">
                      <span>Total Deductions</span>
                      <span className="text-red-600">
                        -${(selectedPayslip.totaDeductions || selectedPayslip.deductions || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">Net Pay</span>
                    <span className="text-3xl font-bold text-blue-600">
                      ${(selectedPayslip.netPay || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handlePrint}
                    className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
                  >
                    <Printer size={18} />
                    Print
                  </button>
                  <button
                    onClick={() => handleDownload(selectedPayslip._id)}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => handleEmailPayslip(selectedPayslip._id)}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Mail size={18} />
                    Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalizedPayslipsPage;