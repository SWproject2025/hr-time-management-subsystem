"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  listOnboardings,
  getOnboardingProgress,
  type Onboarding,
  type OnboardingProgress,
  type OnboardingQueryParams,
} from "@/lib/onboardingService";
import OnboardingsList from "@/components/onboarding/OnboardingsList";
import OnboardingStatsCards from "@/components/onboarding/OnboardingStatsCards";
import OnboardingFilterPanel from "@/components/onboarding/OnboardingFilterPanel";

type LoadState = "idle" | "loading" | "success" | "error";

export default function OnboardingPage() {
  const router = useRouter();

  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<OnboardingQueryParams>({});
  const [search, setSearch] = useState("");

  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, OnboardingProgress>>({});

  const listFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return onboardings;
    return onboardings.filter((o) => o.employeeId.toLowerCase().includes(q));
  }, [onboardings, search]);

  const progressList = useMemo(() => {
    return listFiltered.map((o) => progressMap[o._id]).filter(Boolean);
  }, [listFiltered, progressMap]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState("loading");
      setError(null);

      try {
        const list = await listOnboardings(filters);

        if (cancelled) return;
        setOnboardings(list);

        // Fetch progress for each onboarding (safe even if backend blocks some)
        const entries = await Promise.all(
          list.map(async (o) => {
            try {
              const p = await getOnboardingProgress(o._id);
              return [o._id, p] as const;
            } catch {
              return [
                o._id,
                {
                  totalTasks: o.tasks?.length ?? 0,
                  completedTasks: (o.tasks || []).filter((t) => t.status === "completed").length,
                  progress:
                    o.tasks && o.tasks.length > 0
                      ? Math.round(
                          ((o.tasks || []).filter((t) => t.status === "completed").length / o.tasks.length) * 100
                        )
                      : 0,
                  onboarding: o,
                },
              ] as const;
            }
          })
        );

        if (cancelled) return;

        const map: Record<string, OnboardingProgress> = {};
        for (const [id, p] of entries) map[id] = p;
        setProgressMap(map);

        setState("success");
      } catch {
        if (cancelled) return;
        setState("error");
        setError("Failed to load onboardings");
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Onboarding</h1>
          <div className="text-sm text-gray-600">Manage onboarding tasks and progress</div>
        </div>

        <button
          onClick={() => router.push("/onboarding/create")}
          className="px-4 py-2 rounded bg-blue-600 text-white"
          type="button"
        >
          Create New Onboarding
        </button>
      </div>

      <OnboardingStatsCards items={progressList} />

      <OnboardingFilterPanel
        filters={filters}
        onChange={setFilters}
        search={search}
        onSearchChange={setSearch}
        onReset={() => {
          setFilters({});
          setSearch("");
        }}
      />

      {state === "loading" || state === "idle" ? (
        <div className="text-sm text-gray-600">Loading onboardings...</div>
      ) : state === "error" ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <OnboardingsList
          items={listFiltered}
          onView={(id) => router.push(`/onboarding/${id}`)}
        />
      )}
    </div>
  );
}
