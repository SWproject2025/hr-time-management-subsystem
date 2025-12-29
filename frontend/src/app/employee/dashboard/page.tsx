"use client"
import React from 'react';
import { getToken } from '../../../lib/auth';
import Link from 'next/link';
import EmployeeSidebar from '../../../components/EmployeeSidebar';

export default function EmployeeDashboard() {
  const token = typeof window !== 'undefined' ? getToken() : null;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1">
          <EmployeeSidebar />
        </div>
        <div className="col-span-3 bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">Employee Portal</h1>
          <p className="mb-4">You are {token ? 'logged in' : 'not logged in'}.</p>

          <div className="space-y-3">
            <Link href="/employee/login"><a className="text-blue-600">Login</a></Link>
            <Link href="/employee/register"><a className="text-blue-600">Create account</a></Link>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-600">Hint: after logging in, future API calls should include the stored JWT in the Authorization header.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
