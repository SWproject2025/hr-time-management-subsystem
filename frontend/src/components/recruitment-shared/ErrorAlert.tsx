import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/calc-draft-utils';

interface ErrorAlertProps {
  message: string;
  title?: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ message, title = 'Error', onDismiss, className }: ErrorAlertProps) {
  return (
    <div className={cn('rounded-lg border border-destructive/50 bg-destructive/10 p-4', className)}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <h5 className="font-medium text-destructive">{title}</h5>
          <p className="text-sm text-destructive/90">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 rounded-md p-1 hover:bg-destructive/20 transition-colors"
          >
            <X className="h-4 w-4 text-destructive" />
          </button>
        )}
      </div>
    </div>
  );
}
