'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { offboardingService } from '@/lib/offboardingService';
import TerminationRequestForm from '@/components/termination/TerminationRequestForm';

export default function CreateTerminationPage() {
  const router = useRouter();

  const submit = async (data: any) => {
    await offboardingService.createTermination(data);
    router.push('/termination');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create Termination Request</h1>
      <TerminationRequestForm onSubmit={submit} />
    </div>
  );
}
