'use client';
import { useEffect, useMemo, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

function startOfMonthISO(d = new Date()) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return first.toISOString().slice(0,10);
}
function endOfMonthISO(d = new Date()) {
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return last.toISOString().slice(0,10);
}

export default function RecordsPage() {
  const { user } = useAuth();
  const isManager = user?.roles?.some((r:string)=>['ADMIN','HR','TIME_MANAGER','MANAGER'].includes(r));
  const { toast } = useToast();

  const [startDate, setStartDate] = useState<string>(startOfMonthISO());
  const [endDate, setEndDate] = useState<string>(endOfMonthISO());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        const params: any = { startDate, endDate };
        if (statusFilter !== 'all') params.validationStatus = statusFilter;
        if (isManager && employeeFilter) params.employeeId = employeeFilter;
        if (!isManager) params.employeeId = user?.employeeProfileId;
        const data = await timeManagementService.getAttendanceRecords(params);
        if (!mounted) return;
        setRecords(data || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load records');
        toast({ title: 'Error', description: err?.message || 'Failed to load records', variant: 'destructive' });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return ()=>{ mounted = false; };
  }, [startDate, endDate, statusFilter, employeeFilter, isManager, user?.employeeProfileId, toast]);

  const rows = useMemo(() => {
    return records.map(r => {
      // derive first IN and last OUT
      let inTime = '';
      let outTime = '';
      if (Array.isArray(r.punches) && r.punches.length) {
        const ins = r.punches.filter((p:any)=>p.type==='IN');
        const outs = r.punches.filter((p:any)=>p.type==='OUT');
        inTime = ins[0]?.time ? new Date(ins[0].time).toLocaleTimeString() : '';
        outTime = outs.length ? new Date(outs[outs.length-1].time).toLocaleTimeString() : '';
      } else {
        inTime = r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : '';
        outTime = r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : '';
      }
      const minutes = r.totalWorkMinutes ?? 0;
      return {
        id: r._id,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
        inTime,
        outTime,
        hours: `${Math.floor(minutes/60)}:${String(minutes%60).padStart(2,'0')}`,
        status: r.validationStatus || 'PENDING_REVIEW',
        overtime: r.overtimeMinutes || 0,
        raw: r,
      };
    });
  }, [records]);

  function exportCsv() {
    const header = ['Date','Clock In','Clock Out','Hours Worked','Status','Overtime'];
    const lines = [header.join(',')];
    for (const r of rows) {
      lines.push([r.date, r.inTime, r.outTime, r.hours, r.status, r.overtime].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','));
    }
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${startDate}_to_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleRequestCorrection(record: any) {
    try {
      await timeManagementService.createCorrectionRequest({ employeeId: record.raw.employeeId || user?.employeeProfileId, attendanceRecord: record.id, reason: 'Requested via UI' });
      toast({ title: 'Requested', description: 'Correction request submitted' });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to submit request', variant: 'destructive' });
    }
  }

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Attendance Records</h1>
            <p className="text-sm text-gray-500">View and export attendance from {startDate} to {endDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn" onClick={exportCsv}>Export CSV</button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 flex flex-col md:flex-row gap-3">
          <div>
            <label className="text-sm block">Start Date</label>
            <input type="date" className="input" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm block">End Date</label>
            <input type="date" className="input" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm block">Status</label>
            <select className="input" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="VALID">Valid</option>
              <option value="FLAGGED">Flagged</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="CORRECTED">Corrected</option>
            </select>
          </div>
          {isManager && (
            <div>
              <label className="text-sm block">Employee</label>
              <input className="input" placeholder="Employee ID" value={employeeFilter} onChange={(e)=>setEmployeeFilter(e.target.value)} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Clock In</th>
                <th className="px-4 py-2 text-left">Clock Out</th>
                <th className="px-4 py-2 text-left">Hours Worked</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Overtime</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={7} className="p-4 text-center">No records</td></tr>}
              {rows.map(r => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{r.date}</td>
                  <td className="px-4 py-2">{r.inTime}</td>
                  <td className="px-4 py-2">{r.outTime}</td>
                  <td className="px-4 py-2">{r.hours}</td>
                  <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-sm ${r.status==='VALID'?'bg-green-100 text-green-800':r.status==='FLAGGED'?'bg-red-100 text-red-800':'bg-yellow-100 text-yellow-800'}`}>{r.status}</span></td>
                  <td className="px-4 py-2">{r.overtime} min</td>
                  <td className="px-4 py-2">
                    <button className="btn" onClick={()=>handleRequestCorrection(r)}>Request Correction</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGuard>
  );
}


