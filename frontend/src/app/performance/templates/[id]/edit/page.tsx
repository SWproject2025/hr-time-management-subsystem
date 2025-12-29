'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import TemplateForm from '@/components/performance/TemplateForm';
import { performanceApi } from '@/services/performance.service';
import type { AppraisalTemplate, UpdateTemplateDto } from '@/types/performance';

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const id = useMemo(() => (params?.id ? String(params.id) : ''), [params]);

  const [initial, setInitial] = useState<AppraisalTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const res = await performanceApi.getTemplateById(id);
        setInitial(res.data);
      } catch (e: any) {
        setInitial(null);
        setErr(e?.response?.data?.message || e?.message || 'Failed to load template');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleUpdate(payload: any) {
    // For update, backend expects Update DTO (all optional).
    // We can safely send the full form payload too.
    const dto: UpdateTemplateDto = payload as UpdateTemplateDto;

    await performanceApi.updateTemplate(id, dto);

    // Go back to details page after saving
    router.push(`/performance/templates/${id}`);
  }

  if (!id) return <p style={{ padding: 24 }}>Missing template id</p>;
  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (err) return <p style={{ padding: 24, color: 'red' }}>{err}</p>;
  if (!initial) return <p style={{ padding: 24 }}>Not found</p>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Edit Template</h1>
        <Link href={`/performance/templates/${id}`}>Back</Link>
      </div>

      <div style={{ marginTop: 16 }}>
        <TemplateForm
          initial={initial}
          onSubmit={handleUpdate}
          submitLabel="Update"
        />
      </div>
    </div>
  );
}
