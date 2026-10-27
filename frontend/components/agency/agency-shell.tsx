'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { agencyNavItems } from '@/lib/agency-nav';

export function AgencyShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }
    if (user.role !== 'RADIANT_AGENCY') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'RADIANT_AGENCY') {
    return (
      <div className="agency-loading">
        <Activity size={24} className="agency-spin" /> در حال بررسی دسترسی...
      </div>
    );
  }

  const currentLink = agencyNavItems.find(
    (item) => pathname === item.href || (item.href !== '/agency' && pathname.startsWith(item.href)),
  );

  return (
    <div className="agency-root">
      <div className="agency-shell">
        <aside className={`agency-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="agency-brand">
            <div className="agency-brand__mark">
              <LayoutDashboard size={28} strokeWidth={1.7} />
            </div>
            <div>
              <strong>رادینت</strong>
              <span>پنل نمایندگی</span>
            </div>
            <button className="agency-sidebar__close" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'grid' : 'none' }}>
              <X size={22} />
            </button>
          </div>

          <nav className="agency-nav">
            {agencyNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/agency' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`agency-nav__item ${isActive ? 'is-active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={22} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button className="agency-nav__logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج</span>
          </button>
        </aside>

        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,29,65,.42)' }} />
        )}

        <div className="agency-content">
          <header className="agency-header">
            <div className="agency-header__title">
              <LayoutDashboard size={26} strokeWidth={1.7} />
              <span>{title ?? currentLink?.label ?? 'پنل نمایندگی'}</span>
            </div>
            <div className="agency-profile">
              <div className="agency-avatar">{user.fullName?.charAt(0) ?? 'A'}</div>
              <div className="agency-user">
                <strong>{user.fullName ?? 'نماینده'}</strong>
                <span>نمایندگی رادینت</span>
              </div>
            </div>
            <button className="agency-burger" onClick={() => setSidebarOpen(true)} aria-label="منو">
              <Menu size={26} strokeWidth={1.7} />
            </button>
          </header>

          <main className="agency-main">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
