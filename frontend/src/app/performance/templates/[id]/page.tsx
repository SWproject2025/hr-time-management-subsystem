'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { performanceApi } from '@/services/performance.service';
import type { AppraisalTemplate } from '@/types/performance';

export default function TemplateDetailsPage() {
  const params = useParams();

  /**
   * Extract template id from URL
   * /performance/templates/[id]
   */
  const id = useMemo(() => {
    return params?.id ? String(params.id) : '';
  }, [params]);

  const [item, setItem] = useState<AppraisalTemplate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadTemplate = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await performanceApi.getTemplateById(id);
        setItem(res.data);
      } catch (e: any) {
        setItem(null);
        setError(
          e?.response?.data?.message ||
            e?.message ||
            'Failed to load template'
        );
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [id]);

  // ========================
  // UI STATES
  // ========================

  if (!id) {
    return <p style={{ padding: 24 }}>Missing template id</p>;
  }

  if (loading) {
    return <p style={{ padding: 24 }}>Loading template...</p>;
  }

  if (error) {
    return (
      <p style={{ padding: 24, color: 'red' }}>
        {error}
      </p>
    );
  }

  if (!item) {
    return <p style={{ padding: 24 }}>Template not found</p>;
  }

  // ========================
  // MAIN VIEW
  // ========================

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0 }}>{item.name}</h1>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/performance/templates">Back</Link>
          <Link href={`/performance/templates/${item._id}/edit`}>
            Edit
          </Link>
        </div>
      </div>

      {/* Basic Info */}
      <div style={{ marginTop: 16 }}>
        <p>
          <b>Template Type:</b> {item.templateType}
        </p>
        <p>
          <b>Active:</b> {item.isActive ? 'Yes' : 'No'}
        </p>
        <p>
          <b>Description:</b> {item.description || '-'}
        </p>
        <p>
          <b>Instructions:</b> {item.instructions || '-'}
        </p>
      </div>

      <hr style={{ margin: '20px 0' }} />

      {/* Rating Scale */}
      <h3>Rating Scale</h3>
      <p>
        <b>Type:</b> {item.ratingScale.type}
        <br />
        <b>Range:</b> {item.ratingScale.min} → {item.ratingScale.max}
        <br />
        <b>Step:</b> {item.ratingScale.step ?? 1}
      </p>

      <hr style={{ margin: '20px 0' }} />

      {/* Criteria */}
      <h3>Criteria</h3>
      <ul>
        {item.criteria.map((c) => (
          <li key={c.key}>
            <b>{c.title}</b> ({c.key})
            {' — '}weight: {c.weight ?? 0}
            {' — '}required: {c.required ? 'Yes' : 'No'}
            {c.details ? ` — ${c.details}` : ''}
          </li>
        ))}

        {item.criteria.length === 0 && (
          <li>No criteria defined</li>
        )}
      </ul>
    </div>
  );
}
