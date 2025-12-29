'use client';

import { useRouter } from 'next/navigation';
import TemplateForm from '@/components/performance/TemplateForm';
import { performanceApi } from '@/services/performance.service';
import type { CreateTemplateDto } from '@/types/performance';

export default function NewTemplatePage() {
  const router = useRouter();

  async function handleCreate(payload: CreateTemplateDto) {
    await performanceApi.createTemplate(payload);
    router.push('/performance/templates'); // back to list after creating
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>New Performance Template</h1>
      </div>

      <div style={{ marginTop: 16 }}>
        <TemplateForm onSubmit={handleCreate} submitLabel="Create Template" />
      </div>
    </div>
  );
}
