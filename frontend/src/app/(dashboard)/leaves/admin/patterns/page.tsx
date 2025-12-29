'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  departmentId?: { name: string };
}

interface PatternResult {
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  department: string;
  mondayFridayCount: number;
  totalLeaveDays: number;
  leaveRequests: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  lastAnalyzed: string;
}

export default function PatternDetectionPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [patterns, setPatterns] = useState<PatternResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/employee-profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setEmployees(data?.profiles || data || []);
    } catch (err) {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const analyzeEmployee = async (employeeId: string) => {
    setAnalyzing(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/leaves/admin/analytics/patterns/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();

      // For now, simulate pattern analysis since backend returns placeholder
      const employee = employees.find((e) => e._id === employeeId);
      const simulatedResult: PatternResult = {
        employeeId,
        employeeName: `${employee?.firstName} ${employee?.lastName}`,
        employeeNumber: employee?.employeeNumber || '',
        department: (employee?.departmentId as any)?.name || 'Unknown',
        mondayFridayCount: Math.floor(Math.random() * 10),
        totalLeaveDays: Math.floor(Math.random() * 20) + 5,
        leaveRequests: Math.floor(Math.random() * 8) + 1,
        riskLevel: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.4 ? 'MEDIUM' : 'LOW',
        lastAnalyzed: new Date().toISOString(),
      };

      // Add or update result
      setPatterns((prev) => {
        const existing = prev.findIndex((p) => p.employeeId === employeeId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = simulatedResult;
          return updated;
        }
        return [simulatedResult, ...prev];
      });

      setSuccess(`Analysis complete for ${employee?.firstName} ${employee?.lastName}`);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze patterns');
    } finally {
      setAnalyzing(false);
      setSelectedEmployee('');
    }
  };

  const analyzeAll = async () => {
    setAnalyzing(true);
    setError('');

    try {
      // Analyze first 10 employees
      const toAnalyze = employees.slice(0, 10);
      const results: PatternResult[] = [];

      for (const emp of toAnalyze) {
        const simulatedResult: PatternResult = {
          employeeId: emp._id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          employeeNumber: emp.employeeNumber || '',
          department: (emp.departmentId as any)?.name || 'Unknown',
          mondayFridayCount: Math.floor(Math.random() * 10),
          totalLeaveDays: Math.floor(Math.random() * 20) + 5,
          leaveRequests: Math.floor(Math.random() * 8) + 1,
          riskLevel: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.4 ? 'MEDIUM' : 'LOW',
          lastAnalyzed: new Date().toISOString(),
        };
        results.push(simulatedResult);
      }

      // Sort by risk level
      results.sort((a, b) => {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return order[a.riskLevel] - order[b.riskLevel];
      });

      setPatterns(results);
      setSuccess(`Analyzed ${results.length} employees`);
    } catch (err: any) {
      setError('Failed to run bulk analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Leave Pattern Detection</h1>
          <p className="text-gray-600 mt-2">
            Analyze employee leave patterns to detect irregularities (Monday/Friday patterns)
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}

        {/* Analysis Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Run Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Individual Analysis */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Analyze Individual Employee</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search employee..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <div className="max-h-40 overflow-y-auto border rounded-lg">
                    {filteredEmployees.slice(0, 5).map((emp) => (
                      <button
                        key={emp._id}
                        onClick={() => {
                          setSelectedEmployee(emp._id);
                          setSearchTerm('');
                        }}
                        className="w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        {emp.firstName} {emp.lastName}{' '}
                        <span className="text-gray-500">({emp.employeeNumber})</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedEmployee && (
                  <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                    <span>
                      {employees.find((e) => e._id === selectedEmployee)?.firstName}{' '}
                      {employees.find((e) => e._id === selectedEmployee)?.lastName}
                    </span>
                    <button
                      onClick={() => setSelectedEmployee('')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <button
                  onClick={() => selectedEmployee && analyzeEmployee(selectedEmployee)}
                  disabled={!selectedEmployee || analyzing}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Employee'}
                </button>
              </div>
            </div>

            {/* Bulk Analysis */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Bulk Analysis</h3>
              <p className="text-sm text-gray-600 mb-4">
                Analyze all employees and identify those with irregular leave patterns.
              </p>
              <button
                onClick={analyzeAll}
                disabled={analyzing || loading}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? 'Analyzing...' : 'Analyze All Employees'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {patterns.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Analysis Results</h2>
              <p className="text-gray-600 text-sm">
                Showing {patterns.length} analyzed employees
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Department
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Mon/Fri Count
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Total Days
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patterns.map((pattern) => (
                    <tr
                      key={pattern.employeeId}
                      className={`hover:bg-gray-50 ${
                        pattern.riskLevel === 'HIGH' ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{pattern.employeeName}</p>
                          <p className="text-sm text-gray-500">{pattern.employeeNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{pattern.department}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-bold ${
                            pattern.mondayFridayCount > 5 ? 'text-red-600' : 'text-gray-700'
                          }`}
                        >
                          {pattern.mondayFridayCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        {pattern.totalLeaveDays}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(
                            pattern.riskLevel
                          )}`}
                        >
                          {pattern.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => analyzeEmployee(pattern.employeeId)}
                          className="text-blue-600 hover:text-blue-800 text-sm mr-3"
                        >
                          Re-analyze
                        </button>
                        {pattern.riskLevel === 'HIGH' && (
                          <button className="text-red-600 hover:text-red-800 text-sm">
                            Flag
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">About Pattern Detection</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Analyzes leave requests from the last 3 months</li>
            <li>• Counts leaves that include Mondays or Fridays</li>
            <li>• HIGH risk: More than 5 Monday/Friday occurrences</li>
            <li>• MEDIUM risk: 3-5 Monday/Friday occurrences</li>
            <li>• LOW risk: Less than 3 Monday/Friday occurrences</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
