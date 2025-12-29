"use client";
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { payrollTrackingService, SalaryDetails } from '@/lib/payrollTrackingService';
import { DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SalaryDetailsPage() {
  const [salaryDetails, setSalaryDetails] = useState<SalaryDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalaryDetails();
  }, []);

  const fetchSalaryDetails = async () => {
    try {
      setLoading(true);
      const data = await payrollTrackingService.getEmployeeSalaryDetails();
      setSalaryDetails(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch salary details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading salary details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!salaryDetails) {
    return (
      <ProtectedRoute>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No salary details found</h3>
            <p className="text-gray-600">Salary details are not available at this time.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Salary Details</h1>
          <p className="text-gray-600">Comprehensive breakdown of your salary components</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Earnings Cards */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Base Salary</h3>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(salaryDetails.baseSalary)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Leave Compensation</h3>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(salaryDetails.leaveCompensation)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Transportation</h3>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(salaryDetails.transportationCompensation)}</p>
          </div>

          {/* Deductions Cards */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Tax Deductions</h3>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(salaryDetails.taxDeductions)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Insurance Deductions</h3>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(salaryDetails.insuranceDeductions)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Salary Deductions</h3>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(salaryDetails.salaryDeductions)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Unpaid Leave Deductions</h3>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(salaryDetails.unpaidLeaveDeductions)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Employer Contributions</h3>
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(salaryDetails.employerContributions)}</p>
          </div>
        </div>

        {/* Net Salary Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium mb-2">Net Salary</h2>
              <p className="text-3xl font-bold">{formatCurrency(salaryDetails.netSalary)}</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-medium mb-2">Net Pay</h2>
              <p className="text-3xl font-bold">{formatCurrency(salaryDetails.netPay)}</p>
            </div>
          </div>
        </div>

        {/* Latest Payroll Run Info */}
        {salaryDetails.latestPayrollRun && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Payroll Run</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Run ID</p>
                <p className="text-sm font-medium text-gray-900">
                  {salaryDetails.latestPayrollRun.runId || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Period</p>
                <p className="text-sm font-medium text-gray-900">
                  {salaryDetails.latestPayrollRun.payrollPeriod
                    ? new Date(salaryDetails.latestPayrollRun.payrollPeriod).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-sm font-medium text-gray-900">
                  {salaryDetails.latestPayrollRun.status || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

