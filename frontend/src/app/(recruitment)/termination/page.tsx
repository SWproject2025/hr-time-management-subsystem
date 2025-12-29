'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { offboardingService } from '@/lib/offboardingService';
import TerminationTable from '@/components/termination/TerminationTable';

export default function TerminationPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    offboardingService
      .getTerminations()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id: string) => {
    try {
      await offboardingService.approveTermination(id, {});
      loadData();
    } catch (error) {
      console.error('Failed to approve termination:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await offboardingService.rejectTermination(id, { hrComments: 'Rejected by HR' });
      loadData();
    } catch (error) {
      console.error('Failed to reject termination:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Termination & Offboarding
          </h1>
          <p className="text-sm text-gray-500">
            Manage employee termination requests and clearance workflows
          </p>
        </div>

        <Link
          href="/termination/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          Create Termination Request
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-gray-500">Loading termination requests...</div>
      ) : (
        <TerminationTable
          data={data}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
