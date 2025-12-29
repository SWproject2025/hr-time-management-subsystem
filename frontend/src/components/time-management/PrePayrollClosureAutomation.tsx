'use client';
import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow, addHours } from 'date-fns';

interface PayrollClosureConfig {
  _id?: string;
  payrollCycleEnd: Date;
  autoEscalationHours: number;
  escalateToRole: string;
  escalateToPerson?: string;
  closureChecklist: {
    attendanceValidated: boolean;
    overtimeProcessed: boolean;
    correctionsApplied: boolean;
    exceptionsResolved: boolean;
    shiftsConfirmed: boolean;
  };
  notificationsEnabled: boolean;
  autoClosureEnabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PendingApproval {
  _id: string;
  type: 'OVERTIME' | 'TIME_EXCEPTION' | 'ATTENDANCE_CORRECTION' | 'LEAVE_REQUEST';
  employeeName: string;
  submittedDate: Date;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  escalated: boolean;
  escalationDue: Date;
}

interface ValidationStatus {
  attendanceValidated: boolean;
  overtimeProcessed: boolean;
  correctionsApplied: boolean;
  exceptionsResolved: boolean;
  shiftsConfirmed: boolean;
  pendingItemsCount: number;
  totalItems: number;
}

export default function PrePayrollClosureAutomation() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [closureConfig, setClosureConfig] = useState<PayrollClosureConfig>({
    payrollCycleEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    autoEscalationHours: 48,
    escalateToRole: 'MANAGER',
    escalateToPerson: '',
    closureChecklist: {
      attendanceValidated: false,
      overtimeProcessed: false,
      correctionsApplied: false,
      exceptionsResolved: false,
      shiftsConfirmed: false,
    },
    notificationsEnabled: true,
    autoClosureEnabled: false,
  });

  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    attendanceValidated: false,
    overtimeProcessed: false,
    correctionsApplied: false,
    exceptionsResolved: false,
    shiftsConfirmed: false,
    pendingItemsCount: 0,
    totalItems: 0,
  });

  const [escalating, setEscalating] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [config, approvals, validation] = await Promise.all([
        timeManagementService.getPayrollClosureConfig(),
        timeManagementService.getPendingPayrollApprovals(),
        timeManagementService.getPayrollValidationStatus()
      ]);

      if (config) {
        setClosureConfig({
          ...config,
          payrollCycleEnd: new Date(config.payrollCycleEnd),
        });
      }

      setPendingApprovals(approvals || []);
      setValidationStatus(validation || {
        attendanceValidated: false,
        overtimeProcessed: false,
        correctionsApplied: false,
        exceptionsResolved: false,
        shiftsConfirmed: false,
        pendingItemsCount: 0,
        totalItems: 0,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load payroll closure data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      await timeManagementService.updatePayrollClosureConfig(closureConfig);
      toast({
        title: 'Success',
        description: 'Payroll closure configuration saved successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleForceEscalate = async () => {
    if (!confirm('Are you sure you want to force escalate all pending approvals? This action cannot be undone.')) {
      return;
    }

    try {
      setEscalating(true);
      await timeManagementService.forceEscalatePendingApprovals();
      toast({
        title: 'Success',
        description: 'All pending approvals have been escalated'
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to escalate pending approvals',
        variant: 'destructive'
      });
    } finally {
      setEscalating(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const report = await timeManagementService.generatePrePayrollReport();

      // Create and download the report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pre-payroll-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Pre-payroll report generated and downloaded'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to generate pre-payroll report',
        variant: 'destructive'
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const toggleChecklistItem = (item: keyof PayrollClosureConfig['closureChecklist']) => {
    setClosureConfig(prev => ({
      ...prev,
      closureChecklist: {
        ...prev.closureChecklist,
        [item]: !prev.closureChecklist[item]
      }
    }));
  };

  const daysUntilClosure = Math.ceil((new Date(closureConfig.payrollCycleEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const overdueApprovals = pendingApprovals.filter(approval =>
    new Date(approval.escalationDue).getTime() < Date.now()
  );

  const getChecklistIcon = (checked: boolean) => {
    return checked ? '✅' : '⏳';
  };

  const getApprovalTypeColor = (type: string) => {
    switch (type) {
      case 'OVERTIME': return 'bg-blue-100 text-blue-800';
      case 'TIME_EXCEPTION': return 'bg-red-100 text-red-800';
      case 'ATTENDANCE_CORRECTION': return 'bg-yellow-100 text-yellow-800';
      case 'LEAVE_REQUEST': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold">Pre-Payroll Closure Automation</h1>
          <p className="text-gray-600 mt-1">Monitor and automate the pre-payroll closure process</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals Monitor */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Pending Approvals Monitor</h2>

            <div className="space-y-4">
              {/* Days until closure */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900">Days until payroll closure</h3>
                    <p className="text-2xl font-bold text-blue-600">{Math.max(0, daysUntilClosure)}</p>
                    <p className="text-sm text-blue-700">
                      {format(new Date(closureConfig.payrollCycleEnd), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className={`text-4xl ${daysUntilClosure <= 2 ? 'text-red-500' : 'text-blue-500'}`}>
                    {daysUntilClosure <= 2 ? '⚠️' : '📅'}
                  </div>
                </div>
              </div>

              {/* Pending approvals count */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-orange-900">Pending time-related approvals</h3>
                    <p className="text-2xl font-bold text-orange-600">{pendingApprovals.length}</p>
                    <p className="text-sm text-orange-700">
                      {overdueApprovals.length} overdue for escalation
                    </p>
                  </div>
                  <div className="text-4xl text-orange-500">⏰</div>
                </div>
              </div>

              {/* Auto-escalation rules */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-3">Auto-escalation Rules</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Escalate after:</span>
                    <input
                      type="number"
                      value={closureConfig.autoEscalationHours}
                      onChange={(e) => setClosureConfig({
                        ...closureConfig,
                        autoEscalationHours: Number(e.target.value)
                      })}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      min="1"
                      max="168"
                    />
                    <span className="text-sm text-gray-600">hours</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Escalate to:</span>
                    <select
                      value={closureConfig.escalateToRole}
                      onChange={(e) => setClosureConfig({
                        ...closureConfig,
                        escalateToRole: e.target.value
                      })}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="MANAGER">Manager</option>
                      <option value="HR">HR</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  {closureConfig.escalateToRole === 'PERSON' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Specific person:</span>
                      <input
                        type="text"
                        value={closureConfig.escalateToPerson || ''}
                        onChange={(e) => setClosureConfig({
                          ...closureConfig,
                          escalateToPerson: e.target.value
                        })}
                        placeholder="Enter name or email"
                        className="px-2 py-1 border border-gray-300 rounded text-sm flex-1 ml-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Force escalate button */}
              <div className="pt-4">
                <button
                  onClick={handleForceEscalate}
                  disabled={escalating || pendingApprovals.length === 0}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {escalating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Escalating...
                    </>
                  ) : (
                    <>🚨 Force Escalate Now</>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Emergency override for all pending approvals
                </p>
              </div>
            </div>
          </div>

          {/* Data Validation Checklist */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Data Validation Checklist</h2>

            <div className="space-y-4">
              {/* Checklist items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getChecklistIcon(validationStatus.attendanceValidated)}</span>
                    <span className="font-medium">All attendance records validated</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={closureConfig.closureChecklist.attendanceValidated}
                    onChange={() => toggleChecklistItem('attendanceValidated')}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getChecklistIcon(validationStatus.overtimeProcessed)}</span>
                    <span className="font-medium">All overtime requests processed</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={closureConfig.closureChecklist.overtimeProcessed}
                    onChange={() => toggleChecklistItem('overtimeProcessed')}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getChecklistIcon(validationStatus.correctionsApplied)}</span>
                    <span className="font-medium">All corrections applied</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={closureConfig.closureChecklist.correctionsApplied}
                    onChange={() => toggleChecklistItem('correctionsApplied')}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getChecklistIcon(validationStatus.exceptionsResolved)}</span>
                    <span className="font-medium">All exceptions resolved</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={closureConfig.closureChecklist.exceptionsResolved}
                    onChange={() => toggleChecklistItem('exceptionsResolved')}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getChecklistIcon(validationStatus.shiftsConfirmed)}</span>
                    <span className="font-medium">All shifts confirmed</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={closureConfig.closureChecklist.shiftsConfirmed}
                    onChange={() => toggleChecklistItem('shiftsConfirmed')}
                    className="h-4 w-4"
                  />
                </div>
              </div>

              {/* Status summary */}
              <div className={`p-4 rounded-lg ${
                validationStatus.pendingItemsCount === 0
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {validationStatus.pendingItemsCount === 0 ? '✅' : '⚠️'}
                  </span>
                  <div>
                    <p className="font-medium">
                      {validationStatus.pendingItemsCount === 0
                        ? 'All validations complete!'
                        : `${validationStatus.pendingItemsCount} pending items require attention`
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      {validationStatus.totalItems} total items processed
                    </p>
                  </div>
                </div>
              </div>

              {/* Generate report button */}
              <div className="pt-4">
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {generatingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>📊 Generate Pre-Payroll Report</>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Download comprehensive validation report
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals List */}
        {pendingApprovals.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Escalation Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingApprovals.map(approval => (
                    <tr key={approval._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getApprovalTypeColor(approval.type)}`}>
                          {approval.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {approval.employeeName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {approval.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(approval.submittedDate), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${
                          new Date(approval.escalationDue).getTime() < Date.now()
                            ? 'text-red-600 font-medium'
                            : 'text-gray-500'
                        }`}>
                          {format(new Date(approval.escalationDue), 'MMM d, h:mm a')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          approval.escalated
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {approval.escalated ? 'Escalated' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Configuration Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={loadData}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Refresh Data
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </RoleGuard>
  );
}
