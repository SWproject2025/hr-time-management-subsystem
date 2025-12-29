'use client';
import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

interface ActivityLogEntry {
  _id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  actionType: 'CREATED' | 'UPDATED' | 'DELETED' | 'SYNCED' | 'EXPORTED' | 'BACKUP' | 'RESTORE' | 'LOGIN' | 'LOGOUT';
  module: 'SHIFT' | 'HOLIDAY' | 'INTEGRATION' | 'ATTENDANCE' | 'EXCEPTION' | 'REPORT' | 'SETTING' | 'USER';
  entityId?: string;
  entityName?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

interface ActivityLogFilters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  userRole?: string;
  actionType?: string;
  module?: string;
  searchTerm?: string;
}

const ACTION_TYPES = [
  { value: 'CREATED', label: 'Created', icon: '➕', color: 'text-green-600 bg-green-50' },
  { value: 'UPDATED', label: 'Updated', icon: '✏️', color: 'text-blue-600 bg-blue-50' },
  { value: 'DELETED', label: 'Deleted', icon: '🗑️', color: 'text-red-600 bg-red-50' },
  { value: 'SYNCED', label: 'Synced', icon: '🔄', color: 'text-purple-600 bg-purple-50' },
  { value: 'EXPORTED', label: 'Exported', icon: '📊', color: 'text-orange-600 bg-orange-50' },
  { value: 'BACKUP', label: 'Backup', icon: '💾', color: 'text-gray-600 bg-gray-50' },
  { value: 'RESTORE', label: 'Restored', icon: '🔙', color: 'text-indigo-600 bg-indigo-50' },
  { value: 'LOGIN', label: 'Login', icon: '🔐', color: 'text-green-600 bg-green-50' },
  { value: 'LOGOUT', label: 'Logout', icon: '🔓', color: 'text-gray-600 bg-gray-50' }
];

const MODULES = [
  { value: 'SHIFT', label: 'Shifts', icon: '⏰' },
  { value: 'HOLIDAY', label: 'Holidays', icon: '🎄' },
  { value: 'INTEGRATION', label: 'Integration', icon: '🔗' },
  { value: 'ATTENDANCE', label: 'Attendance', icon: '📊' },
  { value: 'EXCEPTION', label: 'Exceptions', icon: '⚠️' },
  { value: 'REPORT', label: 'Reports', icon: '📋' },
  { value: 'SETTING', label: 'Settings', icon: '⚙️' },
  { value: 'USER', label: 'Users', icon: '👤' }
];

const USER_ROLES = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'HR', label: 'HR Manager' },
  { value: 'TIME_MANAGER', label: 'Time Manager' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'EMPLOYEE', label: 'Employee' }
];

