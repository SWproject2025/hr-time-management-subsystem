'use client';
import { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';

export default function ScheduleRulesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const r = await timeManagementService.getAllScheduleRules();
        if (!mounted) return;
        setRules(r || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load rules');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Schedule Rules</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <ul>
            {rules.map(r => <li key={r._id}>{r.name} — {r.pattern}</li>)}
          </ul>
        )}
      </div>
    </RoleGuard>
  );
}


