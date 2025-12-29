"use client";
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { payrollTrackingService } from '@/lib/payrollTrackingService';
import { Download, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaxDocumentsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [taxData, setTaxData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchTaxDocuments();
  }, [selectedYear]);

  const fetchTaxDocuments = async () => {
    try {
      setLoading(true);
      const data = await payrollTrackingService.getTaxDocuments(selectedYear);
      setTaxData(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch tax documents');
      setTaxData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await payrollTrackingService.downloadTaxDocuments(selectedYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-document-${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Tax document downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download tax document');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tax Documents</h1>
          <p className="text-gray-600">View and download your annual tax statements</p>
        </div>

        {/* Year Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Select Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              onClick={handleDownload}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download size={20} />
              Download PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tax documents...</p>
          </div>
        ) : !taxData ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tax documents found</h3>
            <p className="text-gray-600">No payslips found for the selected year.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Annual Summary - {selectedYear}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Gross Salary</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(taxData.annualTotals?.totalGrossSalary || 0)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Tax Deductions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(taxData.annualTotals?.totalTaxDeductions || 0)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Net Pay</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(taxData.annualTotals?.totalNetPay || 0)}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Number of Payslips: <span className="font-medium">{taxData.annualTotals?.payslipCount || 0}</span>
                </p>
              </div>
            </div>

            {/* Employee Information */}
            {taxData.employee && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Employee Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {taxData.employee.employeeNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {taxData.employee.firstName} {taxData.employee.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">National ID</p>
                    <p className="text-sm font-medium text-gray-900">
                      {taxData.employee.nationalId || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {taxData.employee.workEmail || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payslips List */}
            {taxData.payslips && taxData.payslips.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Payslips for {selectedYear}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Gross Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tax Deductions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Net Pay
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {taxData.payslips.map((payslip: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payslip.payrollRunId?.payrollPeriod
                              ? new Date(payslip.payrollRunId.payrollPeriod).toLocaleDateString()
                              : new Date(payslip.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payslip.totalGrossSalary || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {formatCurrency(
                              payslip.deductionsDetails?.taxes?.reduce(
                                (sum: number, tax: any) =>
                                  sum + (payslip.totalGrossSalary * (tax.rate || 0)) / 100,
                                0
                              ) || 0
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(payslip.netPay || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

