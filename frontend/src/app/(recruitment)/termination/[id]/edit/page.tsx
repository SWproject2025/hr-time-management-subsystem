'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { offboardingService } from '@/lib/offboardingService';
import TerminationRequestForm from '@/components/termination/TerminationRequestForm';

export default function EditTerminationPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    offboardingService
      .getTerminationById(params.id)
      .then((res) => setData(res.data));
  }, [params.id]);

  const submit = async (payload: any) => {
    await offboardingService.updateTermination(params.id, payload);
    router.push(`/termination/${params.id}`);
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Termination Request</h1>
      <TerminationRequestForm initialData={data} onSubmit={submit} />
    </div>
  );
}
