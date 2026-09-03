'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }
    if (user.role !== 'radiologist') {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'radiologist') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>در حال بارگذاری…</p>
      </div>
    );
  }

  return <>{children}</>;
}
