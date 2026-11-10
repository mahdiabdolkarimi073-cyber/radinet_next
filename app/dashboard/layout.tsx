'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { getPanelPathForRole } from '@/lib/auth-client';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isDoctorRole = user?.role === 'radiologist' || user?.role === 'doctor';

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }
    if (!isDoctorRole) {
      router.replace(getPanelPathForRole(user.role));
    }
  }, [user, loading, isDoctorRole, router]);

  if (loading || !user || !isDoctorRole) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>در حال بارگذاری…</p>
      </div>
    );
  }

  return <>{children}</>;
}
