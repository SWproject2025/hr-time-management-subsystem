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
      setLoading(true);
      setError(null);
      const res = await performanceApi.getTemplates();
      setItems(res.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load templates');
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
        <Link href="/performance/templates/new">+ New Template</Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <table border={1} cellPadding={10} style={{ width: '100%', marginTop: 16 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t._id}>
                <td>{t.name}</td>
                <td>{t.templateType}</td>
                <td>{t.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <Link href={`/performance/templates/${t._id}`}>View</Link>
                  {' | '}
                  <Link href={`/performance/templates/${t._id}/edit`}>Edit</Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4}>No templates yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
