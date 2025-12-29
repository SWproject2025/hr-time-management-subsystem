"use client";

import React, { useMemo } from "react";
import type { OnboardingProgress } from "@/lib/onboardingService";

type Props = {
  items: OnboardingProgress[];
};

function isDueWithinNextDays(dateISO?: string, days = 7) {
  if (!dateISO) return false;
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return false;

  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + days);

  return d >= now && d <= end;
}

export default function OnboardingStatsCards({ items }: Props) {
  const stats = useMemo(() => {
    const total = items.length;

    const active = items.filter((p) => !p.onboarding.completed).length;

    const avgCompletion =
      total === 0
        ? 0
        : Math.round(
            items.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / total
          );

    // due this week = any onboarding that has at least one NOT completed task with deadline in next 7 days
    const dueThisWeek = items.filter((p) => {
      const o = p.onboarding;
      if (o.completed) return false;

      return o.tasks?.some(
        (t) => t.status !== "completed" && isDueWithinNextDays(t.deadline, 7)
      );
    }).length;

    return { total, active, avgCompletion, dueThisWeek };
  }, [items]);

  const Card = ({
    title,
    value,
    sub,
  }: {
    title: string;
    value: string | number;
    sub?: string;
  }) => (
    <div className="border rounded-lg p-4 bg-white">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub ? <div className="text-xs text-gray-500 mt-1">{sub}</div> : null}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Total Active Onboardings" value={stats.active} sub={`Total: ${stats.total}`} />
      <Card title="Average Completion Rate" value={`${stats.avgCompletion}%`} />
      <Card title="Onboardings Due This Week" value={stats.dueThisWeek} />
    </div>
  );
}
