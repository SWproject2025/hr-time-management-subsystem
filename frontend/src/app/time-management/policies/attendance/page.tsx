'use client';
import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useToast } from '@/hooks/use-toast';
import FlexiblePunchConfiguration from '@/components/time-management/attendance/FlexiblePunchConfiguration';

interface AttendanceRules {
  multiplePunchesPolicy: 'MULTIPLE' | 'FIRST_LAST';
  earlyClockInTolerance: number;
  lateClockOutTolerance: number;
  minimumTimeBetweenPunches: number;
  punchRoundingRule: 'NONE' | 'NEAREST_5' | 'NEAREST_10' | 'NEAREST_15';
  effectiveFrom: string;
}

type TabType = 'rules' | 'flexible';

export default function AttendanceRulesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('rules');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<AttendanceRules>({
    multiplePunchesPolicy: 'MULTIPLE',
    earlyClockInTolerance: 15,
    lateClockOutTolerance: 15,
    minimumTimeBetweenPunches: 5,
    punchRoundingRule: 'NONE',
    effectiveFrom: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadAttendanceRules();
  }, []);

  const loadAttendanceRules = async () => {
    try {
      setLoading(true);
      const data = await timeManagementService.getAttendanceRules();
      if (data) {
        setRules({
          multiplePunchesPolicy: data.multiplePunchesPolicy || 'MULTIPLE',
          earlyClockInTolerance: data.earlyClockInTolerance || 15,
          lateClockOutTolerance: data.lateClockOutTolerance || 15,
          minimumTimeBetweenPunches: data.minimumTimeBetweenPunches || 5,
          punchRoundingRule: data.punchRoundingRule || 'NONE',
          effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
      } else {
        setRules({
          multiplePunchesPolicy: 'MULTIPLE',
          earlyClockInTolerance: 15,
          lateClockOutTolerance: 15,
          minimumTimeBetweenPunches: 5,
          punchRoundingRule: 'NONE',
          effectiveFrom: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load attendance rules',
        variant: 'destructive'
      });
      setRules({
        multiplePunchesPolicy: 'MULTIPLE',
        earlyClockInTolerance: 15,
        lateClockOutTolerance: 15,
        minimumTimeBetweenPunches: 5,
        punchRoundingRule: 'NONE',
        effectiveFrom: new Date().toISOString().split('T')[0]
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAttendanceRules = async () => {
    try {
      setSaving(true);
      await timeManagementService.updateAttendanceRules(rules);
      toast({
        title: 'Success',
        description: 'Attendance rules saved successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save attendance rules',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getPolicyDescription = (policy: string) => {
    switch (policy) {
      case 'MULTIPLE':
        return 'Employees can punch in/out multiple times per day. All punches are recorded and used to calculate total working hours.';
      case 'FIRST_LAST':
        return 'Only the first clock-in and last clock-out punches of the day are considered. Additional punches are ignored.';
      default:
        return '';
    }
  };

  const getRoundingDescription = (rule: string) => {
    switch (rule) {
      case 'NONE':
        return 'No rounding applied. Punches are recorded at exact times.';
      case 'NEAREST_5':
        return 'Punch times are rounded to the nearest 5 minutes.';
      case 'NEAREST_10':
        return 'Punch times are rounded to the nearest 10 minutes.';
      case 'NEAREST_15':
        return 'Punch times are rounded to the nearest 15 minutes.';
      default:
        return '';
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

  const tabs = [
    { id: 'rules' as TabType, name: 'Punch Handling Rules', description: 'Configure punch handling policies and validation rules' },
    { id: 'flexible' as TabType, name: 'Flexible Punch Configuration', description: 'Configure punch methods, permissions, and correction policies' }
  ];

  return (
    <RoleGuard allowedRoles={['ADMIN', 'HR', 'TIME_MANAGER']}>
      <div className="p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Attendance Configuration</h1>
          <p className="text-gray-600 mt-1">Manage attendance rules and flexible punch settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === 'rules' ? (
          <div className="space-y-8">
          {/* Multiple Punches Policy Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Multiple Punches Policy</h2>
            <p className="text-sm text-gray-600 mb-4">
              Define how multiple punches per day should be handled
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="multiple-punches"
                  name="punches-policy"
                  value="MULTIPLE"
                  checked={rules.multiplePunchesPolicy === 'MULTIPLE'}
                  onChange={(e) => setRules({ ...rules, multiplePunchesPolicy: e.target.value as 'MULTIPLE' | 'FIRST_LAST' })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="multiple-punches" className="font-medium cursor-pointer">
                    Allow Multiple Punches Per Day
                    {rules.multiplePunchesPolicy === 'MULTIPLE' && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    {getPolicyDescription('MULTIPLE')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="first-last-only"
                  name="punches-policy"
                  value="FIRST_LAST"
                  checked={rules.multiplePunchesPolicy === 'FIRST_LAST'}
                  onChange={(e) => setRules({ ...rules, multiplePunchesPolicy: e.target.value as 'MULTIPLE' | 'FIRST_LAST' })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="first-last-only" className="font-medium cursor-pointer">
                    First-In/Last-Out Only
                    {rules.multiplePunchesPolicy === 'FIRST_LAST' && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    {getPolicyDescription('FIRST_LAST')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Punch Validation Rules Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Punch Validation Rules</h2>
            <p className="text-sm text-gray-600 mb-6">
              Configure tolerances and validation rules for attendance punches
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Early Clock-in Tolerance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Early Clock-in Tolerance (minutes)
                </label>
                <input
                  type="number"
                  value={rules.earlyClockInTolerance}
                  onChange={(e) => setRules({ ...rules, earlyClockInTolerance: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="480"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How many minutes early employees can clock in before their shift starts
                </p>
              </div>

              {/* Late Clock-out Tolerance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Late Clock-out Tolerance (minutes)
                </label>
                <input
                  type="number"
                  value={rules.lateClockOutTolerance}
                  onChange={(e) => setRules({ ...rules, lateClockOutTolerance: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="480"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How many minutes late employees can clock out after their shift ends
                </p>
              </div>

              {/* Minimum Time Between Punches */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Time Between Punches (minutes)
                </label>
                <input
                  type="number"
                  value={rules.minimumTimeBetweenPunches}
                  onChange={(e) => setRules({ ...rules, minimumTimeBetweenPunches: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="60"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum time required between consecutive punches
                </p>
              </div>

              {/* Punch Rounding Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Punch Rounding Rules
                </label>
                <select
                  value={rules.punchRoundingRule}
                  onChange={(e) => setRules({ ...rules, punchRoundingRule: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NONE">No Rounding</option>
                  <option value="NEAREST_5">Nearest 5 minutes</option>
                  <option value="NEAREST_10">Nearest 10 minutes</option>
                  <option value="NEAREST_15">Nearest 15 minutes</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {getRoundingDescription(rules.punchRoundingRule)}
                </p>
              </div>
            </div>
          </div>

          {/* Application Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Application Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective From Date
                </label>
                <input
                  type="date"
                  value={rules.effectiveFrom}
                  onChange={(e) => setRules({ ...rules, effectiveFrom: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Date when these rules will become active. Leave as today for immediate effect.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={loadAttendanceRules}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Reset Changes
            </button>
            <button
              onClick={saveAttendanceRules}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Rules'}
            </button>
          </div>
        </div>
        ) : (
          <FlexiblePunchConfiguration />
        )}
      </div>
    </RoleGuard>
  );
}