export default function SystemActivityLog() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [activityStats, setActivityStats] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ActivityLogFilters>({
    dateRange: {
      startDate: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 7 days ago
      endDate: format(new Date(), 'yyyy-MM-dd')
    },
    userRole: '',
    actionType: '',
    module: '',
    searchTerm: ''
  });

  useEffect(() => {
    loadActivityLogs();
    loadActivityStats();
  }, [currentPage, filters]);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        startDate: filters.dateRange.startDate,
        endDate: filters.dateRange.endDate,
        userRole: filters.userRole || undefined,
        actionType: filters.actionType || undefined,
        module: filters.module || undefined,
        searchTerm: filters.searchTerm || undefined
      };

      const response = await timeManagementService.getActivityLogs(params);
      setActivityLogs(response.logs || []);
      setTotalCount(response.total || 0);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load activity logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActivityStats = async () => {
    try {
      const stats = await timeManagementService.getActivityLogStats({
        startDate: filters.dateRange.startDate,
        endDate: filters.dateRange.endDate
      });
      setActivityStats(stats || null);
    } catch (error) {
      console.warn('Failed to load activity stats:', error);
      setActivityStats(null);
    }
  };

  const exportLogs = async () => {
    try {
      const params = {
        startDate: filters.dateRange.startDate,
        endDate: filters.dateRange.endDate,
        userRole: filters.userRole || undefined,
        actionType: filters.actionType || undefined,
        module: filters.module || undefined,
        searchTerm: filters.searchTerm || undefined,
        format: 'CSV'
      };

      const result = await timeManagementService.exportActivityLogs(params);

      // Create and download the export
      const blob = new Blob([result.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Activity logs exported successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to export activity logs',
        variant: 'destructive'
      });
    }
  };

  const getActionTypeInfo = (actionType: string) => {
    return ACTION_TYPES.find(type => type.value === actionType) || ACTION_TYPES[0];
  };

  const getModuleInfo = (module: string) => {
    return MODULES.find(m => m.value === module) || MODULES[0];
  };

  const formatDetails = (details: string, metadata?: Record<string, any>) => {
    if (!details) return 'No details available';

    // If we have structured metadata, format it nicely
    if (metadata && Object.keys(metadata).length > 0) {
      const changes = [];
      if (metadata.oldValue !== undefined && metadata.newValue !== undefined) {
        changes.push(`Changed from "${metadata.oldValue}" to "${metadata.newValue}"`);
      }
      if (metadata.field) {
        changes.push(`Field: ${metadata.field}`);
      }
      if (metadata.count !== undefined) {
        changes.push(`Count: ${metadata.count}`);
      }
      if (metadata.duration) {
        changes.push(`Duration: ${metadata.duration}`);
      }

      return changes.length > 0 ? changes.join(' • ') : details;
    }

    return details;
  };

  const clearFilters = () => {
    setFilters({
      dateRange: {
        startDate: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      },
      userRole: '',
      actionType: '',
      module: '',
      searchTerm: ''
    });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <RoleGuard allowedRoles={['ADMIN', 'HR', 'TIME_MANAGER']}>
      <div className="p-6 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">System Activity Log</h1>
            <p className="text-gray-600 mt-1">Comprehensive audit trail of all system activities and user actions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              🔍 Filters {showFilters ? '▼' : '▶'}
            </button>
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              📊 Export Logs
            </button>
          </div>
        </div>

        {/* Activity Stats */}
        {activityStats && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Activity Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{activityStats.totalActivities || 0}</div>
                <div className="text-sm text-gray-600">Total Activities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{activityStats.uniqueUsers || 0}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{activityStats.mostActiveModule || 'N/A'}</div>
                <div className="text-sm text-gray-600">Top Module</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{activityStats.mostCommonAction || 'N/A'}</div>
                <div className="text-sm text-gray-600">Top Action</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateRange.startDate}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, startDate: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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

              {/* User Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <select
                  value={filters.userRole}
                  onChange={(e) => setFilters({ ...filters, userRole: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  {USER_ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              {/* Action Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Type
                </label>
                <select
                  value={filters.actionType}
                  onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  {ACTION_TYPES.map(action => (
                    <option key={action.value} value={action.value}>{action.label}</option>
                  ))}
                </select>
              </div>

              {/* Module */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module
                </label>
                <select
                  value={filters.module}
                  onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Modules</option>
                  {MODULES.map(module => (
                    <option key={module.value} value={module.value}>{module.label}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Employee Name/ID
                </label>
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  placeholder="Enter employee name or ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  loadActivityLogs();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Activity Log Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No activity logs found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  activityLogs.map((log) => {
                    const actionInfo = getActionTypeInfo(log.actionType);
                    const moduleInfo = getModuleInfo(log.module);

                    return (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(new Date(log.timestamp), 'PPp')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {log.userName}
                            </div>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {log.userRole}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionInfo.color}`}>
                            <span className="mr-1">{actionInfo.icon}</span>
                            {actionInfo.label}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <span className="mr-1">{moduleInfo.icon}</span>
                            {moduleInfo.label}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={log.details}>
                            {formatDetails(log.details, log.metadata)}
                          </div>
                          {log.entityName && (
                            <div className="text-sm text-gray-500">
                              {log.entityName}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress || 'N/A'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    <span className="sr-only">Previous</span>
                    ‹
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    <span className="sr-only">Next</span>
                    ›
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Activity Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
              <div className="text-sm text-blue-800">Total Activities</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {activityLogs.filter(log => ['CREATED', 'LOGIN'].includes(log.actionType)).length}
              </div>
              <div className="text-sm text-green-800">Create/Login Actions</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {activityLogs.filter(log => ['DELETED', 'LOGOUT'].includes(log.actionType)).length}
              </div>
              <div className="text-sm text-red-800">Delete/Logout Actions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(activityLogs.map(log => log.userId)).size}
              </div>
              <div className="text-sm text-purple-800">Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
