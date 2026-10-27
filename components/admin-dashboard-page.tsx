'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Stethoscope,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { adminNavItems } from '@/lib/admin-nav';

type Stats = {
  users: number;
  doctors: number;
  radiologists: number;
  centers: number;
  organizations: number;
  orders: number;
  requests: number;
  reports: number;
  products: number;
  categories: number;
};

type ChartPoint = { label: string; orders: number; requests: number };

type ActivityItem = {
  type: 'order' | 'request' | 'report' | 'user' | 'notification';
  title: string;
  description: string;
  status: string;
  createdAt: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
};

type AdminData = {
  stats: Stats;
  sales: {
    daily: { orders: number; requests: number };
    monthly: { orders: number; requests: number };
    yearly: { orders: number; requests: number };
  };
  revenue: { shop: number; teleReport: number; total: number };
  charts: { daily: ChartPoint[]; monthly: ChartPoint[]; yearly: ChartPoint[] };
  activities: ActivityItem[];
  notifications?: NotificationItem[];
};

const statusColors: Record<string, string> = {
  new: '#C9973E',
  pending: '#C9973E',
  in_progress: '#1456C3',
  reviewing: '#1456C3',
  completed: '#168A68',
  referred: '#168A68',
  rejected: '#D94B55',
  draft: '#8795A9',
  signed: '#168A68',
  paid: '#168A68',
  unpaid: '#D94B55',
  sent: '#168A68',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'همین حالا';
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  return `${Math.floor(hours / 24)} روز پیش`;
}

function formatToman(n: number): string {
  return (n || 0).toLocaleString('fa-IR');
}

