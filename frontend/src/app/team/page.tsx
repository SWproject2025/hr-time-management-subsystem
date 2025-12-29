'use client';

import { useEffect, useState } from 'react';
import { EmployeeService } from '@/services/employee.service';
import { EmployeeProfile } from '@/types/employee';
import { Card, CardContent } from '@/components/employee-profile-ui/card';
import { Loader2, Mail, Briefcase } from 'lucide-react';

export default function TeamPage() {
  const [team, setTeam] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { profile } = await EmployeeService.getMe();
        if (profile._id) {
          const teamData = await EmployeeService.getTeam(profile._id);
          setTeam(teamData);
        }
      } catch (error) {
        console.error("Failed to load team", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Team ({team.length})</h1>
      {team.length === 0 ? (
        <p className="text-gray-500">No team members found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((emp) => (
            <div key={emp._id} className="bg-white rounded-xl border p-6 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{emp.firstName} {emp.lastName}</h3>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{emp.status}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail size={14} /> {emp.workEmail}
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={14} /> Pos ID: {emp.primaryPositionId}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
