'use client';

import { useState, useEffect } from 'react';
import leavesService from '@/lib/leavesService';

interface Holiday {
  date: string;
  name: string;
  description?: string;
}

interface Calendar {
  year: number;
  holidays: Holiday[];
}

export default function CalendarManagementPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ date: '', name: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCalendar();
  }, [year]);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const data = await leavesService.getCalendar(year);
      setCalendar(data);
    } catch (err: any) {
      setError('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await leavesService.addHoliday(year, formData);
      setSuccess('Holiday added successfully');
      setFormData({ date: '', name: '', description: '' });
      setShowForm(false);
      fetchCalendar();
    } catch (err: any) {
      setError(err.message || 'Failed to add holiday');
    }
  };

  const handleDeleteHoliday = async (date: string) => {
    if (!confirm('Delete this holiday?')) return;

    try {
      await leavesService.deleteHoliday(year, date);
      setSuccess('Holiday deleted');
      fetchCalendar();
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar Management</h1>
            <p className="text-gray-600 mt-2">Manage holidays and working days</p>
          </div>
          <div className="flex gap-4">
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2 border rounded-lg"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : '+ Add Holiday'}
            </button>
          </div>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800">{success}</div>}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Add Holiday</h2>
            <form onSubmit={handleAddHoliday} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Add Holiday
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Holidays for {year}</h2>
              <p className="text-gray-600">Total: {calendar?.holidays?.length || 0} holidays</p>
            </div>
            <div className="p-6">
              {!calendar?.holidays || calendar.holidays.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No holidays configured for this year</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {calendar.holidays.map((holiday, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{holiday.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(holiday.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteHoliday(holiday.date)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                      {holiday.description && (
                        <p className="text-xs text-gray-500 mt-2">{holiday.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
