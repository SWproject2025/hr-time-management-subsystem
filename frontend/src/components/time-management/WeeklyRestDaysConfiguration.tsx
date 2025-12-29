'use client';
import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useToast } from '@/hooks/use-toast';

interface RestDayConfig {
  _id?: string;
  type: 'DEFAULT' | 'DEPARTMENT' | 'POSITION';
  departmentId?: string;
  positionId?: string;
  restDays: string[]; // Array of day names: 'monday', 'tuesday', etc.
  effectiveFrom: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Department {
  _id: string;
  name: string;
}

interface Position {
  _id: string;
  name: string;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

export default function WeeklyRestDaysConfiguration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultConfig, setDefaultConfig] = useState<RestDayConfig>({
    type: 'DEFAULT',
    restDays: ['friday', 'saturday'],
    effectiveFrom: new Date().toISOString().split('T')[0]
  });
  const [customConfigs, setCustomConfigs] = useState<RestDayConfig[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<RestDayConfig | null>(null);

  // Form state for adding/editing custom configurations
  const [formData, setFormData] = useState({
    type: 'DEPARTMENT' as 'DEPARTMENT' | 'POSITION',
    departmentId: '',
    positionId: '',
    restDays: [] as string[],
    effectiveFrom: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configs, depts, pos] = await Promise.all([
        timeManagementService.getRestDayConfigurations(),
        timeManagementService.getDepartments(),
        timeManagementService.getPositions()
      ]);

      // Separate default and custom configurations
      const defaultCfg = configs.find((c: RestDayConfig) => c.type === 'DEFAULT');
      const customCfgs = configs.filter((c: RestDayConfig) => c.type !== 'DEFAULT');

      if (defaultCfg) {
        setDefaultConfig(defaultCfg);
      }

      setCustomConfigs(customCfgs);
      setDepartments(depts || []);
      setPositions(pos || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load rest day configurations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDefaultConfig = async () => {
    try {
      setSaving(true);
      await timeManagementService.updateDefaultRestDays(defaultConfig);
      toast({
        title: 'Success',
        description: 'Default rest days updated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update default rest days',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomConfig = async () => {
    try {
      setSaving(true);
      const configData = {
        type: formData.type,
        [formData.type === 'DEPARTMENT' ? 'departmentId' : 'positionId']:
          formData.type === 'DEPARTMENT' ? formData.departmentId : formData.positionId,
        restDays: formData.restDays,
        effectiveFrom: formData.effectiveFrom
      };

      await timeManagementService.createRestDayConfiguration(configData);
      toast({
        title: 'Success',
        description: 'Custom rest day configuration added successfully'
      });

      resetForm();
      setShowAddForm(false);
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to add custom configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCustomConfig = async () => {
    if (!editingConfig) return;

    try {
      setSaving(true);
      const configData = {
        type: formData.type,
        [formData.type === 'DEPARTMENT' ? 'departmentId' : 'positionId']:
          formData.type === 'DEPARTMENT' ? formData.departmentId : formData.positionId,
        restDays: formData.restDays,
        effectiveFrom: formData.effectiveFrom
      };

      await timeManagementService.updateRestDayConfiguration(editingConfig._id!, configData);
      toast({
        title: 'Success',
        description: 'Custom rest day configuration updated successfully'
      });

      resetForm();
      setEditingConfig(null);
      setShowAddForm(false);
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update custom configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this rest day configuration?')) return;

    try {
      await timeManagementService.deleteRestDayConfiguration(configId);
      toast({
        title: 'Success',
        description: 'Rest day configuration deleted successfully'
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete configuration',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'DEPARTMENT',
      departmentId: '',
      positionId: '',
      restDays: [],
      effectiveFrom: new Date().toISOString().split('T')[0]
    });
  };

  const startEdit = (config: RestDayConfig) => {
    setFormData({
      type: config.type as 'DEPARTMENT' | 'POSITION',
      departmentId: config.departmentId || '',
      positionId: config.positionId || '',
      restDays: config.restDays,
      effectiveFrom: config.effectiveFrom
    });
    setEditingConfig(config);
    setShowAddForm(true);
  };

  const toggleDefaultRestDay = (dayKey: string) => {
    setDefaultConfig(prev => ({
      ...prev,
      restDays: prev.restDays.includes(dayKey)
        ? prev.restDays.filter(d => d !== dayKey)
        : [...prev.restDays, dayKey]
    }));
  };

  const toggleFormRestDay = (dayKey: string) => {
    setFormData(prev => ({
      ...prev,
      restDays: prev.restDays.includes(dayKey)
        ? prev.restDays.filter(d => d !== dayKey)
        : [...prev.restDays, dayKey]
    }));
  };

  const getEntityName = (config: RestDayConfig) => {
    if (config.type === 'DEPARTMENT' && config.departmentId) {
      const dept = departments.find(d => d._id === config.departmentId);
      return dept ? dept.name : 'Unknown Department';
    }
    if (config.type === 'POSITION' && config.positionId) {
      const pos = positions.find(p => p._id === config.positionId);
      return pos ? pos.name : 'Unknown Position';
    }
    return 'Unknown';
  };

  const formatRestDays = (restDays: string[]) => {
    return restDays.map(day => DAYS_OF_WEEK.find(d => d.key === day)?.short || day).join(', ');
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
          <h1 className="text-2xl font-bold">Weekly Rest Days Configuration</h1>
          <p className="text-gray-600 mt-1">Configure default and custom rest day patterns for departments and positions</p>
        </div>

        <div className="space-y-8">
          {/* Default Rest Day Pattern */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Default Rest Day Pattern</h2>
            <p className="text-sm text-gray-600 mb-6">
              Set the company-wide default rest days that apply to all employees unless overridden
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Rest Days
                </label>
                <div className="grid grid-cols-7 gap-3">
                  {DAYS_OF_WEEK.map(day => (
                    <label
                      key={day.key}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        defaultConfig.restDays.includes(day.key)
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={defaultConfig.restDays.includes(day.key)}
                        onChange={() => toggleDefaultRestDay(day.key)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective From
                </label>
                <input
                  type="date"
                  value={defaultConfig.effectiveFrom}
                  onChange={(e) => setDefaultConfig({ ...defaultConfig, effectiveFrom: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveDefaultConfig}
                  disabled={saving || defaultConfig.restDays.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save Default Pattern'}
                </button>
              </div>
            </div>
          </div>

          {/* Custom Rest Days by Department/Position */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Custom Rest Days by Department/Position</h2>
                <p className="text-sm text-gray-600">Override default rest days for specific departments or positions</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Custom Configuration
              </button>
            </div>

            {customConfigs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No custom rest day configurations set.</p>
                <p className="text-sm">All employees will use the default rest day pattern.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department/Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rest Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Effective From
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customConfigs.map(config => (
                      <tr key={config._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            config.type === 'DEPARTMENT'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {config.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getEntityName(config)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatRestDays(config.restDays)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(config.effectiveFrom).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => startEdit(config)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => config._id && handleDeleteCustomConfig(config._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add/Edit Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {editingConfig ? 'Edit Rest Day Configuration' : 'Add Custom Rest Day Configuration'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingConfig(null);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Configuration Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({
                          ...formData,
                          type: e.target.value as 'DEPARTMENT' | 'POSITION',
                          departmentId: '',
                          positionId: ''
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="DEPARTMENT">Department</option>
                        <option value="POSITION">Position</option>
                      </select>
                    </div>

                    {/* Department/Position Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.type === 'DEPARTMENT' ? 'Department' : 'Position'}
                      </label>
                      <select
                        value={formData.type === 'DEPARTMENT' ? formData.departmentId : formData.positionId}
                        onChange={(e) => setFormData({
                          ...formData,
                          [formData.type === 'DEPARTMENT' ? 'departmentId' : 'positionId']: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">
                          Select {formData.type === 'DEPARTMENT' ? 'Department' : 'Position'}
                        </option>
                        {(formData.type === 'DEPARTMENT' ? departments : positions).map(entity => (
                          <option key={entity._id} value={entity._id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rest Days Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Rest Days
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {DAYS_OF_WEEK.map(day => (
                          <label
                            key={day.key}
                            className={`flex items-center justify-center p-2 border rounded cursor-pointer text-xs transition-colors ${
                              formData.restDays.includes(day.key)
                                ? 'bg-blue-100 border-blue-300 text-blue-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.restDays.includes(day.key)}
                              onChange={() => toggleFormRestDay(day.key)}
                              className="sr-only"
                            />
                            <span>{day.short}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Effective From */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Effective From
                      </label>
                      <input
                        type="date"
                        value={formData.effectiveFrom}
                        onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingConfig(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingConfig ? handleUpdateCustomConfig : handleAddCustomConfig}
                      disabled={saving || formData.restDays.length === 0 ||
                        (formData.type === 'DEPARTMENT' ? !formData.departmentId : !formData.positionId)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {saving ? 'Saving...' : editingConfig ? 'Update Configuration' : 'Add Configuration'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
