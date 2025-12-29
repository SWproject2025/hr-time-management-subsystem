'use client';
import React from 'react';
import { Card } from '@/components/employee-profile-ui/card';

interface Props {
  title: string;
  description?: string;
  onEdit?: ()=>void;
}

export default function PolicyCard({ title, description, onEdit }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{title}</div>
          {description && <div className="text-sm text-gray-500">{description}</div>}
        </div>
        <div>
          {onEdit && <button className="btn" onClick={onEdit}>Edit</button>}
        </div>
      </div>
    </Card>
  );
}


