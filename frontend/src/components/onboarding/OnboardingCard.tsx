import React, { useMemo } from "react";
import type { OnboardingProgress } from "@/lib/onboardingService";

function isDueThisWeek(deadline?: string): boolean {
  if (!deadline) return false;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return false;

  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + 7);

  return d >= now && d <= end;
}

export default function OnboardingStatsCards({
  items,
}: {
  items: OnboardingProgress[];
}) {
  const stats = useMemo(() => {
    const active = items.filter((p) => !p.onboarding.completed).length;
    const avg =
      items.length === 0
        ? 0
        : Math.round(items.reduce((sum, p) => sum + (p.progress || 0), 0) / items.length);

    const dueThisWeek = items.reduce((count, p) => {
      const hasDue = (p.onboarding.tasks || []).some((t) => isDueThisWeek(t.deadline));
      return count + (hasDue ? 1 : 0);
    }, 0);

    return { active, avg, dueThisWeek };
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="border rounded-lg p-4 bg-white">
        <div className="text-sm text-gray-600">Total Active Onboardings</div>
        <div className="text-2xl font-semibold">{stats.active}</div>
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <div className="text-sm text-gray-600">Average Completion Rate</div>
        <div className="text-2xl font-semibold">{stats.avg}%</div>
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <div className="text-sm text-gray-600">Onboardings Due This Week</div>
        <div className="text-2xl font-semibold">{stats.dueThisWeek}</div>
      </div>
    </div>
  );
}
