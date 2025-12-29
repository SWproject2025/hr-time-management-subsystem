"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { authFetch, getToken, logout } from '../lib/auth';

export default function EmployeeSidebar() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch('http://localhost:3000/employee-profile/me');
        if (!res.ok) return;
        const json = await res.json();
        setProfile(json.profile);
      } catch (e) {
        // ignore
      }
    };
    if (getToken()) fetchProfile();
  }, []);

  return (
    <aside className="w-64 bg-white p-4 rounded shadow">
      <div className="mb-4">
        <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold">{(profile?.firstName || 'U').charAt(0)}</div>
        <div className="mt-2">
          <div className="font-semibold">{profile ? `${profile.firstName} ${profile.lastName}` : 'Guest'}</div>
          <div className="text-xs text-gray-500">{profile?.employeeNumber || ''}</div>
        </div>
      </div>

      <nav className="space-y-2">
        <Link href="/employee/dashboard"><a className="block text-sm text-blue-600">Dashboard</a></Link>
        <Link href="/employee/profile"><a className="block text-sm text-blue-600">My Profile</a></Link>
        <Link href="/time-management" className="block text-sm text-blue-600">⏰ Time Management</Link>
        <Link href="/employee/login"><a className="block text-sm text-blue-600">Login</a></Link>
      </nav>

      <div className="mt-4">
        {getToken() ? (
          <button onClick={() => { logout(); window.location.href = '/employee/login'; }} className="text-sm text-red-600">Logout</button>
        ) : null}
      </div>
    </aside>
  );
}
