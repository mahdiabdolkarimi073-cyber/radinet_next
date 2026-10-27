'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  LogOut,
  Users,
  FilePlus,
  ListChecks,
  BarChart3,
  FileText,
  Settings,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useEffect } from 'react';

const adminLinks = [
  { href: '/org', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/org/users', label: 'مدیریت کاربران', icon: Users, adminOnly: true },
  { href: '/org/requests/new', label: 'ثبت درخواست جدید', icon: FilePlus },
  { href: '/org/requests', label: 'پیگیری درخواست‌ها', icon: ListChecks },
  { href: '/org/reports', label: 'گزارش‌ها و آمار', icon: BarChart3 },
  { href: '/org/contracts', label: 'قراردادها و پرداخت‌ها', icon: FileText, adminOnly: true },
  { href: '/org/settings', label: 'تنظیمات سازمان', icon: Settings, adminOnly: true },
];

const staffLinks = [
  { href: '/org', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/org/requests/new', label: 'ثبت درخواست جدید', icon: FilePlus },
  { href: '/org/requests', label: 'پیگیری درخواست‌ها', icon: ListChecks },
  { href: '/org/reports', label: 'گزارش‌ها و آمار', icon: BarChart3 },
];

export function OrgShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'ORG_ADMIN' && user.role !== 'ORG_STAFF'))) {
      router.replace('/auth');
    }
  }, [loading, user, router]);

  if (loading || !user || (user.role !== 'ORG_ADMIN' && user.role !== 'ORG_STAFF')) {
    return (
      <div className="org-loading">
        <Activity size={24} className="org-spin" /> در حال بررسی دسترسی...
      </div>
    );
  }

  const links = user.role === 'ORG_ADMIN' ? adminLinks : staffLinks;
  const currentLink = links.find(
    (link) => pathname === link.href || (link.href !== '/org' && pathname.startsWith(link.href)),
  );

  return (
    <div className="org-app" dir="rtl">
      <aside className="org-sidebar">
        <div className="org-brand">
          <span><Building2 size={22} /></span>
          <div>
            <strong>رادینت</strong>
            <small>پنل سازمانی</small>
          </div>
        </div>
        <div className="org-profile">
          <div className="org-avatar"><Users size={22} /></div>
          <div>
            <strong>{user.fullName}</strong>
            <small>{user.role === 'ORG_ADMIN' ? 'مدیر سازمان' : 'کارشناس سازمان'}</small>
          </div>
        </div>
        <nav className="org-nav">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/org' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={isActive ? 'is-active' : ''}>
                <Icon size={19} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <button className="org-logout" onClick={signOut}>
          <LogOut size={18} /> خروج از حساب
        </button>
      </aside>
      <main className="org-content">
        <header className="org-topbar">
          <div>
            <p>پنل سازمانی</p>
            <h1>{currentLink?.label ?? 'داشبورد'}</h1>
          </div>
          <div className="org-topbar-actions">
            <span className="org-status"><i /> سامانه فعال</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
