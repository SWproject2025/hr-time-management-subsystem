import React from 'react';
import { FileText, FileSignature, IdCard, Award, FileX } from 'lucide-react';
import { cn } from '@/lib/calc-draft-utils';

interface DocumentTypeIconProps {
  type: 'cv' | 'contract' | 'id' | 'certificate' | 'resignation';
  className?: string;
}

const iconConfig = {
  cv: {
    Icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  contract: {
    Icon: FileSignature,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  id: {
    Icon: IdCard,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  certificate: {
    Icon: Award,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  resignation: {
    Icon: FileX,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
};

export function DocumentTypeIcon({ type, className }: DocumentTypeIconProps) {
  const config = iconConfig[type];
  const Icon = config.Icon;

  return (
    <div className={cn('p-3 rounded-lg inline-flex', config.bgColor)}>
      <Icon className={cn(config.color, className)} />
    </div>
  );
}
