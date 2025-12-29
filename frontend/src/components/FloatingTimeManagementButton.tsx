"use client";
import { Clock } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function FloatingTimeManagementButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show on time management pages themselves
  if (pathname?.startsWith('/time-management')) {
    return null;
  }

  // Check if user has time management access
  const hasTimeManagementAccess = user?.roles?.some((role: string) => {
    const roleLower = role.toLowerCase();
    return ['admin', 'hr', 'time_manager', 'manager', 'system_admin'].some(allowed =>
      roleLower.includes(allowed.replace('_', '')) || allowed.includes(roleLower.replace('_', ''))
    );
  });

  if (!hasTimeManagementAccess) {
    return null;
  }

  return (
    <button
      onClick={() => router.push('/time-management')}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-50 group"
      title="Go to Time Management"
    >
      <Clock size={24} />
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        Time Management
      </div>
    </button>
  );
}
