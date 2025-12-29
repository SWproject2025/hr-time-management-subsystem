"use client"
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Check, 
  X, 
  Eye, 
  MessageSquare, 
  Filter, 
  Search, 
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Exception {
  _id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  runId: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  status: 'open' | 'resolved' | 'escalated';
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

const ExceptionResolutionPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [runId, setRunId] = useState<string>('');
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExceptions, setSelectedExceptions] = useState<string[]>([]);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [currentException, setCurrentException] = useState<Exception | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    searchTerm: ''
  });

  useEffect(() => {
    const initPage = async () => {
      const resolvedParams = await params;
      setRunId(resolvedParams.id);
    };
    initPage();
  }, [params]);

  useEffect(() => {
    if (runId) {
      fetchExceptions();
    }
  }, [runId]);

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${runId}/exceptions`);
      
      if (!response.ok) throw new Error('Failed to fetch exceptions');
      
      const data = await response.json();
      
      const transformedExceptions = data.exceptions?.map((exc: any) => ({
        _id: exc.employee?._id || Math.random().toString(),
        employeeId: exc.employee?._id || '',
        employeeName: exc.employee ? `${exc.employee.firstName} ${exc.employee.lastName}` : 'Unknown',
        employeeCode: exc.employee?.code || 'N/A',
        runId: data.runId,
        type: 'FLAGGED',
        severity: 'MEDIUM' as const,
        description: exc.exception || '',
        status: 'open' as const,
        createdAt: new Date().toISOString()
      })) || [];
      
      setExceptions(transformedExceptions);
    } catch (error: any) {
      console.error('Error fetching exceptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveException = async (exceptionId: string) => {
    if (!resolutionNote.trim()) {
      alert('Please provide a resolution note');
      return;
    }

    try {
      const exception = exceptions.find(e => e._id === exceptionId);
      if (!exception) return;

      const response = await fetch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/exceptions/${exception.employeeId}/resolve`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolutionNote })
        }
      );

      if (!response.ok) throw new Error('Failed to resolve exception');

      alert('Exception resolved successfully');
      setShowResolutionModal(false);
      setResolutionNote('');
      fetchExceptions();
    } catch (error: any) {
      alert(error.message || 'Failed to resolve exception');
    }
  };

  const handleBulkResolve = async () => {
    if (selectedExceptions.length === 0) {
      alert('Please select exceptions to resolve');
      return;
    }

    const note = prompt('Enter resolution note for all selected exceptions:');
    if (!note) return;

    try {
      await Promise.all(
        selectedExceptions.map(excId => {
          const exception = exceptions.find(e => e._id === excId);
          if (!exception) return Promise.resolve();
          
          return fetch(
            `${API_URL}/payroll-execution/payroll-runs/${runId}/exceptions/${exception.employeeId}/resolve`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ resolutionNote: note })
            }
          );
        })
      );

      alert('Exceptions resolved successfully');
      setSelectedExceptions([]);
      fetchExceptions();
    } catch (error: any) {
      alert('Some exceptions failed to resolve');
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityMap: any = {
      'LOW': 'bg-blue-100 text-blue-700 border-blue-200',
      'MEDIUM': 'bg-amber-100 text-amber-700 border-amber-200',
      'HIGH': 'bg-orange-100 text-orange-700 border-orange-200',
      'CRITICAL': 'bg-red-100 text-red-700 border-red-200'
    };
    return severityMap[severity] || severityMap.MEDIUM;
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      return <AlertCircle className="w-4 h-4" />;
    }
    return <AlertTriangle className="w-4 h-4" />;
  };

  const filteredExceptions = exceptions.filter(exc => {
    if (filters.severity && exc.severity !== filters.severity) return false;
    if (filters.status && exc.status !== filters.status) return false;
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      return exc.employeeName.toLowerCase().includes(term) ||
             exc.employeeCode.toLowerCase().includes(term) ||
             exc.description.toLowerCase().includes(term);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto" />
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-indigo-400 animate-ping mx-auto" style={{ animationDuration: '1.5s' }} />
          </div>
          <p className="mt-6 text-slate-600 font-medium">Loading exceptions...</p>
        </div>
      </div>
    );
  }

  const totalExceptions = exceptions.length;
  const openCount = exceptions.filter(e => e.status === 'open').length;
  const resolvedCount = exceptions.filter(e => e.status === 'resolved').length;
  const criticalCount = exceptions.filter(e => e.severity === 'CRITICAL').length;
  const resolutionRate = totalExceptions > 0 ? ((resolvedCount / totalExceptions) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Exception Resolution</h1>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">Run ID: {runId}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-2 text-slate-700 font-medium">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button 
                onClick={fetchExceptions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Exceptions</p>
              <AlertTriangle className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalExceptions}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Open</p>
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-amber-600">{openCount}</p>
            <p className="text-xs text-slate-500 mt-1">Requires attention</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Resolved</p>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">{resolvedCount}</p>
            <p className="text-xs text-slate-500 mt-1">Successfully closed</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Critical</p>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
            <p className="text-xs text-slate-500 mt-1">High priority items</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Resolution Rate</p>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{resolutionRate}%</p>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${resolutionRate}%` }} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Severity Level
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 transition"
              >
                <option value="">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 transition"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  placeholder="Search employee or description..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedExceptions.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-semibold text-blue-900">
                  {selectedExceptions.length} exception{selectedExceptions.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <button
                onClick={handleBulkResolve}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 font-medium shadow-sm"
              >
                <Check className="w-4 h-4" />
                Bulk Resolve
              </button>
            </div>
          </div>
        )}

        {/* Exceptions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedExceptions.length === filteredExceptions.length && filteredExceptions.length > 0}
                      onChange={() => {
                        if (selectedExceptions.length === filteredExceptions.length) {
                          setSelectedExceptions([]);
                        } else {
                          setSelectedExceptions(filteredExceptions.map(e => e._id));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExceptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <AlertTriangle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <p className="text-lg font-semibold text-slate-900 mb-1">No exceptions found</p>
                      <p className="text-sm text-slate-500">Try adjusting your filters or search criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredExceptions.map((exception) => (
                    <tr key={exception._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedExceptions.includes(exception._id)}
                          onChange={() => {
                            if (selectedExceptions.includes(exception._id)) {
                              setSelectedExceptions(selectedExceptions.filter(id => id !== exception._id));
                            } else {
                              setSelectedExceptions([...selectedExceptions, exception._id]);
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">{exception.employeeName}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{exception.employeeCode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {exception.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${getSeverityBadge(exception.severity)}`}>
                          {getSeverityIcon(exception.severity)}
                          {exception.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 max-w-md line-clamp-2">{exception.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          exception.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          exception.status === 'escalated' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {exception.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setCurrentException(exception);
                              setShowResolutionModal(true);
                            }}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {exception.status === 'open' && (
                            <button
                              onClick={() => {
                                setCurrentException(exception);
                                setShowResolutionModal(true);
                              }}
                              className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition"
                              title="Resolve Exception"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && currentException && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Resolve Exception</h3>
                <p className="text-sm text-slate-500 mt-1">Review and document the resolution</p>
              </div>
              <button
                onClick={() => {
                  setShowResolutionModal(false);
                  setResolutionNote('');
                }}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Employee</p>
                <p className="text-base font-semibold text-slate-900">{currentException.employeeName}</p>
                <p className="text-sm text-slate-600 font-mono mt-0.5">{currentException.employeeCode}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Exception Type</p>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 border border-slate-300">
                    {currentException.type}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Severity</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${getSeverityBadge(currentException.severity)}`}>
                    {getSeverityIcon(currentException.severity)}
                    {currentException.severity}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Description</p>
                <p className="text-sm text-slate-900 leading-relaxed">{currentException.description}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1.5" />
                  Resolution Note *
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Describe how this exception was resolved, including any actions taken..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white text-slate-900"
                  rows={5}
                />
                <p className="text-xs text-slate-500 mt-2">This note will be permanently recorded with the resolution.</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowResolutionModal(false);
                    setResolutionNote('');
                  }}
                  className="flex-1 px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResolveException(currentException._id)}
                  disabled={!resolutionNote.trim()}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-5 h-5" />
                  Resolve Exception
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExceptionResolutionPage;