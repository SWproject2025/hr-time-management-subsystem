'use client';
import React from 'react';
import { Card } from '@/components/employee-profile-ui/card';

interface Props {
  id: string;
  name: string;
  kind?: string;
  onEdit?: (id: string)=>void;
}

export default function ShiftTypeCard({ id, name, kind, onEdit }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-gray-500">{kind}</div>
        </div>
        <div>
          {onEdit && <button className="btn" onClick={()=>onEdit(id)}>Edit</button>}
        </div>
      </div>
    </Card>
  );
}


