'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { performanceApi } from '@/services/performance.service';
import type { AppraisalTemplate } from '@/types/performance';

export default function TemplateDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<AppraisalTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await performanceApi.getTemplateById(id);
      setItem(res.data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (!item) return <p style={{ padding: 24 }}>Not found</p>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>{item.name}</h1>
        <Link href={`/performance/templates/${item._id}/edit`}>Edit</Link>
      </div>

      <p><b>Type:</b> {item.templateType}</p>
      <p><b>Active:</b> {item.isActive ? 'Yes' : 'No'}</p>
      <p><b>Description:</b> {item.description || '-'}</p>

      <h3>Rating Scale</h3>
      <p>
        {item.ratingScale.type} ({item.ratingScale.min} → {item.ratingScale.max}, step {item.ratingScale.step ?? 1})
      </p>

      <h3>Criteria</h3>
      <ul>
        {item.criteria?.map((c) => (
          <li key={c.key}>
            <b>{c.title}</b> ({c.key}) — weight: {c.weight ?? 0} — required: {c.required ? 'Yes' : 'No'}
          </li>
        ))}
        {(!item.criteria || item.criteria.length === 0) && <li>No criteria.</li>}
      </ul>
    </div>
  );
}
