'use client';
import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

interface AttendanceOverview {
  totalEmployees: number;
  clockedIn: number;
  notYetClockedIn: number;
  onLeave: number;
  missingPunches: number;
  lateArrivals: number;
  earlyDepartures: number;
}

interface EmployeeStatus {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  currentStatus: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_LEAVE' | 'NOT_CLOCKED_IN';
  clockInTime?: Date;
  clockOutTime?: Date;
  lastActivity: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  shift?: {
    name: string;
    startTime: string;
    endTime: string;
  };
}

interface SystemHealth {
  punchDevices: {
    total: number;
    online: number;
    offline: number;
    maintenance: number;
  };
  apiResponseTimes: {
    average: number;
    min: number;
    max: number;
    p95: number;
  };
  databaseMetrics: {
    connections: number;
    queryTime: number;
    activeTransactions: number;
    slowQueries: number;
  };
  uptime: number; // hours
  lastBackup: Date;
}

export default function SystemMonitoringDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [attendanceOverview, setAttendanceOverview] = useState<AttendanceOverview>({
    totalEmployees: 0,
    clockedIn: 0,
    notYetClockedIn: 0,
    onLeave: 0,
    missingPunches: 0,
    lateArrivals: 0,
    earlyDepartures: 0
  });

  const [currentEmployees, setCurrentEmployees] = useState<EmployeeStatus[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [geoTrackingEnabled, setGeoTrackingEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overview, employees, health, geoEnabled] = await Promise.all([
        timeManagementService.getAttendanceOverview(),
        timeManagementService.getCurrentEmployeeStatuses(),
        timeManagementService.getSystemHealth(),
        timeManagementService.getGeoTrackingStatus()
      ]);

      setAttendanceOverview(overview);
      setCurrentEmployees(employees);
      setSystemHealth(health);
      setGeoTrackingEnabled(geoEnabled);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load monitoring data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLOCKED_IN': return 'bg-green-100 text-green-800';
      case 'CLOCKED_OUT': return 'bg-gray-100 text-gray-800';
      case 'ON_LEAVE': return 'bg-blue-100 text-blue-800';
      case 'NOT_CLOCKED_IN': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CLOCKED_IN': return '🟢';
      case 'CLOCKED_OUT': return '⚪';
      case 'ON_LEAVE': return '🏖️';
      case 'NOT_CLOCKED_IN': return '🟡';
      default: return '❓';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getSystemHealthColor = (health: SystemHealth) => {
    const avgResponseTime = health.apiResponseTimes.average;
    const offlineDevices = health.punchDevices.offline;

    if (avgResponseTime > 2000 || offlineDevices > 0) return 'text-red-600';
    if (avgResponseTime > 1000) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading && !attendanceOverview.totalEmployees) {
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">System Monitoring Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time attendance monitoring and system health overview</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Auto-refresh: 30s
            </span>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              🔄 Refresh Now
            </button>
          </div>
        </div>

        {/* Today's Attendance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{attendanceOverview.totalEmployees}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Currently Clocked In</p>
                <p className="text-3xl font-bold text-green-600">{attendanceOverview.clockedIn}</p>
                <p className="text-xs text-gray-500">
                  {attendanceOverview.totalEmployees > 0
                    ? `${Math.round((attendanceOverview.clockedIn / attendanceOverview.totalEmployees) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div className="text-3xl">🟢</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Not Yet Clocked In</p>
                <p className="text-3xl font-bold text-yellow-600">{attendanceOverview.notYetClockedIn}</p>
                <p className="text-xs text-gray-500">
                  {attendanceOverview.totalEmployees > 0
                    ? `${Math.round((attendanceOverview.notYetClockedIn / attendanceOverview.totalEmployees) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div className="text-3xl">🟡</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Leave Today</p>
                <p className="text-3xl font-bold text-blue-600">{attendanceOverview.onLeave}</p>
                <p className="text-xs text-gray-500">
                  {attendanceOverview.totalEmployees > 0
                    ? `${Math.round((attendanceOverview.onLeave / attendanceOverview.totalEmployees) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div className="text-3xl">🏖️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Missing Punches</p>
                <p className="text-2xl font-bold text-red-600">{attendanceOverview.missingPunches}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
                <p className="text-2xl font-bold text-orange-600">{attendanceOverview.lateArrivals}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Early Departures</p>
                <p className="text-2xl font-bold text-purple-600">{attendanceOverview.earlyDepartures}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real-time Attendance Map */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Real-time Attendance Status</h2>
              {geoTrackingEnabled && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  📍 Geo-tracking enabled
                </span>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentEmployees.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No employee data available</p>
              ) : (
                currentEmployees.map(employee => (
                  <div key={employee._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getStatusIcon(employee.currentStatus)}</span>
                        <div>
                          <p className="font-medium">{employee.employeeName}</p>
                          <p className="text-sm text-gray-600">
                            {employee.department} • {employee.position}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(employee.currentStatus)}`}>
                        {employee.currentStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      {employee.clockInTime && (
                        <div>
                          <span className="font-medium">Clock In:</span>
                          <span className="ml-2">
                            {format(new Date(employee.clockInTime), 'HH:mm')}
                            {employee.currentStatus === 'CLOCKED_IN' && (
                              <span className="ml-2 text-green-600">
                                ({formatDuration(Math.floor((Date.now() - new Date(employee.clockInTime).getTime()) / (1000 * 60)))})
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {employee.clockOutTime && (
                        <div>
                          <span className="font-medium">Clock Out:</span>
                          <span className="ml-2">
                            {format(new Date(employee.clockOutTime), 'HH:mm')}
                          </span>
                        </div>
                      )}

                      {employee.shift && (
                        <div>
                          <span className="font-medium">Shift:</span>
                          <span className="ml-2">
                            {employee.shift.name} ({employee.shift.startTime} - {employee.shift.endTime})
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="font-medium">Last Activity:</span>
                        <span className="ml-2">
                          {formatDistanceToNow(new Date(employee.lastActivity), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {geoTrackingEnabled && employee.location && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>📍</span>
                          <span>
                            {employee.location.address ||
                             `${employee.location.latitude.toFixed(4)}, ${employee.location.longitude.toFixed(4)}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">System Health</h2>

            {systemHealth ? (
              <div className="space-y-6">
                {/* Punch Device Status */}
                <div>
                  <h3 className="font-medium mb-3">Punch Device Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-lg font-semibold">{systemHealth.punchDevices.total}</div>
                      <div className="text-xs text-gray-600">Total Devices</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-semibold text-green-600">{systemHealth.punchDevices.online}</div>
                      <div className="text-xs text-green-800">Online</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <div className="text-lg font-semibold text-red-600">{systemHealth.punchDevices.offline}</div>
                      <div className="text-xs text-red-800">Offline</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <div className="text-lg font-semibold text-yellow-600">{systemHealth.punchDevices.maintenance}</div>
                      <div className="text-xs text-yellow-800">Maintenance</div>
                    </div>
                  </div>
                </div>

                {/* API Response Times */}
                <div>
                  <h3 className="font-medium mb-3">API Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Response Time:</span>
                      <span className={`font-medium ${systemHealth.apiResponseTimes.average > 1000 ? 'text-red-600' : 'text-green-600'}`}>
                        {systemHealth.apiResponseTimes.average}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">95th Percentile:</span>
                      <span className={`font-medium ${systemHealth.apiResponseTimes.p95 > 2000 ? 'text-red-600' : 'text-green-600'}`}>
                        {systemHealth.apiResponseTimes.p95}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Min/Max:</span>
                      <span className="font-medium">
                        {systemHealth.apiResponseTimes.min}ms / {systemHealth.apiResponseTimes.max}ms
                      </span>
                    </div>
                  </div>
                </div>

                {/* Database Metrics */}
                <div>
                  <h3 className="font-medium mb-3">Database Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Connections:</span>
                      <span className="font-medium">{systemHealth.databaseMetrics.connections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Query Time:</span>
                      <span className={`font-medium ${systemHealth.databaseMetrics.queryTime > 100 ? 'text-red-600' : 'text-green-600'}`}>
                        {systemHealth.databaseMetrics.queryTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Transactions:</span>
                      <span className="font-medium">{systemHealth.databaseMetrics.activeTransactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Slow Queries (24h):</span>
                      <span className={`font-medium ${systemHealth.databaseMetrics.slowQueries > 10 ? 'text-red-600' : 'text-green-600'}`}>
                        {systemHealth.databaseMetrics.slowQueries}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Uptime */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">System Uptime:</span>
                    <span className="font-medium text-green-600">
                      {Math.floor(systemHealth.uptime / 24)}d {systemHealth.uptime % 24}h
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Last Backup:</span>
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(systemHealth.lastBackup), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Overall Health Status */}
                <div className={`p-3 rounded-lg ${getSystemHealthColor(systemHealth) === 'text-green-600' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${getSystemHealthColor(systemHealth)}`}>
                      {getSystemHealthColor(systemHealth) === 'text-green-600' ? '✅' : '❌'}
                    </span>
                    <span className={`font-medium ${getSystemHealthColor(systemHealth)}`}>
                      {getSystemHealthColor(systemHealth) === 'text-green-600' ? 'System Healthy' : 'System Issues Detected'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>System health data not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => toast({ title: 'Info', description: 'Generating detailed attendance report...' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              📊 Generate Report
            </button>
            <button
              onClick={() => toast({ title: 'Info', description: 'Sending attendance alerts...' })}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              🚨 Send Alerts
            </button>
            <button
              onClick={() => toast({ title: 'Info', description: 'Running system diagnostics...' })}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              🔧 Run Diagnostics
            </button>
            <button
              onClick={() => toast({ title: 'Info', description: 'Refreshing all employee statuses...' })}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              🔄 Refresh Status
            </button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
