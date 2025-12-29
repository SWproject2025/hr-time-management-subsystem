'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/employee-profile-ui/button';
import timeManagementService from '@/services/timeManagementService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AttendanceStatusBadge from './AttendanceStatusBadge';
import RoleGuard from '@/components/RoleGuard';

interface Props {
  employeeId?: string;
  allowMultiplePunches?: boolean;
}

export default function ClockInOutWidget({ employeeId: propEmployeeId = '', allowMultiplePunches = true }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const employeeId = propEmployeeId || String(user?.employeeProfileId || '');

  const [now, setNow] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [todayRecords, setTodayRecords] = useState<any[]>([]);
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [hoursWorked, setHoursWorked] = useState<number>(0);
  const [assignedShift, setAssignedShift] = useState<any | null>(null);

  // update clock every second
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // load today's attendance and assignments
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!employeeId) return;
      try {
        const today = new Date();
        const startDate = today.toISOString().slice(0, 10);
        const [records, assignments] = await Promise.all([
          timeManagementService.getAttendanceRecords({ employeeId, startDate, endDate: startDate }),
          timeManagementService.getAllShiftAssignments({ employeeId }),
        ]);

        if (!mounted) return;
        setTodayRecords(records || []);

        // compute assigned shift (choose current assignment)
        const myAssignment = (assignments || []).find((a: any) => {
          if (!a) return false;
          if (!a.startDate) return true;
          const s = new Date(a.startDate).setHours(0,0,0,0);
          const e = a.endDate ? new Date(a.endDate).setHours(0,0,0,0) : Infinity;
          const todayDay = new Date().setHours(0,0,0,0);
          return s <= todayDay && todayDay <= e;
        }) || null;
        setAssignedShift(myAssignment);
      } catch (err) {
        // ignore - UI will show defaults
      }
    }
    load();
    return () => { mounted = false; };
  }, [employeeId]);

  // compute isClockedIn and hours worked from today's records
  useEffect(() => {
    // aggregate punches
    let totalMs = 0;
    let clockedIn = false;

    const punches: { type: string; time: string }[] = [];
    for (const r of todayRecords || []) {
      if (Array.isArray(r.punches)) {
        punches.push(...r.punches);
      } else {
        // support legacy shape with clockIn/clockOut per record
        if (r.clockIn) punches.push({ type: 'IN', time: r.clockIn });
        if (r.clockOut) punches.push({ type: 'OUT', time: r.clockOut });
      }
    }

    punches.sort((a,b)=> new Date(a.time).getTime() - new Date(b.time).getTime());

    for (let i = 0; i < punches.length; i++) {
      const p = punches[i];
      if (p.type === 'IN') {
        // find next OUT
        const out = punches.slice(i+1).find(x=> x.type === 'OUT');
        if (out) {
          totalMs += (new Date(out.time).getTime() - new Date(p.time).getTime());
        } else {
          // open IN => count until now
          totalMs += (Date.now() - new Date(p.time).getTime());
          clockedIn = true;
        }
      }
    }

    setHoursWorked(Math.round(totalMs / (1000*60)) ); // minutes
    setIsClockedIn(clockedIn);
  }, [todayRecords, now]);

  const outsideShiftHours = useMemo(() => {
    if (!assignedShift || !assignedShift.shiftId) return null;
    // shift may be populated or just id; try to use shift fields
    const shift = assignedShift.shift || assignedShift.shiftId;
    if (!shift || !shift.startTime || !shift.endTime) return null;
    try {
      const [sh, sm] = shift.startTime.split(':').map((s:string)=>Number(s));
      const [eh, em] = shift.endTime.split(':').map((s:string)=>Number(s));
      const start = new Date(now);
      start.setHours(sh, sm, 0, 0);
      const end = new Date(now);
      end.setHours(eh, em, 0, 0);
      return now < start || now > end;
    } catch {
      return null;
    }
  }, [assignedShift, now]);

  async function handleClockIn() {
    if (!employeeId) {
      toast({ title: 'Missing employee', description: 'No employee id found', variant: 'destructive' });
      return;
    }
    if (isClockedIn && !allowMultiplePunches) {
      toast({ title: 'Already clocked in', description: 'You are currently clocked in', variant: 'destructive' });
      return;
    }
    if (outsideShiftHours) {
      toast({ title: 'Outside shift hours', description: 'You are outside your assigned shift hours', variant: 'warning' });
    }

    // optimistic UI
    const optimisticPunch = { type: 'IN', time: new Date().toISOString() };
    setTodayRecords(prev => [{ _id: `opt-${Date.now()}`, punches: [optimisticPunch], employeeId }, ...prev]);
    setIsClockedIn(true);
    setLoading(true);
    try {
      const res = await timeManagementService.clockIn(employeeId);
      toast({ title: 'Clocked in', description: 'Your clock-in was recorded' });
      // refresh today's records
      const startDate = new Date().toISOString().slice(0,10);
      const records = await timeManagementService.getAttendanceRecords({ employeeId, startDate, endDate: startDate });
      setTodayRecords(records || []);
    } catch (err: any) {
      // rollback optimistic
      setTodayRecords(prev => prev.filter(r => !String(r._id).startsWith('opt-')));
      setIsClockedIn(false);
      toast({ title: 'Clock in failed', description: err?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handleClockOut() {
    if (!employeeId) {
      toast({ title: 'Missing employee', description: 'No employee id found', variant: 'destructive' });
      return;
    }
    if (!isClockedIn) {
      toast({ title: 'Not clocked in', description: 'You are not currently clocked in', variant: 'destructive' });
      return;
    }

    // optimistic UI: append OUT punch to last optimistic or real record
    setLoading(true);
    const optimisticPunch = { type: 'OUT', time: new Date().toISOString() };
    setTodayRecords(prev => {
      const copy = [...prev];
      if (copy.length > 0) {
        // append to first record's punches if it was our optimistic entry
        copy[0] = {
          ...copy[0],
          punches: [...(copy[0].punches || []), optimisticPunch],
        };
      } else {
        copy.unshift({ _id: `opt-${Date.now()}`, punches: [optimisticPunch], employeeId });
      }
      return copy;
    });
    setIsClockedIn(false);

    try {
      await timeManagementService.clockOut(employeeId);
      toast({ title: 'Clocked out', description: 'Your clock-out was recorded' });
      const startDate = new Date().toISOString().slice(0,10);
      const records = await timeManagementService.getAttendanceRecords({ employeeId, startDate, endDate: startDate });
      setTodayRecords(records || []);
    } catch (err: any) {
      // rollback: remove optimistic OUT
      setTodayRecords(prev => prev.filter(r => !String(r._id).startsWith('opt-')));
      setIsClockedIn(true);
      toast({ title: 'Clock out failed', description: err?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="pace-y-3 max-w-md">
        <div>
          <div className="text-sm text-gray-500">Current time</div>
          <div className="text-3xl font-mono">{now.toLocaleTimeString()}</div>
          <div className="mt-2 flex items-center gap-2">
            <AttendanceStatusBadge state={isClockedIn ? 'VALID' : 'PENDING_REVIEW'} />
            <div className="text-sm text-gray-600">Hours today: <span className="font-medium">{hoursWorked} min</span></div>
          </div>
        </div>

        <div className="pace-x-2">
          <RoleGuard allowedRoles={['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN']}>
            <button
              className="btn"
              onClick={handleClockIn}
              disabled={loading || isClockedIn}
            >
              Clock In
            </button>
          </RoleGuard>
          <RoleGuard allowedRoles={['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN']}>
            <button
              className="btn"
              onClick={handleClockOut}
              disabled={loading || !isClockedIn}
            >
              Clock Out
            </button>
          </RoleGuard>
        </div>

        <div className="text-sm">
          <div><a href="/time-management/attendance/corrections" className="text-blue-600 hover:underline">Request Correction</a></div>
          <div><a href="/time-management/schedules" className="text-blue-600 hover:underline">View My Schedule</a></div>
        </div>

        {assignedShift ? (
          <div className="mt-3 text-sm text-gray-600">Assigned shift: <span className="font-medium">{assignedShift.shift?.name || assignedShift.shiftId || '—'}</span></div>
        ) : (
          <div className="mt-3 text-sm text-yellow-700">No shift assigned</div>
        )}
        {outsideShiftHours && <div className="mt-2 text-sm text-red-600">You are outside your assigned shift hours</div>}
      </div>
    </div>
  );
}


