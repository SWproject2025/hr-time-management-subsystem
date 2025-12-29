'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { offboardingService } from '@/lib/offboardingService';

import TerminationDetailCard from '@/components/termination/TerminationDetailCard';
import TerminationActionButtons from '@/components/termination/TerminationActionsButtons';
import TerminationAuditTrail from '@/components/termination/TerminationAuditTrail';

export default function TerminationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [termination, setTermination] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    offboardingService
      .getTerminationById(params.id)
      .then((res) => setTermination(res.data))
      .finally(() => setLoading(false));
  }, [params.id]);

  const approve = async () => {
    await offboardingService.approveTermination(params.id, {});
    router.push(`/termination/${params.id}/clearance`);
  };

  const reject = async () => {
    await offboardingService.rejectTermination(params.id, {
      hrComments: 'Rejected by HR',
    });
    router.refresh();
  };

  if (loading) return <div>Loading...</div>;
  if (!termination) return <div>Not found</div>;

  return (
    <div className="space-y-6">
      <TerminationDetailCard termination={termination} />

      <TerminationActionButtons
        termination={termination}
        onApprove={approve}
        onReject={reject}
      />

      <TerminationAuditTrail termination={termination} />
    </div>
  );
}
