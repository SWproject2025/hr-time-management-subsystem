'use client';
import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

interface SystemSettings {
  general: {
    timezone: string;
    weekStartDay: 'MONDAY' | 'SUNDAY';
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12H' | '24H';
  };
  notifications: {
    shiftExpiryDays: number;
    missedPunchTiming: 'IMMEDIATE' | 'END_OF_DAY';
    escalationNotifications: boolean;
    emailNotifications: boolean;
    inAppNotifications: boolean;
  };
  security: {
    auditLogRetentionDays: number;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
      expiryDays: number;
    };
    sessionTimeoutMinutes: number;
  };
  backup: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    retentionDays: number;
    autoBackup: boolean;
  };
}

interface BackupHistory {
  _id: string;
  timestamp: Date;
  type: 'MANUAL' | 'AUTOMATIC';
  size: number;
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  initiatedBy: string;
  downloadUrl?: string;
}

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney'
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2023)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2023)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2023-12-31)' }
];

const BACKUP_FREQUENCIES = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' }
];

export default function SystemSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      timezone: 'UTC',
      weekStartDay: 'MONDAY',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24H'
    },
    notifications: {
      shiftExpiryDays: 7,
      missedPunchTiming: 'END_OF_DAY',
      escalationNotifications: true,
      emailNotifications: true,
      inAppNotifications: true
    },
    security: {
      auditLogRetentionDays: 90,
      passwordPolicy: {
        minLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        expiryDays: 90
      },
      sessionTimeoutMinutes: 60
    },
    backup: {
      frequency: 'DAILY',
      retentionDays: 30,
      autoBackup: true
    }
  });

  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadBackupHistory();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await timeManagementService.getSystemSettings();
      if (data) {
        setSettings(data);
      }
    } catch (error: any) {
      // Use default settings if not configured
      console.log('Using default settings');
    } finally {
      setLoading(false);
    }
  };

  const loadBackupHistory = async () => {
    try {
      const history = await timeManagementService.getBackupHistory();
      setBackupHistory(history || []);

      // Find the most recent successful backup
      const successfulBackups = history?.filter(b => b.status === 'SUCCESS') || [];
      if (successfulBackups.length > 0) {
        const mostRecent = successfulBackups.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        setLastBackup(new Date(mostRecent.timestamp));
      }
    } catch (error: any) {
      console.log('Backup history not available');
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await timeManagementService.updateSystemSettings(settings);
      toast({
        title: 'Success',
        description: 'System settings saved successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const performBackup = async () => {
    try {
      setBackupInProgress(true);
      await timeManagementService.createBackup();
      toast({
        title: 'Success',
        description: 'Backup initiated successfully'
      });
      // Refresh backup history after a short delay
      setTimeout(() => loadBackupHistory(), 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to create backup',
        variant: 'destructive'
      });
    } finally {
      setBackupInProgress(false);
    }
  };

  const performRestore = async (backupId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to restore from this backup? This will overwrite current system settings and may require a system restart.'
    );
    if (!confirmed) return;

    try {
      setRestoreInProgress(backupId);
      await timeManagementService.restoreFromBackup(backupId);
      toast({
        title: 'Success',
        description: 'System restore initiated successfully. The system may need to restart.'
      });

      // Refresh backup history and settings
      setTimeout(() => {
        loadBackupHistory();
        loadSettings();
      }, 3000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to restore from backup',
        variant: 'destructive'
      });
    } finally {
      setRestoreInProgress(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBackupStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600 bg-green-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const updateGeneralSetting = (key: keyof SystemSettings['general'], value: any) => {
    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [key]: value
      }
    });
  };

  const updateNotificationSetting = (key: keyof SystemSettings['notifications'], value: any) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  const updateSecuritySetting = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setSettings({
        ...settings,
        security: {
          ...settings.security,
          [parent]: {
            ...(settings.security as any)[parent],
            [child]: value
          }
        }
      });
    } else {
      setSettings({
        ...settings,
        security: {
          ...settings.security,
          [key]: value
        }
      });
    }
  };

  const updateBackupSetting = (key: keyof SystemSettings['backup'], value: any) => {
    setSettings({
      ...settings,
      backup: {
        ...settings.backup,
        [key]: value
      }
    });
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['ADMIN']}>
        <div className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="p-6 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">System Settings</h1>
            <p className="text-gray-600 mt-1">Configure system-wide settings, notifications, security, and backup policies</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>💾 Save Settings</>
            )}
          </button>
        </div>

        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              ⚙️ General Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Timezone
                </label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => updateGeneralSetting('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Week Start Day
                </label>
                <select
                  value={settings.general.weekStartDay}
                  onChange={(e) => updateGeneralSetting('weekStartDay', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MONDAY">Monday</option>
                  <option value="SUNDAY">Sunday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Format
                </label>
                <select
                  value={settings.general.dateFormat}
                  onChange={(e) => updateGeneralSetting('dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DATE_FORMATS.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Format
                </label>
                <select
                  value={settings.general.timeFormat}
                  onChange={(e) => updateGeneralSetting('timeFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="12H">12 Hour (AM/PM)</option>
                  <option value="24H">24 Hour</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🔔 Notification Settings
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift Expiry Notification (days before)
                  </label>
                  <input
                    type="number"
                    value={settings.notifications.shiftExpiryDays}
                    onChange={(e) => updateNotificationSetting('shiftExpiryDays', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Missed Punch Notification
                  </label>
                  <select
                    value={settings.notifications.missedPunchTiming}
                    onChange={(e) => updateNotificationSetting('missedPunchTiming', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IMMEDIATE">Immediate</option>
                    <option value="END_OF_DAY">End of Day</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Notification Channels</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.escalationNotifications}
                      onChange={(e) => updateNotificationSetting('escalationNotifications', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Escalation Notifications</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => updateNotificationSetting('emailNotifications', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Email Notifications</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.inAppNotifications}
                      onChange={(e) => updateNotificationSetting('inAppNotifications', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">In-App Notifications</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Access */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🔒 Security & Access
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audit Log Retention (days)
                  </label>
                  <input
                    type="number"
                    value={settings.security.auditLogRetentionDays}
                    onChange={(e) => updateSecuritySetting('auditLogRetentionDays', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="30"
                    max="365"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeoutMinutes}
                    onChange={(e) => updateSecuritySetting('sessionTimeoutMinutes', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="15"
                    max="480"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Password Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Length
                    </label>
                    <input
                      type="number"
                      value={settings.security.passwordPolicy.minLength}
                      onChange={(e) => updateSecuritySetting('passwordPolicy.minLength', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="6"
                      max="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Expiry (days)
                    </label>
                    <input
                      type="number"
                      value={settings.security.passwordPolicy.expiryDays}
                      onChange={(e) => updateSecuritySetting('passwordPolicy.expiryDays', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="30"
                      max="365"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.security.passwordPolicy.requireSpecialChars}
                          onChange={(e) => updateSecuritySetting('passwordPolicy.requireSpecialChars', e.target.checked)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">Require special characters</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.security.passwordPolicy.requireNumbers}
                          onChange={(e) => updateSecuritySetting('passwordPolicy.requireNumbers', e.target.checked)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">Require numbers</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Backup & Recovery */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              💾 Backup & Recovery
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backup.frequency}
                    onChange={(e) => updateBackupSetting('frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {BACKUP_FREQUENCIES.map(freq => (
                      <option key={freq.value} value={freq.value}>{freq.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    value={settings.backup.retentionDays}
                    onChange={(e) => updateBackupSetting('retentionDays', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="7"
                    max="365"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.backup.autoBackup}
                      onChange={(e) => updateBackupSetting('autoBackup', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Enable automatic backups</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Backup Status</h3>
                    {lastBackup && (
                      <p className="text-sm text-gray-600">
                        Last backup: {formatDistanceToNow(lastBackup, { addSuffix: true })}
                        ({format(lastBackup, 'PPp')})
                      </p>
                    )}
                  </div>
                  <button
                    onClick={performBackup}
                    disabled={backupInProgress}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    {backupInProgress ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating Backup...
                      </>
                    ) : (
                      <>💾 Backup Now</>
                    )}
                  </button>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recent Backup History</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {backupHistory.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No backup history available</p>
                    ) : (
                      backupHistory.slice(0, 5).map(backup => (
                        <div key={backup._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${getBackupStatusColor(backup.status)}`}>
                              {backup.status}
                            </span>
                            <div>
                              <p className="text-sm font-medium">
                                {format(new Date(backup.timestamp), 'PPp')}
                              </p>
                              <p className="text-xs text-gray-600">
                                {backup.type} • {formatFileSize(backup.size)} • by {backup.initiatedBy}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {backup.downloadUrl && (
                              <button
                                onClick={() => window.open(backup.downloadUrl, '_blank')}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Download
                              </button>
                            )}
                            {backup.status === 'SUCCESS' && (
                              <button
                                onClick={() => performRestore(backup._id)}
                                disabled={restoreInProgress === backup._id}
                                className="text-green-600 hover:text-green-800 text-sm disabled:text-gray-400"
                              >
                                {restoreInProgress === backup._id ? 'Restoring...' : 'Restore'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
