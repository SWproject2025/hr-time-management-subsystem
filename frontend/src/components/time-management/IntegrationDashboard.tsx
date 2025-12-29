'use client';
import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

interface SyncStatus {
  lastSync: Date | null;
  frequency: 'DAILY' | 'REAL_TIME' | 'HOURLY' | 'WEEKLY';
  recordsSyncedToday: {
    attendance: number;
    overtime: number;
    penalty: number;
  };
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'SYNCING';
  lastSyncMessage: string;
  nextSync: Date | null;
}

interface SyncLog {
  _id: string;
  system: 'PAYROLL' | 'LEAVE_MANAGEMENT' | 'HR_SYSTEM';
  operation: string;
  status: 'SUCCESS' | 'ERROR' | 'WARNING';
  recordsProcessed: number;
  message: string;
  timestamp: Date;
  triggeredBy: string;
  duration: number; // in milliseconds
}

interface IntegrationConfig {
  payrollEnabled: boolean;
  leaveManagementEnabled: boolean;
  autoSyncEnabled: boolean;
  syncFrequency: 'DAILY' | 'REAL_TIME' | 'HOURLY' | 'WEEKLY';
  failureAlertsEnabled: boolean;
  alertEmails: string[];
}

export default function IntegrationDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<'PAYROLL' | 'LEAVE' | null>(null);
  const [payrollStatus, setPayrollStatus] = useState<SyncStatus | null>(null);
  const [leaveStatus, setLeaveStatus] = useState<SyncStatus | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [config, setConfig] = useState<IntegrationConfig>({
    payrollEnabled: true,
    leaveManagementEnabled: true,
    autoSyncEnabled: true,
    syncFrequency: 'DAILY',
    failureAlertsEnabled: true,
    alertEmails: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [payroll, leave, logs, integrationConfig] = await Promise.all([
        timeManagementService.getPayrollSyncStatus(),
        timeManagementService.getLeaveSyncStatus(),
        timeManagementService.getSyncLogs(20), // Get last 20 logs
        timeManagementService.getIntegrationConfig()
      ]);

      setPayrollStatus(payroll);
      setLeaveStatus(leave);
      setSyncLogs(logs || []);
      if (integrationConfig) {
        setConfig(integrationConfig);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load integration data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async (system: 'PAYROLL' | 'LEAVE') => {
    try {
      setSyncing(system);
      const result = system === 'PAYROLL'
        ? await timeManagementService.syncWithPayrollNow()
        : await timeManagementService.syncWithLeaveManagementNow();

      toast({
        title: 'Success',
        description: `${system} sync completed successfully`
      });

      // Refresh data
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to sync with ${system.toLowerCase()} system`,
        variant: 'destructive'
      });
    } finally {
      setSyncing(null);
    }
  };

  const handleRetryFailedSync = async (logId: string) => {
    try {
      await timeManagementService.retryFailedSync(logId);
      toast({
        title: 'Success',
        description: 'Retry operation initiated'
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to retry sync operation',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateConfig = async () => {
    try {
      await timeManagementService.updateIntegrationConfig(config);
      toast({
        title: 'Success',
        description: 'Integration configuration updated'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update configuration',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return '✅';
      case 'WARNING': return '⚠️';
      case 'ERROR': return '❌';
      case 'SYNCING': return '🔄';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600 bg-green-100';
      case 'WARNING': return 'text-yellow-600 bg-yellow-100';
      case 'ERROR': return 'text-red-600 bg-red-100';
      case 'SYNCING': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case 'REAL_TIME': return 'Real-time';
      case 'HOURLY': return 'Hourly';
      case 'DAILY': return 'Daily';
      case 'WEEKLY': return 'Weekly';
      default: return frequency;
    }
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['ADMIN', 'HR', 'TIME_MANAGER']}>
        <div className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['ADMIN', 'HR', 'TIME_MANAGER']}>
      <div className="p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">System Integration & Synchronization</h1>
          <p className="text-gray-600 mt-1">Monitor and manage integrations with payroll and leave management systems</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payroll System Integration */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Payroll System Integration</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payrollStatus?.status || 'ERROR')}`}>
                {getStatusIcon(payrollStatus?.status || 'ERROR')} {payrollStatus?.status || 'Unknown'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Sync</label>
                  <p className="text-sm text-gray-900">
                    {payrollStatus?.lastSync
                      ? formatDistanceToNow(new Date(payrollStatus.lastSync), { addSuffix: true })
                      : 'Never'
                    }
                  </p>
                  {payrollStatus?.lastSync && (
                    <p className="text-xs text-gray-500">
                      {format(new Date(payrollStatus.lastSync), 'MMM d, yyyy h:mm a')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Sync Frequency</label>
                  <p className="text-sm text-gray-900">
                    {formatFrequency(payrollStatus?.frequency || 'DAILY')}
                  </p>
                  {payrollStatus?.nextSync && (
                    <p className="text-xs text-gray-500">
                      Next: {format(new Date(payrollStatus.nextSync), 'MMM d, h:mm a')}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Records Synced Today</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-semibold text-blue-600">
                      {payrollStatus?.recordsSyncedToday?.attendance || 0}
                    </div>
                    <div className="text-xs text-blue-800">Attendance</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-semibold text-green-600">
                      {payrollStatus?.recordsSyncedToday?.overtime || 0}
                    </div>
                    <div className="text-xs text-green-800">Overtime</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded">
                    <div className="text-lg font-semibold text-red-600">
                      {payrollStatus?.recordsSyncedToday?.penalty || 0}
                    </div>
                    <div className="text-xs text-red-800">Penalties</div>
                  </div>
                </div>
              </div>

              {payrollStatus?.lastSyncMessage && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Sync Message</label>
                  <p className="text-sm text-gray-600 mt-1">{payrollStatus.lastSyncMessage}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleSyncNow('PAYROLL')}
                  disabled={syncing === 'PAYROLL'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {syncing === 'PAYROLL' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Syncing...
                    </>
                  ) : (
                    <>🔄 Sync Now</>
                  )}
                </button>
                <button
                  onClick={() => setShowLogs(true)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  View Sync Log
                </button>
              </div>
            </div>
          </div>

          {/* Leave Management Integration */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Leave Management Integration</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(leaveStatus?.status || 'ERROR')}`}>
                {getStatusIcon(leaveStatus?.status || 'ERROR')} {leaveStatus?.status || 'Unknown'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Sync</label>
                  <p className="text-sm text-gray-900">
                    {leaveStatus?.lastSync
                      ? formatDistanceToNow(new Date(leaveStatus.lastSync), { addSuffix: true })
                      : 'Never'
                    }
                  </p>
                  {leaveStatus?.lastSync && (
                    <p className="text-xs text-gray-500">
                      {format(new Date(leaveStatus.lastSync), 'MMM d, yyyy h:mm a')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Active Leaves Today</label>
                  <p className="text-sm text-gray-900">
                    {leaveStatus?.recordsSyncedToday?.attendance || 0} employees
                  </p>
                  <p className="text-xs text-gray-500">affecting attendance</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Sync Frequency</label>
                <p className="text-sm text-gray-900">
                  {formatFrequency(leaveStatus?.frequency || 'DAILY')}
                </p>
                {leaveStatus?.nextSync && (
                  <p className="text-xs text-gray-500">
                    Next: {format(new Date(leaveStatus.nextSync), 'MMM d, h:mm a')}
                  </p>
                )}
              </div>

              {leaveStatus?.lastSyncMessage && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Sync Message</label>
                  <p className="text-sm text-gray-600 mt-1">{leaveStatus.lastSyncMessage}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleSyncNow('LEAVE')}
                  disabled={syncing === 'LEAVE'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {syncing === 'LEAVE' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Syncing...
                    </>
                  ) : (
                    <>🔄 Sync Now</>
                  )}
                </button>
                <button
                  onClick={() => setShowLogs(true)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  View Sync Log
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Configuration */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Integration Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="payroll-enabled"
                  checked={config.payrollEnabled}
                  onChange={(e) => setConfig({ ...config, payrollEnabled: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="payroll-enabled" className="font-medium cursor-pointer">
                  Enable Payroll Integration
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="leave-enabled"
                  checked={config.leaveManagementEnabled}
                  onChange={(e) => setConfig({ ...config, leaveManagementEnabled: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="leave-enabled" className="font-medium cursor-pointer">
                  Enable Leave Management Integration
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="auto-sync"
                  checked={config.autoSyncEnabled}
                  onChange={(e) => setConfig({ ...config, autoSyncEnabled: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="auto-sync" className="font-medium cursor-pointer">
                  Enable Automatic Sync
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sync Frequency
                </label>
                <select
                  value={config.syncFrequency}
                  onChange={(e) => setConfig({ ...config, syncFrequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="REAL_TIME">Real-time</option>
                  <option value="HOURLY">Hourly</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="failure-alerts"
                  checked={config.failureAlertsEnabled}
                  onChange={(e) => setConfig({ ...config, failureAlertsEnabled: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="failure-alerts" className="font-medium cursor-pointer">
                  Enable Failure Alerts
                </label>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleUpdateConfig}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Update Configuration
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Logs Modal */}
        {showLogs && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Sync Logs</h3>
                  <button
                    onClick={() => setShowLogs(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-96">
                {syncLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No sync logs available</p>
                ) : (
                  <div className="space-y-3">
                    {syncLogs.map(log => (
                      <div key={log._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                              {getStatusIcon(log.status)} {log.status}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {log.system} - {log.operation}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">{log.message}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div>
                            <span>Records: {log.recordsProcessed}</span>
                            <span className="ml-4">Duration: {log.duration}ms</span>
                            <span className="ml-4">By: {log.triggeredBy}</span>
                          </div>

                          {log.status === 'ERROR' && (
                            <button
                              onClick={() => handleRetryFailedSync(log._id)}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowLogs(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
