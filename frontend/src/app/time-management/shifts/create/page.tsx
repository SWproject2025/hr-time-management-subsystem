'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';

export default function CreateShiftPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await timeManagementService.createShiftType({ name });
      router.push('/time-management/shifts');
    } catch (err: any) {
      setError(err?.message || 'Failed to create shift type');
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Create Shift Type</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="input" />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <div>
            <button className="btn" disabled={loading}>{loading ? 'Saving...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}


