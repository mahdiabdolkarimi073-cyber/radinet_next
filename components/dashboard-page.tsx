'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Stethoscope,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type DashboardStats = {
  total: number;
  new: number;
  inReview: number;
  completed: number;
};

type DashboardNotification = {
  id: string;
  title: string;
  description: string;
  status: 'warning' | 'success' | 'info' | 'error';
  createdAt: string;
};

type DashboardData = {
  stats: DashboardStats;
  notifications: DashboardNotification[];
};

const navItems = [
  { label: 'داشبورد', href: '/dashboard', icon: LayoutDashboard, active: true },
  { label: 'درخواست‌های ارجاعی', href: '/dashboard/referrals', icon: ClipboardList },
  { label: 'گزارش‌ها', href: '/dashboard/reports', icon: FileText },
  { label: 'بیماران', href: '/dashboard/patients', icon: Stethoscope },
  { label: 'اعلان‌ها', href: '/dashboard/notifications', icon: Bell },
  { label: 'تنظیمات', href: '/dashboard/settings', icon: Settings },
];

const quickActions = [
  { label: 'ثبت درخواست تله‌ریپورت', href: '/tele-report/new', icon: FileText },
  { label: 'مشاهده درخواست‌های ارجاعی', href: '/dashboard/referrals', icon: ClipboardList },
  { label: 'پیگیری سفارش', href: '/shop/tracking', icon: Activity },
  { label: 'تنظیمات حساب', href: '/dashboard/settings', icon: Settings },
];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'همین حالا';
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  const days = Math.floor(hours / 24);
  return `${days} روز پیش`;
}

const statusConfig = {
  warning: { color: '#F59E0B', bg: '#FEF3C7', icon: Clock },
  success: { color: '#10B981', bg: '#D1FAE5', icon: CheckCircle2 },
  info: { color: '#2563EB', bg: '#DBEAFE', icon: Activity },
  error: { color: '#EF4444', bg: '#FEE2E2', icon: AlertCircle },
};

export function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
    fetch('/api/dashboard', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (result) setData(result);
        else setError('دریافت اطلاعات داشبورد ناموفق بود.');
      })
      .catch(() => setError('اتصال به سرور برقرار نیست.'))
      .finally(() => {});
  }, []);

  const stats = [
    { label: 'درخواست‌های جدید', value: data?.stats.new ?? 0, change: '+۱۲٪', positive: true, color: '#F59E0B', bg: '#FEF3C7', icon: Bell },
    { label: 'در حال بررسی', value: data?.stats.inReview ?? 0, change: '+۵٪', positive: true, color: '#2563EB', bg: '#DBEAFE', icon: Clock },
    { label: 'تکمیل‌شده', value: data?.stats.completed ?? 0, change: '+۸٪', positive: true, color: '#10B981', bg: '#D1FAE5', icon: CheckCircle2 },
    { label: 'مجموع درخواست‌ها', value: data?.stats.total ?? 0, change: '-۳٪', positive: false, color: '#1E40AF', bg: '#EFF6FF', icon: ClipboardList },
  ];

  return (
    <div className="dashboard-root">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header__right">
          <button className="dash-burger" onClick={() => setSidebarOpen((v) => !v)} aria-label="منو">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="dash-logo">
            <span className="dash-logo__mark">◈</span>
            <span className="dash-logo__text">رادینت</span>
          </div>
        </div>
        <h1 className="dash-header__title">داشبورد اختصاصی</h1>
        <div className="dash-header__left">
          <div className="dash-avatar">
            {user?.fullName?.charAt(0) ?? 'د'}
          </div>
          <div className="dash-user">
            <strong>{loading ? 'در حال بارگذاری…' : user?.fullName ?? 'دکتر احمدی'}</strong>
            <span>پزشک رادیولوژیست</span>
          </div>
        </div>
      </header>

      <div className="dash-layout">
        {/* Sidebar */}
        <aside className={`dash-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <nav className="dash-nav">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`dash-nav__item ${item.active ? 'is-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="dash-nav__item dash-nav__item--logout" onClick={() => signOut()}>
            <LogOut size={20} />
            <span>خروج از حساب</span>
          </button>
        </aside>

        {sidebarOpen && <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <main className="dash-main">
          <section className="dash-welcome">
            <h2>سلام {user?.fullName ?? 'دکتر احمدی'}</h2>
            <p>خوش آمدید به پنل شخصی خود</p>
          </section>

          {error && <div className="dash-error">{error}</div>}

          {/* Stat cards */}
          <section className="dash-stats">
            {stats.map((stat) => (
              <div className="dash-stat" key={stat.label}>
                <div className="dash-stat__icon" style={{ background: stat.bg, color: stat.color }}>
                  <stat.icon size={20} />
                </div>
                <div className="dash-stat__body">
                  <span>{stat.label}</span>
                  <strong>{stat.value.toLocaleString('fa-IR')}</strong>
                  <em className={stat.positive ? 'is-positive' : 'is-negative'}>
                    {stat.change}
                  </em>
                </div>
              </div>
            ))}
          </section>

          {/* Bottom row */}
          <section className="dash-bottom">
            {/* Notifications */}
            <div className="dash-card dash-card--notifications">
              <div className="dash-card__head">
                <h3>اطلاعات جدید</h3>
              </div>
              <ul className="dash-notif-list">
                {(data?.notifications ?? []).map((notif) => {
                  const cfg = statusConfig[notif.status];
                  const Icon = cfg.icon;
                  return (
                    <li key={notif.id} className="dash-notif">
                      <div className="dash-notif__icon" style={{ background: cfg.bg, color: cfg.color }}>
                        <Icon size={16} />
                      </div>
                      <div className="dash-notif__body">
                        <strong>{notif.title}</strong>
                        <span>{notif.description}</span>
                        <time>{relativeTime(notif.createdAt)}</time>
                      </div>
                    </li>
                  );
                })}
                {!data && !error && (
                  <li className="dash-notif dash-notif--empty">در حال بارگذاری اعلان‌ها…</li>
                )}
                {data && data.notifications.length === 0 && (
                  <li className="dash-notif dash-notif--empty">اعلان جدیدی وجود ندارد.</li>
                )}
              </ul>
              <a href="/dashboard/notifications" className="dash-card__link">
                مشاهده <ChevronLeft size={14} />
              </a>
            </div>

            {/* Quick access */}
            <div className="dash-card dash-card--quick">
              <div className="dash-card__head">
                <h3>دسترسی سریع</h3>
              </div>
              <div className="dash-quick">
                {quickActions.map((action) => (
                  <a key={action.label} href={action.href} className="dash-quick__btn">
                    <action.icon size={20} />
                    <span>{action.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
