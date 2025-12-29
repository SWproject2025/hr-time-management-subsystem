"use client";

import React from "react";
import type { Onboarding } from "@/lib/onboardingService";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { StatusBadge } from "@/components/recruitment-shared/StatusBadge";

function calcProgress(tasks: Onboarding["tasks"]) {
  const totalTasks = tasks?.length ?? 0;
  const completedTasks =
    tasks?.filter((t) => t.status === "completed")?.length ?? 0;

  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return { totalTasks, completedTasks, progress };
}

export default function OnboardingsList({
  items,
  onView,
}: {
  items: Onboarding[];
  onView: (id: string) => void;
}) {
  if (!items.length) {
    return <div className="text-sm text-gray-600">No onboardings found.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {items.map((o) => {
        const { totalTasks, completedTasks, progress } = calcProgress(o.tasks);
        const completed = o.completed;

        return (
          <div key={o._id} className="border rounded-lg p-4 bg-white space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">Employee ID: {o.employeeId}</div>
                <div className="text-sm text-gray-600">
                  Start Date: {new Date(o.createdAt).toLocaleDateString()}
                </div>
              </div>

              <StatusBadge
                status={completed ? "Completed" : "In Progress"}
                variant={completed ? "completed" : "in_progress"}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-600">{progress}% completed</div>
              <ProgressBar value={progress} />
              <div className="text-sm text-gray-600">
                {completedTasks}/{totalTasks} tasks completed
              </div>
            </div>

            <div className="flex justify-end">
              <button
                className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
                onClick={() => onView(o._id)}
                type="button"
              >
                View Details
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
