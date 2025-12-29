"use client";

import React, { useEffect, useState } from "react";
import type { OnboardingTask } from "@/lib/onboardingService";
import { completeOnboardingTask } from "@/lib/onboardingService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onboardingId: string;
  task: OnboardingTask | null;
  onCompleted: () => void; // call this to refresh parent page data
};

export default function CompleteOnboardingTaskModal({
  isOpen,
  onClose,
  onboardingId,
  task,
  onCompleted,
}: Props) {
  const [notes, setNotes] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset fields when modal opens / task changes
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setLoading(false);
    setNotes("");
    setDocumentUrl("");
  }, [isOpen, task?._id]);

  if (!isOpen) return null;

  async function handleConfirm() {
    if (!task) return;

    setError(null);

    try {
      setLoading(true);
      await completeOnboardingTask(onboardingId, task._id, {
        notes: notes.trim() ? notes.trim() : undefined,
        completedDocument: documentUrl.trim() ? documentUrl.trim() : undefined,
      });

      onCompleted();
      onClose();
      setNotes("");
      setDocumentUrl("");
    } catch {
      setError("Failed to complete task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Complete Task</div>
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
                <div className="text-sm text-gray-600">Task</div>
                <div className="font-medium">{task.name}</div>
                <div className="text-sm text-gray-600">
                  Department: {task.department || "-"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Supporting Document URL (optional)</label>
                <input
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://... (or leave empty)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Completion Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded px-3 py-2 min-h-[90px]"
                  placeholder="Any notes about completing this task..."
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
            onClick={handleConfirm}
            disabled={loading || !task}
          >
            {loading ? "Completing..." : "Confirm Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
