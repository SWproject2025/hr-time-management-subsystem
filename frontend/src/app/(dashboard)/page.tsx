"use client";
import Dashboard from "@/components/Dashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="p-6">
        <Dashboard />
      </div>
    </ProtectedRoute>
  );
}
