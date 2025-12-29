'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Role-based access control wrapper
 * Protects pages/components by checking user roles
 */
export default function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const hasAccess = user?.roles?.some(role => {
    const roleLower = role.toLowerCase();
    return allowedRoles.some(allowedRole => {
      const allowedLower = allowedRole.toLowerCase();
      return roleLower.includes(allowedLower) || allowedLower.includes(roleLower) ||
             role === allowedRole || role.replace('_', ' ') === allowedRole ||
             allowedRole.replace('_', ' ') === role;
    });
  }) ?? false;

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      // Optional: redirect to unauthorized page
      // router.push('/unauthorized');
    }
  }, [isLoading, hasAccess, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg 
          className="mx-auto h-12 w-12 text-red-400 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
        <p className="text-red-600">You don't have permission to view this content.</p>
        <p className="text-sm text-red-500 mt-2">Required role: {allowedRoles.join(' or ')}</p>
      </div>
    );
  }

  return <>{children}</>;
}
