"use client";

import React from "react";
import type { OnboardingQueryParams, OnboardingTaskStatus } from "@/lib/onboardingService";

export default function OnboardingFilterPanel({
  filters,
  onChange,
  search,
  onSearchChange,
  onReset,
}: {
  filters: OnboardingQueryParams;
  onChange: (next: OnboardingQueryParams) => void;
  search: string;
  onSearchChange: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 bg-white space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">Employee ID</div>
          <input
            className="w-full border rounded px-3 py-2"
            value={filters.employeeId ?? ""}
            onChange={(e) => onChange({ ...filters, employeeId: e.target.value || undefined })}
            placeholder="e.g. E-1001"
          />
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium">Completion</div>
          <select
            className="w-full border rounded px-3 py-2"
            value={filters.completed === undefined ? "" : filters.completed ? "true" : "false"}
            onChange={(e) =>
              onChange({
                ...filters,
                completed:
                  e.target.value === "" ? undefined : e.target.value === "true",
              })
            }
          >
            <option value="">All</option>
            <option value="false">Active</option>
            <option value="true">Completed</option>
          </select>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium">Status</div>
          <select
            className="w-full border rounded px-3 py-2"
            value={filters.status ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                status: (e.target.value || undefined) as OnboardingTaskStatus | undefined,
              })
            }
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium">Search (employee)</div>
          <input
            className="w-full border rounded px-3 py-2"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by employee id"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="px-3 py-2 rounded border text-sm" onClick={onReset} type="button">
          Reset
        </button>
      </div>
    </div>
  );
}
