'use client';
import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface Holiday {
  _id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  type: 'NATIONAL' | 'RELIGIOUS' | 'COMPANY' | 'REGIONAL' | 'PUBLIC' | 'OPTIONAL';
  active: boolean;
  recurring: boolean;
  description?: string;
  region?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function CompanyHolidayCalendar() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    type: 'COMPANY' as const,
    recurring: false,
    description: '',
    region: '',
    active: true
  });

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const data = await timeManagementService.getAllHolidays();
      setHolidays(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load holidays',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async () => {
    try {
      await timeManagementService.createHoliday({
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        type: formData.type,
        recurring: formData.recurring,
        description: formData.description || undefined,
        region: formData.region || undefined,
        active: formData.active
      });

      toast({
        title: 'Success',
        description: 'Holiday added successfully'
      });

      resetForm();
      setShowAddForm(false);
      await loadHolidays();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to add holiday',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateHoliday = async () => {
    if (!editingHoliday) return;

    try {
      await timeManagementService.updateHoliday(editingHoliday._id, {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        type: formData.type,
        recurring: formData.recurring,
        description: formData.description || undefined,
        region: formData.region || undefined,
        active: formData.active
      });

      toast({
        title: 'Success',
        description: 'Holiday updated successfully'
      });

      resetForm();
      setEditingHoliday(null);
      await loadHolidays();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update holiday',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteHoliday = async (holidayId: string) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;

    try {
      await timeManagementService.deleteHoliday(holidayId);
      toast({
        title: 'Success',
        description: 'Holiday deleted successfully'
      });
      await loadHolidays();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete holiday',
        variant: 'destructive'
      });
    }
  };

  const handleBulkImport = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const importedCount = 0;

      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 2) {
          await timeManagementService.createHoliday({
            name: parts[0]?.trim() || '',
            startDate: parts[1]?.trim() || '',
            type: (parts[2]?.trim() || 'COMPANY') as any,
            recurring: parts[3]?.trim().toLowerCase() === 'yes',
            description: parts[4]?.trim() || undefined,
            active: true
          });
        }
      }

      toast({
        title: 'Success',
        description: `${lines.length} holidays imported successfully`
      });

      await loadHolidays();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to import holidays',
        variant: 'destructive'
      });
    }
  };

  const handleSyncNationalCalendar = async () => {
    try {
      // This would call a service to sync with national calendar API
      toast({
        title: 'Info',
        description: 'National calendar sync feature coming soon'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to sync national calendar',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      type: 'COMPANY',
      recurring: false,
      description: '',
      region: '',
      active: true
    });
  };

  const startEdit = (holiday: Holiday) => {
    setFormData({
      name: holiday.name,
      startDate: format(new Date(holiday.startDate), 'yyyy-MM-dd'),
      endDate: holiday.endDate ? format(new Date(holiday.endDate), 'yyyy-MM-dd') : '',
      type: holiday.type,
      recurring: holiday.recurring || false,
      description: holiday.description || '',
      region: holiday.region || '',
      active: holiday.active
    });
    setEditingHoliday(holiday);
    setShowAddForm(true);
  };

  const getHolidaysForDate = (date: Date) => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.startDate);
      return isSameDay(date, holidayDate) && holiday.active;
    });
  };

  const getHolidayTypeColor = (type: string) => {
    switch (type) {
      case 'NATIONAL': return 'bg-red-100 text-red-800';
      case 'RELIGIOUS': return 'bg-purple-100 text-purple-800';
      case 'COMPANY': return 'bg-blue-100 text-blue-800';
      case 'REGIONAL': return 'bg-green-100 text-green-800';
      case 'PUBLIC': return 'bg-yellow-100 text-yellow-800';
      case 'OPTIONAL': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const renderCalendarView = () => (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          ← Previous
        </button>
        <h3 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          Next →
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((date, index) => {
          const dayHolidays = getHolidaysForDate(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);

          return (
            <div
              key={index}
              className={`min-h-24 p-2 border border-gray-200 ${
                !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {format(date, 'd')}
              </div>
              <div className="space-y-1">
                {dayHolidays.map(holiday => (
                  <div
                    key={holiday._id}
                    className={`text-xs p-1 rounded truncate ${getHolidayTypeColor(holiday.type)}`}
                    title={`${holiday.name} (${holiday.type})`}
                  >
                    {holiday.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Holiday List</h3>

      {holidays.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No holidays configured</p>
      ) : (
        <div className="space-y-3">
          {holidays.map(holiday => (
            <div key={holiday._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{holiday.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHolidayTypeColor(holiday.type)}`}>
                      {holiday.type}
                    </span>
                    {holiday.recurring && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Recurring
                      </span>
                    )}
                    {!holiday.active && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mt-1">
                    {format(new Date(holiday.startDate), 'MMM d, yyyy')}
                    {holiday.endDate && ` - ${format(new Date(holiday.endDate), 'MMM d, yyyy')}`}
                    {holiday.region && ` • ${holiday.region}`}
                  </div>

                  {holiday.description && (
                    <p className="text-sm text-gray-500 mt-1">{holiday.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(holiday)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteHoliday(holiday._id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderHolidayForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
        </h3>
        <button
          onClick={() => {
            setShowAddForm(false);
            setEditingHoliday(null);
            resetForm();
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Holiday Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter holiday name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="NATIONAL">National</option>
            <option value="RELIGIOUS">Religious</option>
            <option value="COMPANY">Company</option>
            <option value="REGIONAL">Regional</option>
            <option value="PUBLIC">Public</option>
            <option value="OPTIONAL">Optional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date (Optional)
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Optional description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region (for regional holidays)
          </label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., California, New York"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.recurring}
              onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium">Recurring (Yearly)</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium">Active</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => {
            setShowAddForm(false);
            setEditingHoliday(null);
            resetForm();
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={editingHoliday ? handleUpdateHoliday : handleAddHoliday}
          disabled={!formData.name || !formData.startDate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {editingHoliday ? 'Update Holiday' : 'Add Holiday'}
        </button>
      </div>
    </div>
  );

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
          <h1 className="text-2xl font-bold">Company Holiday Calendar</h1>
          <p className="text-gray-600 mt-1">Manage company and national holidays with calendar view</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewMode === 'calendar'
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Calendar View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List View
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncNationalCalendar}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              🔄 Sync National Calendar
            </button>

            <label className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 cursor-pointer flex items-center gap-2">
              📁 Bulk Import CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBulkImport(file);
                }}
              />
            </label>

            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              ➕ Add Holiday
            </button>
          </div>
        </div>

        {/* Holiday Form */}
        {showAddForm && (
          <div className="mb-6">
            {renderHolidayForm()}
          </div>
        )}

        {/* Main Content */}
        {viewMode === 'calendar' ? renderCalendarView() : renderListView()}

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{holidays.length}</div>
            <div className="text-sm text-gray-600">Total Holidays</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {holidays.filter(h => h.type === 'NATIONAL').length}
            </div>
            <div className="text-sm text-gray-600">National Holidays</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">
              {holidays.filter(h => h.type === 'COMPANY').length}
            </div>
            <div className="text-sm text-gray-600">Company Holidays</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">
              {holidays.filter(h => h.recurring).length}
            </div>
            <div className="text-sm text-gray-600">Recurring Holidays</div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
