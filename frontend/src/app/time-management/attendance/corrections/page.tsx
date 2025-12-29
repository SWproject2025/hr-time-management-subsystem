'use client';
import { useEffect, useMemo, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService, { formatEmployeeName } from '@/services/timeManagementService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

type Tab = 'my' | 'pending' | 'history';

export default function CorrectionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isManager = user?.roles?.some((r:string)=>['ADMIN','HR','TIME_MANAGER','MANAGER'].includes(r));

  const [tab, setTab] = useState<Tab>('my');

  // Data
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [date, setDate] = useState<string>('');
  const [issueType, setIssueType] = useState<string>('missed_punch');
  const [inTime, setInTime] = useState<string>('');
  const [outTime, setOutTime] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [evidence, setEvidence] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true); setError(null);
    try {
      const [allMy, allPending, allHistory] = await Promise.all([
        timeManagementService.getCorrectionRequests({ employeeId: user?.employeeProfileId }),
        isManager ? timeManagementService.getCorrectionRequests({ status: 'PENDING' }) : Promise.resolve([]),
        timeManagementService.getCorrectionRequests({}),
      ]);
      setMyRequests(allMy || []);
      setPending(allPending || []);
      setHistory(allHistory || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load correction requests');
      toast({ title: 'Error', description: err?.message || 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function submitRequest(e?: any) {
    if (e) e.preventDefault();
    if (!date) {
      toast({ title: 'Validation', description: 'Please select a date', variant: 'destructive' });
      return;
    }
    if (!inTime && !outTime) {
      toast({ title: 'Validation', description: 'Provide at least one corrected time', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      // Send date and requested corrections to backend
      const payload: any = {
        employeeId: user?.employeeProfileId,
        date, // Send the date instead of attendanceRecord ID
        reason: justification || `${issueType}`,
        requested: { inTime, outTime, issueType }
      };

      await timeManagementService.createCorrectionRequest(payload);
      toast({ title: 'Requested', description: 'Correction request submitted' });
      setDate(''); setInTime(''); setOutTime(''); setJustification(''); setEvidence(null);
      await loadAll();
      setTab('my');
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to submit request', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  async function approveRequest(id: string) {
    const reason = prompt('Optional approval note') || '';
    try {
      await timeManagementService.updateCorrectionRequest(id, { status: 'APPROVED', reason });
      toast({ title: 'Approved', description: 'Request approved' });
      await loadAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to approve', variant: 'destructive' });
    }
  }

  async function rejectRequest(id: string) {
    const reason = prompt('Rejection reason') || '';
    if (!reason) {
      toast({ title: 'Cancelled', description: 'Rejection aborted' });
      return;
    }
    try {
      await timeManagementService.updateCorrectionRequest(id, { status: 'REJECTED', reason });
      toast({ title: 'Rejected', description: 'Request rejected' });
      await loadAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to reject', variant: 'destructive' });
    }
  }

  const displayed = useMemo(() => {
    if (tab === 'my') return myRequests;
    if (tab === 'pending') return pending;
    return history;
  }, [tab, myRequests, pending, history]);

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Attendance Corrections</h1>
            <p className="text-sm text-gray-500">Request and approve attendance corrections</p>
          </div>
        </div>

        <div className="mb-4">
          <nav className="flex gap-2">
            <button className={`px-3 py-2 rounded ${tab==='my'?'bg-white shadow':'bg-transparent'}`} onClick={()=>setTab('my')}>My Requests</button>
            {isManager && <button className={`px-3 py-2 rounded ${tab==='pending'?'bg-white shadow':'bg-transparent'}`} onClick={()=>setTab('pending')}>Pending Approvals</button>}
            <button className={`px-3 py-2 rounded ${tab==='history'?'bg-white shadow':'bg-transparent'}`} onClick={()=>setTab('history')}>History</button>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-3">Request Correction</h3>
            <form onSubmit={submitRequest} className="space-y-3">
              <div>
                <label className="text-sm block">Date</label>
                <input type="date" className="input" value={date} onChange={(e)=>setDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm block">Issue Type</label>
                <select className="input" value={issueType} onChange={(e)=>setIssueType(e.target.value)}>
                  <option value="missed_punch">Missed Punch</option>
                  <option value="wrong_time">Wrong Time</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm block">Correct Clock In</label>
                <input type="time" className="input" value={inTime} onChange={(e)=>setInTime(e.target.value)} />
              </div>
              <div>
                <label className="text-sm block">Correct Clock Out</label>
                <input type="time" className="input" value={outTime} onChange={(e)=>setOutTime(e.target.value)} />
              </div>
              <div>
                <label className="text-sm block">Justification</label>
                <textarea className="w-full border p-2 rounded" rows={3} value={justification} onChange={(e)=>setJustification(e.target.value)} />
              </div>
              <div>
                <label className="text-sm block">Evidence (optional)</label>
                <input type="file" className="input" onChange={(e)=>setEvidence(e.target.files?.[0] || null)} />
              </div>
              <div className="flex items-center gap-2">
                <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
                <button type="button" className="btn" onClick={()=>{ setDate(''); setInTime(''); setOutTime(''); setJustification(''); setEvidence(null); }}>Reset</button>
              </div>
            </form>
          </div>

          {/* List / Approvals */}
          <div className="lg:col-span-2">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              {loading && <p>Loading...</p>}
              {error && <p className="text-red-600">{error}</p>}
              {!loading && displayed.length === 0 && <p className="text-sm text-gray-600">No items</p>}
              <ul className="space-y-3">
                {displayed.map(req => (
                  <li key={req._id} className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{formatEmployeeName(req.employeeId) || 'Employee'}</div>
                        <div className="text-sm text-gray-500">
                          {req.attendanceRecord ? new Date(req.attendanceRecord.createdAt || req.attendanceRecord).toLocaleDateString() : new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">{req.status}</div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm">Requested times: {req.requested ? `${req.requested.inTime || '-'} → ${req.requested.outTime || '-'}` : '-'}</div>
                      <div className="text-sm mt-1">Justification: {req.reason || '-'}</div>
                    </div>
                    {tab === 'pending' && isManager && (
                      <div className="mt-3 flex items-center gap-2">
                        <button className="btn" onClick={()=>approveRequest(req._id)}>Approve</button>
                        <button className="btn" onClick={()=>rejectRequest(req._id)}>Reject</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}


