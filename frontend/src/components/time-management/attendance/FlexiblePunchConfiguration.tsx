'use client';
import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useToast } from '@/hooks/use-toast';

interface FlexiblePunchConfig {
  punchMethods: 'WEB' | 'MOBILE' | 'BOTH';
  geolocationRequired: boolean;
  geolocationRadius: number; // meters
  editingPermissions: {
    canEditOwn: boolean;
    canEditTeam: boolean;
    canEditAll: boolean;
    managers: boolean;
    hr: boolean;
    admin: boolean;
  };
  gracePeriodMinutes: number;
  allowLateCorrections: boolean;
  maxCorrectionDays: number;
  requireApprovalForCorrections: boolean;
  notifyOnCorrections: boolean;
  effectiveFrom: string;
}

export default function FlexiblePunchConfiguration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<FlexiblePunchConfig>({
    punchMethods: 'BOTH',
    geolocationRequired: false,
    geolocationRadius: 100,
    editingPermissions: {
      canEditOwn: true,
      canEditTeam: false,
      canEditAll: false,
      managers: true,
      hr: true,
      admin: true,
    },
    gracePeriodMinutes: 15,
    allowLateCorrections: true,
    maxCorrectionDays: 7,
    requireApprovalForCorrections: true,
    notifyOnCorrections: true,
    effectiveFrom: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadFlexiblePunchConfig();
  }, []);

  const loadFlexiblePunchConfig = async () => {
    try {
      setLoading(true);
      const data = await timeManagementService.getFlexiblePunchConfig();
      if (data) {
        setConfig({
          punchMethods: data.punchMethods || 'BOTH',
          geolocationRequired: data.geolocationRequired || false,
          geolocationRadius: data.geolocationRadius || 100,
          editingPermissions: {
            canEditOwn: data.editingPermissions?.canEditOwn ?? true,
            canEditTeam: data.editingPermissions?.canEditTeam ?? false,
            canEditAll: data.editingPermissions?.canEditAll ?? false,
            managers: data.editingPermissions?.managers ?? true,
            hr: data.editingPermissions?.hr ?? true,
            admin: data.editingPermissions?.admin ?? true,
          },
          gracePeriodMinutes: data.gracePeriodMinutes || 15,
          allowLateCorrections: data.allowLateCorrections ?? true,
          maxCorrectionDays: data.maxCorrectionDays || 7,
          requireApprovalForCorrections: data.requireApprovalForCorrections ?? true,
          notifyOnCorrections: data.notifyOnCorrections ?? true,
          effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load flexible punch configuration',
        variant: 'destructive'
      });
      // Use defaults on error
    } finally {
      setLoading(false);
    }
  };

  const saveFlexiblePunchConfig = async () => {
    try {
      setSaving(true);
      await timeManagementService.updateFlexiblePunchConfig(config);
      toast({
        title: 'Success',
        description: 'Flexible punch configuration saved successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save flexible punch configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateEditingPermission = (key: keyof FlexiblePunchConfig['editingPermissions'], value: boolean) => {
    setConfig({
      ...config,
      editingPermissions: {
        ...config.editingPermissions,
        [key]: value
      }
    });
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
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Flexible Punch Configuration</h2>
          <p className="text-gray-600 mt-1">Configure punch methods, permissions, and correction policies</p>
        </div>

        <div className="space-y-8">
          {/* Punch Methods Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Punch Methods</h3>
            <p className="text-sm text-gray-600 mb-4">
              Define how employees can record their attendance punches
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="punch-web"
                  name="punch-methods"
                  value="WEB"
                  checked={config.punchMethods === 'WEB'}
                  onChange={(e) => setConfig({ ...config, punchMethods: e.target.value as any })}
                  className="h-4 w-4"
                />
                <label htmlFor="punch-web" className="font-medium cursor-pointer">
                  Web Only
                  {config.punchMethods === 'WEB' && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="punch-mobile"
                  name="punch-methods"
                  value="MOBILE"
                  checked={config.punchMethods === 'MOBILE'}
                  onChange={(e) => setConfig({ ...config, punchMethods: e.target.value as any })}
                  className="h-4 w-4"
                />
                <label htmlFor="punch-mobile" className="font-medium cursor-pointer">
                  Mobile Only
                  {config.punchMethods === 'MOBILE' && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="punch-both"
                  name="punch-methods"
                  value="BOTH"
                  checked={config.punchMethods === 'BOTH'}
                  onChange={(e) => setConfig({ ...config, punchMethods: e.target.value as any })}
                  className="h-4 w-4"
                />
                <label htmlFor="punch-both" className="font-medium cursor-pointer">
                  Web and Mobile (Flexible)
                  {config.punchMethods === 'BOTH' && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Geo-location Requirements Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Geo-location Requirements</h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure location-based attendance requirements
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="geolocation-required"
                  checked={config.geolocationRequired}
                  onChange={(e) => setConfig({ ...config, geolocationRequired: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="geolocation-required" className="font-medium cursor-pointer">
                  Require Geo-location Validation
                </label>
              </div>

              {config.geolocationRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Acceptable Radius (meters)
                  </label>
                  <input
                    type="number"
                    value={config.geolocationRadius}
                    onChange={(e) => setConfig({ ...config, geolocationRadius: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="10"
                    max="5000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum distance from workplace location for punch validation
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Punch Editing Permissions Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Punch Editing Permissions</h3>
            <p className="text-sm text-gray-600 mb-4">
              Define who can manually edit or correct attendance punches
            </p>

            <div className="space-y-6">
              {/* Individual Permissions */}
              <div>
                <h4 className="font-medium mb-3">Individual Permissions</h4>
                <div className="space-y-3 ml-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="edit-own"
                      checked={config.editingPermissions.canEditOwn}
                      onChange={(e) => updateEditingPermission('canEditOwn', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="edit-own" className="cursor-pointer">
                      Employees can edit their own punches
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="edit-team"
                      checked={config.editingPermissions.canEditTeam}
                      onChange={(e) => updateEditingPermission('canEditTeam', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="edit-team" className="cursor-pointer">
                      Managers can edit team punches
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="edit-all"
                      checked={config.editingPermissions.canEditAll}
                      onChange={(e) => updateEditingPermission('canEditAll', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="edit-all" className="cursor-pointer">
                      HR/Admin can edit all punches
                    </label>
                  </div>
                </div>
              </div>

              {/* Role-based Permissions */}
              <div>
                <h4 className="font-medium mb-3">Role-based Permissions</h4>
                <div className="space-y-3 ml-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="managers-edit"
                      checked={config.editingPermissions.managers}
                      onChange={(e) => updateEditingPermission('managers', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="managers-edit" className="cursor-pointer">
                      Managers
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="hr-edit"
                      checked={config.editingPermissions.hr}
                      onChange={(e) => updateEditingPermission('hr', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="hr-edit" className="cursor-pointer">
                      HR Personnel
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="admin-edit"
                      checked={config.editingPermissions.admin}
                      onChange={(e) => updateEditingPermission('admin', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="admin-edit" className="cursor-pointer">
                      System Administrators
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Correction Policies Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Correction Policies</h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure grace periods and approval workflows for punch corrections
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Grace Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grace Period for Corrections (minutes)
                </label>
                <input
                  type="number"
                  value={config.gracePeriodMinutes}
                  onChange={(e) => setConfig({ ...config, gracePeriodMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="480"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How long after punching can employees make corrections without approval
                </p>
              </div>

              {/* Allow Late Corrections */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allow Late Corrections
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allow-late-corrections"
                    checked={config.allowLateCorrections}
                    onChange={(e) => setConfig({ ...config, allowLateCorrections: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="allow-late-corrections" className="cursor-pointer">
                    Enable late corrections
                  </label>
                </div>
              </div>

              {/* Max Correction Days */}
              {config.allowLateCorrections && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Correction Period (days)
                  </label>
                  <input
                    type="number"
                    value={config.maxCorrectionDays}
                    onChange={(e) => setConfig({ ...config, maxCorrectionDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="365"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How many days back can punches be corrected
                  </p>
                </div>
              )}

              {/* Require Approval */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Workflow
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="require-approval"
                      checked={config.requireApprovalForCorrections}
                      onChange={(e) => setConfig({ ...config, requireApprovalForCorrections: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <label htmlFor="require-approval" className="cursor-pointer">
                      Require approval for corrections
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="notify-corrections"
                      checked={config.notifyOnCorrections}
                      onChange={(e) => setConfig({ ...config, notifyOnCorrections: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <label htmlFor="notify-corrections" className="cursor-pointer">
                      Send notifications for corrections
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Application Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective From Date
                </label>
                <input
                  type="date"
                  value={config.effectiveFrom}
                  onChange={(e) => setConfig({ ...config, effectiveFrom: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Date when these settings will become active. Leave as today for immediate effect.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={loadFlexiblePunchConfig}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Reset Changes
            </button>
            <button
              onClick={saveFlexiblePunchConfig}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
