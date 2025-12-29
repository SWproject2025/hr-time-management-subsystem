'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { performanceApi } from '@/services/performance.service';
import type { AppraisalTemplate } from '@/types/performance';

export default function TemplatesPage() {
  const [items, setItems] = useState<AppraisalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setLoading(true);
      const res = await performanceApi.getTemplates();
      setItems(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Performance Templates</h1>

        {/* adjust this link if your create page route is different */}
        <Link href="/performance/templates/new">+ New Template</Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && items.length === 0 && <p>No templates found.</p>}

      {!loading && !error && items.length > 0 && (
        <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #444', padding: 8 }}>Name</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #444', padding: 8 }}>Type</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #444', padding: 8 }}>Active</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #444', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t._id}>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{t.name}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{t.templateType}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{t.isActive ? 'Yes' : 'No'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                  <Link href={`/performance/templates/${t._id}`}>View</Link>
                  {'  |  '}
                  <Link href={`/performance/templates/${t._id}/edit`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
