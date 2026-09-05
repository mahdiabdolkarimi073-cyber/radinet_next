'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  DollarSign,
  FileText,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { adminNavItems, formatDate, formatToman } from '@/lib/admin-nav';
import { useAuth } from '@/components/auth-provider';

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
  type: 'order' | 'request' | 'report' | 'user';
  title: string;
  description: string;
  status: string;
  createdAt: string;
};

type ReportsData = {
  stats: Stats;
  sales: {
    daily: { orders: number; requests: number };
    monthly: { orders: number; requests: number };
    yearly: { orders: number; requests: number };
  };
  revenue: { shop: number; teleReport: number; total: number };
  charts: { daily: ChartPoint[]; monthly: ChartPoint[]; yearly: ChartPoint[] };
  activities: ActivityItem[];
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
};

const statusLabels: Record<string, string> = {
  new: 'جدید',
  pending: 'در انتظار',
  in_progress: 'در حال بررسی',
  reviewing: 'در حال بررسی',
  completed: 'تکمیل‌شده',
  referred: 'ارجاع‌شده',
  rejected: 'ردشده',
  draft: 'پیش‌نویس',
  signed: 'امضاشده',
  paid: 'پرداخت‌شده',
  unpaid: 'پرداخت‌نشده',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'همین حالا';
  if (minutes < 60) return `${minutes.toLocaleString('fa-IR')} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours.toLocaleString('fa-IR')} ساعت پیش`;
  return `${Math.floor(hours / 24).toLocaleString('fa-IR')} روز پیش`;
}

