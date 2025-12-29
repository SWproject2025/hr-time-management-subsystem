'use client';
import ClearanceProgressTracker from '@/components/termination/ClearanceProgressTracker';

import React, { useEffect, useState } from 'react';
import { offboardingService } from '@/lib/offboardingService';
import ClearanceHeader from '@/components/termination/ClearanceHeader';
import DepartmentClearanceCard from '@/components/termination/DepartmentClearanceCard';
import EquipmentReturnList from '@/components/termination/EquipmentReturnList';
import AccessCardToggle from '@/components/termination/AccessCardToggle';
import ClearanceProgressSummary from '@/components/termination/ClearanceProgressSummary';

export default function ClearanceChecklistPage({ params }: any) {
  const terminationId = params.id;
  const [clearance, setClearance] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);

  const load = async () => {
    const checklist = await offboardingService.getClearance(terminationId);
    setClearance(checklist.data);

    const progressRes = await offboardingService.getClearanceProgress(
      checklist.data._id,
    );
    setProgress(progressRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  if (!clearance || !progress) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <ClearanceHeader progress={progress} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {clearance.items.map((item: any) => (
            <DepartmentClearanceCard
              key={item._id}
              item={item}
              checklistId={clearance._id}
              reload={load}
            />
          ))}

          <EquipmentReturnList
            checklist={clearance}
            reload={load}
          />

          <AccessCardToggle
            checklist={clearance}
            reload={load}
          />
        </div>

        <ClearanceProgressSummary progress={progress} />
        <ClearanceProgressTracker progress={progress} />

      </div>
    </div>
  );
}
