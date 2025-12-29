"use client";

import React, { useMemo, useState } from "react";
import { addOnboardingTask } from "@/lib/onboardingService";

type Dept = "HR" | "IT" | "Admin" | "Finance" | "Legal" | "Operations";

const DEPARTMENTS: Dept[] = ["HR", "IT", "Admin", "Finance", "Legal", "Operations"];

export default function AddOnboardingTaskModal({
  open,
  onboardingId,
  onClose,
  onCreated,
}: {
  open: boolean;
  onboardingId: string;
  onClose: () => void;
  onCreated: () => void; // refresh parent
}) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState<Dept>("HR");
  const [deadline, setDeadline] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  if (!open) return null;

  async function handleSave() {
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Task name is required");
      return;
    }

    try {
      setLoading(true);
      await addOnboardingTask(onboardingId, {
        name: trimmed,
        department,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        notes: notes.trim() ? notes.trim() : undefined,
      });
      onCreated();
      onClose();
      setName("");
      setDeadline("");
      setNotes("");
      setDepartment("HR");
    } catch {
      setError("Failed to add task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white border shadow">
        <div className="px-4 py-3 border-b font-semibold">Add Task</div>

        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Task name *</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Create email account"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Department</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={department}
              onChange={(e) => setDepartment(e.target.value as Dept)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Deadline (optional)</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Notes (optional)</label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[90px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any extra info..."
            />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </div>

        <div className="px-4 py-3 border-t flex justify-end gap-2">
          <button className="px-4 py-2 rounded border" onClick={onClose} type="button">
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
            onClick={handleSave}
            disabled={loading || !canSave}
            type="button"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
