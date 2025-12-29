'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import timeManagementService, { formatEmployeeName } from '@/services/timeManagementService';
import ClockInOutWidget from '@/components/time-management/attendance/ClockInOutWidget';
import TimeManagementStats from '@/components/time-management/shared/TimeManagementStats';
import ShiftExpiryAlert from '@/components/time-management/shifts/ShiftExpiryAlert';
import AttendanceRecordTable from '@/components/time-management/attendance/AttendanceRecordTable';
import NotificationBell from '@/components/time-management/shared/NotificationBell';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

export default function TimeManagementDashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const employeeId = searchParams?.get('employee');
  const isManager = user?.roles?.some((r: string) => {
    const roleLower = r.toLowerCase();
    return ['admin', 'hr', 'time_manager', 'manager', 'system_admin', 'hr_admin'].some(allowed =>
      roleLower.includes(allowed.replace('_', '')) || allowed.includes(roleLower.replace('_', ''))
    );
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [todayRecords, setTodayRecords] = useState<any[]>([]);
  const [pendingExceptionsCount, setPendingExceptionsCount] = useState<number>(0);
  const [upcomingShift, setUpcomingShift] = useState<any | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const prevAlertsRef = React.useRef<string[]>([]);
  const { toast } = useToast();

  // Dashboard metrics state
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [shiftExpiryNotifications, setShiftExpiryNotifications] = useState<any>(null);
  const [pendingApprovalsEscalation, setPendingApprovalsEscalation] = useState<any>(null);
  const [missingPunchAlerts, setMissingPunchAlerts] = useState<any>(null);
  const [systemSyncStatus, setSystemSyncStatus] = useState<any>(null);

  const totalMinutesToday = React.useMemo(() => {
    let total = 0;
    for (const r of todayRecords || []) {
      total += r.totalWorkMinutes || 0;
    }
    return total;
  }, [todayRecords]);
  const isAdmin = user?.roles?.some((r: string) => ['ADMIN', 'HR'].includes(r));
  const [payrollSyncStatus, setPayrollSyncStatus] = useState<any>(null);

  // poll pending payroll sync status for admins
  useEffect(() => {
    let id: any;
    async function poll() {
      if (!isAdmin) return;
      try {
        const pending = await timeManagementService.getPendingPayrollSync();
        setPayrollSyncStatus(pending || null);
      } catch {}
    }
    poll();
    if (isAdmin) id = setInterval(poll, 30_000);
    return () => { if (id) clearInterval(id); };
  }, [isAdmin]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Fetch dashboard metrics and alerts in parallel
        const [
          records,
          exceptions,
          assignments,
          metrics,
          shiftExpiry,
          pendingEscalation,
          missingPunches,
          syncStatus,
        ] = await Promise.all([
          timeManagementService.getAttendanceRecords({ startDate: new Date().toISOString().slice(0,10) }), // today
          timeManagementService.getAllTimeExceptions({ status: 'OPEN' }),
          timeManagementService.getAllShiftAssignments({ startDate: new Date().toISOString().slice(0,10) }),
          timeManagementService.getDashboardMetrics().catch(() => null), // Graceful fallback
          timeManagementService.getShiftExpiryNotifications().catch(() => null),
          timeManagementService.getPendingApprovalsRequiringEscalation().catch(() => null),
          timeManagementService.getMissingPunchAlertsSummary().catch(() => null),
          timeManagementService.getSystemSyncStatusOverview().catch(() => null),
        ]);

        if (!mounted) return;

        setTodayRecords(records || []);
        setPendingExceptionsCount((exceptions && exceptions.length) || 0);

        // Set dashboard metrics
        setDashboardMetrics(metrics);
        setShiftExpiryNotifications(shiftExpiry);
        setPendingApprovalsEscalation(pendingEscalation);
        setMissingPunchAlerts(missingPunches);
        setSystemSyncStatus(syncStatus);

        // Determine upcoming shift for current user (if any)
        const myAssignment = (assignments || []).find((a: any) => String(a.employeeId) === String(user?.employeeProfileId));
        setUpcomingShift(myAssignment || null);

        // Simple recent activity feed: latest punches + exceptions
        const recentPunches = (records || []).slice(-5).map((r: any) => ({
          type: 'punch',
          employeeId: formatEmployeeName(r.employeeId),
          punches: r.punches,
          time: r.createdAt,
        }));

        const recentExceptions = (exceptions || []).slice(-5).map((e: any) => ({
          type: 'exception',
          employeeId: formatEmployeeName(e.employeeId),
          status: e.status,
          time: e.createdAt,
        }));

        setRecentActivities([...recentPunches, ...recentExceptions].slice(-10).reverse());

        // Alerts: missed punches (records with hasMissedPunch) and expiring assignments
        const missedPunchAlerts = (records || []).filter((r: any) => r.hasMissedPunch).map((r: any)=>({
          kind: 'missed-punch',
          message: `Missed punch for ${formatEmployeeName(r.employeeId)}`,
          id: r._id
        }));

        const shiftExpiryAlerts = (assignments || []).filter((a: any) => {
          if (!a.endDate) return false;
          const daysLeft = (new Date(a.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return daysLeft > 0 && daysLeft <= 7;
        }).map((a: any)=>({
          kind: 'shift-expiry',
          message: `Assignment for ${a.employeeId} ends ${a.endDate}`,
          id: a._id,
          expiresInDays: Math.ceil((new Date(a.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        }));

        const managerPendingApprovals = isManager ? [{ kind: 'approval', message: `${pendingExceptionsCount} pending time exceptions`, id: 'pending-approvals' }] : [];

        const newAlerts = [...shiftExpiryAlerts, ...missedPunchAlerts, ...managerPendingApprovals];
        setAlerts(newAlerts);
        // toast for any newly arrived alert IDs
        const prevIds = prevAlertsRef.current || [];
        const newIds = newAlerts.map(a=>a.id || a.message);
        const added = newIds.filter(id => !prevIds.includes(id));
        for (const id of added) {
          const a = newAlerts.find(x => (x.id || x.message) === id);
          if (a) {
            if (a.kind === 'shift-expiry') {
              toast({ title: 'Shift expiring', description: a.message });
            } else if (a.kind === 'missed-punch') {
              toast({ title: 'Missed punch', description: a.message, variant: 'destructive' });
            } else if (a.kind === 'approval') {
              toast({ title: 'Pending approvals', description: a.message });
            } else {
              toast({ title: 'Alert', description: a.message });
            }
          }
        }
        prevAlertsRef.current = newIds;
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load time management dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, 30_000);
    return () => { mounted = false; clearInterval(id); };
  }, [user, isManager]);

  const handleBulkRenewShifts = async (shiftIds: string[], daysToExtend: number = 30) => {
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + daysToExtend);

    try {
      await timeManagementService.bulkRenewShifts(shiftIds, newEndDate.toISOString().split('T')[0]);
      toast({ title: 'Success', description: `Successfully renewed ${shiftIds.length} shift assignments` });

      // Reload shift expiry notifications
      const updatedShiftExpiry = await timeManagementService.getShiftExpiryNotifications();
      setShiftExpiryNotifications(updatedShiftExpiry);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to renew shifts', variant: 'destructive' });
    }
  };

  const statsMemo = useMemo(() => ({
    shifts: 0,
    assignments: 0,
    records: todayRecords?.length || 0,
  }), [todayRecords]);

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6 bg-gray-50 min-h-full max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-2">
              <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">← Back to Dashboard</Link>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Time Management
              {employeeId && employeeId !== user?.employeeProfileId && <span className="text-sm font-normal ml-2">- Employee View</span>}
            </h1>
            <p className="text-sm text-gray-500">
              {employeeId && employeeId !== user?.employeeProfileId ? 'Viewing employee time management data' : 'Overview & quick actions'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/time-management/attendance" className="btn">My Attendance</Link>
            <Link href="/time-management/shifts" className="btn">Manage Shifts</Link>
          </div>
        </div>

        {/* Key Metrics & Alerts Dashboard */}
        <section className="mb-6 space-y-6">
          {/* Today's Attendance Overview */}
          {dashboardMetrics && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Today's Attendance Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{dashboardMetrics.totalEmployees}</div>
                  <div className="text-sm text-gray-600">Total Employees</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{dashboardMetrics.clockedInToday}</div>
                  <div className="text-sm text-gray-600">Clocked In</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{dashboardMetrics.totalEmployees - dashboardMetrics.clockedInToday}</div>
                  <div className="text-sm text-gray-600">Not Yet Clocked In</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{dashboardMetrics.onLeaveToday}</div>
                  <div className="text-sm text-gray-600">On Leave</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{dashboardMetrics.pendingExceptions}</div>
                  <div className="text-sm text-gray-600">Pending Exceptions</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{dashboardMetrics.attendanceRate}%</div>
                  <div className="text-sm text-gray-600">Attendance Rate</div>
                </div>
              </div>
            </div>
          )}

          {/* High Priority Alerts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shift Expiry Notifications */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 bg-red-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-800 flex items-center">
                  <span className="mr-2">🚨</span> Shift Expiry Notifications
                </h3>
                {shiftExpiryNotifications?.totalExpiring > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    {shiftExpiryNotifications.totalExpiring} expiring
                  </span>
                )}
              </div>

              {shiftExpiryNotifications ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-red-100 rounded">
                      <div className="font-bold text-red-700">{shiftExpiryNotifications.urgentCount}</div>
                      <div className="text-xs">Urgent (≤7 days)</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-100 rounded">
                      <div className="font-bold text-yellow-700">{shiftExpiryNotifications.soonCount}</div>
                      <div className="text-xs">Soon (8-14 days)</div>
                    </div>
                    <div className="text-center p-2 bg-blue-100 rounded">
                      <div className="font-bold text-blue-700">{shiftExpiryNotifications.upcomingCount}</div>
                      <div className="text-xs">Upcoming (15+ days)</div>
                    </div>
                  </div>

                  {shiftExpiryNotifications.notifications.urgent.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium text-red-700 mb-2">Urgent Expirations:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {shiftExpiryNotifications.notifications.urgent.slice(0, 3).map((notification: any) => (
                          <div key={notification.id} className="text-xs p-2 bg-white rounded border">
                            <div className="font-medium">{notification.employeeName}</div>
                            <div className="text-gray-600">{notification.shiftName} - {notification.department}</div>
                            <div className="text-red-600">Expires in {notification.daysUntilExpiry} days</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-gray-600">
                      {shiftExpiryNotifications.summary.employeesAffected} employees affected across {shiftExpiryNotifications.summary.departmentsAffected} departments
                    </div>
                    {shiftExpiryNotifications.totalExpiring > 0 && (
                      <button
                        onClick={() => handleBulkRenewShifts(shiftExpiryNotifications.notifications.urgent.map((n: any) => n.id), 30)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Renew All Urgent
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">Loading shift expiry data...</div>
              )}
            </div>

            {/* Pending Approvals Requiring Escalation */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-200 bg-orange-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-800 flex items-center">
                  <span className="mr-2">⚠️</span> Pending Approvals Escalation
                </h3>
                {pendingApprovalsEscalation?.requiringEscalation > 0 && (
                  <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                    {pendingApprovalsEscalation.requiringEscalation} requiring action
                  </span>
                )}
              </div>

              {pendingApprovalsEscalation ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded border">
                      <div className="text-xl font-bold text-orange-600">{pendingApprovalsEscalation.totalPending}</div>
                      <div className="text-xs text-gray-600">Total Pending</div>
                    </div>
                    <div className="text-center p-3 bg-red-100 rounded border">
                      <div className="text-xl font-bold text-red-600">{pendingApprovalsEscalation.requiringEscalation}</div>
                      <div className="text-xs text-gray-600">Requiring Escalation</div>
                    </div>
                  </div>

                  {pendingApprovalsEscalation.daysUntilPayrollClosure && (
                    <div className="p-3 bg-yellow-100 rounded border">
                      <div className="text-sm font-medium text-yellow-800">
                        {pendingApprovalsEscalation.daysUntilPayrollClosure} days until payroll closure
                      </div>
                      <div className="text-xs text-yellow-700">
                        Escalation threshold: {pendingApprovalsEscalation.escalationThresholdHours} hours
                      </div>
                    </div>
                  )}

                  {pendingApprovalsEscalation.exceptions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-orange-700 mb-2">Overdue Approvals:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {pendingApprovalsEscalation.exceptions.slice(0, 3).map((exception: any) => (
                          <div key={exception.id} className="text-xs p-2 bg-white rounded border">
                            <div className="font-medium">{exception.employeeName}</div>
                            <div className="text-gray-600">{exception.type} - Pending {exception.daysPending} days</div>
                            <div className="text-orange-600">Assigned to: {exception.assignedTo}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pendingApprovalsEscalation.requiringEscalation > 0 && (
                    <div className="pt-2 border-t">
                      <Link
                        href="/time-management/exceptions/approvals"
                        className="w-full block text-center px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                      >
                        Review Pending Approvals
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">Loading escalation data...</div>
              )}
            </div>
          </div>

          {/* Secondary Alerts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Missing Punch Alerts Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
                  <span className="mr-2">👤</span> Missing Punch Alerts
                </h3>
                {missingPunchAlerts?.totalMissing > 0 && (
                  <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                    {missingPunchAlerts.totalMissing} missing
                  </span>
                )}
              </div>

              {missingPunchAlerts ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-xl font-bold text-yellow-600">{missingPunchAlerts.totalMissing}</div>
                      <div className="text-xs">Total Missing</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-xl font-bold text-green-600">{missingPunchAlerts.expectedEmployees}</div>
                      <div className="text-xs">Expected Today</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-xl font-bold text-blue-600">{missingPunchAlerts.attendanceRate}%</div>
                      <div className="text-xs">Attendance Rate</div>
                    </div>
                  </div>

                  {missingPunchAlerts.topMissingDepartments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-700 mb-2">Top Missing by Department:</h4>
                      <div className="space-y-2">
                        {missingPunchAlerts.topMissingDepartments.map((dept: any, index: number) => (
                          <div key={dept.department} className="flex justify-between items-center text-sm p-2 bg-white rounded border">
                            <span>{index + 1}. {dept.department}</span>
                            <span className="font-medium text-yellow-600">{dept.count} missing</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <Link
                      href="/time-management/attendance"
                      className="w-full block text-center px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                    >
                      View Attendance Records
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">Loading missing punch data...</div>
              )}
            </div>

            {/* System Sync Status */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <span className="mr-2">🔄</span> System Sync Status
                </h3>
                {systemSyncStatus && (
                  <div className={`w-3 h-3 rounded-full ${
                    systemSyncStatus.overallHealth === 'green' ? 'bg-green-500' :
                    systemSyncStatus.overallHealth === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                )}
              </div>

              {systemSyncStatus ? (
                <div className="space-y-4">
                  {/* Payroll Sync */}
                  <div className="p-3 bg-white rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">Payroll System</span>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        systemSyncStatus.payrollSync.health.color === 'green' ? 'bg-green-100 text-green-800' :
                        systemSyncStatus.payrollSync.health.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {systemSyncStatus.payrollSync.health.status}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Last sync: {systemSyncStatus.payrollSync.lastSync ?
                        formatDistanceToNow(new Date(systemSyncStatus.payrollSync.lastSync), { addSuffix: true }) :
                        'Never'}</div>
                      <div>Records processed: {systemSyncStatus.payrollSync.recordsProcessed}</div>
                      <div>Frequency: {systemSyncStatus.payrollSync.frequency}</div>
                    </div>
                  </div>

                  {/* Leave Management Sync */}
                  <div className="p-3 bg-white rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">Leave Management</span>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        systemSyncStatus.leaveSync.health.color === 'green' ? 'bg-green-100 text-green-800' :
                        systemSyncStatus.leaveSync.health.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {systemSyncStatus.leaveSync.health.status}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Last sync: {systemSyncStatus.leaveSync.lastSync ?
                        formatDistanceToNow(new Date(systemSyncStatus.leaveSync.lastSync), { addSuffix: true }) :
                        'Never'}</div>
                      <div>Records processed: {systemSyncStatus.leaveSync.recordsProcessed}</div>
                      <div>Frequency: {systemSyncStatus.leaveSync.frequency}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <Link
                      href="/time-management/integrations"
                      className="w-full block text-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Manage Integrations
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">Loading sync status...</div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions & Legacy Stats */}
        <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-2">Clock In / Out</div>
                <div><ClockInOutWidget employeeId={String(user?.employeeProfileId)} /></div>
              </div>
              <div>
                <Link href="/time-management/attendance/corrections" className="text-blue-600 hover:underline">Request Correction</Link>
              </div>
              <div>
                <Link href="/time-management/schedules" className="text-blue-600 hover:underline">View My Schedule</Link>
              </div>
            </div>
          </div>

          {/* Today's detailed stats */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium mb-3">Today's Detailed Stats</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">Attendance records: <span className="font-medium">{todayRecords.length}</span></div>
              <div className="p-2 bg-gray-50 rounded">Hours worked: <span className="font-medium">{Math.floor(totalMinutesToday/60)}h {totalMinutesToday%60}m</span></div>
              <div className="p-2 bg-gray-50 rounded">Pending exceptions: <span className="font-medium">{pendingExceptionsCount}</span></div>
              <div className="p-2 bg-gray-50 rounded">My next shift: <span className="font-medium">{upcomingShift ? 'Scheduled' : 'None'}</span></div>
              {isAdmin && payrollSyncStatus && (
                <div className="p-2 bg-white rounded border text-sm col-span-2">
                  Payroll sync status: <span className="font-medium">{payrollSyncStatus.status}</span>
                  {payrollSyncStatus.lastSync && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({formatDistanceToNow(new Date(payrollSyncStatus.lastSync), { addSuffix: true })})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main content: Recent Activity + Feed */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <div className="text-sm text-gray-500">Latest events</div>
            </div>
            <div className="space-y-2">
              {recentActivities.length === 0 && <div className="text-sm text-gray-600">No recent activity</div>}
              {recentActivities.map((ev:any, idx:number) => (
                <div key={idx} className="p-3 border rounded hover:bg-gray-50">
                  <div className="text-sm font-medium">
                    {ev.type === 'punch' ? `Punch: ${formatEmployeeName(ev.employeeId)}` : `Exception: ${formatEmployeeName(ev.employeeId)}`}
                  </div>
                  <div className="text-xs text-gray-500">{ev.time ? new Date(ev.time).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: Attendance table or quick links */}
          <aside className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-3">Today - Attendance</h3>
            <AttendanceRecordTable records={todayRecords} />

            {isManager && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Quick Links (Manager)</h4>
                <Link href="/time-management/shifts" className="block text-blue-600 hover:underline">Manage Shifts</Link>
                <Link href="/time-management/policies" className="block text-blue-600 hover:underline">Configure Policies</Link>
                <Link href="/time-management/reports" className="block text-blue-600 hover:underline">View Reports</Link>
              </div>
            )}
          </aside>
        </section>
      </div>
    </RoleGuard>
  );
}
