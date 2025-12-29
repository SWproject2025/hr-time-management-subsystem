'use client';
import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useToast } from '@/hooks/use-toast';

interface ApprovalWorkflow {
  _id?: string;
  exceptionType: 'ATTENDANCE_CORRECTION' | 'OVERTIME_REQUEST' | 'TIME_EXCEPTION' | 'LEAVE_REQUEST';
  approvalChain: string[]; // Array of role IDs in approval order
  autoEscalateAfter: number; // hours
  escalateToRole: string;
  autoApproveConditions?: {
    amount?: number; // For overtime, max auto-approve hours
    duration?: number; // For leave, max auto-approve days
    enabled: boolean;
  };
  notifications: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
    notifyOnSubmission: boolean;
    notifyOnApproval: boolean;
    notifyOnRejection: boolean;
    notifyOnEscalation: boolean;
  };
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Role {
  _id: string;
  name: string;
  displayName: string;
}

const EXCEPTION_TYPES = [
  { key: 'ATTENDANCE_CORRECTION', label: 'Attendance Correction', icon: '📝' },
  { key: 'OVERTIME_REQUEST', label: 'Overtime Request', icon: '⏰' },
  { key: 'TIME_EXCEPTION', label: 'Time Exception', icon: '⚠️' },
  { key: 'LEAVE_REQUEST', label: 'Leave Request', icon: '🏖️' }
];

const AVAILABLE_ROLES = [
  { _id: 'LINE_MANAGER', name: 'Line Manager', displayName: 'Line Manager' },
  { _id: 'DEPARTMENT_HEAD', name: 'Department Head', displayName: 'Department Head' },
  { _id: 'HR_ADMIN', name: 'HR Administrator', displayName: 'HR Administrator' },
  { _id: 'HR_MANAGER', name: 'HR Manager', displayName: 'HR Manager' },
  { _id: 'SYSTEM_ADMIN', name: 'System Administrator', displayName: 'System Administrator' }
];

