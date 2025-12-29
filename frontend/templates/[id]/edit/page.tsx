'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TemplateForm from '@/components/performance/TemplateForm';
import { performanceApi } from '@/services/performance.service';
import type { AppraisalTemplate, CreateTemplateDto } from '@/types/performance';

export default function EditTemplatePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [initial, setInitial] = useState<AppraisalTemplate | null>(null);

  useEffect(() => {
    (async () => {
      const res = await performanceApi.getTemplateById(id);
      setInitial(res.data);
    })();
  }, [id]);

  async function handleUpdate(payload: CreateTemplateDto) {
    await performanceApi.updateTemplate(id, payload);
    router.push(`/performance/templates/${id}`);
  }

  if (!initial) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Edit Template</h1>
      <TemplateForm
        initial={initial as any}
        onSubmit={handleUpdate}
        submitLabel="Update"
      />
    </div>
  );
}
