"use client";

import React, { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Settings, Play, User, TrendingUp, FileText, Users, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

type MenuItem =
  | {
      id: string;
      icon: any;
      label: string;
      path?: string;
      submenu?: undefined;
    }
  | {
      id: string;
      icon: any;
      label: string;
      path?: undefined;
      submenu: { id: string; label: string; path: string }[];
    };

function isOverdue(task: any) {
  if (!task) return false;
  if (task.status === "completed" || task.completedAt) return false;
  if (!task.deadline) return false;
  const d = new Date(task.deadline);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

export const Sidebar = () => {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("dashboard");

  const [overdueCount, setOverdueCount] = useState<number>(0);

  const menuItems: MenuItem[] = useMemo(
    () => [
      { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      {
        id: "payroll-config",
        icon: Settings,
        label: "Payroll Config",
        submenu: [
          { id: "policies", label: "Policies", path: "/payroll-config/policies" },
          { id: "pay-grades", label: "Pay Grades", path: "/payroll-config/pay-grades" },
          { id: "pay-types", label: "Pay Types", path: "/payroll-config/pay-types" },
          { id: "overtime-rules", label: "Overtime Rules", path: "/payroll-config/overtime-rules" },
          { id: "shift-differentials", label: "Shift Differentials", path: "/payroll-config/shift-differentials" },
          { id: "allowances", label: "Allowances", path: "/payroll-config/allowances" },
          { id: "multi-currency", label: "Multi-Currency", path: "/payroll-config/multi-currency" },
          { id: "integrations", label: "Integrations", path: "/payroll-config/integrations" },
        ],
      },
      {
        id: "payroll-runs",
        icon: Play,
        label: "Payroll Runs",
        submenu: [
          { id: "all-runs", label: "All Runs", path: "/all-runs/runs" },
          { id: "finalized-payslips", label: "Finalized Payslips", path: "/payslips" },
          { id: "exceptions", label: "Exceptions", path: "/exceptions" },
          { id: "bank-files", label: "Bank Files", path: "/bank-files" },
        ],
      },
      {
        id: "employee-portal",
        icon: User,
        label: "Employee Portal",
        submenu: [
          { id: "payslips", label: "Payslips", path: "/payslips" },
          { id: "salary-history", label: "Salary History", path: "/employee-portal/salary-history" },
          { id: "disputes", label: "Disputes", path: "/employee-portal/disputes" },
          { id: "claims", label: "Claims", path: "/employee-portal/claims" },
          { id: "tax-documents", label: "Tax Documents", path: "/employee-portal/tax-documents" },
        ],
      },
      {
        id: "recruitment",
        icon: Users,
        label: "Recruitment",
        submenu: [
          { id: "contracts", label: "Contracts", path: "/contracts" },
          { id: "documents", label: "Documents", path: "/documents" },
          { id: "onboarding", label: "Onboarding", path: "/onboarding" },
          { id: "termination", label: "Termination", path: "/termination" },
        ],
      },
      {
        id: "time-management",
        icon: Clock,
        label: "Time Management",
        submenu: [
          { id: "time-dashboard", label: "Dashboard", path: "/time-management" },
          { id: "attendance", label: "Attendance", path: "/time-management/attendance" },
          { id: "shifts", label: "Shifts", path: "/time-management/shifts" },
          { id: "schedules", label: "Schedules", path: "/time-management/schedules" },
          { id: "exceptions", label: "Exceptions", path: "/time-management/exceptions" },
          { id: "policies", label: "Policies", path: "/time-management/policies" },
          { id: "workflows", label: "Approval Workflows", path: "/time-management/workflows" },
          { id: "monitoring", label: "Monitoring", path: "/time-management/monitoring" },
          { id: "integrations", label: "Integrations", path: "/time-management/integrations" },
          { id: "automation", label: "Automation", path: "/time-management/automation" },
          { id: "time-reports", label: "Reports", path: "/time-management/reports" },
          { id: "activity-logs", label: "Activity Logs", path: "/time-management/activity-logs" },
          { id: "settings", label: "Settings", path: "/time-management/settings" },
        ],
      },
      { id: "reports", icon: TrendingUp, label: "Reports", path: "/reports" },
    ],
    []
  );

  function handleClick(id: string, path: string) {
    setActiveItem(id);
    router.push(path);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadOverdueBadge() {
      try {
        const api: any = await import("@/lib/onboardingService");

        const listFn =
          api.getOnboardings ||
          api.listOnboardings ||
          api.default?.getOnboardings ||
          api.default?.listOnboardings;

        if (typeof listFn !== "function") return;

        const onboardings = await listFn();

        let count = 0;
        for (const o of onboardings || []) {
          const tasks = o?.tasks || [];
          for (const t of tasks) {
            if (isOverdue(t)) count += 1;
          }
        }

        if (!cancelled) setOverdueCount(count);
      } catch {
        // ignore badge errors (do not break sidebar)
      }
    }

    loadOverdueBadge();

    return () => {
      cancelled = true;
    };
  }, []);

 return (
    <div className="w-60 bg-slate-900 text-white h-screen flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-slate-700">
        <span className="font-semibold text-sm">HR System</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item) => {
          const Icon = (item as any).icon;

          return (
            <div key={(item as any).id}>
              <button
                onClick={() => {
                  if (!(item as any).submenu && (item as any).path) {
                    handleClick((item as any).id, (item as any).path);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors ${
                  activeItem === (item as any).id && !(item as any).submenu ? "bg-blue-600" : ""
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{(item as any).label}</span>
              </button>

              {(item as any).submenu && (
                <div>
                  {(item as any).submenu.map((subItem: any) => (
                    <button
                      key={subItem.id}
                      onClick={() => handleClick(subItem.id, subItem.path)}
                      className={`w-full flex items-center gap-3 px-4 pl-10 py-2 text-sm hover:bg-slate-800 transition-colors ${
                        activeItem === subItem.id ? "bg-blue-600" : ""
                      }`}
                    >
                      <FileText size={14} />
                      <span className="text-left flex-1">{subItem.label}</span>

                      {subItem.id === "onboarding" && overdueCount > 0 ? (
                        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs px-2 py-0.5">
                          {overdueCount}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};