export function AdminReportsPage() {
  const { user, signOut } = useAuth();
  const [data, setData] = useState<ReportsData | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chartTab, setChartTab] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
    fetch('/api/admin/reports', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (result && !result.error) setData(result);
        else setError('دریافت اطلاعات گزارش‌های مدیریتی ناموفق بود.');
      })
      .catch(() => setError('اتصال به سرور برقرار نیست.'))
      .finally(() => setIsLoading(false));
  }, []);

  const statCards = [
    { label: 'کاربران', value: data?.stats.users ?? 0, icon: Users, color: '#1456C3', bg: '#eaf2ff' },
    { label: 'پزشکان', value: data?.stats.doctors ?? 0, icon: Stethoscope, color: '#168A68', bg: '#e8f7f1' },
    { label: 'سفارش‌ها', value: data?.stats.orders ?? 0, icon: ShoppingCart, color: '#D94B55', bg: '#fdeaea' },
    { label: 'درخواست‌ها', value: data?.stats.requests ?? 0, icon: FileText, color: '#5b3f8a', bg: '#f0eef6' },
    { label: 'گزارش‌ها', value: data?.stats.reports ?? 0, icon: FileText, color: '#0b2a5b', bg: '#e8edf4' },
    { label: 'محصولات', value: data?.stats.products ?? 0, icon: Package, color: '#C9973E', bg: '#fff6e5' },
  ];

  const revenueCards = [
    { label: 'فروشگاه', value: data?.revenue.shop ?? 0, icon: ShoppingCart, color: '#5b3f8a', bg: '#f0eef6' },
    { label: 'تله‌ریپورت', value: data?.revenue.teleReport ?? 0, icon: Stethoscope, color: '#C9973E', bg: '#fff6e5' },
    { label: 'درآمد کل', value: data?.revenue.total ?? 0, icon: DollarSign, color: '#168A68', bg: '#e8f7f1', highlight: true },
  ];

  const salesSummary = [
    { label: 'سفارش‌های امروز', value: data?.sales.daily.orders ?? 0 },
    { label: 'درخواست‌های امروز', value: data?.sales.daily.requests ?? 0 },
    { label: 'سفارش‌های این ماه', value: data?.sales.monthly.orders ?? 0 },
    { label: 'درخواست‌های این ماه', value: data?.sales.monthly.requests ?? 0 },
    { label: 'سفارش‌های امسال', value: data?.sales.yearly.orders ?? 0 },
    { label: 'درخواست‌های امسال', value: data?.sales.yearly.requests ?? 0 },
  ];

  const chartData = data?.charts[chartTab] ?? [];
  const maxChartVal = Math.max(...chartData.map((d) => Math.max(d.orders, d.requests)), 1);

  return (
    <div className="admin-page-root">
      <div className="admin-page-shell">
        <aside className={`admin-page-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-page-brand">
            <div className="admin-page-brand__mark"><ShieldCheck size={28} strokeWidth={1.7} /></div>
            <div>
              <strong>رادینت</strong>
              <span>پنل مدیریت</span>
            </div>
            <button className="admin-page-sidebar__close" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'grid' : 'none' }}>
              <X size={22} />
            </button>
          </div>

          <nav className="admin-page-nav">
            {adminNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`admin-page-nav__item ${item.href === '/admin/reports' ? 'is-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <button className="admin-page-nav__logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج</span>
          </button>
        </aside>

        {sidebarOpen && (
          <div className="admin-page-overlay" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,29,65,.42)' }} />
        )}

        <div className="admin-page-content">
          <header className="admin-page-header">
            <div className="admin-page-header__title">
              <BarChart3 size={26} strokeWidth={1.7} />
              <span>گزارش‌های مدیریتی</span>
            </div>
            <div className="admin-page-profile">
              <div className="admin-page-avatar">{user?.fullName?.charAt(0) ?? 'A'}</div>
              <div className="admin-page-user">
                <strong>{user?.fullName ?? 'مدیر سیستم'}</strong>
                <span>مدیر کل</span>
              </div>
              <ChevronDown className="admin-page-profile__chevron" size={17} />
            </div>
            <button className="admin-page-burger" onClick={() => setSidebarOpen(true)} aria-label="منو">
              <Menu size={26} strokeWidth={1.7} />
            </button>
          </header>

          <main className="admin-page-main">
            <div className="admin-page-title">
              <div>
                <h2>گزارش‌های مدیریتی</h2>
                <p>آمار کلان، نمودار فروش، درآمد و فعالیت‌های اخیر سیستم</p>
              </div>
            </div>

            {error && <div className="admin-page-error">{error}</div>}

            {isLoading && <div className="admin-page-empty">در حال دریافت گزارش‌های مدیریتی…</div>}

            {!isLoading && !error && data && (
              <>
                <section className="admin-stats-grid">
                  {statCards.map((card) => (
                    <article className="admin-stat-card" key={card.label}>
                      <div className="admin-stat-card__top">
                        <span>{card.label}</span>
                        <div className="admin-stat-card__icon" style={{ background: card.bg, color: card.color }}>
                          <card.icon size={26} strokeWidth={1.8} />
                        </div>
                      </div>
                      <strong>{formatToman(card.value)}</strong>
                    </article>
                  ))}
                </section>

                <section className="admin-charts-row">
                  <div className="admin-card admin-chart-card">
                    <div className="admin-card__head">
                      <h2><BarChart3 size={22} strokeWidth={1.7} /> نمودار فروش</h2>
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
                        {chartData.length === 0 && (
                          <div className="admin-page-empty">داده‌ای برای نمایش وجود ندارد.</div>
                        )}
                        {chartData.map((point, i) => (
                          <div className="admin-chart__group" key={i}>
                            <div className="admin-chart__bar-wrap">
                              <div
                                className="admin-chart__bar admin-chart__bar--orders"
                                style={{ height: `${(point.orders / maxChartVal) * 100}%` }}
                                title={`سفارش: ${formatToman(point.orders)}`}
                              />
                              <div
                                className="admin-chart__bar admin-chart__bar--requests"
                                style={{ height: `${(point.requests / maxChartVal) * 100}%` }}
                                title={`درخواست: ${formatToman(point.requests)}`}
                              />
                            </div>
                            <span className="admin-chart__label">{point.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="admin-chart__legend">
                        <span><i style={{ background: '#5b3f8a' }} /> سفارش‌های فروشگاه</span>
                        <span><i style={{ background: '#e2b35f' }} /> درخواست‌های تله‌ریپورت</span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-card admin-revenue-card">
                    <div className="admin-card__head">
                      <h2><DollarSign size={22} strokeWidth={1.7} /> درآمد</h2>
                      <TrendingUp size={22} strokeWidth={1.7} style={{ color: '#C9973E' }} />
                    </div>
                    <div className="admin-revenue-list">
                      {revenueCards.map((item) => (
                        <div className={`admin-revenue-item ${item.highlight ? 'admin-revenue-item--total' : ''}`} key={item.label}>
                          <div className="admin-revenue-item__icon" style={{ background: item.bg, color: item.color }}>
                            <item.icon size={22} strokeWidth={1.8} />
                          </div>
                          <div className="admin-revenue-item__body">
                            <strong>{item.label}</strong>
                            <span>{formatToman(item.value)} تومان</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="admin-activity-row">
                  <div className="admin-card admin-activity-card">
                    <div className="admin-card__head">
                      <h2><Activity size={22} strokeWidth={1.7} /> آخرین فعالیت‌ها</h2>
                    </div>
                    <ul className="admin-activity-list">
                      {data.activities.length === 0 && (
                        <li className="admin-activity--empty">فعالیتی ثبت نشده است.</li>
                      )}
                      {data.activities.map((act, i) => (
                        <li className="admin-activity" key={i}>
                          <span
                            className="admin-activity__dot"
                            style={{ background: statusColors[act.status] ?? '#8795A9' }}
                          />
                          <div className="admin-activity__body">
                            <strong>{act.title}</strong>
                            <span>{act.description}</span>
                          </div>
                          <time>{relativeTime(act.createdAt)}</time>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="admin-card admin-sales-card">
                    <div className="admin-card__head">
                      <h2><CalendarDays size={22} strokeWidth={1.7} /> خلاصه فروش</h2>
                    </div>
                    <div className="admin-sales-summary">
                      {salesSummary.map((item) => (
                        <div className="admin-sales-item" key={item.label}>
                          <span>{item.label}</span>
                          <strong>{formatToman(item.value)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
