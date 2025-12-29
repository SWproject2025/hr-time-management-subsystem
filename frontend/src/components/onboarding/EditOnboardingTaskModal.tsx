"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { OnboardingTask, OnboardingTaskStatus } from "@/lib/onboardingService";
import { updateOnboardingTask } from "@/lib/onboardingService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onboardingId: string;
  task: OnboardingTask | null;
  onSaved: () => void; // call this to refresh parent page data
};

const DEPARTMENTS = ["HR", "IT", "Admin", "Finance", "Operations", "Legal", "Other"];

export default function EditOnboardingTaskModal({
  isOpen,
  onClose,
  onboardingId,
  task,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState<OnboardingTaskStatus>("pending");
  const [deadline, setDeadline] = useState<string>(""); // yyyy-mm-dd
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deadlineInputValue = useMemo(() => {
    if (!task?.deadline) return "";
    try {
      const d = new Date(task.deadline);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  }, [task?.deadline]);

  // Load task data into form when opening / changing selection
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setLoading(false);

    setName(task?.name ?? "");
    setDepartment(task?.department ?? "");
    setStatus(task?.status ?? "pending");
    setDeadline(deadlineInputValue);
    setNotes(task?.notes ?? "");
  }, [isOpen, task?._id, deadlineInputValue]);

  if (!isOpen) return null;

  async function handleSave() {
    if (!task) return;

    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Task name is required");
      return;
    }

    try {
      setLoading(true);

      await updateOnboardingTask(onboardingId, task._id, {
        name: trimmed,
        department: department.trim(),
        status,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        notes: notes.trim() ? notes.trim() : undefined,
      });

      onSaved();
      onClose();
    } catch {
      setError("Failed to update task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Edit Task</div>
          <button
            type="button"
            className="rounded px-2 py-1 text-sm border hover:bg-gray-50"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {!task ? (
            <div className="text-sm text-gray-600">No task selected.</div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium">Task name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. Submit documents"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select...</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OnboardingTaskStatus)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="pending">pending</option>
                    <option value="in_progress">in_progress</option>
                    <option value="completed">completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Deadline (optional)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded px-3 py-2 min-h-[90px]"
                  placeholder="Any notes..."
                />
              </div>

              {error ? <div className="text-sm text-red-600">{error}</div> : null}
            </>
          )}
        </div>

        <div className="border-t px-4 py-3 flex items-center justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded border hover:bg-gray-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
            onClick={handleSave}
            disabled={loading || !task}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
