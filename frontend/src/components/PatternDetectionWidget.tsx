import React, { useEffect, useState } from 'react';
import { leavesService } from '../lib/leavesService';

interface LeavePattern {
  _id: string;
  employeeId: string; // expanded to object in real usage?
  patternType: string;
  occurrences: number;
  details: string;
  detectionDate: string;
  acknowledged: boolean;
}

interface PatternDetectionWidgetProps {
  employeeId: string;
  onPatternAcknowledged?: () => void;
}

export const PatternDetectionWidget: React.FC<PatternDetectionWidgetProps> = ({ employeeId, onPatternAcknowledged }) => {
  const [patterns, setPatterns] = useState<LeavePattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const data = await leavesService.getLeavePatterns(employeeId);
      // Filter out acknowledged patterns if we only want to show active ones
      const activePatterns = data.filter((p: LeavePattern) => !p.acknowledged);
      setPatterns(activePatterns);
    } catch (err: any) {
      console.error('Failed to fetch patterns', err);
      setError('Failed to load leave patterns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchPatterns();
    }
  }, [employeeId]);

  const handleAcknowledge = async (patternId: string) => {
    try {
      await leavesService.acknowledgePattern(patternId);
      // Remove from list locally
      setPatterns(prev => prev.filter(p => p._id !== patternId));
      if (onPatternAcknowledged) onPatternAcknowledged();
    } catch (err) {
      console.error('Failed to acknowledge pattern', err);
      alert('Failed to acknowledge pattern');
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Checking for patterns...</div>;
  if (!patterns.length) return null; // Don't show anything if no patterns

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="text-sm font-semibold text-orange-800">Irregular Leave Patterns Detected</h3>
      </div>
      
      <div className="space-y-3">
        {patterns.map(pattern => (
          <div key={pattern._id} className="bg-white p-3 rounded border border-orange-100 shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-800 font-medium">{pattern.details}</p>
              <p className="text-xs text-gray-500 mt-1">Detected on: {new Date(pattern.detectionDate).toLocaleDateString()}</p>
            </div>
            <button 
              onClick={() => handleAcknowledge(pattern._id)}
              className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
