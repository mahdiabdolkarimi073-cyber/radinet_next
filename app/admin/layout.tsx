'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { getPanelPathForRole } from '@/lib/auth-client';
import './admin.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      router.replace(getPanelPathForRole(user.role));
    }
  }, [user, loading, router]);

  const isAdmin = user?.role === 'admin';
  if (loading || !user || !isAdmin) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>در حال بارگذاری…</p>
      </div>
    );
  }

  return <>{children}</>;
}
