'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  Building2,
  FilePlus,
  FileSearch,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { orgGet, type OrgContext } from '@/lib/org-api';
import '@/app/org/org.css';

type NavItem = {
  href: string;
  label: string;
  subtitle: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
  permissionKey?: 'staffCanSubmit' | 'staffCanViewReports';
};

const NAV_ITEMS: NavItem[] = [
  {
    href: '/org',
    label: 'داشبورد مدیریت سازمان',
    subtitle: 'نمای کلی، آمار و وضعیت مالی',
    icon: LayoutDashboard,
  },
  {
    href: '/org/users',
    label: 'مدیریت کاربران سازمان',
    subtitle: 'کارکنان و دسترسی‌های زیرمجموعه',
    icon: Users,
    adminOnly: true,
  },
  {
    href: '/org/requests/new',
    label: 'ثبت درخواست تله‌ریپورت',
    subtitle: 'ارسال پرونده تصویربرداری جدید',
    icon: FilePlus,
    permissionKey: 'staffCanSubmit',
  },
  {
    href: '/org/requests',
    label: 'پیگیری درخواست‌ها',
    subtitle: 'فهرست، جست‌وجو و وضعیت پرونده‌ها',
    icon: FileSearch,
  },
  {
    href: '/org/reports',
    label: 'گزارش‌ها و آمار عملکرد',
    subtitle: 'تحلیل درخواست‌ها بر اساس کاربر و زمان',
    icon: BarChart3,
    permissionKey: 'staffCanViewReports',
  },
  {
    href: '/org/contracts',
    label: 'قراردادها و پرداخت‌ها',
    subtitle: 'قراردادها، صورت‌حساب‌ها و سوابق مالی',
    icon: FileText,
    adminOnly: true,
  },
  {
    href: '/org/settings',
    label: 'تنظیمات سازمان',
    subtitle: 'پروفایل حقوقی و مجوزهای کارکنان',
    icon: Settings,
    adminOnly: true,
  },
];

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/org') {
    return pathname === '/org';
  }
  if (href === '/org/requests/new') {
    return pathname === '/org/requests/new';
  }
  if (href === '/org/requests') {
    return (
      pathname === '/org/requests' ||
      (pathname.startsWith('/org/requests/') && pathname !== '/org/requests/new')
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OrgShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [orgCtx, setOrgCtx] = useState<OrgContext | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const normalizedRole = user?.role?.toLowerCase();
  const isOrgUser = normalizedRole === 'org_admin' || normalizedRole === 'org_staff';
  const isAdmin = normalizedRole === 'org_admin';

  useEffect(() => {
    if (!loading && (!user || !isOrgUser)) {
      router.replace('/login');
    }
  }, [loading, user, isOrgUser, router]);

  useEffect(() => {
    if (!loading && user && isOrgUser) {
      orgGet<OrgContext>('/context')
        .then((ctx) => setOrgCtx(ctx))
        .catch(() => {});
    }
  }, [loading, user, isOrgUser, pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (loading || !user || !isOrgUser) {
    return (
      <div className="org-loading" dir="rtl">
        <Activity size={24} className="org-spin" />
        <span>در حال بارگذاری پنل مدیریت سازمان...</span>
      </div>
    );
  }

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (isAdmin) return true;
    if (item.adminOnly) return false;
    if (item.permissionKey && orgCtx?.permissions) {
      return orgCtx.permissions[item.permissionKey] !== false;
    }
    return true;
  });

  const orgName = orgCtx?.organization?.name || 'سازمان طرف قرارداد رادینت';
  const orgLocation = [orgCtx?.organization?.province, orgCtx?.organization?.city]
    .filter(Boolean)
    .join('، ');

  return (
    <div className="org-app" dir="rtl">
      {mobileMenuOpen && (
        <div
          className="org-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`org-sidebar ${mobileMenuOpen ? 'is-open' : ''}`}>
        <div className="org-brand">
          <span>
            <Building2 size={22} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong>رادینت</strong>
            <small>پنل اختصاصی مدیریت سازمان</small>
          </div>
          <button
            type="button"
            className="org-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="بستن منو"
          >
            <X size={20} />
          </button>
        </div>

        <div className="org-profile">
          <div className="org-avatar">
            <Shield size={18} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <strong
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.fullName}
            </strong>
            <small style={{ display: 'block' }}>
              {isAdmin ? 'مدیر سازمان (ORG_ADMIN)' : 'کارشناس سازمان (ORG_STAFF)'}
            </small>
            <small
              style={{
                display: 'block',
                color: '#7fb3e6',
                marginTop: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {orgName}
            </small>
          </div>
        </div>

        <nav className="org-nav">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'is-active' : ''}
              >
                <Icon size={18} />
                <div className="org-nav-label">
                  <span>{item.label}</span>
                  <small>{item.subtitle}</small>
                </div>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="org-logout"
          onClick={async () => {
            await logout();
            router.replace('/login');
          }}
        >
          <LogOut size={18} /> خروج از حساب کاربری
        </button>
      </aside>

      <div className="org-content">
        <header className="org-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              className="org-mobile-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="باز کردن منوی سازمان"
            >
              <Menu size={22} />
            </button>
            <div>
              <p>
                {orgName}
                {orgLocation ? ` — ${orgLocation}` : ''}
              </p>
              <h1>{user.fullName} خوش آمدید</h1>
            </div>
          </div>
          <div className="org-topbar-actions">
            <span className="org-status">
              <i /> متصل به دیتابیس سازمان
            </span>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