export default function ExceptionApprovalWorkflowConfiguration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [selectedExceptionType, setSelectedExceptionType] = useState<string>('ATTENDANCE_CORRECTION');
  const [currentWorkflow, setCurrentWorkflow] = useState<ApprovalWorkflow | null>(null);

  // Form state
  const [formData, setFormData] = useState<ApprovalWorkflow>({
    exceptionType: 'ATTENDANCE_CORRECTION',
    approvalChain: ['LINE_MANAGER', 'HR_ADMIN'],
    autoEscalateAfter: 48,
    escalateToRole: 'HR_MANAGER',
    autoApproveConditions: {
      amount: 2, // 2 hours overtime
      duration: 1, // 1 day leave
      enabled: false
    },
    notifications: {
      email: true,
      inApp: true,
      sms: false,
      notifyOnSubmission: true,
      notifyOnApproval: true,
      notifyOnRejection: true,
      notifyOnEscalation: true
    },
    active: true
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    // Load workflow for selected exception type
    const workflow = workflows.find(w => w.exceptionType === selectedExceptionType);
    if (workflow) {
      setCurrentWorkflow(workflow);
      setFormData({
        ...workflow,
        autoApproveConditions: workflow.autoApproveConditions || {
          amount: 2,
          duration: 1,
          enabled: false
        }
      });
    } else {
      // Create default workflow for this type
      const defaultWorkflow: ApprovalWorkflow = {
        exceptionType: selectedExceptionType as any,
        approvalChain: ['LINE_MANAGER', 'HR_ADMIN'],
        autoEscalateAfter: 48,
        escalateToRole: 'HR_MANAGER',
        autoApproveConditions: {
          amount: selectedExceptionType === 'OVERTIME_REQUEST' ? 2 : undefined,
          duration: selectedExceptionType === 'LEAVE_REQUEST' ? 1 : undefined,
          enabled: false
        },
        notifications: {
          email: true,
          inApp: true,
          sms: false,
          notifyOnSubmission: true,
          notifyOnApproval: true,
          notifyOnRejection: true,
          notifyOnEscalation: true
        },
        active: true
      };
      setCurrentWorkflow(null);
      setFormData(defaultWorkflow);
    }
  }, [selectedExceptionType, workflows]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await timeManagementService.getApprovalWorkflows();
      setWorkflows(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load approval workflows',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async () => {
    try {
      setSaving(true);
      if (currentWorkflow) {
        // Update existing
        await timeManagementService.updateApprovalWorkflow(currentWorkflow._id!, formData);
        toast({
          title: 'Success',
          description: 'Approval workflow updated successfully'
        });
      } else {
        // Create new
        await timeManagementService.createApprovalWorkflow(formData);
        toast({
          title: 'Success',
          description: 'Approval workflow created successfully'
        });
      }
      await loadWorkflows();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save approval workflow',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this workflow? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await timeManagementService.deleteApprovalWorkflow(workflowId);
      toast({
        title: 'Success',
        description: 'Workflow deleted successfully'
      });

      await loadWorkflows();

      // Clear current workflow if it was deleted
      if (currentWorkflow && currentWorkflow._id === workflowId) {
        setCurrentWorkflow(null);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete workflow',
        variant: 'destructive'
      });
    }
  };

  const addToApprovalChain = (roleId: string) => {
    if (!formData.approvalChain.includes(roleId)) {
      setFormData({
        ...formData,
        approvalChain: [...formData.approvalChain, roleId]
      });
    }
  };

  const removeFromApprovalChain = (roleId: string) => {
    setFormData({
      ...formData,
      approvalChain: formData.approvalChain.filter(id => id !== roleId)
    });
  };

  const moveInChain = (index: number, direction: 'up' | 'down') => {
    const newChain = [...formData.approvalChain];
    if (direction === 'up' && index > 0) {
      [newChain[index], newChain[index - 1]] = [newChain[index - 1], newChain[index]];
    } else if (direction === 'down' && index < newChain.length - 1) {
      [newChain[index], newChain[index + 1]] = [newChain[index + 1], newChain[index]];
    }
    setFormData({ ...formData, approvalChain: newChain });
  };

  const updateNotification = (key: keyof ApprovalWorkflow['notifications'], value: boolean) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [key]: value
      }
    });
  };

  const getRoleDisplayName = (roleId: string) => {
    const role = AVAILABLE_ROLES.find(r => r._id === roleId);
    return role ? role.displayName : roleId;
  };

  const getExceptionTypeInfo = (type: string) => {
    return EXCEPTION_TYPES.find(t => t.key === type) || EXCEPTION_TYPES[0];
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
      <div className="p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Exception & Approval Workflow Configuration</h1>
          <p className="text-gray-600 mt-1">Configure approval workflows, escalation rules, and notifications for different exception types</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exception Type Selector */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Exception Types</h2>
            <div className="space-y-2">
              {EXCEPTION_TYPES.map(type => {
                const workflow = workflows.find(w => w.exceptionType === type.key);
                const isConfigured = !!workflow;
                const isActive = workflow?.active;

                return (
                  <button
                    key={type.key}
                    onClick={() => setSelectedExceptionType(type.key)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      selectedExceptionType === type.key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{type.icon}</span>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">
                            {isConfigured ? (isActive ? 'Active' : 'Inactive') : 'Not configured'}
                          </div>
                        </div>
                      </div>
                      {isConfigured && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isActive ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Exception Type Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">
                  {getExceptionTypeInfo(selectedExceptionType).icon}
                </span>
                <div>
                  <h2 className="text-lg font-semibold">
                    {getExceptionTypeInfo(selectedExceptionType).label} Workflow
                  </h2>
                  <p className="text-sm text-gray-600">
                    Configure approval chain and escalation rules
                  </p>
                </div>
              </div>

              {/* Approval Chain Configuration */}
              <div className="space-y-4">
                <h3 className="font-medium">Approval Chain</h3>
                <div className="space-y-2">
                  {formData.approvalChain.map((roleId, index) => (
                    <div key={roleId} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <span className="flex-1 font-medium">
                        {index + 1}. {getRoleDisplayName(roleId)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveInChain(index, 'up')}
                          disabled={index === 0}
                          className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveInChain(index, 'down')}
                          disabled={index === formData.approvalChain.length - 1}
                          className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeFromApprovalChain(roleId)}
                          className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded hover:bg-red-300"
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Role to Chain */}
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    onChange={(e) => {
                      if (e.target.value) {
                        addToApprovalChain(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Add role to approval chain...</option>
                    {AVAILABLE_ROLES
                      .filter(role => !formData.approvalChain.includes(role._id))
                      .map(role => (
                        <option key={role._id} value={role._id}>
                          {role.displayName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Escalation Rules */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium mb-4">Escalation Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-escalate after (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.autoEscalateAfter}
                    onChange={(e) => setFormData({
                      ...formData,
                      autoEscalateAfter: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="168"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escalate to role
                  </label>
                  <select
                    value={formData.escalateToRole}
                    onChange={(e) => setFormData({
                      ...formData,
                      escalateToRole: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {AVAILABLE_ROLES.map(role => (
                      <option key={role._id} value={role._id}>
                        {role.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Auto-Approval Conditions */}
            {(selectedExceptionType === 'OVERTIME_REQUEST' || selectedExceptionType === 'LEAVE_REQUEST') && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-medium mb-4">Auto-Approval Conditions</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="auto-approve-enabled"
                      checked={formData.autoApproveConditions?.enabled || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        autoApproveConditions: {
                          ...formData.autoApproveConditions!,
                          enabled: e.target.checked
                        }
                      })}
                      className="h-4 w-4"
                    />
                    <label htmlFor="auto-approve-enabled" className="font-medium cursor-pointer">
                      Enable auto-approval for small requests
                    </label>
                  </div>

                  {formData.autoApproveConditions?.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                      {selectedExceptionType === 'OVERTIME_REQUEST' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max overtime hours for auto-approval
                          </label>
                          <input
                            type="number"
                            value={formData.autoApproveConditions?.amount || 2}
                            onChange={(e) => setFormData({
                              ...formData,
                              autoApproveConditions: {
                                ...formData.autoApproveConditions!,
                                amount: Number(e.target.value)
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.5"
                          />
                        </div>
                      )}

                      {selectedExceptionType === 'LEAVE_REQUEST' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max leave days for auto-approval
                          </label>
                          <input
                            type="number"
                            value={formData.autoApproveConditions?.duration || 1}
                            onChange={(e) => setFormData({
                              ...formData,
                              autoApproveConditions: {
                                ...formData.autoApproveConditions!,
                                duration: Number(e.target.value)
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.5"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium mb-4">Notification Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notification Methods */}
                <div>
                  <h4 className="font-medium mb-3">Notification Methods</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'email', label: 'Email Notifications' },
                      { key: 'inApp', label: 'In-App Notifications' },
                      { key: 'sms', label: 'SMS Notifications' }
                    ].map(method => (
                      <label key={method.key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.notifications[method.key as keyof typeof formData.notifications] as boolean}
                          onChange={(e) => updateNotification(method.key as keyof typeof formData.notifications, e.target.checked)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notification Events */}
                <div>
                  <h4 className="font-medium mb-3">Notify On</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'notifyOnSubmission', label: 'Request Submission' },
                      { key: 'notifyOnApproval', label: 'Approval' },
                      { key: 'notifyOnRejection', label: 'Rejection' },
                      { key: 'notifyOnEscalation', label: 'Escalation' }
                    ].map(event => (
                      <label key={event.key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.notifications[event.key as keyof typeof formData.notifications] as boolean}
                          onChange={(e) => updateNotification(event.key as keyof typeof formData.notifications, e.target.checked)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{event.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Configuration */}
            <div className="flex justify-end gap-3">
              <button
                onClick={loadWorkflows}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Reset Changes
              </button>
              <button
                onClick={handleSaveWorkflow}
                disabled={saving || formData.approvalChain.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : currentWorkflow ? 'Update Workflow' : 'Create Workflow'}
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Summary */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Workflow Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {EXCEPTION_TYPES.map(type => {
              const workflow = workflows.find(w => w.exceptionType === type.key);
              const hasWorkflow = !!workflow;
              const isActive = workflow?.active;
              const chainLength = workflow?.approvalChain?.length || 0;

              return (
                <div key={type.key} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{type.icon}</span>
                      <span className="font-medium text-sm">{type.label}</span>
                    </div>
                    {hasWorkflow && (
                      <button
                        onClick={() => handleDeleteWorkflow(workflow._id!)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Delete workflow"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Status: {hasWorkflow ? (isActive ? 'Active' : 'Inactive') : 'Not configured'}</div>
                    {hasWorkflow && <div>Approval steps: {chainLength}</div>}
                    {workflow?.autoApproveConditions?.enabled && (
                      <div>Auto-approval: Enabled</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
