"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Briefcase, ChevronRight, Clock, DollarSign, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";

function isOverdue(task: any) {
  if (!task) return false;
  if (task.status === "completed" || task.completedAt) return false;
  if (!task.deadline) return false;
  const d = new Date(task.deadline);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

const Dashboard = () => {
  const router = useRouter();

  const [onboardingSummary, setOnboardingSummary] = useState<{
    total: number;
    active: number;
    overdueTasks: number;
    loading: boolean;
  }>({
    total: 0,
    active: 0,
    overdueTasks: 0,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadOnboardingSummary() {
      try {
        const api: any = await import("@/lib/onboardingService");

        const listFn =
          api.getOnboardings ||
          api.listOnboardings ||
          api.default?.getOnboardings ||
          api.default?.listOnboardings;

        if (typeof listFn !== "function") {
          if (!cancelled) setOnboardingSummary((s) => ({ ...s, loading: false }));
          return;
        }

        const onboardings = await listFn();

        let total = 0;
        let active = 0;
        let overdueTasks = 0;

        for (const o of onboardings || []) {
          total += 1;
          if (!o?.completed) active += 1;

          const tasks = o?.tasks || [];
          for (const t of tasks) {
            if (isOverdue(t)) overdueTasks += 1;
          }
        }

        if (!cancelled) {
          setOnboardingSummary({
            total,
            active,
            overdueTasks,
            loading: false,
          });
        }
      } catch {
        if (!cancelled) setOnboardingSummary((s) => ({ ...s, loading: false }));
      }
    }

    loadOnboardingSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        title: "Total Employees",
        value: "1,247",
        change: "+12 this month",
        changeType: "positive",
        icon: Users,
        color: "bg-blue-500",
      },
      {
        title: "Active Recruitments",
        value: "23",
        change: "8 positions filled",
        changeType: "positive",
        icon: Briefcase,
        color: "bg-green-500",
      },
      {
        title: "Pending Approvals",
        value: "47",
        change: "15 leave requests",
        changeType: "neutral",
        icon: Clock,
        color: "bg-yellow-500",
      },
      {
        title: "Payroll Processing",
        value: "$2.5M",
        change: "December 2025",
        changeType: "neutral",
        icon: DollarSign,
        color: "bg-purple-500",
      },
    ],
    []
  );

  const pendingActions = useMemo(
    () => [
      { id: 1, type: "Leave Request", employee: "Ahmed Hassan", department: "Engineering", priority: "High", status: "Pending Manager" },
      { id: 2, type: "Overtime Approval", employee: "Fatima Ali", department: "Sales", priority: "Medium", status: "Pending HR" },
      { id: 3, type: "Performance Review", employee: "Mohamed Ibrahim", department: "Marketing", priority: "High", status: "In Progress" },
      { id: 4, type: "Onboarding Task", employee: "Sara Ahmed", department: "Finance", priority: "High", status: "Pending IT" },
      { id: 5, type: "Exit Interview", employee: "Youssef Mahmoud", department: "Operations", priority: "Medium", status: "Scheduled" },
      { id: 6, type: "Termination Request", employee: "Youssef Mahmoud", department: "Operations", priority: "High", status: "Pending HR Approval" },
    ],
    []
  );

  const recentActivities = useMemo(
    () => [
      { id: 1, action: "Payroll processed for December 2025", user: "Payroll Specialist", time: "2 hours ago" },
      { id: 2, action: "New employee onboarded: Sara Ahmed", user: "HR Admin", time: "5 hours ago" },
      { id: 3, action: "Performance cycle initiated for Q4", user: "HR Manager", time: "1 day ago" },
      { id: 4, action: "Job posting published: Senior Developer", user: "Recruiter", time: "1 day ago" },
      { id: 5, action: "Leave policy updated: Annual Leave", user: "HR Manager", time: "2 days ago" },
    ],
    []
  );

  const quickLinks = useMemo(
    () => [
      { title: "Process Payroll", description: "Run monthly payroll cycle", icon: DollarSign, color: "text-purple-600", path: "/payroll-runs" },
      { title: "Time Management", description: "Attendance & shift tracking", icon: Clock, color: "text-blue-600", path: "/time-management" },
      { title: "Review Candidates", description: "12 new applications", icon: Briefcase, color: "text-green-600", path: "/contracts" },
      { title: "Performance Reviews", description: "8 pending reviews", icon: TrendingUp, color: "text-orange-600", path: "/performance" },
    ],
    []
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm">Welcome back! Here's what's happening with your HR operations today.</p>
      </div>

      {/* Onboarding Integration (2.7) */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm text-gray-600">Onboarding</div>
          {onboardingSummary.loading ? (
            <div className="text-sm text-gray-700">Loading onboarding summary...</div>
          ) : (
            <div className="text-sm text-gray-800">
              Total: <span className="font-semibold">{onboardingSummary.total}</span> • Active:{" "}
              <span className="font-semibold">{onboardingSummary.active}</span> • Overdue tasks:{" "}
              <span className="font-semibold">{onboardingSummary.overdueTasks}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Open Onboarding
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <div className="text-gray-500 text-sm mb-1">{stat.title}</div>
              <div className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</div>
              <div
                className={`text-sm ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : stat.changeType === "negative"
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <button
              key={index}
              onClick={() => link.path && router.push(link.path)}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left w-full"
            >
              <Icon size={20} className={`${link.color} mb-2`} />
              <div className="font-medium text-gray-800 text-sm mb-1">{link.title}</div>
              <div className="text-xs text-gray-500">{link.description}</div>
            </button>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Pending Actions</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingActions.map((action) => (
                  <tr key={action.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-800">{action.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{action.employee}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{action.department}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          action.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : action.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {action.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{action.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
          </div>
          <div className="p-4 space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="text-sm text-gray-800 mb-1">{activity.action}</div>
                  <div className="text-xs text-gray-500">
                    {activity.user} • {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Modules Overview */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Module Status Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-blue-600 mb-1">Active</div>
            <div className="text-sm text-gray-600">Employee Profiles</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-green-600 mb-1">Running</div>
            <div className="text-sm text-gray-600">Time Management</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-purple-600 mb-1">Processing</div>
            <div className="text-sm text-gray-600">Payroll Cycle</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-orange-600 mb-1">Active</div>
            <div className="text-sm text-gray-600">Recruitment</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
