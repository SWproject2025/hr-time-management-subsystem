'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import timeManagementService from '@/services/timeManagementService';

export default function ShiftDetailPage() {
  const params = useParams() as { id?: string };
  const id = params?.id || '';
  const router = useRouter();
  const [shift, setShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const s = await timeManagementService.getShiftTypeById(id);
        if (!mounted) return;
        setShift(s);
      } catch (err: any) {
        setError(err?.message || 'Failed to load shift');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  if (!id) return <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}><p className="p-6">No shift id</p></RoleGuard>;

  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6">
        <button className="btn mb-4" onClick={()=>router.back()}>Back</button>
        {loading && <p>Loading shift...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {shift && (
          <div>
            <h1 className="text-xl font-bold">{shift.name}</h1>
            <p>Type: {shift.kind || shift.type}</p>
            <pre className="mt-4 bg-gray-50 p-3 rounded">{JSON.stringify(shift, null, 2)}</pre>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}