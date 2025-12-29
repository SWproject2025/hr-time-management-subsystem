'use client';
import React from 'react';
import { Card } from '@/components/employee-profile-ui/card';

interface Props {
  id: string;
  employeeId: string;
  type?: string;
  onApprove?: (id: string)=>void;
  onReject?: (id: string)=>void;
}

export default function ExceptionApprovalCard({ id, employeeId, type, onApprove, onReject }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{employeeId}</div>
          <div className="text-sm text-gray-500">{type}</div>
        </div>
        <div>
          {onApprove && <button className="btn mr-2" onClick={()=>onApprove(id)}>Approve</button>}
          {onReject && <button className="btn" onClick={()=>onReject(id)}>Reject</button>}
        </div>
      </div>
    </Card>
  );
}


