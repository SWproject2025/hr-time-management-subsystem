"use client";

import React from "react";

export type TaskDraft = {
  name: string;
  department: string;
  deadline?: string;
};

export default function OnboardingTaskInput({
  value,
  onChange,
  onRemove,
  showRemove,
}: {
  value: TaskDraft;
  onChange: (next: TaskDraft) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  return (
    <div className="border rounded p-3 bg-white space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">Task name</div>
          <input
            className="w-full border rounded px-3 py-2"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="e.g. Submit documents"
          />
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium">Department</div>
          <input
            className="w-full border rounded px-3 py-2"
            value={value.department}
            onChange={(e) => onChange({ ...value, department: e.target.value })}
            placeholder="e.g. HR"
          />
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium">Deadline (optional)</div>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={value.deadline ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                deadline: e.target.value ? e.target.value : undefined,
              })
            }
          />
        </div>
      </div>

      {showRemove ? (
        <div className="flex justify-end">
          <button
            type="button"
            className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}
