import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/calc-draft-utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message: string;
  actionButton?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, message, actionButton, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {Icon && <Icon className="h-12 w-12 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">{message}</p>
      {actionButton}
    </div>
  );
}
