'use client';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';

export default function PoliciesPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN','HR','TIME_MANAGER']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Policies</h1>
        <div className="space-y-2">
          <Link href="/time-management/policies/attendance"><button className="btn">Attendance Rules</button></Link>
          <Link href="/time-management/policies/rest-days"><button className="btn">Rest Days</button></Link>
          <Link href="/time-management/policies/overtime"><button className="btn">Overtime Rules</button></Link>
          <Link href="/time-management/policies/lateness"><button className="btn">Lateness Rules</button></Link>
          <Link href="/time-management/policies/holidays"><button className="btn">Holidays</button></Link>
        </div>
      </div>
    </RoleGuard>
  );
}


