"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getOnboardingById,
  getOnboardingProgress,
  type Onboarding,
  type OnboardingProgress,
  type OnboardingTask,
} from "@/lib/onboardingService";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { StatusBadge } from "@/components/recruitment-shared/StatusBadge";

import EditOnboardingTaskModal from "@/components/onboarding/EditOnboardingTaskModal";
import CompleteOnboardingTaskModal from "@/components/onboarding/CompleteOnboardingTaskModal";
import OnboardingProgressTracker from "@/components/onboarding/OnboardingProgressTracker";

type LoadState = "idle" | "loading" | "success" | "error";

function safePercent(p?: OnboardingProgress | null) {
  if (!p) return 0;
  const v = Number.isFinite(p.progress) ? p.progress : 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function groupByDepartment(tasks: OnboardingTask[]) {
  const map: Record<string, OnboardingTask[]> = {};
  for (const t of tasks) {
    const key = t.department?.trim() || "General";
    if (!map[key]) map[key] = [];
    map[key].push(t);
  }
  return map;
}

export default function OnboardingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);

  // Modals state
  const [editOpen, setEditOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OnboardingTask | null>(null);

  const percent = useMemo(() => safePercent(progress), [progress]);

  const grouped = useMemo(() => {
    const tasks = onboarding?.tasks || [];
    return groupByDepartment(tasks);
  }, [onboarding]);

  async function reload() {
    if (!id) return;
    setState("loading");
    setError(null);

    try {
      const [o, p] = await Promise.all([
        getOnboardingById(id),
        getOnboardingProgress(id),
      ]);
      setOnboarding(o);
      setProgress(p);
      setState("success");
    } catch {
      setState("error");
      setError("Failed to load onboarding details");
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function openEdit(task: OnboardingTask) {
    setSelectedTask(task);
    setEditOpen(true);
  }

  function openComplete(task: OnboardingTask) {
    setSelectedTask(task);
    setCompleteOpen(true);
  }

  function closeModals() {
    setEditOpen(false);
    setCompleteOpen(false);
    setSelectedTask(null);
  }

  if (!id) {
    return (
      <div className="p-6">
        <div className="text-sm text-red-600">Missing onboarding id</div>
      </div>
    );
  }

  if (state === "loading" || state === "idle") {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-24 w-full bg-gray-200 rounded" />
        <div className="h-64 w-full bg-gray-200 rounded" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="p-6 space-y-4">
        <div className="text-sm text-red-600">{error}</div>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded border"
            onClick={() => router.push("/onboarding")}
            type="button"
          >
            Back to list
          </button>

          <button
            className="px-4 py-2 rounded bg-black text-white"
            onClick={() => reload()}
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tasks = onboarding?.tasks || [];
  const isCompleted = onboarding?.completed ?? false;

  return (
    <div className="p-6 space-y-6">
      {/* Modals */}
      <EditOnboardingTaskModal
        isOpen={editOpen}
        onClose={closeModals}
        onboardingId={id}
        task={selectedTask}
        onSaved={reload}
      />

      <CompleteOnboardingTaskModal
        isOpen={completeOpen}
        onClose={closeModals}
        onboardingId={id}
        task={selectedTask}
        onCompleted={reload}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Onboarding Details</h1>
          <div className="text-sm text-gray-600">Onboarding ID: {id}</div>
          <div className="text-sm text-gray-600">
            Employee ID: {onboarding?.employeeId || "-"}
          </div>
        </div>

        <div className="min-w-[260px] border rounded p-4 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Status</div>
            <StatusBadge
              status={isCompleted ? "Completed" : "In Progress"}
              variant={isCompleted ? "completed" : "in_progress"}
              size="sm"
            />
          </div>

          <div className="text-sm text-gray-600">Overall progress</div>
          <div className="text-2xl font-semibold">{percent}%</div>
          <ProgressBar value={percent} />
          <div className="text-sm text-gray-600">
            {progress?.completedTasks ?? 0}/{progress?.totalTasks ?? 0} tasks
            completed
          </div>
        </div>
      </div>

      {/* Progress Tracker (2.6) */}
      {onboarding ? (
        <OnboardingProgressTracker
          onboarding={onboarding}
          progressPercent={percent}
          completedTasks={progress?.completedTasks ?? 0}
          totalTasks={progress?.totalTasks ?? 0}
        />
      ) : null}

      {/* Tasks */}
      <div className="border rounded bg-white">
        <div className="px-4 py-3 border-b font-medium">Tasks</div>

        {tasks.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No tasks found.</div>
        ) : (
          <div className="p-4 space-y-6">
            {Object.entries(grouped).map(([dept, deptTasks]) => (
              <div key={dept} className="space-y-2">
                <div className="font-semibold">{dept}</div>

                <div className="divide-y border rounded">
                  {deptTasks.map((t) => (
                    <div
                      key={t._id}
                      className="p-4 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{t.name}</div>

                        <div className="flex items-center gap-2">
                          <StatusBadge
                            status={t.status}
                            variant={t.status}
                            size="sm"
                          />
                          {t.deadline ? (
                            <div className="text-sm text-gray-600">
                              Deadline:{" "}
                              {new Date(t.deadline).toLocaleDateString()}
                            </div>
                          ) : null}
                        </div>

                        {t.notes ? (
                          <div className="text-sm text-gray-600">{t.notes}</div>
                        ) : null}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {t.completedAt ? (
                          <div className="text-sm text-gray-600">
                            Completed:{" "}
                            {new Date(t.completedAt).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            Not completed
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
                            onClick={() => openEdit(t)}
                            type="button"
                          >
                            Edit
                          </button>

                          {!t.completedAt && (
                            <button
                              className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm"
                              onClick={() => openComplete(t)}
                              type="button"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded border"
          onClick={() => router.push("/onboarding")}
          type="button"
        >
          Back
        </button>
      </div>
    </div>
  );
}
