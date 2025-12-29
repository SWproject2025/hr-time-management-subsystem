'use client';
import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ReportFilter {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  department?: string;
  shiftType?: string;
  exportFormat: 'PDF' | 'EXCEL' | 'CSV';
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'attendance' | 'shifts' | 'holidays' | 'sync' | 'exceptions' | 'system';
  supportsFilters: boolean;
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'shift_assignment_dept',
    name: 'Shift Assignment Report (by Department)',
    description: 'Detailed shift assignments organized by department',
    icon: '📊',
    category: 'shifts',
    supportsFilters: true
  },
  {
    id: 'shift_assignment_employee',
    name: 'Shift Assignment Report (by Employee)',
    description: 'Individual employee shift assignments and schedules',
    icon: '👤',
    category: 'shifts',
    supportsFilters: true
  },
  {
    id: 'shift_expiry_forecast',
    name: 'Shift Expiry Forecast Report',
    description: 'Upcoming shift expirations and renewal requirements',
    icon: '⏰',
    category: 'shifts',
    supportsFilters: true
  },
  {
    id: 'holiday_calendar',
    name: 'Holiday Calendar Report',
    description: 'Complete holiday calendar with dates and types',
    icon: '🎄',
    category: 'holidays',
    supportsFilters: true
  },
  {
    id: 'sync_audit',
    name: 'Sync Audit Report',
    description: 'Data synchronization activities and status',
    icon: '🔄',
    category: 'sync',
    supportsFilters: true
  },
  {
    id: 'exception_approval_timeline',
    name: 'Exception Approval Timeline Report',
    description: 'Approval workflows and processing times for exceptions',
    icon: '📋',
    category: 'exceptions',
    supportsFilters: true
  },
  {
    id: 'system_config_audit',
    name: 'System Configuration Change Log',
    description: 'Audit trail of all system configuration changes',
    icon: '⚙️',
    category: 'system',
    supportsFilters: true
  }
];

const EXPORT_FORMATS = [
  { value: 'PDF', label: 'PDF Document', icon: '📄' },
  { value: 'EXCEL', label: 'Excel Spreadsheet', icon: '📊' },
  { value: 'CSV', label: 'CSV File', icon: '📋' }
];

