import React from 'react';
import { cn } from '@/lib/calc-draft-utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'under_review';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-800 border-gray-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  under_review: 'bg-blue-100 text-blue-800 border-blue-300',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function StatusBadge({ status, variant, size = 'md', className }: StatusBadgeProps) {
  // Auto-detect variant from status if not provided
  const detectedVariant = variant || (status.toLowerCase().replace(/\s+/g, '_') as keyof typeof variantStyles);
  const appliedVariant = variantStyles[detectedVariant] || variantStyles.default;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        appliedVariant,
        sizeStyles[size],
        className
      )}
    >
      {status}
    </span>
  );
}