export function AdminDashboardPage() {
  const { user, signOut } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chartTab, setChartTab] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
    fetch('/api/admin-dashboard', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (result && !result.error) setData(result);
        else setError('دریافت اطلاعات داشبورد ناموفق بود.');
      })
      .catch(() => setError('اتصال به سرور برقرار نیست.'));
  }, []);

  const statCards = [
    { label: 'کاربران', value: data?.stats.users ?? 0, icon: Users, color: '#1456C3', bg: '#eaf2ff' },
    { label: 'پزشکان', value: data?.stats.doctors ?? 0, icon: Stethoscope, color: '#168A68', bg: '#e8f7f1' },
    { label: 'مراکز تصویربرداری', value: data?.stats.centers ?? 0, icon: Building2, color: '#C9973E', bg: '#fff6e5' },
    { label: 'سازمان‌ها', value: data?.stats.organizations ?? 0, icon: Building2, color: '#0b2a5b', bg: '#e8edf4' },
    { label: 'سفارش‌های فروشگاه', value: data?.stats.orders ?? 0, icon: ShoppingCart, color: '#D94B55', bg: '#fdeaea' },
    { label: 'درخواست‌های تله‌ریپورت', value: data?.stats.requests ?? 0, icon: FileText, color: '#5b3f8a', bg: '#f0eef6' },
    { label: 'گزارش‌های تشخیصی', value: data?.stats.reports ?? 0, icon: Archive, color: '#2563eb', bg: '#eff6ff' },
    { label: 'محصولات فروشگاه', value: data?.stats.products ?? 0, icon: Package, color: '#059669', bg: '#ecfdf5' },
  ];

  const chartData = data?.charts[chartTab] ?? [];
  const maxChartVal = Math.max(...chartData.map((d) => Math.max(d.orders, d.requests)), 1);

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-brand">
            <div className="admin-brand__mark">
              <LayoutDashboard size={28} strokeWidth={1.7} />
            </div>
            <div>
              <strong>رادینت</strong>
              <span>پنل مدیریت مرکزی</span>
            </div>
            <button
              className="admin-sidebar__close"
              onClick={() => setSidebarOpen(false)}
              style={{ display: sidebarOpen ? 'grid' : 'none' }}
              aria-label="بستن منو"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="admin-nav">
            {adminNavItems.map((item) => {
              const isActive = item.href === '/admin';
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`admin-nav__item ${isActive ? 'is-active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={20} strokeWidth={1.7} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          <button className="admin-nav__logout" onClick={() => void signOut()}>
            <LogOut size={20} strokeWidth={1.7} />
            <span>خروج از حساب</span>
          </button>
        </aside>

        {sidebarOpen && (
          <div
            className="admin-overlay"
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,29,65,.42)' }}
          />
        )}

        <div className="admin-content">
          <header className="admin-header">
            <div className="admin-header__title">
              <LayoutDashboard size={26} strokeWidth={1.7} />
              <span>داشبورد مدیریت مرکزی</span>
            </div>
            <div className="admin-profile">
              <div className="admin-avatar">{user?.fullName?.charAt(0) ?? 'A'}</div>
              <div className="admin-user">
                <strong>{user?.fullName ?? 'مدیر سیستم'}</strong>
                <span>مدیر ارشد سامانه</span>
              </div>
              <ChevronDown className="admin-profile__chevron" size={17} />
            </div>
            <button className="admin-burger" onClick={() => setSidebarOpen(true)} aria-label="منو">
              <Menu size={26} strokeWidth={1.7} />
            </button>
          </header>

          <main className="admin-main">
            <section className="admin-welcome">
              <div className="admin-welcome__text">
                <h1>سلام {user?.fullName ?? 'ادمین'}، خوش آمدید</h1>
                <p>
                  نمای کلی آمار واقعی سامانه رادینت، درآمد حاصل از فروشگاه و تله‌ریپورت، نمودارهای تحلیلی و وقایع جاری سیستم.
                </p>
              </div>
            </section>

            {error && <div className="admin-error">{error}</div>}

            {/* کارت‌های آمار کلان */}
            <section className="admin-stats-grid">
              {statCards.map((card) => (
                <article className="admin-stat-card" key={card.label}>
                  <div className="admin-stat-card__top">
                    <span>{card.label}</span>
                    <div className="admin-stat-card__icon" style={{ background: card.bg, color: card.color }}>
                      <card.icon size={24} strokeWidth={1.8} />
                    </div>
                  </div>
                  <strong>{formatToman(card.value)}</strong>
                </article>
              ))}
            </section>

            {/* ردیف نمودار و درآمد */}
            <section className="admin-charts-row">
              <div className="admin-card admin-chart-card">
                <div className="admin-card__head">
                  <h2>
                    <BarChart3 size={22} strokeWidth={1.7} /> نمودار فعالیت و فروش
                  </h2>
                  <div className="admin-chart-tabs">
                    {(['daily', 'monthly', 'yearly'] as const).map((tab) => (
                      <button
                        key={tab}
                        className={`admin-chart-tab ${chartTab === tab ? 'is-active' : ''}`}
                        onClick={() => setChartTab(tab)}
                      >
                        {tab === 'daily' ? 'روزانه' : tab === 'monthly' ? 'ماهانه' : 'سالانه'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="admin-chart">
                  <div className="admin-chart__bars">
                    {chartData.length === 0 ? (
                      <div className="admin-activity--empty">داده‌ای برای نمایش نمودار وجود ندارد.</div>
                    ) : (
                      chartData.map((point, i) => (
                        <div className="admin-chart__group" key={i}>
                          <div className="admin-chart__bar-wrap">
                            <div
                              className="admin-chart__bar admin-chart__bar--orders"
                              style={{ height: `${point.orders > 0 ? Math.max((point.orders / maxChartVal) * 100, 6) : 0}%` }}
                              title={`سفارش‌های فروشگاه: ${point.orders}`}
                            />
                            <div
                              className="admin-chart__bar admin-chart__bar--requests"
                              style={{ height: `${point.requests > 0 ? Math.max((point.requests / maxChartVal) * 100, 6) : 0}%` }}
                              title={`درخواست‌های تله‌ریپورت: ${point.requests}`}
                            />
                          </div>
                          <span className="admin-chart__label">{point.label}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="admin-chart__legend">
                    <span>
                      <i style={{ background: '#5b3f8a' }} /> سفارش‌های فروشگاه
                    </span>
                    <span>
                      <i style={{ background: '#e2b35f' }} /> درخواست‌های تله‌ریپورت
                    </span>
                  </div>
                </div>
              </div>

              {/* درآمد تفکیک‌شده */}
              <div className="admin-card admin-revenue-card">
                <div className="admin-card__head">
                  <h2>
                    <DollarSign size={22} strokeWidth={1.7} /> درآمد واقعی سامانه
                  </h2>
                  <TrendingUp size={22} strokeWidth={1.7} style={{ color: '#C9973E' }} />
                </div>
                <div className="admin-revenue-list">
                  <div className="admin-revenue-item">
                    <div className="admin-revenue-item__icon" style={{ background: '#f0eef6', color: '#5b3f8a' }}>
                      <ShoppingCart size={22} strokeWidth={1.8} />
                    </div>
                    <div className="admin-revenue-item__body">
                      <strong>فروشگاه رادینت</strong>
                      <span>{formatToman(data?.revenue.shop ?? 0)} تومان</span>
                    </div>
                  </div>
                  <div className="admin-revenue-item">
                    <div className="admin-revenue-item__icon" style={{ background: '#fff6e5', color: '#C9973E' }}>
                      <Stethoscope size={22} strokeWidth={1.8} />
                    </div>
                    <div className="admin-revenue-item__body">
                      <strong>خدمات تله‌ریپورت</strong>
                      <span>{formatToman(data?.revenue.teleReport ?? 0)} تومان</span>
                    </div>
                  </div>
                  <div className="admin-revenue-item admin-revenue-item--total">
                    <div className="admin-revenue-item__icon" style={{ background: '#e8f7f1', color: '#168A68' }}>
                      <DollarSign size={22} strokeWidth={1.8} />
                    </div>
                    <div className="admin-revenue-item__body">
                      <strong>درآمد کل محقق‌شده</strong>
                      <span>{formatToman(data?.revenue.total ?? 0)} تومان</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ردیف فعالیت‌ها و اعلانات */}
            <section className="admin-activity-row">
              <div className="admin-card admin-activity-card">
                <div className="admin-card__head">
                  <h2>
                    <Activity size={22} strokeWidth={1.7} /> آخرین وقایع و فعالیت‌ها
                  </h2>
                </div>
                <ul className="admin-activity-list">
                  {(!data?.activities || data.activities.length === 0) && (
                    <li className="admin-activity--empty">هیچ فعالیتی ثبت نشده است.</li>
                  )}
                  {data?.activities.map((act, i) => (
                    <li className="admin-activity" key={i}>
                      <span className="admin-activity__dot" style={{ background: statusColors[act.status] ?? '#8795A9' }} />
                      <div className="admin-activity__body">
                        <strong>{act.title}</strong>
                        <span>{act.description}</span>
                      </div>
                      <time>{relativeTime(act.createdAt)}</time>
                    </li>
                  ))}
                </ul>
              </div>

              {/* خلاصه سفارشات و اعلانات اخیر */}
              <div className="admin-card admin-sales-card">
                <div className="admin-card__head">
                  <h2>
                    <CalendarDays size={22} strokeWidth={1.7} /> خلاصه فروش و تراکنش‌ها
                  </h2>
                </div>
                <div className="admin-sales-summary">
                  <div className="admin-sales-item">
                    <span>سفارش‌های امروز</span>
                    <strong>{formatToman(data?.sales.daily.orders ?? 0)}</strong>
                  </div>
                  <div className="admin-sales-item">
                    <span>درخواست‌های امروز</span>
                    <strong>{formatToman(data?.sales.daily.requests ?? 0)}</strong>
                  </div>
                  <div className="admin-sales-item">
                    <span>سفارش‌های این ماه</span>
                    <strong>{formatToman(data?.sales.monthly.orders ?? 0)}</strong>
                  </div>
                  <div className="admin-sales-item">
                    <span>درخواست‌های این ماه</span>
                    <strong>{formatToman(data?.sales.monthly.requests ?? 0)}</strong>
                  </div>
                  <div className="admin-sales-item">
                    <span>سفارش‌های امسال</span>
                    <strong>{formatToman(data?.sales.yearly.orders ?? 0)}</strong>
                  </div>
                  <div className="admin-sales-item">
                    <span>درخواست‌های امسال</span>
                    <strong>{formatToman(data?.sales.yearly.requests ?? 0)}</strong>
                  </div>
                </div>

                {data?.notifications && data.notifications.length > 0 && (
                  <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Bell size={18} style={{ color: '#1456C3' }} />
                      <strong style={{ fontSize: '14px', color: '#071D41' }}>آخرین اعلانات سامانه</strong>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {data.notifications.map((n) => (
                        <li
                          key={n.id}
                          style={{
                            background: '#f8fafc',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '13px',
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{n.title}</div>
                          <div style={{ color: '#64748b', marginTop: '2px' }}>{n.message}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
