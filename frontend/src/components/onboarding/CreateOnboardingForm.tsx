"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createOnboarding } from "@/lib/onboardingService";
import OnboardingTaskInput, { TaskDraft } from "./OnboardingTaskInput";

export default function CreateOnboardingForm() {
  const router = useRouter();

  const [employeeId, setEmployeeId] = useState("");
  const [useDefaultTasks, setUseDefaultTasks] = useState(true);

  const [tasks, setTasks] = useState<TaskDraft[]>([
    { name: "", department: "", deadline: undefined },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (useDefaultTasks) return [];
    return tasks
      .map((t) => ({
        name: t.name.trim(),
        department: t.department.trim(),
        deadline: t.deadline,
      }))
      .filter((t) => t.name && t.department);
  }, [tasks, useDefaultTasks]);

  function addTask() {
    setTasks((prev) => [...prev, { name: "", department: "", deadline: undefined }]);
  }

  function updateTask(index: number, next: TaskDraft) {
    setTasks((prev) => prev.map((t, i) => (i === index ? next : t)));
  }

  function removeTask(index: number) {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedEmployeeId = employeeId.trim();
    if (!trimmedEmployeeId) {
      setError("Employee ID is required");
      return;
    }

    if (!useDefaultTasks) {
      if (preview.length === 0) {
        setError("Add at least one valid task (name + department).");
        return;
      }
    }

    try {
      setLoading(true);

      const created = await createOnboarding({
        employeeId: trimmedEmployeeId,
        useDefaultTasks,
        tasks: useDefaultTasks ? undefined : preview,
      });

      router.push(`/onboarding/${created._id}`);
    } catch {
      setError("Failed to create onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Create Onboarding</h1>
          <div className="text-sm text-gray-600">
            Create a new onboarding and track tasks
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded border"
          onClick={() => router.push("/onboarding")}
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="border rounded p-4 bg-white space-y-5">
        <div className="space-y-1">
          <div className="text-sm font-medium">Employee ID</div>
          <input
            className="w-full border rounded px-3 py-2"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="e.g. E-1001"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useDefaultTasks}
            onChange={(e) => setUseDefaultTasks(e.target.checked)}
          />
          Use default tasks
        </label>

        {!useDefaultTasks ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">Custom tasks</div>
              <button
                type="button"
                className="px-3 py-1.5 rounded border text-sm"
                onClick={addTask}
              >
                Add Task
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map((t, idx) => (
                <OnboardingTaskInput
                  key={idx}
                  value={t}
                  onChange={(next) => updateTask(idx, next)}
                  onRemove={() => removeTask(idx)}
                  showRemove={tasks.length > 1}
                />
              ))}
            </div>

            <div className="border rounded p-3 bg-gray-50">
              <div className="font-medium mb-2">Preview</div>
              {preview.length === 0 ? (
                <div className="text-sm text-gray-600">No valid tasks yet.</div>
              ) : (
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {preview.map((t, i) => (
                    <li key={i}>
                      {t.name} ({t.department}){t.deadline ? ` - due ${t.deadline}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
          >
            {loading ? "Creating..." : "Submit"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
