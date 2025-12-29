'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { performanceApi } from '@/services/performance.service';
import type { AppraisalCycle } from '@/types/performance';

export default function CycleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = useMemo(() => (params?.id ? String(params.id) : ''), [params]);

  const [item, setItem] = useState<AppraisalCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function reload() {
    if (!id) return;
    const res = await performanceApi.getCycleById(id);
    setItem(res.data);
  }

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setErr(null);
        setLoading(true);
        await reload();
      } catch (e: any) {
        setItem(null);
        setErr(e?.response?.data?.message || e?.message || 'Failed to load cycle');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function runAction(action: () => Promise<any>) {
    if (!id) return;
    try {
      setErr(null);
      setActing(true);

      await action();

      // optional: refresh server components if any
      router.refresh();

      // reload details for client state
      await reload();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'Action failed');
    } finally {
      setActing(false);
    }
  }

  if (!id) return <p style={{ padding: 24 }}>Missing cycle id</p>;
  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (err) return <p style={{ padding: 24, color: 'red' }}>{err}</p>;
  if (!item) return <p style={{ padding: 24 }}>Not found</p>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>{item.name}</h1>
        <Link href="/performance/cycles">Back</Link>
      </div>

      <div style={{ marginTop: 12 }}>
        <p><b>Type:</b> {item.cycleType}</p>
        <p><b>Status:</b> {item.status}</p>
        <p><b>Start:</b> {formatDate(item.startDate)}</p>
        <p><b>End:</b> {formatDate(item.endDate)}</p>
        <p><b>Description:</b> {item.description || '-'}</p>
        <p><b>Manager Due:</b> {formatDate(item.managerDueDate)}</p>
        <p><b>Acknowledgement Due:</b> {formatDate(item.employeeAcknowledgementDueDate)}</p>
      </div>

      <hr style={{ margin: '16px 0' }} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={acting}
          onClick={() => runAction(() => performanceApi.activateCycle(id))}
        >
          {acting ? 'Working...' : 'Activate'}
        </button>

        <button
          type="button"
          disabled={acting}
          onClick={() => runAction(() => performanceApi.publishCycle(id))}
        >
          {acting ? 'Working...' : 'Publish'}
        </button>

        <button
          type="button"
          disabled={acting}
          onClick={() => runAction(() => performanceApi.closeCycle(id))}
        >
          {acting ? 'Working...' : 'Close'}
        </button>

        <button
          type="button"
          disabled={acting}
          onClick={() => runAction(() => performanceApi.archiveCycle(id))}
        >
          {acting ? 'Working...' : 'Archive'}
        </button>
      </div>

      {err && <p style={{ marginTop: 12, color: 'red' }}>{err}</p>}
    </div>
  );
}

function formatDate(v?: string) {
  if (!v) return '-';
  const d = new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10);
}
