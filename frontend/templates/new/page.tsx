'use client';

import { useRouter } from 'next/navigation';
import TemplateForm from '@/components/performance/TemplateForm';
import { performanceApi } from '@/services/performance.service';
import type { CreateTemplateDto } from '@/types/performance';

export default function NewTemplatePage() {
  const router = useRouter();

  async function handleCreate(payload: CreateTemplateDto) {
    const res = await performanceApi.createTemplate(payload);
    router.push(`/performance/templates/${res.data._id}`);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>New Performance Template</h1>
      <TemplateForm onSubmit={handleCreate} submitLabel="Create" />
    </div>
  );
}