export default function AdminReports() {
  const { toast } = useToast();
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  const [availableReports, setAvailableReports] = useState<ReportType[]>(REPORT_TYPES);
  const [scheduling, setScheduling] = useState(false);

  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: {
      startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days ago
      endDate: format(new Date(), 'yyyy-MM-dd')
    },
    department: '',
    shiftType: '',
    exportFormat: 'PDF'
  });

  // Load available reports and report history on component mount
  useEffect(() => {
    const loadReportData = async () => {
      try {
        // Load available reports
        const available = await timeManagementService.getAvailableReports();
        if (available && available.length > 0) {
          setAvailableReports(available);
        }

        // Load report history
        const history = await timeManagementService.getReportHistory();
        if (history) {
          setReportHistory(history);
        }
      } catch (error: any) {
        console.warn('Failed to load report data:', error);
        // Continue with static data if API fails
      }
    };

    loadReportData();
  }, []);

  const handleGenerateReport = async (reportType: ReportType) => {
    try {
      setGeneratingReports(prev => new Set(prev).add(reportType.id));

      const reportData = {
        reportType: reportType.id,
        filters: reportType.supportsFilters ? {
          ...filters,
          department: filters.department || undefined,
          shiftType: filters.shiftType || undefined
        } : undefined
      };

      const result = await timeManagementService.generateReport(reportData);

      // Create and download the report
      const blob = new Blob([result.data], {
        type: filters.exportFormat === 'PDF' ? 'application/pdf' :
              filters.exportFormat === 'EXCEL' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              'text/csv'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType.name.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.${filters.exportFormat.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: `${reportType.name} generated and downloaded successfully`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to generate ${reportType.name}`,
        variant: 'destructive'
      });
    } finally {
      setGeneratingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportType.id);
        return newSet;
      });
    }
  };

  const handleScheduleReport = async (reportType: ReportType, frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY', recipients: string[]) => {
    try {
      setScheduling(true);

      const scheduleData = {
        reportType: reportType.id,
        frequency,
        filters: reportType.supportsFilters ? {
          ...filters,
          department: filters.department || undefined,
          shiftType: filters.shiftType || undefined
        } : undefined,
        recipients
      };

      await timeManagementService.scheduleReport(scheduleData);

      toast({
        title: 'Success',
        description: `${reportType.name} scheduled successfully`
      });

      // Reload report history
      const history = await timeManagementService.getReportHistory();
      if (history) {
        setReportHistory(history);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to schedule ${reportType.name}`,
        variant: 'destructive'
      });
    } finally {
      setScheduling(false);
    }
  };

  const getReportsByCategory = (category: string) => {
    return REPORT_TYPES.filter(report => report.category === category);
  };

  const renderReportCard = (report: ReportType) => (
    <div key={report.id} className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{report.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{report.name}</h3>
            <p className="text-sm text-gray-600">{report.description}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedReport(report);
            setShowFilters(report.supportsFilters);
          }}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Generate
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {report.supportsFilters && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Filters Available
          </span>
        )}
        <span className={`px-2 py-1 text-xs rounded-full ${
          report.category === 'attendance' ? 'bg-green-100 text-green-800' :
          report.category === 'shifts' ? 'bg-purple-100 text-purple-800' :
          report.category === 'holidays' ? 'bg-yellow-100 text-yellow-800' :
          report.category === 'sync' ? 'bg-blue-100 text-blue-800' :
          report.category === 'exceptions' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
        </span>
      </div>
    </div>
  );

  const renderFiltersModal = () => {
    if (!selectedReport || !showFilters) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{selectedReport.icon}</span>
                <h3 className="text-lg font-semibold">{selectedReport.name}</h3>
              </div>
              <button
                onClick={() => {
                  setShowFilters(false);
                  setSelectedReport(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={filters.dateRange.startDate}
                      onChange={(e) => setFilters({
                        ...filters,
                        dateRange: { ...filters.dateRange, startDate: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={filters.dateRange.endDate}
                      onChange={(e) => setFilters({
                        ...filters,
                        dateRange: { ...filters.dateRange, endDate: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department (Optional)
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  <option value="IT">IT Department</option>
                  <option value="HR">HR Department</option>
                  <option value="FINANCE">Finance Department</option>
                  <option value="OPERATIONS">Operations Department</option>
                  <option value="MARKETING">Marketing Department</option>
                </select>
              </div>

              {/* Shift Type Filter (for shift-related reports) */}
              {(selectedReport.category === 'shifts') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift Type (Optional)
                  </label>
                  <select
                    value={filters.shiftType}
                    onChange={(e) => setFilters({ ...filters, shiftType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Shift Types</option>
                    <option value="MORNING">Morning Shift</option>
                    <option value="EVENING">Evening Shift</option>
                    <option value="NIGHT">Night Shift</option>
                    <option value="WEEKEND">Weekend Shift</option>
                    <option value="HOLIDAY">Holiday Shift</option>
                  </select>
                </div>
              )}

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {EXPORT_FORMATS.map(format => (
                    <label
                      key={format.value}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        filters.exportFormat === format.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        value={format.value}
                        checked={filters.exportFormat === format.value}
                        onChange={(e) => setFilters({ ...filters, exportFormat: e.target.value as any })}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-lg mb-1">{format.icon}</div>
                        <div className="text-xs font-medium">{format.label}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowFilters(false);
                  setSelectedReport(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedReport) {
                    handleGenerateReport(selectedReport);
                    setShowFilters(false);
                    setSelectedReport(null);
                  }
                }}
                disabled={generatingReports.has(selectedReport?.id || '')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {generatingReports.has(selectedReport?.id || '') ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>📊 Generate Report</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'HR', 'TIME_MANAGER']}>
      <div className="p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin Reports</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive reports for time management analysis and auditing</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => toast({ title: 'Info', description: 'Generating attendance summary report...' })}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              📈 Attendance Summary
            </button>
            <button
              onClick={() => toast({ title: 'Info', description: 'Generating compliance report...' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              ✅ Compliance Report
            </button>
            <button
              onClick={() => toast({ title: 'Info', description: 'Generating productivity analysis...' })}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              📊 Productivity Analysis
            </button>
            <button
              onClick={() => toast({ title: 'Info', description: 'Scheduling automated reports...' })}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              ⏰ Schedule Reports
            </button>
          </div>
        </div>

        {/* Report Categories */}
        <div className="space-y-8">
          {/* Attendance Reports */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-green-700">📊 Attendance Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getReportsByCategory('attendance').map(renderReportCard)}
            </div>
          </div>

          {/* Shift Reports */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-700">⏰ Shift Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getReportsByCategory('shifts').map(renderReportCard)}
            </div>
          </div>

          {/* Holiday Reports */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-yellow-700">🎄 Holiday Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getReportsByCategory('holidays').map(renderReportCard)}
            </div>
          </div>

          {/* Sync Reports */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-blue-700">🔄 Sync & Integration Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getReportsByCategory('sync').map(renderReportCard)}
            </div>
          </div>

          {/* Exception Reports */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-red-700">📋 Exception & Approval Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getReportsByCategory('exceptions').map(renderReportCard)}
            </div>
          </div>

          {/* System Reports */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">⚙️ System & Audit Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getReportsByCategory('system').map(renderReportCard)}
            </div>
          </div>
        </div>

        {/* Report Generation Modal */}
        {renderFiltersModal()}

        {/* Report Statistics */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Report Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{REPORT_TYPES.length}</div>
              <div className="text-sm text-blue-800">Available Reports</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {REPORT_TYPES.filter(r => r.supportsFilters).length}
              </div>
              <div className="text-sm text-green-800">Filterable Reports</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-purple-800">Export Formats</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {generatingReports.size}
              </div>
              <div className="text-sm text-orange-800">Reports Generating</div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
