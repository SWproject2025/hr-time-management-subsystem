"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import leavesService from "@/lib/leavesService";
import { ROLES, isManager, isHRAdmin } from "@/lib/roles";
import LeaveBalanceCard from "@/components/LeaveBalanceCard";

import { PatternDetectionWidget } from "@/components/PatternDetectionWidget";

export default function LeavesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [balances, setBalances] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [hrPendingCount, setHrPendingCount] = useState(0);
  const [hrStats, setHrStats] = useState<{
    totalEmployees: number;
    onLeaveToday: number;
    approvedThisMonth: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const userRoles = user?.roles || [];
  const showManagerSection = isManager(userRoles);
  const showHRSection = isHRAdmin(userRoles);

  useEffect(() => {
    loadDashboardData();
  }, [userRoles]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Always load employee balances
      const balanceData = await leavesService.getLeaveBalance();
      setBalances(balanceData);

      // Load pending approvals count for managers
      if (showManagerSection) {
        try {
          const pendingData = await leavesService.getPendingLeaveRequests(1, 1);
          setPendingCount(pendingData.pagination?.total || 0);
        } catch (e) {
          console.log("Manager approvals not available");
        }
      }

      // Load HR pending count and stats
      if (showHRSection) {
        try {
          const hrData = await leavesService.getAllLeaveRequestsForHR(
            undefined,
            1,
            1
          );
          setHrPendingCount(hrData.pagination?.total || 0);

          // Load dashboard statistics
          const stats = await leavesService.getDashboardStats();
          setHrStats(stats);
        } catch (e) {
          console.log("HR requests not available");
        }
      }
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      if (error.message === 'Unauthorized') {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">
            Welcome, {user?.firstName || "User"} •
            <span className="text-blue-600 ml-1">{userRoles.join(", ")}</span>
          </p>
        </div>
        <button
          onClick={() => router.push("/leaves/request")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow"
        >
          + Request Leave
        </button>
      </div>

      {/* ==================== EMPLOYEE SECTION ==================== */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          My Leave Dashboard
        </h2>

        {/* Leave Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {balances.slice(0, 3).map((balance, index) => (
            <LeaveBalanceCard key={index} balance={balance} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/leaves/my-leaves"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <div className="text-3xl mb-2">📋</div>
            <div className="text-sm font-medium text-gray-700">My Requests</div>
          </Link>
          <Link
            href="/leaves/balance"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm font-medium text-gray-700">
              View Balances
            </div>
          </Link>
          <Link
            href="/leaves/request"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <div className="text-3xl mb-2">✏️</div>
            <div className="text-sm font-medium text-gray-700">New Request</div>
          </Link>
          <Link
            href="/leaves/my-leaves"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <div className="text-3xl mb-2">📅</div>
            <div className="text-sm font-medium text-gray-700">
              Leave History
            </div>
          </Link>
        </div>
      </section>

      {/* ==================== MANAGER SECTION ==================== */}
      {showManagerSection && (
        <section className="border-t pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Manager Dashboard
          </h2>

          {/* Pattern Detection Widget */}
          {user?.employeeProfileId && (
             <PatternDetectionWidget employeeId={user.employeeProfileId} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pending Approvals */}
            <Link
              href="/leaves/approvals"
              className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white hover:from-orange-600 hover:to-orange-700 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Pending Approvals</p>
                  <p className="text-4xl font-bold mt-2">{pendingCount}</p>
                </div>
                <div className="text-5xl opacity-50">📥</div>
              </div>
              <p className="text-sm text-orange-100 mt-4">
                Click to review team requests
              </p>
            </Link>

            {/* Delegation */}
            <Link
              href="/leaves/delegation"
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔄</div>
                <div>
                  <p className="font-medium text-gray-900">Set Delegation</p>
                  <p className="text-sm text-gray-500">
                    Delegate approvals when away
                  </p>
                </div>
              </div>
            </Link>

            {/* Team Overview */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="text-4xl">👥</div>
                <div>
                  <p className="font-medium text-gray-900">Team Overview</p>
                  <p className="text-sm text-gray-500">
                    View team leave calendar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== HR ADMIN SECTION ==================== */}
      {showHRSection && (
        <section className="border-t pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            HR Administration
          </h2>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Link
              href="/leaves/admin/requests"
              className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-5 text-white hover:from-purple-600 hover:to-purple-700 transition"
            >
              <p className="text-purple-100 text-sm">HR Review Queue</p>
              <p className="text-3xl font-bold mt-1">{hrPendingCount}</p>
            </Link>
            <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
              <p className="text-gray-500 text-sm">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {hrStats?.totalEmployees ?? "--"}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
              <p className="text-gray-500 text-sm">On Leave Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {hrStats?.onLeaveToday ?? "--"}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
              <p className="text-gray-500 text-sm">Approved This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {hrStats?.approvedThisMonth ?? "--"}
              </p>
            </div>
          </div>

          {/* Admin Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/leaves/admin/categories"
              className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition border border-gray-100"
            >
              <div className="text-3xl mb-2">📁</div>
              <div className="text-sm font-medium text-gray-700">
                Categories
              </div>
            </Link>
            <Link
              href="/leaves/admin/types"
              className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition border border-gray-100"
            >
              <div className="text-3xl mb-2">🏷️</div>
              <div className="text-sm font-medium text-gray-700">
                Leave Types
              </div>
            </Link>
            <Link
              href="/leaves/admin/calendar"
              className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition border border-gray-100"
            >
              <div className="text-3xl mb-2">🗓️</div>
              <div className="text-sm font-medium text-gray-700">Calendar</div>
            </Link>
            <Link
              href="/leaves/admin/entitlements"
              className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition border border-gray-100"
            >
              <div className="text-3xl mb-2">⚖️</div>
              <div className="text-sm font-medium text-gray-700">
                Entitlements
              </div>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
