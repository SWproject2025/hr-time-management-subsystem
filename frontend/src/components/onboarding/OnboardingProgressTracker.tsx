"use client";

import React, { useMemo } from "react";
import type { Onboarding, OnboardingTask } from "@/lib/onboardingService";
import ProgressBar from "@/components/onboarding/ProgressBar";
import ProgressCircle from "@/components/onboarding/ProgressCircle";
import { cn } from "@/lib/calc-draft-utils";

type Props = {
  onboarding: Onboarding;
  progressPercent: number; // 0-100
  completedTasks: number;
  totalTasks: number;
  className?: string;
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function getBarToneClass(p: number) {
  // we won't change ProgressBar color itself; we just show a label tone
  if (p < 30) return "text-red-600";
  if (p < 70) return "text-yellow-700";
  return "text-green-700";
}

function isOverdue(task: OnboardingTask) {
  if (task.status === "completed" || task.completedAt) return false;
  if (!task.deadline) return false;
  const d = new Date(task.deadline);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

function isDueSoon(task: OnboardingTask, days = 3) {
  if (task.status === "completed" || task.completedAt) return false;
  if (!task.deadline) return false;
  const d = new Date(task.deadline);
  if (Number.isNaN(d.getTime())) return false;
  const now = Date.now();
  const diff = d.getTime() - now;
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

export default function OnboardingProgressTracker({
  onboarding,
  progressPercent,
  completedTasks,
  totalTasks,
  className,
}: Props) {
  const percent = clamp(progressPercent);

  const byDept = useMemo(() => {
    const map: Record<
      string,
      { total: number; completed: number; percent: number }
    > = {};

    for (const t of onboarding.tasks || []) {
      const key = (t.department || "General").trim() || "General";
      if (!map[key]) map[key] = { total: 0, completed: 0, percent: 0 };
      map[key].total += 1;
      if (t.status === "completed" || !!t.completedAt) map[key].completed += 1;
    }

    for (const key of Object.keys(map)) {
      const item = map[key];
      item.percent =
        item.total === 0 ? 0 : Math.round((item.completed / item.total) * 100);
    }

    return map;
  }, [onboarding.tasks]);

  const overdue = useMemo(
    () => (onboarding.tasks || []).filter((t) => isOverdue(t)),
    [onboarding.tasks]
  );

  const dueSoon = useMemo(
    () => (onboarding.tasks || []).filter((t) => isDueSoon(t, 3)),
    [onboarding.tasks]
  );

  return (
    <div className={cn("border rounded-lg bg-white p-4 space-y-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-600">Progress tracker</div>
          <div className="text-lg font-semibold">Overall completion</div>
          <div className={cn("text-sm font-medium", getBarToneClass(percent))}>
            {percent}% • {completedTasks}/{totalTasks} tasks
          </div>
        </div>

        <ProgressCircle value={percent} />
      </div>

      <div className="space-y-2">
        <ProgressBar value={percent} />
      </div>

      <div className="space-y-2">
        <div className="font-medium">Department breakdown</div>

        {Object.keys(byDept).length === 0 ? (
          <div className="text-sm text-gray-600">No tasks to summarize.</div>
        ) : (
          <div className="space-y-3">
            {Object.entries(byDept).map(([dept, v]) => (
              <div key={dept} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{dept}</div>
                  <div className="text-sm text-gray-600">
                    {v.completed}/{v.total} • {v.percent}%
                  </div>
                </div>
                <ProgressBar value={v.percent} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border rounded p-3">
          <div className="font-medium">Overdue</div>
          {overdue.length === 0 ? (
            <div className="text-sm text-gray-600">None 🎉</div>
          ) : (
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
              {overdue.slice(0, 5).map((t) => (
                <li key={t._id}>
                  {t.name}
                  {t.deadline ? ` (due ${new Date(t.deadline).toLocaleDateString()})` : ""}
                </li>
              ))}
              {overdue.length > 5 ? (
                <li>...and {overdue.length - 5} more</li>
              ) : null}
            </ul>
          )}
        </div>

        <div className="border rounded p-3">
          <div className="font-medium">Due soon (next 3 days)</div>
          {dueSoon.length === 0 ? (
            <div className="text-sm text-gray-600">None</div>
          ) : (
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
              {dueSoon.slice(0, 5).map((t) => (
                <li key={t._id}>
                  {t.name}
                  {t.deadline ? ` (due ${new Date(t.deadline).toLocaleDateString()})` : ""}
                </li>
              ))}
              {dueSoon.length > 5 ? (
                <li>...and {dueSoon.length - 5} more</li>
              ) : null}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
