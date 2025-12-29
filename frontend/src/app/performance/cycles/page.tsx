'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { performanceApi } from '@/services/performance.service';
import type { AppraisalCycle } from '@/types/performance';

export default function CyclesListPage() {
  const [items, setItems] = useState<AppraisalCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const res = await performanceApi.getCycles();
        setItems(res.data || []);
      } catch (e: any) {
        setItems([]);
        setErr(e?.response?.data?.message || e?.message || 'Failed to load cycles');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Appraisal Cycles</h1>
        <Link href="/performance/cycles/create">+ Create Cycle</Link>
      </div>

      {loading && <p style={{ marginTop: 12 }}>Loading...</p>}
      {err && <p style={{ marginTop: 12, color: 'red' }}>{err}</p>}

      {!loading && !err && (
        <>
          {items.length === 0 ? (
            <p style={{ marginTop: 12 }}>No cycles found.</p>
          ) : (
            <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Type</th>
                  <th style={th}>Start</th>
                  <th style={th}>End</th>
                  <th style={th}>Status</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id}>
                    <td style={td}>{c.name}</td>
                    <td style={td}>{c.cycleType}</td>
                    <td style={td}>{formatDate(c.startDate)}</td>
                    <td style={td}>{formatDate(c.endDate)}</td>
                    <td style={td}>{c.status}</td>
                    <td style={td}>
                      <Link href={`/performance/cycles/${c._id}`}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '1px solid #ddd',
  padding: '8px',
};

const td: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: '8px',
};

function formatDate(v?: string) {
  if (!v) return '-';
  const d = new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10);
}
