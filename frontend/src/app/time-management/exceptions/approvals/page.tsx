'use client';
import { useEffect, useMemo, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService, { formatEmployeeName } from '@/services/timeManagementService';
import { useToast } from '@/hooks/use-toast';

export default function ApprovalsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true); setError(null);
    try {
      const p = await timeManagementService.getAllTimeExceptions({ status: 'OPEN' });
      const h = await timeManagementService.getAllTimeExceptions({});
      setPending(p || []);
      setHistory(h || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load exceptions');
      toast({ title: 'Error', description: err?.message || 'Failed to load', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await timeManagementService.approveTimeException(id);
      toast({ title: 'Approved', description: 'Exception approved' });
      setPending(prev => prev.filter(p => p._id !== id));
      // notify
      try { await timeManagementService.createNotificationLog({ to: id, type: 'EXCEPTION_APPROVED', message: 'Your exception was approved' }); } catch {}
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to approve', variant: 'destructive' });
    }
  }

  async function handleReject(id: string) {
    const reason = prompt('Rejection reason') || 'Rejected by manager';
    try {
      await timeManagementService.rejectTimeException(id, reason);
      toast({ title: 'Rejected', description: 'Exception rejected' });
      setPending(prev => prev.filter(p => p._id !== id));
      try { await timeManagementService.createNotificationLog({ to: id, type: 'EXCEPTION_REJECTED', message: 'Your exception was rejected' }); } catch {}
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to reject', variant: 'destructive' });
    }
  }

  const filtered = useMemo(() => {
    return pending.filter(p => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (employeeFilter && String(p.employeeId).indexOf(employeeFilter) === -1) return false;
      if (startDate && new Date(p.createdAt) < new Date(startDate)) return false;
      if (endDate && new Date(p.createdAt) > new Date(endDate)) return false;
      return true;
    });
  }, [pending, typeFilter, employeeFilter, startDate, endDate]);

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id); else copy.add(id);
      return copy;
    });
  }

  async function bulkApprove() {
    if (selectedIds.size === 0) {
      toast({ title: 'No selection', description: 'Select items to approve', variant: 'destructive' });
      return;
    }
    if (!confirm(`Approve ${selectedIds.size} requests?`)) return;
    for (const id of Array.from(selectedIds)) {
      try {
        await timeManagementService.approveTimeException(id);
      } catch (err) {
        console.error('bulk approve error', err);
      }
    }
    toast({ title: 'Bulk', description: 'Bulk approve completed' });
    setSelectedIds(new Set());
    await load();
  }

  function isEscalated(item: any) {
    if (!item?.createdAt) return false;
    const ageMs = Date.now() - new Date(item.createdAt).getTime();
    return ageMs > 48 * 60 * 60 * 1000;
  }

  function exportHistory() {
    const header = ['Employee','Type','Start','End','Reason','Status','CreatedAt'];
    const lines = [header.join(',')];
    for (const r of history) {
      lines.push([r.employeeId, r.type, r.startDate || '', r.endDate || '', (r.reason||'').replace(/"/g,'""'), r.status, r.createdAt].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','));
    }
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exceptions_history.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Exception Approvals</h1>
          <div className="flex items-center gap-2">
            <button className="btn" onClick={bulkApprove}>Bulk Approve</button>
            <button className="btn" onClick={exportHistory}>Export History</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm border mb-4">
          <div className="flex gap-3 items-end">
            <div>
              <label className="text-sm block">Type</label>
              <select className="input" value={typeFilter} onChange={(e)=>setTypeFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="OVERTIME">Overtime</option>
                <option value="PERMISSION">Permission</option>
                <option value="WEEKEND">Weekend</option>
              </select>
            </div>
            <div>
              <label className="text-sm block">Employee</label>
              <input className="input" value={employeeFilter} onChange={(e)=>setEmployeeFilter(e.target.value)} placeholder="Employee ID" />
            </div>
            <div>
              <label className="text-sm block">Start Date</label>
              <input type="date" className="input" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm block">End Date</label>
              <input type="date" className="input" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
            </div>
            <div>
              <button className="btn" onClick={()=>{ setTypeFilter('all'); setEmployeeFilter(''); setStartDate(''); setEndDate(''); }}>Clear</button>
            </div>
          </div>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            {filtered.map(item => (
              <div key={item._id} className="p-3 border rounded mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{formatEmployeeName(item.employeeId)} <span className="text-sm text-gray-500">({item.departmentId || '—'})</span></div>
                    <div className="text-sm text-gray-600">
                      {item.type} — {item.startDate ? new Date(item.startDate).toLocaleDateString() : (item.attendanceRecord ? 'Record exists' : 'No date')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedIds.has(item._id)} onChange={()=>toggleSelect(item._id)} />
                    {isEscalated(item) && <span className="text-sm text-red-600">Escalated</span>}
                    <button className="btn" onClick={()=>handleApprove(item._id)}>Approve</button>
                    <button className="btn" onClick={()=>handleReject(item._id)}>Reject</button>
                  </div>
                </div>
                <div className="mt-2 text-sm">Reason: {item.reason}</div>
              </div>
            ))}
          </div>

          <aside className="bg-white p-4 rounded shadow-sm border">
            <h3 className="text-lg font-medium mb-2">History</h3>
            <div className="text-sm text-gray-600 mb-2">Recent exceptions</div>
            <ul className="space-y-2">
              {history.slice(0,20).map(h => (
                <li key={h._id} className="text-sm">
                  {formatEmployeeName(h.employeeId)} — {h.type} — {h.status} — {new Date(h.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </RoleGuard>
  );
}


