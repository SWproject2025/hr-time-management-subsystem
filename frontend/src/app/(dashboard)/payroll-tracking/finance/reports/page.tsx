"use client";
import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { payrollTrackingService } from '@/lib/payrollTrackingService';
import { FileText, TrendingUp, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FinanceReportsPage() {
  const [activeTab, setActiveTab] = useState<'tax' | 'insurance' | 'benefits' | 'month' | 'year'>('tax');
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    departmentId: '',
  });
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    try {
      setLoading(true);
      
      // Validate date range for reports that use date filters
      if ((activeTab === 'tax' || activeTab === 'insurance' || activeTab === 'benefits') && 
          filters.fromDate && filters.toDate) {
        const from = new Date(filters.fromDate);
        const to = new Date(filters.toDate);
        if (from > to) {
          toast.error('From date must be less than or equal to To date');
          setLoading(false);
          return;
        }
      }
      
      let data;
      switch (activeTab) {
        case 'tax':
          data = await payrollTrackingService.getTaxReport({
            fromDate: filters.fromDate || undefined,
            toDate: filters.toDate || undefined,
            year: filters.fromDate ? undefined : filters.year,
            departmentId: filters.departmentId || undefined,
          });
          break;
        case 'insurance':
          data = await payrollTrackingService.getInsuranceReport({
            fromDate: filters.fromDate || undefined,
            toDate: filters.toDate || undefined,
            departmentId: filters.departmentId || undefined,
          });
          break;
        case 'benefits':
          data = await payrollTrackingService.getBenefitsReport({
            fromDate: filters.fromDate || undefined,
            toDate: filters.toDate || undefined,
            departmentId: filters.departmentId || undefined,
          });
          break;
        case 'month':
          data = await payrollTrackingService.getMonthEndSummary(filters.month, filters.year);
          break;
        case 'year':
          data = await payrollTrackingService.getYearEndSummary(filters.year);
          break;
      }
      setReportData(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate report');
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

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Reports</h1>
          <p className="text-gray-600">Generate and view financial reports</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'tax', label: 'Tax Report' },
                { id: 'insurance', label: 'Insurance Report' },
                { id: 'benefits', label: 'Benefits Report' },
                { id: 'month', label: 'Month-End Summary' },
                { id: 'year', label: 'Year-End Summary' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {(activeTab === 'tax' || activeTab === 'insurance' || activeTab === 'benefits') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input
                      type="date"
                      value={filters.fromDate}
                      max={filters.toDate || undefined}
                      onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input
                      type="date"
                      value={filters.toDate}
                      min={filters.fromDate || undefined}
                      onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                    />
                  </div>
                </>
              )}
              {(activeTab === 'tax' || activeTab === 'month' || activeTab === 'year') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                  />
                </div>
              )}
              {activeTab === 'month' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={filters.month}
                    onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Results */}
        {reportData && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {reportData.reportType?.replace('-', ' ').toUpperCase()} Report
              </h2>
              <p className="text-gray-600">Period: {reportData.period}</p>
            </div>

            {reportData.summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(reportData.summary).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof value === 'number' && key.toLowerCase().includes('amount')
                        ? formatCurrency(value)
                        : value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {reportData.taxBreakdown && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tax Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Transactions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.taxBreakdown.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.taxName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.transactionCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportData.monthlyBreakdown && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Month
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Gross Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Deductions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Net Pay
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.monthlyBreakdown.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(2000, item.month - 1).toLocaleString('default', { month: 'long' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.totalGrossSalary)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.totalDeductions)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(item.totalNetPay)}
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

